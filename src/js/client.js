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

const ICONS = {
  HABITICA: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAC0UExURUdwTAAAAEEjdUEjdUIzeDQvaQAA/0EidUEjdVMiiEQndkEjdUAidUEjdUIidkEjdUEidUAidUEidEEjdUEidUEjdkAjdUMic0EjdUEjdUEjdUEidUEjdUEjdUAjdUIkdEEidEAjdUEjdUEjdUAidUMidEEjd0EidUEidUEjdUEjdUIidkEkdUEjdEEjdT4ndkEjdUIidEIjdkEjdUQlekUlfEMkeEYnfUcngEopg0UnfEwqh08GzoYAAAAzdFJOUwABn9ADBQH9/gIKwq/7QJbLj1VD33ZwD/iKslvZ9UkvUL25pE0iKoPw5Zo2HHFnGMZ8ps6c3PwAAAF2SURBVBgZZcBVluMwEEDR57hsyaCQw8zQMFSSA73/fY3TZ/7mEvEBKf8T3npIxj/SSDKAhOFjCAkQiaR8ywChqn0HMskAqs5o3nkng5R8UIe4DYzbq5m/Bf/oQgTC8L709bYfUTxuxjkXBgkpJBHF3TgfFhWbQe100j+mQArkf5yvbR36FMGpHkgjoL8GqtF5oeqqrndWw5QM2PXyjHIQT9TVZqJWjb0dEBI6BWzu3lk1qlZVXZghJJz9DobeG+eM1YapY4GE3telt2bVre83tapq1bTJEOaxfh2A9Xx6UauqJvxAQDheL2WUkJ9nS7Wq6kKJAJGM096I8eIR1GrDPd8QXoTPIb/vS2O1Ya2vEICEapuzDU5VXcNPyQCE9+4HaeyNWhPCU+s2AqTkv9YIsTdW/W4zWoYVAgibFrlQBOd8D+jfViQRZJy6Y2Drl3rlZTDnW8bnotXpPkO4+SLejafhWhY/ASKOo86+9VLOWqf9fl+Wp78TOCsCfttvbQAAAABJRU5ErkJggg==',
  TASK_DOING: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAC0UExURUdwTAAAAEEjdUEjdUIzeDQvaQAA/0EidUEjdVMiiEQndkEjdUAidUEjdUIidkEjdUEidUAidUEidEEjdUEidUEjdkAjdUMic0EjdUEjdUEjdUEidUEjdUEjdUAjdUIkdEEidEAjdUEjdUEjdUAidUMidEEjd0EidUEidUEjdUEjdUIidkEkdUEjdEEjdT4ndkEjdUIidEIjdkEjdUQlekUlfEMkeEYnfUcngEopg0UnfEwqh08GzoYAAAAzdFJOUwABn9ADBQH9/gIKwq/7QJbLj1VD33ZwD/iKslvZ9UkvUL25pE0iKoPw5Zo2HHFnGMZ8ps6c3PwAAAF2SURBVBgZZcBVluMwEEDR57hsyaCQw8zQMFSSA73/fY3TZ/7mEvEBKf8T3npIxj/SSDKAhOFjCAkQiaR8ywChqn0HMskAqs5o3nkng5R8UIe4DYzbq5m/Bf/oQgTC8L709bYfUTxuxjkXBgkpJBHF3TgfFhWbQe100j+mQArkf5yvbR36FMGpHkgjoL8GqtF5oeqqrndWw5QM2PXyjHIQT9TVZqJWjb0dEBI6BWzu3lk1qlZVXZghJJz9DobeG+eM1YapY4GE3telt2bVre83tapq1bTJEOaxfh2A9Xx6UauqJvxAQDheL2WUkJ9nS7Wq6kKJAJGM096I8eIR1GrDPd8QXoTPIb/vS2O1Ya2vEICEapuzDU5VXcNPyQCE9+4HaeyNWhPCU+s2AqTkv9YIsTdW/W4zWoYVAgibFrlQBOd8D+jfViQRZJy6Y2Drl3rlZTDnW8bnotXpPkO4+SLejafhWhY/ASKOo86+9VLOWqf9fl+Wp78TOCsCfttvbQAAAABJRU5ErkJggg==',
  TASK_DONE: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACZUExURUdwTJnNMpnMM4y6J5nMM2p9AJnMM5bfPpnMM5vPM5nMM5nNMpzQNpnMM5nMM5nLMpjLMpjNM5nNMpfLLpnMM5nNMpjMMpnNM5fKMpnMMpnMMpnMM5nMM5nMM5vMM5jKMprMM5jMM5rMM5nLNJfLNJrLNJjMM5jKM5nMM6TbN6PaNprOM6HXNp/UNaDVNZzQNJ3SNKbeN6jgOA6jikkAAAAodFJOUwD99gb+Af0C+gR5mx7s18sno0YOscVO0VZw5+KB9zstiHKrwUBilW/wrNXJAAABCklEQVQoz2WR2ZqDIAxGU9SAu1Vrp/vsA4ja9v0fbojaWTAX5PNEzw8C4FQQ2IVzWBSHj6yk5lQI73jDHSx5su/YYGLuevhGC4l4rx0OsRJSypOuHdHO4EpKYbJq3CF/8LId0PIru8wCPvEi7awI2+uTfSDoUQ/By22w9IU+Ag+Ir7MCQupjsFCvs+JTqf3ZfhBp9Cl4W5EA4KiR9ayBZmgpuEuLiX91EqXoT9GhH4OHZuKQ3RiJW0Pvr1BHFEx1Tg1FIvlt8Pr3x14OWlg4cp17s4jOkGwVTcbg5IfTwao3JZCC2/IPp0lYK5uB5uUfpwnE2mcqXtyonTz39423vGkLojxxRI+J4/kGZm0YuxibMCYAAAAASUVORK5CYII=',
  NOTIFICATIONS: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAQAAABKIxwrAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADdcAAA3XAUIom3gAAAAHdElNRQfjAhUOEh7JZlf7AAAA5UlEQVQ4y43RvWoCQRSG4ZfFf7ELxCrEQm0kjeg1GKIQMFcg3kRyQwqBXIliGxAbLYUtJGgQ3M9mwcWZnZ3TzDDnGfg4B8zKM+ePGTm86gMhxNhsBRb+GJ91H16kGd+aFLKCjNjFUYTYMnThKVECC3FhkoZfON9hIc507PzHgoX4tuEy/yn8RMmcTINiSsgSzyavOkZQc63JUQE+H/MmenDwJ5N3HbxthtqkjFGI1T1/d2Ah3pK4wG8GXye38pWBhfi85T548AMB5ICIFpXMDR2JbM999oSEhOzp+Wz6lSVHFgzM1hX87JwFnhPN4gAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOS0wMi0yMVQxMzoxODozMCswMTowMB5daKIAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTktMDItMjFUMTM6MTg6MzArMDE6MDBvANAeAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg=='
}

