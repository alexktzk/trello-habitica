class HabiticaTask {
  constructor(
    trello,
    storage = new HabiticaStorage(trello),
    API = new HabiticaApi(trello)
  ) {
    this.t = trello
    this.storage = storage
    this.API = API
  }

  template(card) {
    let cardUrl = `https://trello.com/c/${card.shortLink}`

    return {
      type: 'todo',
      text: `### ![](${TRELLO_ICON})&ensp; ${card.name}`,
      notes: `[Open in Trello](${cardUrl})`
    }
  }

  async handleAdd() {
    let card = await this.t.card('name', 'shortLink')
    let params = this.template(card)

    return this.API.addTask(params)
      .then(res => this.storage.setTask({ id: res.data.id }))
  } 

  async handleRemove() {
    let task = await this.storage.getTask()

    return this.API.removeTask(task.id)
      .then(_ => this.storage.removeTask())
  }

  async handleDo() {
    let task = await this.storage.getTask()

    return this.API.doTask(task.id)
      .then(_ => this.storage.setTask({ done: true }))
  }

  async handleUndo() {
    let task = await this.storage.getTask()

    return this.API.undoTask(task.id)
      .then(_ => this.storage.setTask({ done: false }))
  }

  handleScopedSync(task) {
    if (task.id) {
      if (task.done) {
        return this.handleUndo().then(() => this.handleRemove())
      } else {
        return this.handleRemove()
      }
    }
  }

  handleSync(task, listType) {
    if (listType == LIST_TYPES.DOING) {
      if (task.id) {
        if (task.done) {
          return this.handleUndo()
        }
      } else {
        return this.handleAdd()
      }
    } else if (listType == LIST_TYPES.DONE) {
      if (task.id) {
        if (!task.done) {
          return this.handleDo()
        }
      } else {
        return this.handleAdd().then(() => this.handleDo())
      }
    } else {
      if (task.id) {
        if (task.done) {
          return this.handleUndo().then(() => this.handleRemove())
        } else {
          return this.handleRemove()
        }
      }
    }
  }

  async sync() {
    let card = await this.t.card('id', 'idList', 'members')
    let settings = await this.storage.getSettings()
    let task = await this.storage.getTask()

    if (settings.scope == CARD_SCOPES.ASSIGNED_TO_ME) { 
      let me = this.t.getContext().member
      if (!card.members.some(member => member.id == me)) {
        return this.handleScopedSync(task)
      }
    }

    let lists = await this.storage.getLists()
    let listType = lists[card.idList]

    return this.handleSync(task, listType)
  }
}

// Fails in a browser, but required for tests.
try { module.exports = HabiticaTask } catch(_) {}