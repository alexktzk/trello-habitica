const TRELLO_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYBAMAAAASWSDLAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAACmAAAApgHdff84AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAACRQTFRFAGbMA3a9A3e8Ane9A3e9GYPCR5rMa63Ud7PXvNfm4Onu7O/xNljIFwAAAAN0Uk5TBWHLjO1H6wAAAGRJREFUGNNjYFQ2hgIjAQZhYzgwZFBGcIwYjM1X794ZbDp7965iYwZjq927dxebA4nFQI41kG62ABKbacMxAxKTYRyTjI72YBgH4jiiOZZATjKMY1rR0eYM4yABVG+jBAhyUAEAulltP7yEQqgAAAAASUVORK5CYII='

class Task {
  constructor(
    trello,
    storage = new Storage(trello),
    API = new HabiticaApi(trello, storage)
  ) {
    this.t = trello
    this.storage = storage
    this.API = API
  }

  async template(card) {
    let cardUrl = `https://trello.com/c/${card.shortLink}`
    let settings = await this.storage.getSettings()

    return {
      type: 'todo',
      priority: settings.priority,
      text: `### ![](${TRELLO_ICON})&ensp; ${card.name}`,
      notes: `[Open in Trello](${cardUrl})`
    }
  }

  async handleAdd() {
    let card = await this.t.card('name', 'shortLink')
    let params = await this.template(card)

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

// Fails in a browser, but required for tests.
try { module.exports = Task } catch(_) {}