LIST_TYPES = {
  DONE: 'done',
  DOING: 'doing'
}

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
      height: 394,
    })
    
    let loginPage = (t) => t.popup({
      title: 'Log in Habitica',
      url: './login.html',
      height: 340,
    })

    return [
      {
        icon: ICONS.HABITICA,
        text: currentUser.loggedIn ? currentUser.name : 'Login',
        callback: currentUser.loggedIn ? settingsPage : loginPage
      },
      {
        icon: ICONS.NOTIFICATIONS,
        text: ' ',
        callback: (t) => t.popup({
          title: "What's new?",
          url: './changelog/',
          height: 525
        })
      }
  ]
  },
  'card-badges': async (t) => {
    let storage = new Storage(t)
    let currentUser = await storage.getUser()
    if (!currentUser.loggedIn) return []

    return syncWithHabitica(t).then(async () => {
      let settings = await storage.getSettings()
      if (!settings.showBadges) return []

      let taskData = await storage.getTask()
      return [
        { icon: taskData.id ? ICONS.TASK_DOING : null }, 
        { icon: taskData.done ? ICONS.TASK_DONE : null }
      ]
    })
  },
  'card-detail-badges': async (t) => {
    let taskData = await new Storage(t).getTask()
    if (!taskData.id) return []

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
