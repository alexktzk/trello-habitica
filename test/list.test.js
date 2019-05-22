import List from '../src/js/list';
import { LIST_TYPES } from '../src/js/constants';

describe('List class', () => {
  describe('constructor', () => {
    const t = {};
    const storage = {};
    let list;

    beforeEach(() => {
      list = new List(t, storage);
    });

    it('assigns passed trello instance to local t variable', () => {
      expect(list.t).toBeDefined();
      expect(list.t).toBe(t);
    });

    it('assigns passed storage to local storage variable', () => {
      expect(list.storage).toBeDefined();
      expect(list.storage).toBe(storage);
    });
  });

  describe('.markAsDone()', () => {
    const t = {};
    const storage = {};
    let list;

    beforeEach(() => {
      list = new List(t, storage);
    });

    it('calls .mark() with proper args', () => {
      expect(list.mark).toBeDefined();
      list.mark = jest.fn();
      list.markAsDone();
      expect(list.mark).toBeCalledWith(LIST_TYPES.DONE);
    });
  });

  describe('.markAsDoing()', () => {
    const t = {};
    const storage = {};
    let list;

    beforeEach(() => {
      list = new List(t, storage);
    });

    it('calls .mark() with proper args', () => {
      expect(list.mark).toBeDefined();
      list.mark = jest.fn();
      list.markAsDoing();
      expect(list.mark).toBeCalledWith(LIST_TYPES.DOING);
    });
  });

  describe('.mark()', () => {
    const t = {};
    const storage = {};
    const lists = {};
    let list;
    let listData;
    let listType;

    beforeAll(() => {
      listType = LIST_TYPES.DOING;
      listData = { id: 456 };

      t.closePopup = jest.fn();
      t.alert = jest.fn();
      t.list = jest.fn(() => listData);

      storage.getLists = jest.fn(async () => lists);
      storage.setLists = jest.fn(async () => ({}));
    });

    beforeEach(() => {
      list = new List(t, storage);
    });

    it('gets lists from the storage', async () => {
      await list.mark(listType);
      expect(list.storage.getLists).toBeCalledWith();
    });

    it('gets list data', async () => {
      await list.mark(listType);
      expect(list.t.list).toBeCalled();
    });

    it('updates current list type', async () => {
      await list.mark(listType);
      expect(list.storage.setLists).toBeCalledWith({ [listData.id]: listType });
    });

    it('closes popup', async () => {
      await list.mark(listType);
      expect(list.t.closePopup).toBeCalledWith();
    });

    it('notifies', async () => {
      expect(list.notify).toBeDefined();
      list.notify = jest.fn();
      await list.mark(listType);
      expect(list.notify).toBeCalled();
    });

    it('saves updated lists to storage', async () => {
      await list.mark(listType);
      expect(list.storage.setLists).toBeCalledWith(
        Object.assign({}, lists, {
          [listData.id]: listType
        })
      );
    });
  });

  describe('.unmark()', () => {
    const t = {};
    const storage = {};
    let list;
    let listData;
    let lists;

    beforeAll(() => {
      listData = { id: 37, name: 'List name' };
      lists = { [listData.id]: 'done' };

      t.list = jest.fn(() => listData);
      t.closePopup = jest.fn();
      t.alert = jest.fn();

      storage.getLists = jest.fn(async () => lists);
      storage.setLists = jest.fn(async () => ({}));
    });

    beforeEach(() => {
      list = new List(t, storage);
    });

    it('gets lists from the storage', async () => {
      await list.unmark();
      expect(list.storage.getLists).toBeCalled();
    });

    it('gets list data', async () => {
      await list.unmark();
      expect(list.t.list).toBeCalled();
    });

    it('deletes current list from lists', async () => {
      await list.unmark();
      expect(list.storage.setLists).toBeCalledWith({});
    });

    it('closes popup', async () => {
      await list.unmark();
      expect(list.t.closePopup).toBeCalled();
    });

    it('notifies', async () => {
      expect(list.notify).toBeDefined();
      list.notify = jest.fn();
      await list.unmark();
      expect(list.notify).toBeCalled();
    });

    it('saves updated lists to storage', async () => {
      await list.unmark();
      expect(list.storage.setLists).toBeCalledWith(
        expect.not.objectContaining({ [listData.id]: expect.anything() })
      );
    });
  });
});
