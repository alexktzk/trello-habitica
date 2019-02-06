const LIST_TYPES = {
  DONE: 'done',
  DOING: 'doing'
}

const CARD_SCOPES = {
  ASSIGNED_TO_ME: 'me',
  NONE: 'none'
}

class Sync {
  constructor(
    trello,
    storage = new Storage(trello)
  ) {
    this.t = trello
    this.storage = storage
    this.task = undefined
  }

  getTask() {
    this.task = this.task || new Task(this.t, this.storage)
    return this.task
  }

  async start() {
    let card = await this.t.card('id', 'idList', 'members')
    let settings = await this.storage.getSettings()
    let taskStorage = await this.storage.getTask()

    // Skips the cards that are not assigned to user.
    // Remove the badge if card was already synced.
    if (settings.scope == CARD_SCOPES.ASSIGNED_TO_ME) { 
      let me = this.t.getContext().member
      if (!card.members.some(member => member.id == me)) {
        return this.handleScoped(taskStorage)
      }
    }

    let lists = await this.storage.getLists()
    let listType = lists[card.idList]

    return this.handle(taskStorage, listType)
  }


  handleScoped(taskStorage) {
    if (taskStorage.id) {
      if (taskStorage.done) {
        return this.getTask().handleUndo().then(() => this.getTask().handleRemove())
      } else {
        return this.getTask().handleRemove()
      }
    }
  }

  handle(taskStorage, listType) {
    if (listType == LIST_TYPES.DOING) {
      if (taskStorage.id) {
        if (taskStorage.done) {
          return this.getTask().handleUndo()
        }
      } else {
        return this.getTask().handleAdd()
      }
    } else if (listType == LIST_TYPES.DONE) {
      if (taskStorage.id) {
        if (!taskStorage.done) {
          return this.getTask().handleDo()
        }
      } else {
        return this.getTask().handleAdd().then(() => this.getTask().handleDo())
      }
    } else {
      if (taskStorage.id) {
        if (taskStorage.done) {
          return this.getTask().handleUndo().then(() => this.getTask().handleRemove())
        } else {
          return this.getTask().handleRemove()
        }
      }
    }
  }
}