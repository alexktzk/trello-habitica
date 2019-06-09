import Task from '../src/js/task';
import { ICONS } from '../src/js/constants';

jest.mock('../src/js/habitica-api');

describe('Task class', () => {
  describe('constructor', () => {
    const t = {};
    const storage = {};
    const API = {};
    let task;

    beforeEach(() => {
      task = new Task(t, storage, API);
    });

    it('assigns passed trello instance to local t variable', () => {
      expect(task.t).toBeDefined();
      expect(task.t).toBe(t);
    });

    it('assigns passed storage to local storage variable', () => {
      expect(task.storage).toBeDefined();
      expect(task.storage).toBe(storage);
    });

    it('assings passed API instance to local API variable', () => {
      expect(task.API).toBeDefined();
      expect(task.API).toBe(API);
    });
  });

  describe('.getTemplate()', () => {
    const t = {};
    const storage = {};
    const API = {};
    let task;
    let card;
    let settings;

    beforeAll(() => {
      settings = { priority: 1 };

      storage.getSettings = jest.fn(async () => settings);

      card = {
        shortLink: 'asdf',
        name: 'Card name'
      };
    });

    beforeEach(() => {
      task = new Task(t, storage, API);
    });

    it('gets settings from the storage', async () => {
      await task.getTemplate(card);
      expect(task.storage.getSettings).toBeCalled();
    });

    it('assigns task type as "todo"', async () => {
      const template = await task.getTemplate(card);
      expect(template.type).toBe('todo');
    });

    it('assigns default difficulty(priority) for todo', async () => {
      const template = await task.getTemplate(card);
      expect(template.priority).toBe(settings.priority);
    });

    it('uses card name as text for todo', async () => {
      const template = await task.getTemplate(card);
      expect(template.text).toMatch(card.name);
    });

    it('generates card url from shortLink', async () => {
      const template = await task.getTemplate(card);
      expect(template.notes).toMatch(card.shortLink);
    });

    describe('when chosen to prepend the icon to the text', () => {
      beforeAll(() => {
        settings.prependIcon = true;
      });

      it('prepends the icon', async () => {
        const template = await task.getTemplate(card);
        expect(template.text).toMatch(ICONS.TRELLO_LOGO);
      });
    });

    describe('when chosen to not prepend the icon to the text', () => {
      beforeAll(() => {
        settings.prependIcon = false;
      });

      it('not prepends the icon', async () => {
        const template = await task.getTemplate(card);
        expect(template.text).not.toMatch(ICONS.TRELLO_LOGO);
      });
    });
  });

  describe('.handleAdd()', () => {
    const t = {};
    const storage = {};
    let API;
    let task;
    let cardData;
    let res;
    let template;

    beforeAll(() => {
      cardData = {
        shortLink: 'asdf',
        name: 'Card name'
      };

      t.card = jest.fn(async () => cardData);

      storage.setTask = jest.fn();

      res = {
        data: {
          id: 123,
          text: 'Card name',
          notes: 'Card url',
          priority: 1
        }
      };
      API = {
        addTask: jest.fn(async () => res)
      };
      template = {
        type: 'todo',
        text: 'Todo text'
      };
    });

    beforeEach(() => {
      task = new Task(t, storage, API);
      task.getTemplate = jest.fn(async () => template);
    });

    it('gets card data from the storage', async () => {
      await task.handleAdd();
      expect(task.t.card).toBeCalledWith('name', 'shortLink');
    });

    it('generates request template', async () => {
      await task.handleAdd();
      expect(task.getTemplate).toBeCalledWith(cardData);
    });

    it('adds a task by using API', async () => {
      await task.handleAdd();
      expect(task.API.addTask).toBeCalledWith(template);
    });

    it('stores response in the storage', async () => {
      await task.handleAdd();
      expect(task.storage.setTask).toBeCalledWith(res.data);
    });
  });

  describe('.handleRemove()', () => {
    const t = {};
    const storage = {};
    let API;
    let task;
    let taskData;

    beforeAll(() => {
      taskData = { id: 123 };

      storage.getTask = jest.fn(async () => taskData);
      storage.removeTask = jest.fn(async () => ({}));

      API = {
        removeTask: jest.fn(async () => ({}))
      };
    });

    beforeEach(() => {
      task = new Task(t, storage, API);
    });

    it('gets task data from the storage', async () => {
      await task.handleRemove();
      expect(task.storage.getTask).toBeCalledWith();
    });

    it('removes the task by using API', async () => {
      await task.handleRemove();
      expect(task.API.removeTask).toBeCalledWith(taskData.id);
    });

    it('removes task data from the storage', async () => {
      await task.handleRemove();
      expect(task.storage.removeTask).toBeCalledWith();
    });
  });

  describe('.handleDo()', () => {
    const t = {};
    const storage = {};
    let res;
    let API;
    let task;
    let taskData;
    let user;

    beforeAll(() => {
      taskData = { id: 123 };

      storage.getTask = jest.fn(async () => taskData);
      storage.setTask = jest.fn(async () => ({}));

      res = {
        data: {
          gp: 100,
          exp: 200,
          lvl: 37
        }
      };

      API = {
        doTask: jest.fn(async () => res)
      };

      user = {
        updateStats: jest.fn()
      };
    });

    beforeEach(() => {
      task = new Task(t, storage, API, user);
    });

    it('gets task data from the storage', async () => {
      await task.handleDo();
      expect(task.storage.getTask).toBeCalledWith();
    });

    it('do task by using API', async () => {
      await task.handleDo();
      expect(task.API.doTask).toBeCalledWith(taskData.id);
    });

    it('marks task as done in the storage', async () => {
      await task.handleDo();
      expect(task.storage.setTask).toBeCalledWith({ done: true });
    });

    it('updates user stats with response data', async () => {
      await task.handleDo();
      expect(task.currentUser.updateStats).toBeCalledWith(res.data);
    });
  });

  describe('.handleUndo()', () => {
    const t = {};
    const storage = {};
    let API;
    let task;
    let taskData;
    let user;
    let res;

    beforeAll(() => {
      taskData = { id: 123 };

      storage.getTask = jest.fn(async () => taskData);
      storage.setTask = jest.fn(async () => ({}));

      res = {
        data: {
          gp: 100,
          exp: 200,
          lvl: 37
        }
      };

      API = {
        undoTask: jest.fn(async () => res)
      };

      user = {
        updateStats: jest.fn()
      };
    });

    beforeEach(() => {
      task = new Task(t, storage, API, user);
    });

    it('gets task data from the storage', async () => {
      await task.handleUndo();
      expect(task.storage.getTask).toBeCalledWith();
    });

    it('undo task by using API', async () => {
      await task.handleUndo();
      expect(task.API.undoTask).toBeCalledWith(taskData.id);
    });

    it('marks task as not done in the storage', async () => {
      await task.handleUndo();
      expect(task.storage.setTask).toBeCalledWith({ done: false });
    });

    it('updates user stats with response data', async () => {
      await task.handleUndo();
      expect(task.currentUser.updateStats).toBeCalledWith(res.data);
    });
  });

  describe('.handleUpdate()', () => {
    const t = {};
    const storage = {};
    let API;
    let task;
    let res;
    let params;
    let taskData;

    beforeAll(() => {
      taskData = { id: 123 };
      params = { priority: 1 };

      storage.getTask = jest.fn(async () => taskData);
      storage.setTask = jest.fn(async () => ({}));

      res = { data: params };
      API = {
        updateTask: jest.fn(async () => res)
      };
    });

    beforeEach(() => {
      task = new Task(t, storage, API);
    });

    it('gets task data from the storage', async () => {
      await task.handleUpdate(params);
      expect(task.storage.getTask).toBeCalledWith();
    });

    it('updates the task by using API', async () => {
      await task.handleUpdate(params);
      expect(task.API.updateTask).toBeCalledWith(taskData.id, params);
    });

    it('stores response in the storage', async () => {
      await task.handleUpdate(params);
      expect(task.storage.setTask).toBeCalledWith(res.data);
    });
  });
});
