class HabiticaStorage {
  constructor(trello) {
    this.t = trello
  }

  getTask() {
    return this.t.get('card', 'private', 'task', {})
  }

  setTask(params) {
    return this.t.get('card', 'private', 'task').then(task => {
      return this.t.set('card', 'private', 'task', Object.assign({}, task, params))
    })
  }

  removeTask() {
    return this.t.remove('card', 'private', 'task')
  }

  getSettings() {
    return this.t.get('member', 'private', 'settings', {})
  }

  getHabiticaLists() {
    return this.t.get('board', 'private', 'habiticaLists', {})
  }
}
