import { markLegacy } from './integrity.js'
import { idbGetAll, idbPut, idbCount, isIndexedDbAvailable } from './idb.js'

const REPORTS_KEY = 'hsse_reports'
const PREFS_KEY = 'hsse_prefs'
const CONSENT_KEY = 'hsse_consent'
const LAST_PARAM_KEY = 'hsse_last_param'

// Reports saved before the integrity rework have no `integrity` block.
// Tag them as legacy on read rather than silently computing a canonical
// hash for evidence content that was never captured under this scheme.
function migrateLegacyRecords(reports) {
  let changed = false
  const migrated = reports.map((r) => {
    if (r.integrity) return r
    changed = true
    return markLegacy(r)
  })
  return { migrated, changed }
}

// Reports live in IndexedDB (no practical quota limit for this app's
// embedded photo data). This in-memory cache lets storage.getReports()
// keep its existing synchronous signature, which every call site in the
// app relies on; writes update the cache immediately and persist to
// IndexedDB in the background.
let reportsCache = []
let initialized = false

// Moves any reports already saved under the old localStorage key into
// IndexedDB, verifies the record count made it across intact, and only
// then removes the old key. If the count doesn't match, the localStorage
// copy is left in place rather than risking data loss.
async function migrateFromLocalStorage() {
  let legacyRaw
  try {
    legacyRaw = localStorage.getItem(REPORTS_KEY)
  } catch {
    return
  }
  if (!legacyRaw) return

  let legacyReports
  try {
    legacyReports = JSON.parse(legacyRaw)
  } catch {
    return
  }
  if (!Array.isArray(legacyReports) || legacyReports.length === 0) {
    localStorage.removeItem(REPORTS_KEY)
    return
  }

  for (const report of legacyReports) {
    await idbPut(report)
  }
  const countInDb = await idbCount()
  if (countInDb >= legacyReports.length) {
    localStorage.removeItem(REPORTS_KEY)
  }
  // If the count doesn't match, the localStorage copy is deliberately left
  // in place — a future load will retry the migration rather than lose data.
}

async function initReportsCache() {
  if (initialized) return
  if (!isIndexedDbAvailable()) {
    // No IndexedDB (very old browser, or a restrictive private-browsing
    // mode) — fall back to reading straight from the legacy key so the app
    // still works, just without the higher storage ceiling.
    try {
      reportsCache = JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]')
    } catch {
      reportsCache = []
    }
    initialized = true
    return
  }

  await migrateFromLocalStorage()
  const stored = await idbGetAll()
  const { migrated, changed } = migrateLegacyRecords(stored)
  reportsCache = migrated
  if (changed) {
    for (const report of migrated) {
      await idbPut(report)
    }
  }
  initialized = true
  window.dispatchEvent(new CustomEvent('hsse-data-updated', { detail: { reports: reportsCache } }))
}

// Call once at app startup (see main.jsx). Safe to call more than once —
// subsequent calls are no-ops once initialization has completed.
export function initStorage() {
  return initReportsCache()
}

export const storage = {
  getReports: () => reportsCache,

  saveReport: (report) => {
    const existing = reportsCache.findIndex((r) => r.id === report.id)
    if (existing >= 0) {
      reportsCache = [...reportsCache.slice(0, existing), report, ...reportsCache.slice(existing + 1)]
    } else {
      reportsCache = [...reportsCache, report]
    }
    if (isIndexedDbAvailable()) {
      idbPut(report).catch(() => {
        // Best-effort persistence — the in-memory cache still reflects the
        // save for the current session even if the IndexedDB write fails.
      })
    } else {
      try {
        localStorage.setItem(REPORTS_KEY, JSON.stringify(reportsCache))
      } catch {
        // Storage full or unavailable — the report still exists for this
        // session via reportsCache.
      }
    }
    window.dispatchEvent(new CustomEvent('hsse-data-updated', { detail: { reports: reportsCache } }))
    return reportsCache
  },

  updateReport: (id, updates) => {
    const idx = reportsCache.findIndex((r) => r.id === id)
    if (idx < 0) return null
    const updated = { ...reportsCache[idx], ...updates }
    storage.saveReport(updated)
    return updated
  },

  getPrefs: () => {
    try {
      return JSON.parse(localStorage.getItem(PREFS_KEY))
    } catch {
      return null
    }
  },

  setPrefs: (data) => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(data))
  },

  getConsent: () => {
    try {
      return JSON.parse(localStorage.getItem(CONSENT_KEY))
    } catch {
      return null
    }
  },

  setConsent: (data) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data))
  },

  getLastParam: () => {
    try {
      return JSON.parse(localStorage.getItem(LAST_PARAM_KEY))
    } catch {
      return null
    }
  },

  setLastParam: (data) => {
    localStorage.setItem(LAST_PARAM_KEY, JSON.stringify(data))
  },
}
