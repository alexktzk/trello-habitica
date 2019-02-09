const Task = require('../public/js/task')
const Storage = require('../public/js/storage')
const HabiticaApi = require('../public/js/habitica_api')

jest.mock('../public/js/habitica_api')

describe('Task class', () => {
  describe('constructor', () => {
    let t = {}, storage = {}, API = {}, task

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
    let t = {}, storage, API = {}, task, card

    beforeAll(() => {
      settings = { priority: 1 }
      storage = {
        getSettings: jest.fn(async () => settings)
      }
      card = {
        shortLink: 'asdf',
        name: 'Card name'
      }
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
    })

    it('gets settings from the storage', async () => {
      await task.template(card)
      expect(task.storage.getSettings).toBeCalled()
    })

    it('assigns task type as "todo"', async () => {
      let template = await task.template(card)
      expect(template.type).toBe('todo')
    })

    it('assigns default difficulty(priority) for todo', async () => {
      let template = await task.template(card)
      expect(template.priority).toBe(settings.priority)
    })

    it('uses card name as text for todo', async () => {
      let template = await task.template(card)
      expect(template.text).toMatch(card.name)
    })

    it('generates card url from shortLink', async () => {
      let template = await task.template(card)
      expect(template.notes).toMatch(card.shortLink)
    })
  })

  describe('.handleAdd()', () => {
    let t, storage, API, task, cardData, res

    beforeAll(() => {
      cardData = {
        shortLink: 'asdf',
        name: 'Card name'
      }
      t = { 
        card: jest.fn(async () => cardData) 
      }
      storage = { 
        setTask: jest.fn() 
      }
      res = { 
        data: {
          id: 123,
          text: 'Card name',
          notes: 'Card url',
          priority: 1
        } 
      }
      API = { 
        addTask: jest.fn(async () => res) 
      }
      templateSample = {
        type: 'todo',
        text: 'Todo text'
      }
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
      task.template = jest.fn(async () => templateSample)
    })

    it('gets card data from the storage', async () => {
      await task.handleAdd()
      expect(task.t.card).toBeCalledWith('name', 'shortLink')
    })

    it('generates request template', async () => {
      await task.handleAdd()
      expect(task.template).toBeCalledWith(cardData)
    })

    it('adds a task by using API', async () => {
      await task.handleAdd()
      expect(task.API.addTask).toBeCalledWith(templateSample)
    })

    it('stores response in the storage', async () => {
      await task.handleAdd()
      expect(task.storage.setTask).toBeCalledWith(res.data)
    })
  })

  describe('.handleRemove()', () => {
    let t = {}, storage, API, task

    beforeAll(() => {
      taskData = { id: 123 }
      storage = {
        getTask: jest.fn(async () => taskData ),
        removeTask: jest.fn(async () => ({}) )
      }
      API = {
        removeTask: jest.fn(async () => ({}) )
      }
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
    })

    it('gets task data from the storage', async () => {
      await task.handleRemove()
      expect(task.storage.getTask).toBeCalledWith()
    })

    it('removes the task by using API', async () => {
      await task.handleRemove()
      expect(task.API.removeTask).toBeCalledWith(taskData.id)
    })

    it('removes task data from the storage', async () => {
      await task.handleRemove()
      expect(task.storage.removeTask).toBeCalledWith()
    })
  })

  describe('.handleDo()', () => {
    let t = {}, storage, API, task

    beforeAll(() => {
      taskData = { id: 123 }
      storage = {
        getTask: jest.fn(async () => taskData),
        setTask: jest.fn(async () => ({}) )
      }
      API = {
        doTask: jest.fn(async () => ({}) )
      }
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
    })

    it('gets task data from the storage', async () => {
      await task.handleDo()
      expect(task.storage.getTask).toBeCalledWith()
    })

    it('do task by using API', async () => {
      await task.handleDo()
      expect(task.API.doTask).toBeCalledWith(taskData.id)
    })

    it('marks task as done in the storage', async () => {
      await task.handleDo()
      expect(task.storage.setTask).toBeCalledWith({ done: true })
    })
  })

  describe('.handleUndo()', () => {
    let t, storage, API, task

    beforeAll(() => {
      taskData = { id: 123 }
      storage = {
        getTask: jest.fn(async () => taskData),
        setTask: jest.fn(async () => ({}) )
      }
      API = {
        undoTask: jest.fn(async () => ({}) )
      }
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
    })

    it('gets task data from the storage', async () => {
      await task.handleUndo()
      expect(task.storage.getTask).toBeCalledWith()
    })

    it('undo task by using API', async () => {
      await task.handleUndo()
      expect(task.API.undoTask).toBeCalledWith(taskData.id)
    })

    it('marks task as not done in the storage', async () => {
      await task.handleUndo()
      expect(task.storage.setTask).toBeCalledWith({ done: false })
    })
  })

  describe('.handleUpdate()', () => {
    let t = {}, storage, API, task, res

    beforeAll(() => {
      taskData = { id: 123 }
      params = { priority: 1 }
      storage = {
        getTask: jest.fn(async () => taskData),
        setTask: jest.fn(async () => ({}) ),
      }
      res = { data: params }
      API = {
        updateTask: jest.fn(async () => res)
      }
    })

    beforeEach(() => {
      task = new Task(t, storage, API)
    })

    it('gets task data from the storage', async () => {
      await task.handleUpdate(params)
      expect(task.storage.getTask).toBeCalledWith()
    })

    it('updates the task by using API', async () => {
      await task.handleUpdate(params)
      expect(task.API.updateTask).toBeCalledWith(taskData.id, params)
    })

    it('stores response in the storage', async () => {
      await task.handleUpdate(params)
      expect(task.storage.setTask).toBeCalledWith(res.data)
    })
  })
})
