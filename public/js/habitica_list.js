class HabiticaList {
  constructor(trello) {
    this.t = trello
  }

  markAsDone() {
    return this.mark(LIST_TYPES.DONE)
  }

  markAsDoing() {
    return this.mark(LIST_TYPES.DOING)
  }

  async mark(listType) {
    const habiticaLists = await this.t.get('board', 'private', 'habiticaLists', {})
    const list = await this.t.list('id', 'name')

    habiticaLists[list.id] = listType

    this.t.closePopup()
    this.notify(`List "${list.name}" was successfully marked`, 'success')
    return this.t.set('board', 'private', 'habiticaLists', habiticaLists)
  }

  async unmark() {
    const habiticaLists = await this.t.get('board', 'private', 'habiticaLists', {})
    const list = await this.t.list('id', 'name')

    delete habiticaLists[list.id]

    this.t.closePopup()
    this.notify(`List "${list.name}" was successfully unmarked`, 'success')
    return this.t.set('board', 'private', 'habiticaLists', habiticaLists)
  }

  notify(message, display = 'info') {
    this.t.alert({
      message,
      display,
      duration: 3
    })
  }
}

// Fails in a browser, but required for tests.
try { module.exports = HabiticaList } catch(_) {}