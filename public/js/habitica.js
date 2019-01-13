var h = habitica = ({
  addTodo: function(t) {
    return t.set('card', 'private', {
      habiticaId: new Date().getTime()
    });
  },
  removeTodo: function(t) {
    return t.set('card', 'private', {
      habiticaId: null
    });
  },
  sync: t => {
    return t.get('board', 'private', 'habiticaSyncedLists', {}).then(syncedLists => {
      return t.card('id', 'idList').then(card => {
        return t.get('card', 'private').then(cardStorage => {
          var isListSynced = syncedLists[card.idList];

          if (!isListSynced) {
            cardStorage.habiticaId && h.removeTodo(t);
            return;
          }

          if (!cardStorage.habiticaId) { 
            h.addTodo(t);
          }
        });
      });
    });
  },
  syncList: function(t) {
    return h.setListStatus(t, true);
  },
  unsyncList: function(t) {
    return h.setListStatus(t, false);
  },
  setListStatus: function(t, status) {
    return t.get('board', 'private', 'habiticaSyncedLists', {}).then(function (syncedLists) {
      return t.list('id', 'name').then(function (list) {
        syncedLists[list.id] = status;
        t.closePopup();
        t.alert({
          message: `List "${list.name}" successfully ${status ? '' : 'un'}synced...`,
          duration: 2,
          display: status ? 'success' : null
        });
        return t.set('board', 'private', 'habiticaSyncedLists', syncedLists);
      })
    })
  }
})
