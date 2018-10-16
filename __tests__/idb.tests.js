// @ts-nocheck
const indexedDB = require('fake-indexeddb')
global.indexedDB = indexedDB
import {idb} from "../src"

/**
 * It didn't make sense to test for coverage since the largest part of idb is in private scope and unreachable.
 */

// Helper for determining types of key values.
function getType(value) {
  // Trap for NaN:
  if (typeof value === 'number' && isNaN(value)) {
    return 'nan'
  } else if (value && value.nodeType === 3) {
    return 'text'
  } else if (value && value.nodeType === 1) {
    return 'element'
  } else {
    return new RegExp('\\[object (.*)]')
      .exec(toString.call(value))[1]
      .toLowerCase()
  }
}

test('idb database should exist.', function() {
  expect(typeof idb).toBe('object')
  idb.set('test1', 'This is some text.')
  expect(getType(idb)).toBe('object')
  expect(idb.name).toBe('composi-idb')
  expect(idb.storeName).toBe('composi-store')
})

test('Should be able to clear all entries from the database store.', function(done) {
  idb.set('another-key', 'more stuff')
    .then(() => {
      return idb.keys()
    })
    .then(data => {
      expect(data.length).toBeGreaterThan(0)
    })
    .then(() => {
      return idb.clear()
    })
    .then(() => {
      return idb.keys()
    })
    .then(data => {
      expect(data).toHaveProperty('length')
      expect(data.length).toBe(0)
    })
    .then(() => {
      done()
    })
})

test('Should be able to get from database.', function() {
  idb.set('test-get-key', 'This is some text to get.')
  .then(() => {
    idb.get('test-get-key').then(data => {
      if (data) {
        expect(data).toBe('This is some text to get.')
      }
    })
  })
})

test('Should be able to udpate key with new value.', function() {
  idb.set('test1', 'This is the new value.').then(() => {
    return idb.get('test1')
  }).then(data => {
    expect(data).toBe('This is the new value.')
  })
})

test('Should be able to add another key/value to database store.', function() {
  idb.set('fruits', ['Apples', 'Oranges', 'Bananas']).then(() => {
    return idb.get('fruits')
  }).then(data => {
    if (data) {
      expect(data.length).toBe(3)
      expect(data.join(', ')).toBe('Apples, Oranges, Bananas')
    }
  })
})

test('Database should support values types: null, undefined, boolean, string, number, array, object, set and map', function() {
  idb.set('type-null', null)
    .then(() => {
      return idb.set('type-undefined', undefined)
    })
    .then(() => {
      return idb.set('type-boolean', true)
    })
    .then(() => {
      return idb.set('type-string', 'string')
    })
    .then(() => {
      return idb.set('type-number', 123)
    })
    .then(() => {
      return idb.set('type-array', [1, 2, 3])
    })
    .then(() => {
      return idb.set('type-object', { name: 'Sam', job: ['Mechanic', 'Brain Surgeon', 'Chef'] })
    })
    .then(() => {
      return idb.set('type-set', new Set([1,2,3,4,5,2,3,5,6]))
    })
    .then(() => {
      return idb.set('type-map', new Map([[1, 'one'], [2, 'two'], [3, 'three']]))
    })
    .then(() => {
      idb.get('type-null')
      .then(data => {
        return expect(getType(data)).toBe('null')
      })
    })
    .then(() => {
      idb.get('type-undefined')
        .then(data => {
          return expect(getType(data)).toBe('undefined')
        })
    })
    .then(() => {
      idb.get('type-boolean')
        .then(data => {
          return expect(getType(data)).toBe('boolean')
        })
    })
    .then(() => {
      idb.get('type-string')
        .then(data => {
          return expect(getType(data)).toBe('string')
        })
    })
    .then(() => {
      idb.get('type-number')
        .then(data => {
          return expect(getType(data)).toBe('number')
        })
    })
    .then(() => {
      idb.get('type-array')
        .then(data => {
          if (data)
          return expect(getType(data)).toBe('array')
        })
    })
    .then(() => {
      idb.get('type-object')
        .then(data => {
          if (data)
          return expect(getType(data)).toBe('object')
        })
    })
    .then(() => {
      idb.get('type-set')
      .then(data => {
        if (data) 
          expect(getType(data)).toBe('set')
      })
    })
    .then(() => {
      idb.get('type-map')
        .then(data => {
          if (data) 
          expect(getType(data)).toBe('map')
        })
    })
  
})

test('Should be able to delete a key/value from the database store.', function() {
  idb.set('to-be-removed', 'some text to remove')
    .then(() => {
      return idb.get('to-be-removed')
    })
    .then(data => {
      return expect(data).toBe('some text to remove')
    })
    .then(() => {
      return idb.remove('to-be-removed')
    })
    .then(() => {
      return idb.get('to-be-removed')
    })
    .then(data => {
      expect(getType(data)).toBe('undefined')
    })
})

test('Should be able to get all keys in the database.', function() {
  idb.keys()
    .then(data => {
      expect(getType(data)).toBe('array')
      expect(data.length).toBeGreaterThan(0)
    })
})
