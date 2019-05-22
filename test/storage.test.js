import Storage from '../src/js/storage';

// empty state of trello storage
const emptyStorage = {
  board: { shared: {}, private: {} },
  card: { shared: {}, private: {} },
  member: { shared: {}, private: {} },
  organization: { shared: {}, private: {} }
};

describe('Storage class', () => {
  describe('constructor', () => {
    it('assigns passed trello instance to local t variable', () => {
      const t = {};
      const storage = new Storage(t);
      expect(storage.t).toBeDefined();
      expect(storage.t).toBe(t);
    });
  });

  describe('.getAll()', () => {
    const t = {};
    let storage;
    let storageData;

    beforeAll(() => {
      storageData = emptyStorage;
      t.getAll = jest.fn(async () => emptyStorage);
    });

    beforeEach(() => {
      storage = new Storage(t);
    });

    it('calls function with proper args', async () => {
      await storage.getAll();
      expect(storage.t.getAll).toBeCalledWith();
    });

    it('returns all storage', async () => {
      expect(await storage.getAll()).toBe(storageData);
    });
  });

  describe('.removeAll()', () => {
    const t = {};
    let storage;

    beforeAll(() => {
      t.remove = jest.fn();
    });

    beforeEach(() => {
      storage = new Storage(t);
    });

    it('removes the lists', async () => {
      await storage.removeAll();
      expect(storage.t.remove).toBeCalledWith('board', 'private', 'lists');
    });

    it('removes the user', async () => {
      await storage.removeAll();
      expect(storage.t.remove).toBeCalledWith('board', 'private', 'user');
    });

    it('removes the settings', async () => {
      await storage.removeAll();
      expect(storage.t.remove).toBeCalledWith('board', 'private', 'settings');
    });
  });

  describe('.setUser()', () => {
    const t = {};
    let storage;
    let userData;
    let params;

    beforeAll(() => {
      userData = { loggedIn: false };
      params = { name: 'Alex', loggedIn: true };
      t.set = jest.fn();
      t.get = jest.fn(async () => userData);
    });

    beforeEach(() => {
      storage = new Storage(t);
    });

    it('gets current value with proper args', async () => {
      await storage.setUser(params);
      expect(storage.t.get).toBeCalledWith('board', 'private', 'user', {});
    });

    it('sets a new value with proper args', async () => {
      await storage.setUser(params);
      expect(storage.t.set).toBeCalledWith(
        'board',
        'private',
        'user',
        Object.assign({}, userData, params)
      );
    });
  });

  describe('.getUser()', () => {
    const t = {};
    let storage;
    let userData;

    beforeAll(() => {
      userData = { name: 'Alex', loggedIn: true };
      t.get = jest.fn(() => userData);
    });

    beforeEach(() => {
      storage = new Storage(t);
    });

    it('calls function with proper args', async () => {
      await storage.getUser();
      expect(storage.t.get).toBeCalledWith('board', 'private', 'user', {});
    });

    it('returns user data', async () => {
      expect(await storage.getUser()).toBe(userData);
    });
  });

  describe('.removeUser()', () => {
    const t = {};
    let storage;

    beforeAll(() => {
      t.remove = jest.fn(async () => ({}));
    });

    beforeEach(() => {
      storage = new Storage(t);
    });

    it('calls function with proper args', async () => {
      await storage.removeUser();
      expect(storage.t.remove).toBeCalledWith('board', 'private', 'user');
    });
  });

  describe('.setTask()', () => {
    const t = {};
    let storage;
    let taskData;
    let params;

    beforeAll(() => {
      taskData = { id: 123, done: false };
      params = { done: true };

      t.set = jest.fn();
      t.get = jest.fn(async () => taskData);
    });

    beforeEach(() => {
      storage = new Storage(t);
    });

    it('gets current value with proper args', async () => {
      await storage.setTask(params);
      expect(storage.t.get).toBeCalledWith('card', 'private', 'task', {});
    });

    it('sets a new value with proper args', async () => {
      await storage.setTask(params);
      expect(storage.t.set).toBeCalledWith(
        'card',
        'private',
        'task',
        Object.assign({}, taskData, params)
      );
    });
  });

  describe('.getTask()', () => {
    const t = {};
    let storage;
    let taskData;

    beforeAll(() => {
      taskData = {
        id: 123,
        done: false,
        priority: 1.5,
        text: 'To-do text',
        notes: 'To-do description'
      };
      t.get = jest.fn(async () => taskData);
    });

    beforeEach(() => {
      storage = new Storage(t);
    });

    it('calls function with proper args', async () => {
      await storage.getTask();
      expect(storage.t.get).toBeCalledWith('card', 'private', 'task', {});
    });

    it('returns task data', async () => {
      expect(await storage.getTask()).toBe(taskData);
    });
  });

  describe('.removeTask()', () => {
    const t = {};
    let storage;

    beforeAll(() => {
      t.remove = jest.fn(async () => ({}));
    });

    beforeEach(() => {
      storage = new Storage(t);
    });

    it('calls function with proper args', async () => {
      await storage.removeTask();
      expect(storage.t.remove).toBeCalledWith('card', 'private', 'task');
    });
  });

  describe('.setSettings()', () => {
    const t = {};
    let storage;
    let settingsData;
    let params;

    beforeAll(() => {
      settingsData = { scope: 'me', priority: '1' };
      params = { scope: 'all' };
      t.set = jest.fn();
      t.get = jest.fn(async () => settingsData);
    });

    beforeEach(() => {
      storage = new Storage(t);
    });

    it('gets current value with proper args', async () => {
      await storage.setSettings(params);
      expect(storage.t.get).toBeCalledWith('board', 'private', 'settings', {});
    });

    it('sets a new value', async () => {
      await storage.setSettings(params);
      expect(storage.t.set).toBeCalled();
    });

    it('sets a new value with proper args', async () => {
      await storage.setSettings(params);
      expect(storage.t.set).toBeCalledWith(
        'board',
        'private',
        'settings',
        Object.assign({}, settingsData, params)
      );
    });
  });

  describe('.getSettings()', () => {
    const t = {};
    let storage;
    let settingsData;

    beforeAll(() => {
      settingsData = {
        scope: 'me',
        priority: '1',
        showBadges: true,
        prependIcon: false
      };
      t.get = jest.fn(async () => settingsData);
    });

    beforeEach(() => {
      storage = new Storage(t);
    });

    it('calls function with proper args', async () => {
      await storage.getSettings();
      expect(storage.t.get).toBeCalledWith('board', 'private', 'settings', {});
    });

    it('returns settings data', async () => {
      expect(await storage.getSettings()).toEqual(settingsData);
    });
  });

  describe('.setLists()', () => {
    const t = {};
    let storage;
    let params;

    beforeAll(() => {
      params = { 123: 'done' };
      t.set = jest.fn(async () => ({}));
    });

    beforeEach(() => {
      storage = new Storage(t);
    });

    it('sets a new value with proper args', async () => {
      await storage.setLists(params);
      expect(storage.t.set).toBeCalledWith('board', 'private', 'lists', params);
    });
  });

  describe('.getLists()', () => {
    const t = {};
    let storage;
    let listData;

    beforeAll(() => {
      listData = { 123: 'done', 456: 'doing' };
      t.get = jest.fn(async () => listData);
    });

    beforeEach(() => {
      storage = new Storage(t);
    });

    it('calls function with proper args', async () => {
      await storage.getLists();
      expect(storage.t.get).toBeCalledWith('board', 'private', 'lists', {});
    });

    it('returns lists data', async () => {
      expect(await storage.getLists()).toBe(listData);
    });
  });
});
