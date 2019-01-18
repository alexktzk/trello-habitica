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
  HABITICA: 'https://cdn.glitch.com/project-avatar/b281f61d-200e-4898-83b3-b6aa7db06df9.png',
  TASK_DOING: 'https://cdn.glitch.com/project-avatar/b281f61d-200e-4898-83b3-b6aa7db06df9.png',
  TASK_DONE: 'https://cdn.glitch.com/project-avatar/71dc7d01-6387-43b0-b720-e9d264da3a8e.png'
}

let getBadges = t => {
  return t.get('card', 'private', 'task', {}).then(task => (
    [{
      icon: task.id ? ICONS.TASK_DOING : null // for card front badges only
    }, 
    {
      icon: task.done ? ICONS.TASK_DONE : null
    }]
  ))
}

// We need to call initialize to get all of our capability handles set up and registered with Trello
TrelloPowerUp.initialize({
  // NOTE about asynchronous responses
  // If you need to make an asynchronous request or action before you can reply to Trello
  // you can return a Promise (bluebird promises are included at TrelloPowerUp.Promise)
  // The Promise should resolve to the object type that is expected to be returned
  'board-buttons': (t, options) => (
    [{
      icon: ICONS.HABITICA,
      text: 'Settings',
      callback: t => (
        t.popup({
          title: 'Habitica settings',
          url: './settings.html', // Check out public/authorize.html to see how to ask a user to auth
          height: 240,
        })
      )
    }]
  ),
  'card-badges': (t, options) => {
    h.sync(t)
    return getBadges(t)
  },
  'card-detail-badges': (t, options) => (
    t.get('card', 'private', 'task', {}).then(task => (
      [{
        title: 'Habitica',
        text: task.id ? 'Remove' : 'Add',
        callback: task.id ? h.removeTask : h.addTask
      }]
    ))
  ),
  'list-actions': t => (
    t.get('board', 'private', 'habiticaLists', {}).then(habiticaLists => (
      t.list('id').then(list => {
        let listType    = habiticaLists[list.id]

        if (listType == LIST_TYPES.DOING) {
          return [{
            text: 'Unmark list as "Doing"',
            callback: h.unmarkList
          }]
        } else if (listType == LIST_TYPES.DONE) {
          return [{
            text: 'Unmark list as "Done"',
            callback: h.unmarkList
          }]
        } else {
          return [{
            text: 'Mark list as "Doing"',
            callback: h.markListAsDoing
          },
          {
            text: 'Mark list as "Done"',
            callback: h.markListAsDone
          }]
        }
      })
    ))
  ),
  'show-settings': (t, options) => (
    // when a user clicks the gear icon by your Power-Up in the Power-Ups menu
    // what should Trello show. We highly recommend the popup in this case as
    // it is the least disruptive, and fits in well with the rest of Trello's UX
    t.popup({
      title: 'Settings',
      url: './settings.html',
      height: 184 // we can always resize later, but if we know the size in advance, its good to tell Trello
    })
  ),
  
  /*        
      
      🔑 Authorization Capabiltiies 🗝
      
      The following two capabilities should be used together to determine:
      1. whether a user is appropriately authorized
      2. what to do when a user isn't completely authorized
      
  */
  'authorization-status': (t, options) => (
    // Return a promise that resolves to an object with a boolean property 'authorized' of true or false
    // The boolean value determines whether your Power-Up considers the user to be authorized or not.
    
    // When the value is false, Trello will show the user an "Authorize Account" options when
    // they click on the Power-Up's gear icon in the settings. The 'show-authorization' capability
    // below determines what should happen when the user clicks "Authorize Account"
    
    // For instance, if your Power-Up requires a token to be set for the member you could do the following:
    t.get('member', 'private', 'token')
    // Or if you needed to set/get a non-Trello secret token, like an oauth token, you could
    // use t.storeSecret('key', 'value') and t.loadSecret('key')
    .then(token => {
      if(token){
        return { authorized: true }
      }
      return { authorized: false }
    })
    // You can also return the object synchronously if you know the answer synchronously.
  ),
  'show-authorization': (t, options) => {
    // Returns what to do when a user clicks the 'Authorize Account' link from the Power-Up gear icon
    // which shows when 'authorization-status' returns { authorized: false }.
    
    // If we want to ask the user to authorize our Power-Up to make full use of the Trello API
    // you'll need to add your API from trello.com/app-key below:
    let trelloAPIKey = ''
    // This key will be used to generate a token that you can pass along with the API key to Trello's
    // RESTful API. Using the key/token pair, you can make requests on behalf of the authorized user.
    
    // In this case we'll open a popup to kick off the authorization flow.
    if (trelloAPIKey) {
      return t.popup({
        title: 'My Auth Popup',
        args: { apiKey: trelloAPIKey }, // Pass in API key to the iframe
        url: './authorize.html', // Check out public/authorize.html to see how to ask a user to auth
        height: 140,
      })
    } else {
      console.log("🙈 Looks like you need to add your API key to the project!")
    }
  }
})

console.log('Loaded by: ' + document.referrer)
