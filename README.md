# @composi/idb
Promise wrapper for IndexedDB with simple API like localStorage. It's small and has no dependencies.

@composi/idb provides a simple solution for client-side data persistence using IndexedDB. It creates a default database and store in which you can store keys and values. Keys must be strings, and values can be any JavaScript type: strings, numbers, booleans, arrays, objects, Sets, Maps, or even blobs, such as images, sound files, etc.

With @composi/idb you don't have to create a database, create a store, open a database connection, manage version augmentation, worry about ugrading the schema, stress out about transactions. All the complexity of IndexedDB is hidden by a simple interface so you can store your data as easily as using localStorage, but with the robustness of IndexedDB.

@composi/idb's operations are promise-based, so they are non-blocking. This means after performing an operation, you'll need to use a thenable to capture the result of the operation or do something else when the operation completes.

## Install

If you've created your project with @composi/create-composi-app, then @composi/idb is already installed and ready to import into your project. If you are using it without @composi/core, you can install it from NPM:

```bash
npm i -D @composi/idb
```
Then import it in your project:

```javascript
import { idb } from '@composi/idb'
```

## How it Works

IndexedDB is capable of creating many databases, each having multiple stores. The design goal of @composi/idb is to provide access to IndexedDB with the simplicity of localStorage. For that reason, @composi/idb only creates one database with one store. When you perform operations such as set or get, these are operating on the one store of the one database. There is also no support for versioning a database. If you find the features of @composi/idb too limited, you can look at other IndexedDB wrappers, such as [pouchdb-browser](https://www.npmjs.com/package/pouchdb-browser), and [idb](https://www.npmjs.com/package/idb), or search on [NPM](https://www.npmjs.com/search?q=indexeddb).

## New Database

There is no need to create a new database. The first time you use one of idb's methods, it checks to see if its database exists or not. If not, it creates it and performs the operation on it. In the following example, we import idb, then set a key value pair. This results in the database `composi-idb` being created and the data being injected into the store `composi-store`.

```javascript
import { idb } from '@composi/idb'

// Since this is the first use of idb,
// When we set a key/value, 
// this creates the database for us.
idb.set('cities', ['Paris', 'Milan', 'Tokyo', 'Los Angeles', 'Vancouver'])
```

## Methods

@composi/idb databases has five methods:

1. set(key, value) - set a key's value
2. get(key) - get a key's value
3. remove(key) - remove a key
4. clear() - remove all keys
5. keys() - get array of all keys

You can also access the idb database name and store name. These are readonly values.

```javascript
console.log(idb.name) // composi-idb
console.log(idb.storeName) // composi-store
```

## set

The `set` method takes two arguments: key and value. Value can be any JavaScript type: null, undefined, boolean, string, number, array or object. It can also be blobs, such as images, sound files, etc.

If the database does not exist at load time, using `set` will create it before inserting the key/value pair.

You can add as many keys as you need to to the database. You can use each key/value pair as a separate table. Each value holding an array of objects. This gives you something like individual tables in your store. You could also just treat the whole store as a table. In that case each key/value pair would be an entry in that table. 

In the following example we set a key/value pair. Since this is async, if you want to do anything after that, you'll need to use a thenable.

```javascript
idb.set('employees', ['Sam', 'Clare', 'Joe', 'Sarah'])
```

## get

`get` takes on argument--the key you want to retrieve. Because this is async, you need to use a thenable to capture the result returned by `get`.
In the following example we get a key and log its value:

```javascript
idb.get('cars')
  .then(data) {
    // Check that we have something:
    if (data)
      console.log(data)
  }
  .catch(err => {
    console.log(err)
  })
```

## remove

You may want to delete a key from the store. You do that by passing the key to the idb method `remove`. Since this is async, if you want to do anything after that, you'll need to use a thenable.

```javascript
idb.remove('users')
  .then(() => console.log('The key was removed.'))
  .catch(err => console.error(err))
```

## clear

Sometime you need to clear out a database. Maybe the data is stale, or there are too many giblets and you want to make sure the user has a more efficient data store. You can clear out all the entries in the database by running `clear`. This takes no arguments. Since this is async, if you want to do anything after that, you'll need to use a thenable.

```javascript
idb.clear()
  .then(() => {
    idb.set('new-stuff', 'This is new data!!!)
  })
  .then() => {
    console.log('The database has been cleaned up.')
  }
```

## keys

You may want to get all the keys in your IndexedDB database. To do this you use the `keys` method, which returns an array of all the keys in the database's store. Since this is async, you'll need to use thenables.

```javascript
idb.keys()
  .then(keys => {
    if (keys && keys.length)
      console.log(`The database has the follow keys: ${keys.join(', ')}`)
  })
```

## Using with Composi DataStore

@composi/datastore has builtin support for saving its state locally. You can save it and retrieve it from IndexedDB using the two methods: `putInIdb` and `getFromIdb`. When you do this, the dataStore saves its  entire state as the value of a key. In some situations where you don't want to bother with the details, this is fine. But you may not want to persist everything in a dataStore's state. 

Imagine your app has membership and you want to be able to persist all the new gold members. That way when the user comes back to the page, you can retrieve those new gold members for IndexedDB. Let's look at how we might do that:

```javascript
import { h, render } from '@composi/core'
import { DataStore } from '@composi/datastore'
import { idb } from '@composi/idb'

function GoldMembersList({data}) {
  return (
    <div class='list--gold-members'>
      <h2>New Gold Members</h2>
      <ul>
        {
          data.map(member => <li key={member.id}>{member.lastName}, {member.firstName}</li>)
        }
      </ul>
    </div>
  )
}

// Create new dataStore:
const goldMembersStore = new DataStore()

// Setup a watcher to render the list when 
// the dataStore's state changes.
goldMembersStore.watch('new-gold-members', data => {
  // Check that we got new members:
  if (data && data.length) {
    render(<GoldMembersList data={data} />, 'section')
  }
})

// Setup a watcher to add a new gold member to idb:
goldMembersStore.watch('new-gold-member:added', data => {
  if (data && data.membership === 'gold') {
    idb.set('new-gold-members', data)
  } 
})

// Now that we have a gold members component and 
// a dataStore to watch for changes to the data, 
// let's load those members from IndexDB:

idb.get('new-gold-members')
  .then(data => {
    if (data && data.length)
      // Push the data to our dataStore, 
      // causing the component to render:
      goldMembersStore.setState(prevState => {
        prevState = data
        return prevState
      })
  })

// Later we have some code that adds a new gold member.
// We're assume we have the data for this already.
// Executing this update will cause the list
// of new gold members to update, 
// and add the new member to the idb database.
dataStore.setState(prevState => {
  prevState.push({
    id,
    firstName,
    lastName,
    membership,
    startDate
  })
})
```
## Using with an Observer

Although the above works, you might want to be more granular about how the data is persisted. All dataStore watchers execute every time the dataStore state changes. For something where you want a conditional idb database update, this forces you to check the dataStore changes each time in the watcher. You can avoid this by opting to use a dedicated observer to handle the database update. We would need to import @composi/observer and use it instead of the dataStore watcher. And when we modify the dataStore state, we would dispatch that data to the observer:

```javascript
import { h, render } from '@composi/core'
import { DataStore } from '@composi/datastore'
import { Observer } from '@composi/observer'
import { idb } from '@composi/idb'


// Setup an observer to persist dataStore state changes.
const goldMemberObserver = new Observer()
goldMemberObserver.watch('new-gold-member', data => {
  // Check that we got a new member:
  if (data) {
    idb.set('new-gold-members', data)
  } 
})

// Let's add a new gold member and
// dispatch the member directly to the observer:
dataStore.setState(prevState => {
  prevState.push({
    id,
    firstName,
    lastName,
    membership,
    startDate
  })
  // Dispatch new gold member to observer:
  if (membership === 'gold')
    goldMemberObserver.dispatch('new-gold-member', {
      id,
      firstName,
      lastName,
      membership,
      startDate
    })
})
```

Now our handling of gold members is cleaner. Our dataStore doesn't have to worry about membership, it just re-renders the member list when its state changes. And we check when adding a new member whether to persit him or her by using a dedicated observer.


