const Storage = require('../public/js/storage')
const List = require('../public/js/list')

LIST_TYPES = {
  DONE: 'done',
  DOING: 'doing'
}

const minimalT = {
  get: jest.fn(() => ({}) ),
  list: jest.fn(() => ({ id: 123, name: 'List name' }) ),
  closePopup: jest.fn(),
  alert: jest.fn(),
  set: jest.fn()
}

describe('List class', () => {
  describe('constructor', () => {
    let t, storage, list

    beforeAll(() => {
      t = { get: jest.fn(() => {}), set: jest.fn() }
      storage = new Storage(t)
    })

    beforeEach(() => {
      list = new List(t, storage)
    }) 

    it('assigns passed trello instance to local t variable', () => {
      expect(list.t).toBeDefined()
      expect(list.t).toBe(t)
    })

    it('assigns passed storage to local storage variable', () => {
      expect(list.storage).toBeDefined()
      expect(list.storage).toBe(storage)
    })
  })

  describe('.markAsDone()', () => {
    let t, storage, list

    beforeAll(() => {
      t = minimalT
      storage = new Storage(t)
    })

    beforeEach(() => {
      list = new List(t, storage)
    }) 

    it('calls .mark()', async() => {
      let mark = jest.spyOn(list, 'mark')
      list.markAsDone()
      expect(mark).toBeCalled()
    })

    it('calls .mark() with proper args', () => {
      let mark = jest.spyOn(list, 'mark')
      list.markAsDone()
      expect(mark).toBeCalledWith(LIST_TYPES.DONE)
    })
  })

  describe('.markAsDoing()', () => {
    let t, storage, list, lists

    beforeAll(() => {
      t = minimalT
      storage = new Storage(t)
    })

    beforeEach(() => {
      list = new List(t, storage)
    }) 

    it('calls .mark()', async() => {
      let mark = jest.spyOn(list, 'mark')
      list.markAsDoing()
      expect(mark).toBeCalled()
    })

    it('calls .mark() with proper args', () => {
      let mark = jest.spyOn(list, 'mark')
      list.markAsDoing()
      expect(mark).toBeCalledWith(LIST_TYPES.DOING)
    })
  })

  describe('.mark()', () => {
    let t, storage, list, listType

    beforeAll(() => {
      t = minimalT
      storage = new Storage(t)
      listType = LIST_TYPES.DOING
    })

    beforeEach(() => {
      list = new List(t, storage)
    }) 

    it('gets lists from the storage', async () => {
      let getLists = jest.spyOn(storage, 'getLists')
      await list.mark(listType)
      expect(getLists).toBeCalled()
    })

    it('gets list data', async () => {
      await list.mark(listType)
      expect(t.list).toBeCalled()
    })

    it('updates current list type', async () => {
      let listData = t.list()
      let setLists = jest.spyOn(storage, 'setLists')
      await list.mark(listType)
      expect(setLists).toBeCalledWith({ [listData.id]: listType })
    })

    it('closes popup', async () => {
      await list.mark(listType)
      expect(t.closePopup).toBeCalled()
    })

    it('notifies', async () => {
      let notify = jest.spyOn(list, 'notify')
      await list.mark(listType)
      expect(notify).toBeCalled()
    })

    it('saves updated lists to storage', async () => {
      let setLists = jest.spyOn(storage, 'setLists')
      await list.mark(listType)
      expect(setLists).toBeCalled()
    })
  })

  describe('.unmark()', () => {
    let t, storage, list, listType, currentList

    beforeAll(() => {
      currentList = { id: 37, name: 'List name'}
      t = Object.assign({}, minimalT, {
        get: jest.fn(() => ({ [currentList.id]: 'done' }) ),
        list: jest.fn(() => currentList)
      })
      storage = new Storage(t)
      listType = LIST_TYPES.DOING
    })

    beforeEach(() => {
      list = new List(t, storage)
    }) 

    it('gets lists from the storage', async () => {
      let getLists = jest.spyOn(storage, 'getLists')
      await list.unmark()
      expect(getLists).toBeCalled()
    })

    it('gets list data', async () => {
      await list.unmark()
      expect(t.list).toBeCalled()
    })

    it('deletes current list from lists', async () => {
      let setLists = jest.spyOn(storage, 'setLists')
      await list.unmark()
      expect(setLists).toBeCalledWith({})
    })

    it('closes popup', async () => {
      await list.unmark()
      expect(t.closePopup).toBeCalled()
    })

    it('notifies', async () => {
      let notify = jest.spyOn(list, 'notify')
      await list.unmark()
      expect(notify).toBeCalled()
    })

    it('saves updated lists to storage', async () => {
      let setLists = jest.spyOn(storage, 'setLists')
      await list.unmark()
      expect(setLists).toBeCalled()
    })
  })
})
