let h = habitica = ({
  loading: {},
  api: 'https://habitica.com/api/v3',
  request: (t, callback) => (
    h.preventDuplicated(t, () => (
      h.withHeaders(t, headers => (
        callback(
          axios.create({
            baseURL: h.api,
            timeout: 10000,
            headers: headers
          })
        )
      ))
    ))
  ),
  preventDuplicated: (t, callback) => (
    t.card('id').get('id').then(card => {
      if (h.loading[card.id]) { return }
      
      h.loading[card.id] = true
      return callback().then(() => {
        h.loading[card.id] = false
      })
    })
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
  addTask: t => (
    h.request(t, (http) => (
      t.card('name').then(card => (
        http.post('/tasks/user', {
          type: 'todo',
          text: card.name
        })
        .then((res) => res.data)
        .then((res) => (
          t.set('card', 'private', 'task', {
            id: res.data.id
          })
        ))
        .catch(error => console.error(error))
      ))
    ))
  ),
  removeTask: t => (
    h.request(t, (http) => (
      t.get('card', 'private', 'task').then(task => (
        http.delete(`/tasks/${task.id}`)
          .then(_ => (
            t.remove('card', 'private', 'task')
          ))
          .catch(error => console.error(error))
      ))
    ))
  ),
  sync: t => (
    t.get('board', 'private', 'habiticaSyncedLists', {}).then(syncedLists => (
      t.card('id', 'idList').then(card => (
        t.get('card', 'private', 'task', {}).then(task => {
          let isListSynced = syncedLists[card.idList]

          if (!isListSynced) {
            task.id && h.removeTask(t)
            return
          }

          if (!task.id) { 
            h.addTask(t)
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
