const Storage = require('../public/js/storage')

describe('Storage class', () => {
  describe('constructor', () => {
    it('assigns passed trello storage to local t variable', () => {
      let t = { mockFunction: jest.fn() }
      let storage = new Storage(t)
      expect(storage.t).toBeDefined()
      expect(storage.t).toBe(t)
    })
  })

  describe('.getAll()', () => {
    let t, storage, storageSample
  
    beforeAll(() => {
      // empty state of trello storage 
      storageSample = { 
        board: { shared: {}, private: {} },
        card: { shared: {}, private: {} },
        member: { shared: {}, private: {} },
        organization: { shared: {}, private: {} }
      }
      t = { getAll: jest.fn(() => storageSample) }
    })
  
    beforeEach(() => {
      storage = new Storage(t)
    })
  
  
    it('calls proper function', () => {
      storage.getAll()
      expect(t.getAll).toBeCalled()
    })
  
    it('calls function with proper args', () => {
      storage.getAll()
      expect(t.getAll).toBeCalledWith()
    })
  
    it('returns all storage', () => {
      expect(storage.getAll()).toBe(storageSample)
    })
  })

  describe('.removeAll()', () => {
    let t, storage

    beforeAll(() => {
      t = { remove: jest.fn() }
    })

    beforeEach(() => {
      storage = new Storage(t)
    })

    it('removes lists', async () => {
      await storage.removeAll()
      expect(t.remove).toBeCalledWith('board', 'private', 'lists')
    })

    it('removes user', async () => {
      await storage.removeAll()
      expect(t.remove).toBeCalledWith('board', 'private', 'user')
    })

    it('removes settings', async () => {
      await storage.removeAll()
      expect(t.remove).toBeCalledWith('board', 'private', 'settings')
    })
  })

  describe('.setUser()', () => {
    let t, storage, userSample
  
    beforeAll(() => {
      userSample = { loggedIn: false }
      params = { name: 'Alex', loggedIn: true }
      t = {
        set: jest.fn(),
        get: jest.fn(async () => userSample)
      }
    })
  
    beforeEach(() => {
      storage = new Storage(t)
    })
  
    it('gets current value', () => {
      storage.setUser(params)
      expect(t.get).toBeCalled()
    })

    it('gets current value with proper args', () => {
      storage.setUser(params)
      expect(t.get).toBeCalledWith('board', 'private', 'user', {})
    })

    it('sets a new value', async () => {
      await storage.setUser(params)
      expect(t.set).toBeCalled()
    })

    it('sets a new value with proper args', async () => {
      await storage.setUser(params)
      expect(t.set).toBeCalledWith('board', 'private', 'user', Object.assign({}, userSample, params))
    })
  })

  describe('.getUser()', () => {
    let t, storage, userSample
  
    beforeAll(() => {
      userSample = { name: 'Alex', loggedIn: true }
      t = { get: jest.fn(() => userSample) }
    })
  
    beforeEach(() => {
      storage = new Storage(t)
    })
  
    it('calls proper function', () => {
      storage.getUser()
      expect(t.get).toBeCalled()
    })
  
    it('calls function with proper args', () => {
      storage.getUser()
      expect(t.get).toBeCalledWith('board', 'private', 'user', {})
    })
  
    it('returns user data', () => {
      expect(storage.getUser()).toBe(userSample)
    })
  })
  
  describe('.removeUser()', () => {
    let t, storage
  
    beforeAll(() => {
      t = { remove: jest.fn() }
    })
  
    beforeEach(() => {
      storage = new Storage(t)
    })
  
    it('calls proper function', () => {
      storage.removeUser()
      expect(t.remove).toBeCalled()
    })
  
    it('calls function with proper args', () => {
      storage.removeUser()
      expect(t.remove).toBeCalledWith('board', 'private', 'user')
    })
  })

  describe('.setTask()', () => {
    let t, storage
  
    beforeAll(() => {
      taskSample = { id: 123, done: false }
      params = { done: true }
      t = {
        set: jest.fn(),
        get: jest.fn(async () => taskSample)
      }
    })
  
    beforeEach(() => {
      storage = new Storage(t)
    })
  
    it('gets current value', () => {
      storage.setTask(params)
      expect(t.get).toBeCalled()
    })

    it('gets current value with proper args', () => {
      storage.setTask(params)
      expect(t.get).toBeCalledWith('card', 'private', 'task', {})
    })

    it('sets a new value', async () => {
      await storage.setTask(params)
      expect(t.set).toBeCalled()
    })

    it('sets a new value with proper args', async () => {
      await storage.setTask(params)
      expect(t.set).toBeCalledWith('card', 'private', 'task', Object.assign({}, taskSample, params))
    })
  })

  describe('.getTask()', () => {
    let t, storage, taskSample
  
    beforeAll(() => {
      taskSample = { 
        id: 123,
        done: false, 
        priority: 1.5, 
        text: 'To-do text',
        notes: 'To-do description'
      }
      t = { get: jest.fn(() => taskSample) }
    })
  
    beforeEach(() => {
      storage = new Storage(t)
    })
  
    it('calls proper function', () => {
      storage.getTask()
      expect(t.get).toBeCalled()
    })
  
    it('calls function with proper args', () => {
      storage.getTask()
      expect(t.get).toBeCalledWith('card', 'private', 'task', {})
    })
  
    it('returns task data', () => {
      expect(storage.getTask()).toBe(taskSample)
    })
  })

  describe('.removeTask()', () => {
    let t, storage
  
    beforeAll(() => {
      t = { remove: jest.fn() }
    })
  
    beforeEach(() => {
      storage = new Storage(t)
    })
  
    it('calls proper function', () => {
      storage.removeTask()
      expect(t.remove).toBeCalled()
    })
  
    it('calls function with proper args', () => {
      storage.removeTask()
      expect(t.remove).toBeCalledWith('card', 'private', 'task')
    })
  })

  describe('.setSettings()', () => {
    let t, storage, userSample
  
    beforeAll(() => {
      settingsSample = { scope: 'me', priority: '1' }
      params = { scope: 'all' }
      t = {
        set: jest.fn(),
        get: jest.fn(async () => settingsSample)
      }
    })
  
    beforeEach(() => {
      storage = new Storage(t)
    })
  
    it('gets current value', () => {
      storage.setSettings(params)
      expect(t.get).toBeCalled()
    })

    it('gets current value with proper args', () => {
      storage.setSettings(params)
      expect(t.get).toBeCalledWith('board', 'private', 'settings', {})
    })

    it('sets a new value', async () => {
      await storage.setSettings(params)
      expect(t.set).toBeCalled()
    })

    it('sets a new value with proper args', async () => {
      await storage.setSettings(params)
      expect(t.set).toBeCalledWith('board', 'private', 'settings', Object.assign({}, settingsSample, params))
    })
  })

  describe('.getSettings()', () => {
    let t, storage, settingsSample, defaultSettings

    beforeAll(() => {
      settingsSample = { scope: 'me', priority: '1' }
      defaultSettings = settingsSample
      t = { get: jest.fn(() => settingsSample) }
    })

    beforeEach(() => {
      storage = new Storage(t)
    })
  
    it('calls proper function', () => {
      storage.getSettings()
      expect(t.get).toBeCalled()
    })
  
    it('calls function with proper args', () => {
      storage.getSettings()
      expect(t.get).toBeCalledWith('board', 'private', 'settings', defaultSettings)
    })
  
    it('returns settings data', () => {
      expect(storage.getSettings()).toBe(settingsSample)
    })
  })

  describe('.setLists()', () => {
    let t, storage
  
    beforeAll(() => {
      params = { 123: 'done' }
      t = { set: jest.fn() }
    })
  
    beforeEach(() => {
      storage = new Storage(t)
    })

    it('sets a new value', () => {
      storage.setLists(params)
      expect(t.set).toBeCalled()
    })

    it('sets a new value with proper args', async () => {
      await storage.setLists(params)
      expect(t.set).toBeCalledWith('board', 'private', 'lists', params)
    })
  })

  describe('.getLists()', () => {
    let t, storage, listsSample
  
    beforeAll(() => {
      listsSample = { 123: 'done', 456: 'doing' }
      t = { get: jest.fn(() => listsSample) }
    })
  
    beforeEach(() => {
      storage = new Storage(t)
    })
  
    it('calls proper function', () => {
      storage.getLists()
      expect(t.get).toBeCalled()
    })
  
    it('calls function with proper args', () => {
      storage.getLists()
      expect(t.get).toBeCalledWith('board', 'private', 'lists', {})
    })
  
    it('returns lists data', () => {
      expect(storage.getLists()).toBe(listsSample)
    })
  })

})
