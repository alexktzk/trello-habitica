var h = habitica = ({
  api: 'https://habitica.com/api/v3',
  request: (t, callback) => (
    h.withHeaders(t, headers => (
      callback(
        axios.create({
          baseURL: h.api,
          timeout: 10000,
          headers: headers
        })
      )
    ))
  ),
  withHeaders: (t, callback) => (
    t.get('member', 'private').then(member => (
      callback({
        'x-api-user': member.userId,
        'x-api-key': member.apiToken,
        'Content-Type': 'application/json'
      })
    ))
  ),
  addTodo: t => (
    t.set('card', 'private', {
      habiticaId: new Date().getTime()
    })
  ),
  removeTodo: t => (
    t.set('card', 'private', {
      habiticaId: null
    })
  ),
  sync: t => (
    t.get('board', 'private', 'habiticaSyncedLists', {}).then(syncedLists => (
      t.card('id', 'idList').then(card => (
        t.get('card', 'private').then(cardStorage => {
          var isListSynced = syncedLists[card.idList]

          if (!isListSynced) {
            cardStorage.habiticaId && h.removeTodo(t)
            return
          }

          if (!cardStorage.habiticaId) { 
            h.addTodo(t)
          }
        })
      ))
    ))
  ),
  syncList: t => (
    h.setListStatus(t, true)
  ),
  unsyncList: t => (
    h.setListStatus(t, false)
  ),
  setListStatus: (t, status) => (
    t.get('board', 'private', 'habiticaSyncedLists', {}).then(syncedLists => (
      t.list('id', 'name').then(list => {
        syncedLists[list.id] = status
        t.closePopup()
        t.alert({
          message: `List "${list.name}" successfully ${status ? '' : 'un'}synced...`,
          duration: 2,
          display: status ? 'success' : null
        })
        return t.set('board', 'private', 'habiticaSyncedLists', syncedLists)
      })
    ))
  )
})
