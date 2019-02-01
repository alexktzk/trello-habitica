/* global TrelloPowerUp */

// we can access Bluebird Promises as follows
let Promise = TrelloPowerUp.Promise

/*

Trello Data Access

The following methods show all allowed fields, you only need to include those you want.
They all return promises that resolve to an object with the requested fields.

Get information about the current board
t.board('id', 'name', 'url', 'shortLink', 'members')

Get information about the current list (only available when a specific list is in context)
So for example available inside 'attachment-sections' or 'card-badges' but not 'show-settings' or 'board-buttons'
t.list('id', 'name', 'cards')

Get information about all open lists on the current board
t.lists('id', 'name', 'cards')

Get information about the current card (only available when a specific card is in context)
So for example available inside 'attachment-sections' or 'card-badges' but not 'show-settings' or 'board-buttons'
t.card('id', 'name', 'desc', 'due', 'closed', 'cover', 'attachments', 'members', 'labels', 'url', 'shortLink', 'idList')

Get information about all open cards on the current board
t.cards('id', 'name', 'desc', 'due', 'closed', 'cover', 'attachments', 'members', 'labels', 'url', 'shortLink', 'idList')

Get information about the current active Trello member
t.member('id', 'fullName', 'username')

For access to the rest of Trello's data, you'll need to use the RESTful API. This will require you to ask the
user to authorize your Power-Up to access Trello on their behalf. We've included an example of how to
do this in the `🔑 Authorization Capabilities 🗝` section at the bottom.

*/

/*

Storing/Retrieving Your Own Data

Your Power-Up is afforded 4096 chars of space per scope/visibility
The following methods return Promises.

Storing data follows the format: t.set('scope', 'visibility', 'key', 'value')
With the scopes, you can only store data at the 'card' scope when a card is in scope
So for example in the context of 'card-badges' or 'attachment-sections', but not 'board-badges' or 'show-settings'
Also keep in mind storing at the 'organization' scope will only work if the active user is a member of the team

Information that is private to the current user, such as tokens should be stored using 'private' at the 'member' scope

t.set('organization', 'private', 'key', 'value')
t.set('board', 'private', 'key', 'value')
t.set('card', 'private', 'key', 'value')
t.set('member', 'private', 'key', 'value')

Information that should be available to all users of the Power-Up should be stored as 'shared'

t.set('organization', 'shared', 'key', 'value')
t.set('board', 'shared', 'key', 'value')
t.set('card', 'shared', 'key', 'value')
t.set('member', 'shared', 'key', 'value')

If you want to set multiple keys at once you can do that like so

t.set('board', 'shared', { key: value, extra: extraValue })

Reading back your data is as simple as

t.get('organization', 'shared', 'key')

Or want all in scope data at once?

t.getAll()

*/

let syncing = {}

let syncWithHabitica = async (t) => {
  let id = t.getContext().card

  // prevent duplicated tries to sync while previous sync in progress
  if (syncing[id]) return syncing[id]

  // start syncing
  syncing[id] = new Sync(t).start().then(() => {
    return setTimeout(() => delete syncing[id], 1000)
  })
  return syncing[id]
}

t = TrelloPowerUp.initialize({
  'board-buttons': async (t) => {
    let currentUser = await new Storage(t).getUser()

    let settingsPage = (t) => t.popup({
      title: 'Habitica settings',
      url: './settings.html',
      height: 240,
    })
    
    let loginPage = (t) => t.popup({
      title: 'Log in Habitica',
      url: './login.html',
      height: 240,
    })

    return [{
      icon: ICONS.HABITICA,
      text: currentUser.loggedIn ? currentUser.name : 'Login',
      callback: currentUser.loggedIn ? settingsPage : loginPage
    }]
  },
  'card-badges': async (t) => {
    let storage = new Storage(t)
    let currentUser = await storage.getUser()
    if (!currentUser.loggedIn) return []

    return syncWithHabitica(t, storage).then(async () => {
      let taskStorage = await storage.getTask()
      return [
        { icon: taskStorage.id ? ICONS.TASK_DOING : null }, 
        { icon: taskStorage.done ? ICONS.TASK_DONE : null }
      ]
    })
  },
  'card-detail-badges': async (t) => {
    let taskStorage = await new Storage(t).getTask()
    if (!taskStorage.id) return []

    return [{
      title: 'To-Do',
      text: 'Edit',
      callback: t => (
        t.popup({
          title: 'Edit To-Do',
          url: './edit-task.html',
          height: 240,
        })
      )
    }]
  },
  'list-actions': async (t) => {
    let storage = new Storage(t)
    let currentUser = await storage.getUser()
    if (!currentUser.loggedIn) return []
  
    return storage.getLists().then(lists => {
      return t.list('id').then(list => {
        let listType = lists[list.id]

        if (listType == LIST_TYPES.DOING) {
          return [{
            text: 'Unmark list as "Doing"',
            callback: (t) => 
              new List(t).unmark()
          }]
        } else if (listType == LIST_TYPES.DONE) {
          return [{
            text: 'Unmark list as "Done"',
            callback: (t) => 
              new List(t).unmark()
          }]
        } else {
          return [{
            text: 'Mark list as "Doing"',
            callback: (t) => 
              new List(t).markAsDoing()
          },
          {
            text: 'Mark list as "Done"',
            callback: (t) => 
              new List(t).markAsDone()
          }]
        }
      })
    })
  }
})

storage = new Storage(t)

console.log('Loaded by: ' + document.referrer)
