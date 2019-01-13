var h = habitica = ({
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
