const IDBStore = Symbol('IDBStore')

/**
 * Promisified wrapper for IndexedDB providing a simple API like localStorage.
 */
class Store {
  /**
   * Create a database.
   * @param {string} dbName
   * @param {string} storeName
   */
  constructor(dbName = 'composi-idb', storeName = 'composi-store') {
    const version = 1
    this.storeName = storeName
    this.dbName = dbName
    this._dbp = new Promise((resolve, reject) => {
      const openreq = indexedDB.open(dbName, version)
      openreq.onerror = () => reject(openreq.error)
      openreq.onsuccess = () => {
        resolve(openreq.result)
      }
      // First time setup: create an empty object store
      openreq.onupgradeneeded = () => {
        openreq.result.createObjectStore(storeName)
      }
    })
    this[IDBStore] = (type, callback) => {
      return this._dbp.then(
        db =>
          new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, type)
            transaction.oncomplete = () => resolve()
            transaction.onabort = transaction.onerror = () =>
              reject(transaction.error)
            callback(transaction.objectStore(this.storeName))
          })
      )
    }
  }
}
let store
function getDefaultStore() {
  if (!store) store = new Store()
  return store
}

/**
 * Get a value based on the provided key.
 * @param {string} key The key to use.
 * @param {any} store A default value provided by IDB.
 * @return {Promise} Promise
 */
function get(key, store = getDefaultStore()) {
  let req
  return store[IDBStore]('readonly', store => {
    req = store.get(key)
  }).then(() => req.result)
}

/**
 *
 * @param {*} key
 * @param {*} value
 * @param {*} store
 */
function set(key, value, store = getDefaultStore()) {
  return store[IDBStore]('readwrite', store => {
    store.put(value, key)
  })
}

/**
 *
 * @param {*} key
 * @param {*} store
 */
function remove(key, store = getDefaultStore()) {
  return store[IDBStore]('readwrite', store => {
    store.delete(key)
  })
}

/**
 *
 * @param {*} store
 */
function clear(store = getDefaultStore()) {
  return store[IDBStore]('readwrite', store => {
    store.clear()
  })
}

/**
 *
 * @param {*} store
 */
function keys(store = getDefaultStore()) {
  const keys = []
  return store[IDBStore](
    'readonly',
    store =>
      // This would be store.getAllKeys(),
      // but it isn't supported by Edge or Safari.
      // And openKeyCursor isn't supported by Safari.
      ((store.openKeyCursor || store.openCursor).call(
        store
      ).onsuccess = function() {
        if (!this.result) return
        keys.push(this.result.key)
        this.result.continue()
      })
  ).then(() => keys)
}

const name = Symbol('name')
const storeName = Symbol('storeName')
/**
 * A new database ready to use.
 *
 * This has the following methods:
 * @example
 * get(key)
 * set(key, value)
 * remove(key)
 * clear()
 * keys()
 */
export const idb = {
  get,
  set,
  remove,
  clear,
  keys,
  [name]: 'composi-idb',
  get name() {
    return this[name]
  },
  set name(value) {
    return
  },
  [storeName]: 'composi-store',
  get storeName() {
    return this[storeName]
  },
  set storeName(value) {
    return
  }
}
