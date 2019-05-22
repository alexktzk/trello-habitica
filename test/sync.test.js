import Sync from '../src/js/sync';
import { LIST_TYPES } from '../src/js/constants';

const taskMock = {
  handleAdd: jest.fn(async () => {}),
  handleDo: jest.fn(),
  handleUndo: jest.fn(async () => {}),
  handleRemove: jest.fn()
};
const getTaskMock = jest.fn(() => taskMock);

describe('Sync class', () => {
  describe('constructor', () => {
    const t = {};
    const storage = {};
    let sync;

    beforeEach(() => {
      sync = new Sync(t, storage);
    });

    it('assigns passed trello instance to local t variable', () => {
      expect(sync.t).toBeDefined();
      expect(sync.t).toBe(t);
    });

    it('assigns passed storage to local storage variable', () => {
      expect(sync.storage).toBeDefined();
      expect(sync.storage).toBe(storage);
    });
  });

  describe('.start()', () => {
    describe('preparations', () => {
      const t = {};
      const storage = {};
      let sync;
      let settings;
      let cardData;
      let context;

      beforeAll(() => {
        cardData = { members: [] };
        settings = { scope: 'all' };
        context = { member: 123 };

        t.card = jest.fn(async () => cardData);
        t.getContext = jest.fn(async () => context);

        storage.getTask = jest.fn(async () => ({}));
        storage.getSettings = jest.fn(async () => settings);
        storage.getLists = jest.fn(async () => ({}));
      });

      beforeEach(() => {
        sync = new Sync(t, storage);
      });

      it('gets card data from the storage', async () => {
        await sync.start();
        expect(sync.t.card).toBeCalledWith('id', 'idList', 'members');
      });

      it('gets settings from the storage', async () => {
        await sync.start();
        expect(sync.storage.getSettings).toBeCalledWith();
      });

      it('gets task data from the storage', async () => {
        await sync.start();
        expect(sync.storage.getTask).toBeCalledWith();
      });
    });

    describe('when syncing only cards that was assigned to me', () => {
      const t = {};
      const storage = {};
      let sync;
      let me;
      let settings;
      let context;

      beforeAll(() => {
        me = { id: 123 };
        settings = { scope: 'me' };
        context = { member: me.id };

        t.getContext = () => context;

        storage.getSettings = async () => settings;
        storage.getTask = async () => ({});
        storage.getLists = async () => ({});
      });

      describe('when card is not assigned to me', () => {
        beforeAll(() => {
          t.card = () => ({ members: [] });
        });

        beforeEach(() => {
          sync = new Sync(t, storage);
        });

        it('unmarks the card', async () => {
          expect(sync.handleScoped).toBeDefined();
          sync.handleScoped = jest.fn();
          await sync.start();
          expect(sync.handleScoped).toBeCalled();
        });

        it('do not proceeds to the syncing', async () => {
          expect(sync.handle).toBeDefined();
          sync.handle = jest.fn();
          await sync.start();
          expect(sync.handle).not.toBeCalled();
        });
      });

      describe('when card is assigned to me', () => {
        beforeAll(() => {
          t.card = () => ({ members: [me] });
        });

        beforeEach(() => {
          sync = new Sync(t, storage);
        });

        it('proceeds right to the syncing', async () => {
          const handleScoped = jest.spyOn(sync, 'handleScoped');
          const handle = jest.spyOn(sync, 'handle');
          await sync.start();
          expect(handleScoped).not.toBeCalled();
          expect(handle).toBeCalled();
        });
      });
    });

    describe('when syncing all the cards', () => {
      const t = {};
      const storage = {};
      let sync;
      let card;
      let lists;
      let task;
      let settings;

      beforeAll(() => {
        settings = { scope: 'all' };
        card = { idList: 456 };
        task = { id: 123, priority: 1 };
        lists = { [card.idList]: 'doing' };

        t.card = () => card;

        storage.getSettings = () => settings;
        storage.getTask = () => task;
        storage.getLists = jest.fn(() => lists);
      });

      beforeEach(() => {
        sync = new Sync(t, storage);
      });

      it('proceeds right to the syncing', async () => {
        expect(sync.handleScoped).toBeDefined();
        expect(sync.handle).toBeDefined();
        sync.handleScoped = jest.fn();
        sync.handle = jest.fn();
        await sync.start();
        expect(sync.handleScoped).not.toBeCalled();
        expect(sync.handle).toBeCalled();
      });

      it('gets lists from the storage', async () => {
        await sync.start();
        expect(sync.storage.getLists).toBeCalledWith();
      });

      it('calls sync handler with proper args', async () => {
        expect(sync.handle).toBeDefined();
        sync.handle = jest.fn();
        const listType = lists[card.idList];
        await sync.start();
        expect(sync.handle).toBeCalledWith(task, listType);
      });
    });
  });

  describe('.handleScoped()', () => {
    const t = {};
    const storage = {};
    const taskData = {};
    let sync;

    beforeEach(() => {
      sync = new Sync(t, storage);
      sync.getTask = getTaskMock;
    });

    describe('when to-do is present', () => {
      beforeAll(() => {
        taskData.id = 123;
      });

      describe('when to-do is done', () => {
        beforeAll(() => {
          taskData.done = true;
        });

        it('undo the to-do', () => {
          sync.handleScoped(taskData);
          expect(sync.getTask().handleUndo).toBeCalledWith();
        });

        it('removes the to-do', async () => {
          await sync.handleScoped(taskData);
          expect(sync.getTask().handleRemove).toBeCalledWith();
        });
      });

      describe('when task is not done', () => {
        beforeAll(() => {
          taskData.done = false;
        });

        it('removes the to-do', () => {
          sync.handleScoped(taskData);
          expect(sync.getTask().handleRemove).toBeCalledWith();
        });
      });
    });
  });

  describe('.handle()', () => {
    const t = {};
    const storage = {};
    const taskData = {};
    let sync;
    let listType;

    beforeEach(() => {
      sync = new Sync(t, storage);
      sync.getTask = getTaskMock;
    });

    describe('when card is moved to a list of type DOING', () => {
      beforeAll(() => {
        listType = LIST_TYPES.DOING;
      });

      describe('when task is present', () => {
        beforeAll(() => {
          taskData.id = 123;
        });

        describe('when task is done', () => {
          beforeAll(() => {
            taskData.done = true;
          });

          it('undo the task', () => {
            sync.handle(taskData, listType);
            expect(sync.getTask().handleUndo).toBeCalled();
          });
        });
      });

      describe('when task is not present', () => {
        beforeAll(() => {
          taskData.id = undefined;
        });

        it('adds a task', () => {
          sync.handle(taskData, listType);
          expect(sync.getTask().handleAdd).toBeCalled();
        });
      });
    });

    describe('when card is moved to a list of type DONE', () => {
      beforeAll(() => {
        listType = LIST_TYPES.DONE;
      });

      describe('when task is present', () => {
        beforeAll(() => {
          taskData.id = 123;
        });

        describe('when task is not done', () => {
          beforeAll(() => {
            taskData.done = false;
          });

          it('do the task', () => {
            sync.handle(taskData, listType);
            expect(sync.getTask().handleDo).toBeCalled();
          });
        });
      });

      describe('when task is not present', () => {
        beforeAll(() => {
          taskData.id = undefined;
        });

        it('adds a task', () => {
          sync.handle(taskData, listType);
          expect(sync.getTask().handleAdd).toBeCalled();
        });

        it('do the task', async () => {
          await sync.handle(taskData, listType);
          expect(sync.getTask().handleDo).toBeCalled();
        });
      });
    });

    describe('when card is moved to other lists', () => {
      beforeAll(() => {
        listType = 'some other list';
      });

      describe('when task is present', () => {
        beforeAll(() => {
          taskData.id = 123;
        });

        describe('when task is done', () => {
          beforeAll(() => {
            taskData.done = true;
          });

          it('undo the task', () => {
            sync.handle(taskData, listType);
            expect(sync.getTask().handleUndo).toBeCalled();
          });

          it('removes the task', async () => {
            await sync.handle(taskData, listType);
            expect(sync.getTask().handleRemove).toBeCalled();
          });
        });

        describe('when task is not done', () => {
          beforeAll(() => {
            taskData.done = false;
          });

          it('removes the task', () => {
            sync.handle(taskData, listType);
            expect(sync.getTask().handleRemove).toBeCalled();
          });
        });
      });
    });
  });
});
