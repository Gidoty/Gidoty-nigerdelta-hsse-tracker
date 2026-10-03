// Minimal native IndexedDB wrapper for the reports store. No dependency —
// the API surface this app needs (get all, put, delete, count) is small
// enough that a library isn't worth adding.

const DB_NAME = 'hsse-tracker'
const DB_VERSION = 1
const STORE_NAME = 'reports'

let dbPromise = null

function openDb() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

function withStore(mode, callback) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode)
        const store = tx.objectStore(STORE_NAME)
        const request = callback(store)
        tx.oncomplete = () => resolve(request?.result)
        tx.onerror = () => reject(tx.error)
      }),
  )
}

export function idbGetAll() {
  return withStore('readonly', (store) => store.getAll())
}

export function idbCount() {
  return withStore('readonly', (store) => store.count())
}

export function idbPut(record) {
  return withStore('readwrite', (store) => store.put(record))
}

export function idbPutAll(records) {
  return withStore('readwrite', (store) => {
    records.forEach((record) => store.put(record))
    return null
  })
}

export function idbDelete(id) {
  return withStore('readwrite', (store) => store.delete(id))
}

export function isIndexedDbAvailable() {
  return typeof indexedDB !== 'undefined'
}
