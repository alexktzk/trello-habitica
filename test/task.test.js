const Task = require('../public/js/task')
const Storage = require('../public/js/storage')
const HabiticaApi = require('../public/js/habitica_api')

jest.mock('../public/js/habitica_api')

describe('Task class', () => {
  describe('constructor', () => {
    let t, storage, API, task

    beforeAll(() => {
      t = {}
      storage = new Storage(t)
      API = new HabiticaApi(t, storage)
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
    }) 

    it('assigns passed trello instance to local t variable', () => {
      expect(task.t).toBeDefined()
      expect(task.t).toBe(t)
    })

    it('assigns passed storage to local storage variable', () => {
      expect(task.storage).toBeDefined()
      expect(task.storage).toBe(storage)
    })

    it('assings passed API instance to local API variable', () => {
      expect(task.API).toBeDefined()
      expect(task.API).toBe(API)
    })
  })

  describe('.template()', () => {
    let t, storage, API, task, card

    beforeAll(() => {
      t = { get: jest.fn(() => ({ priority: 1 }) ) }
      storage = new Storage(t)
      API = new HabiticaApi(t, storage)
      card = {
        shortLink: 'asdf',
        name: 'Card name'
      }
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
    })

    it('gets settings from storage', async () => {
      let getSettings = jest.spyOn(storage, 'getSettings')
      await task.template(card)
      expect(getSettings).toBeCalled()
    })

    it('assigns task type as "todo"', async () => {
      let template = await task.template(card)
      expect(template.type).toBeDefined()
      expect(template.type).toBe('todo')
    })

    it('assigns default difficulty(priority) for todo', async () => {
      let template = await task.template(card)
      expect(template.priority).toBeDefined()
    })

    it('uses card name as text for todo', async () => {
      let template = await task.template(card)
      expect(template.text).toBeDefined()
      expect(template.text).toMatch(card.name)
    })

    it('generates card url from shortLink', async () => {
      let template = await task.template(card)
      expect(template.notes).toMatch(card.shortLink)
    })
  })

  describe('.handleAdd()', () => {
    let t, storage, API, task, res

    beforeAll(() => {
      cardData = {
        shortLink: 'asdf',
        name: 'Card name'
      }
      t = { 
        get: jest.fn(async () => ({ priority: 1 }) ),
        set: jest.fn(() => ({}) ),
        card: jest.fn(() => cardData)
      }
      storage = new Storage(t)
      API = new HabiticaApi(t, storage)
      res = { 
        data: {
          id: 123,
          text: 'Card name',
          notes: 'Card url',
          priority: 1
        } 
      }
      API.addTask.mockImplementation(async () => res)
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
    })

    it('gets card data from storage', async () => {
      let card = jest.spyOn(task.t, 'card')
      await task.handleAdd()
      expect(card).toBeCalled()
    })

    it('generates request template', async () => {
      let template = jest.spyOn(task, 'template')
      await task.handleAdd()
      expect(template).toBeCalled()
    })

    it('adds task by using API', async () => {
      let addTask = jest.spyOn(task.API, 'addTask')
      await task.handleAdd()
      expect(addTask).toBeCalled()
    })

    it('stores response in storage', async () => {
      let setTask = jest.spyOn(task.storage, 'setTask')
      await task.handleAdd()
      expect(setTask).toBeCalled()
      expect(setTask).toBeCalledWith(res.data)
    })
  })

  describe('.handleRemove()', () => {
    let t, storage, API, task

    beforeAll(() => {
      t = { 
        get: jest.fn(() => ({}) ),
        remove: jest.fn(() => ({}) )
      }
      storage = new Storage(t)
      API = new HabiticaApi(t, storage)
      API.removeTask.mockImplementation(async () => ({}) )
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
    })

    it('gets task data from storage', async () => {
      let getTask = jest.spyOn(task.storage, 'getTask')
      await task.handleRemove()
      expect(getTask).toBeCalled()
    })

    it('removes task by using API', async () => {
      let removeTask = jest.spyOn(task.API, 'removeTask')
      await task.handleRemove()
      expect(removeTask).toBeCalled()
    })

    it('removes task data from storage', async () => {
      let removeTask = jest.spyOn(task.storage, 'removeTask')
      await task.handleRemove()
      expect(removeTask).toBeCalled()
    })
  })

  describe('.handleDo()', () => {
    let t, storage, API, task

    beforeAll(() => {
      t = { 
        get: jest.fn(async () => ({}) ),
        set: jest.fn(() => ({}) )
      }
      storage = new Storage(t)
      API = new HabiticaApi(t, storage)
      API.doTask.mockImplementation(async () => ({}) )
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
    })

    it('gets task data from storage', async () => {
      let getTask = jest.spyOn(task.storage, 'getTask')
      await task.handleDo()
      expect(getTask).toBeCalled()
    })

    it('do task by using API', async () => {
      let doTask = jest.spyOn(task.API, 'doTask')
      await task.handleDo()
      expect(doTask).toBeCalled()
    })

    it('marks task as done in storage', async () => {
      let setTask = jest.spyOn(task.storage, 'setTask')
      await task.handleDo()
      expect(setTask).toBeCalled()
      expect(setTask).toBeCalledWith({ done: true })
    })
  })

  describe('.handleUndo()', () => {
    let t, storage, API, task

    beforeAll(() => {
      t = { 
        get: jest.fn(async () => ({}) ),
        set: jest.fn(() => ({}) )
      }
      storage = new Storage(t)
      API = new HabiticaApi(t, storage)
      API.undoTask.mockImplementation(async () => ({}) )
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
    })

    it('gets task data from storage', async () => {
      let getTask = jest.spyOn(task.storage, 'getTask')
      await task.handleUndo()
      expect(getTask).toBeCalled()
    })

    it('undo task by using API', async () => {
      let undoTask = jest.spyOn(task.API, 'undoTask')
      await task.handleUndo()
      expect(undoTask).toBeCalled()
    })

    it('marks task as not done in storage', async () => {
      let setTask = jest.spyOn(task.storage, 'setTask')
      await task.handleUndo()
      expect(setTask).toBeCalled()
      expect(setTask).toBeCalledWith({ done: false })
    })
  })

  describe('.handleUpdate()', () => {
    let t, storage, API, task, res

    beforeAll(() => {
      args = { priority: 1 }
      t = { 
        get: jest.fn(async () => ({}) ),
        set: jest.fn(() => ({}) )
      }
      storage = new Storage(t)
      API = new HabiticaApi(t, storage)
      res = { data: args }
      API.updateTask.mockImplementation(async () => res)
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
    })

    it('gets task data from storage', async () => {
      let getTask = jest.spyOn(task.storage, 'getTask')
      await task.handleUpdate(args)
      expect(getTask).toBeCalled()
    })

    it('updates task by using API', async () => {
      let updateTask = jest.spyOn(task.API, 'updateTask')
      await task.handleUpdate(args)
      expect(updateTask).toBeCalled()
    })

    it('stores response in storage', async () => {
      let setTask = jest.spyOn(task.storage, 'setTask')
      await task.handleUpdate(args)
      expect(setTask).toBeCalled()
      expect(setTask).toBeCalledWith(res.data)
    })
  })
})
