/**
 * @typedef {Object} IDB
 * @prop {(key: string) => Promise} get Get a dataStore value based on the provided key.
 * @prop {(key: string, value: any) => Promise} set Set a dataStore value based on the key and value.
 * @prop {(key: string) => Promise} remove Delete a dataStore value based on the provided key.
 * @prop {() => Promise} clear Delete all data from the dataStore.
 * @prop {() => Promise} keys Get all key/value pairs in the dataStore.
 * @prop {string} name The database name.
 * @prop {string} storeName The name of the database table used to store key/value pairs.
 */
/**
 * A promise-based wrapper for IndexDB approximating the interface of localStorage for ease of use.
 * This has the following methods:
 * @example
 * get(key)
 * set(key, value)
 * remove(key)
 * clear()
 * keys()
 * @type {IDB}
 */
export const idb: IDB;
export type IDB = {
    /**
     * Get a dataStore value based on the provided key.
     */
    get: (key: string) => Promise<any>;
    /**
     * Set a dataStore value based on the key and value.
     */
    set: (key: string, value: any) => Promise<any>;
    /**
     * Delete a dataStore value based on the provided key.
     */
    remove: (key: string) => Promise<any>;
    /**
     * Delete all data from the dataStore.
     */
    clear: () => Promise<any>;
    /**
     * Get all key/value pairs in the dataStore.
     */
    keys: () => Promise<any>;
    /**
     * The database name.
     */
    name: string;
    /**
     * The name of the database table used to store key/value pairs.
     */
    storeName: string;
};
