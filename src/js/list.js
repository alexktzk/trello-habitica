import { LIST_TYPES } from './constants'
import Storage from './storage'

export default class List {
  constructor(
    trello,
    storage = new Storage(trello)
  ) {
    this.t = trello
    this.storage = storage
  }

  markAsDone() {
    return this.mark(LIST_TYPES.DONE)
  }

  markAsDoing() {
    return this.mark(LIST_TYPES.DOING)
  }

  async mark(listType) {
    const lists = await this.storage.getLists()
    const list = await this.t.list('id', 'name')

    lists[list.id] = listType

    this.t.closePopup()
    this.notify(`List "${list.name}" was successfully marked`, 'success')
    return this.storage.setLists(lists)
  }

  async unmark() {
    const lists = await this.storage.getLists()
    const list = await this.t.list('id', 'name')

    delete lists[list.id]

    this.t.closePopup()
    this.notify(`List "${list.name}" was successfully unmarked`, 'success')
    return this.storage.setLists(lists)
  }

  notify(message, display = 'info') {
    this.t.alert({
      message,
      display,
      duration: 3
    })
  }
}
