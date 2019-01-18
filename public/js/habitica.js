const LIST_TYPES = {
  DONE: 'done',
  DOING: 'doing'
}

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
  doTask: t => (
    h.request(t, (http) => (
      t.get('card', 'private', 'task').then(task => (
        http.post(`/tasks/${task.id}/score/up`)
          .then(_ => (
            t.set('card', 'private', 'task', Object.assign({}, task, {
              done: true
            }))
          ))
          .catch(error => console.error(error))
      ))
    ))
  ),
  undoTask: t => (
    h.request(t, (http) => (
      t.get('card', 'private', 'task').then(task => (
        http.post(`/tasks/${task.id}/score/down`)
          .then(_ => (
            t.set('card', 'private', 'task', Object.assign({}, task, {
              done: false
            }))
          ))
          .catch(error => console.error(error))
      ))
    ))
  ),
  sync: t => (
    t.get('board', 'private', 'habiticaLists', {}).then(habiticaLists => (
      t.card('id', 'idList').then(card => (
        t.get('card', 'private', 'task', {}).then(task => {
          let listType = habiticaLists[card.idList]

          if (listType == LIST_TYPES.DOING) {
            if (task.id) {
              if (task.done) {
                return h.undoTask(t)
              }
            } else {
              return h.addTask(t)
            }
          } else if (listType == LIST_TYPES.DONE) {
            if (task.id) {
              if (!task.done) {
                return h.doTask(t)
              }
            } else {
              return h.addTask(t).then(() => h.doTask(t))
            }
          } else {
            if (task.id) {
              if (task.done) {
                return h.undoTask(t).then(() => h.removeTask(t))
              } else {
                return h.removeTask(t)
              }
            }
          }
        })
      ))
    ))
  ),
  markListAsDone: t => (
    h.markList(t, LIST_TYPES.DONE)
  ),
  markListAsDoing: t => (
    h.markList(t, LIST_TYPES.DOING)
  ),
  markList: (t, listType) => (
    t.get('board', 'private', 'habiticaLists', {}).then(habiticaLists => (
      t.list('id', 'name').then(list => {
        habiticaLists[list.id] = listType
        t.closePopup()
        t.alert({
          message: `List "${list.name}" was successfully marked`,
          duration: 2,
          display: 'success'
        })
        return t.set('board', 'private', 'habiticaLists', habiticaLists)
      })
    ))
  ),
  unmarkList: t => (
    t.get('board', 'private', 'habiticaLists', {}).then(habiticaLists => (
      t.list('id', 'name').then(list => {
        delete habiticaLists[list.id]
        t.closePopup()
        t.alert({
          message: `List "${list.name}" was successfully unmarked`,
          duration: 2
        })
        return t.set('board', 'private', 'habiticaLists', habiticaLists)
      })
    ))
  )
})
