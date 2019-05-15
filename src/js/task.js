import { TRELLO_ICON } from './constants'
import Storage from './storage'
import HabiticaApi from './habitica-api'

export default class Task {
  constructor(
    trello,
    storage = new Storage(trello),
    API = new HabiticaApi(trello, storage)
  ) {
    this.t = trello
    this.storage = storage
    this.API = API
  }

  async getTemplate(card) {
    let cardUrl = `https://trello.com/c/${card.shortLink}`
    let settings = await this.storage.getSettings()
    let icon = settings.prependIcon ? `![](${TRELLO_ICON})&ensp;` : ''

    return {
      type: 'todo',
      priority: settings.priority,
      text: `### ${icon}${card.name}`,
      notes: `[Open in Trello](${cardUrl})`
    }
  }

  async handleAdd() {
    let card = await this.t.card('name', 'shortLink')
    let params = await this.getTemplate(card)

    return this.API.addTask(params)
      .then(res => (
        this.storage.setTask({ 
          id: res.data.id,
          text: res.data.text,
          notes: res.data.notes,
          priority: res.data.priority
        })
      ))
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

  async handleUpdate(params) {
    let task = await this.storage.getTask()

    return this.API.updateTask(task.id, params)
      .then(res => (
        this.storage.setTask({
          priority: res.data.priority
        })
      ))
  }
}
