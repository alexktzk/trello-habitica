var h = habitica = ({
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
