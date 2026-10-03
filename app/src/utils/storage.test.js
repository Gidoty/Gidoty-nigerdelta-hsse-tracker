import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'

// Minimal in-memory localStorage shim — Node has no global localStorage by
// default, and this module needs one to test the legacy-data migration.
function installLocalStorageShim() {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  }
  return store
}

// storage.js dispatches a DOM CustomEvent on window when its cache updates;
// Node has neither window nor CustomEvent by default.
function installWindowShim() {
  globalThis.window = { dispatchEvent: () => true }
  if (typeof globalThis.CustomEvent === 'undefined') {
    globalThis.CustomEvent = class CustomEvent {
      constructor(type, init) {
        this.type = type
        this.detail = init?.detail
      }
    }
  }
}

function sampleReport(id) {
  return {
    id,
    referenceNumber: `HSSE-${id}`,
    submittedAt: '2026-01-01T00:00:00.000Z',
    incident: { type: 'gas_flare', severity: 'serious', description: 'Sample' },
    location: { state: 'Rivers' },
    evidence: { photos: [], photoCount: 0 },
    health: { healthImpact: false, symptoms: [] },
    audit: { reportHash: `legacy-hash-${id}` },
  }
}

describe('storage.js migration from localStorage to IndexedDB', () => {
  beforeEach(() => {
    installLocalStorageShim()
    installWindowShim()
    // A fresh IDBFactory per test gives genuinely isolated storage — no
    // database state (or open-connection blocking) leaks between tests.
    globalThis.indexedDB = new IDBFactory()
    vi.resetModules()
  })

  afterEach(() => {
    vi.doUnmock('./idb.js')
  })

  it('migrates existing localStorage reports into IndexedDB and clears the old key once the count matches', async () => {
    const legacyReports = [sampleReport('a'), sampleReport('b'), sampleReport('c')]
    localStorage.setItem('hsse_reports', JSON.stringify(legacyReports))

    const { initStorage, storage } = await import('./storage.js')
    await initStorage()

    const migrated = storage.getReports()
    expect(migrated).toHaveLength(3)
    expect(migrated.map((r) => r.id).sort()).toEqual(['a', 'b', 'c'])
    expect(localStorage.getItem('hsse_reports')).toBeNull()
  })

  it('tags migrated records with no integrity block as legacy, without computing a canonical hash', async () => {
    localStorage.setItem('hsse_reports', JSON.stringify([sampleReport('legacy1')]))
    const { initStorage, storage } = await import('./storage.js')
    await initStorage()

    const [report] = storage.getReports()
    expect(report.integrity.canonicalization).toBe('legacy-v0-noncanonical')
    expect(report.integrity.payloadHash).toBe('legacy-hash-legacy1')
  })

  it('starts with an empty cache and no migration when localStorage has no reports key', async () => {
    const { initStorage, storage } = await import('./storage.js')
    await initStorage()
    expect(storage.getReports()).toEqual([])
  })

  it('saveReport adds a new report to the cache immediately and is reflected by getReports', async () => {
    const { initStorage, storage } = await import('./storage.js')
    await initStorage()
    storage.saveReport(sampleReport('new1'))
    expect(storage.getReports().map((r) => r.id)).toContain('new1')
  })

  it('does not clear the localStorage key if the migrated count in IndexedDB falls short', async () => {
    vi.doMock('./idb.js', async () => {
      const actual = await vi.importActual('./idb.js')
      return {
        ...actual,
        idbCount: async () => 0, // simulate a migration that silently failed to persist anything
      }
    })
    localStorage.setItem('hsse_reports', JSON.stringify([sampleReport('x'), sampleReport('y')]))

    const { initStorage } = await import('./storage.js')
    await initStorage()

    // The safety check compares the post-migration IndexedDB count against
    // the legacy array length; if it's short, the legacy key must survive.
    expect(localStorage.getItem('hsse_reports')).not.toBeNull()
  })
})
