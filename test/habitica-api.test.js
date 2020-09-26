import fetchMock from 'fetch-mock';
import HabiticaApi from '../src/js/habitica-api';
import { BASE_URL } from '../src/js/constants';

describe('HabiticaApi class', () => {
  describe('constructor', () => {
    const t = {};
    const storage = {};
    let API;

    beforeEach(() => {
      API = new HabiticaApi(t, storage);
    });

    it('assigns passed trello instance to local t variable', () => {
      expect(API.t).toBeDefined();
      expect(API.t).toBe(t);
    });

    it('assigns passed storage to local storage variable', () => {
      expect(API.storage).toBeDefined();
      expect(API.storage).toBe(storage);
    });
  });

  describe('.request()', () => {
    const t = {};
    const storage = {};
    let API;
    let params;
    let path;
    let url;
    let response;
    let emptyMock;

    beforeAll(() => {
      params = { foo: 'bar' };
      path = '/user';
      url = BASE_URL + path;
      response = { status: 200, body: 'it works' };
      emptyMock = jest.fn(async () => ({}));
    });

    beforeEach(() => {
      API = new HabiticaApi(t, storage);
      API.authHeaders = emptyMock;
      API.handleResponse = emptyMock;
      fetchMock.mock(url, response);
    });

    afterEach(() => {
      fetchMock.restore();
    });

    it('loads auth headers', async () => {
      await API.request(path, params);
      expect(API.authHeaders).toBeCalled();
    });

    it('fetches url', async () => {
      await API.request(path, params);
      expect(fetchMock.lastUrl()).toEqual(expect.stringContaining(path));
    });

    it('fetches url with auth headers', async () => {
      await API.request(path, params);
      expect(fetchMock.lastOptions()).toEqual(
        expect.objectContaining({
          headers: expect.any(Object)
        })
      );
    });

    it('fetches url with passed params', async () => {
      await API.request(path, params);
      expect(fetchMock.lastOptions()).toEqual(expect.objectContaining(params));
    });

    xit('handles response', async () => {
      await API.request(path, params);
      expect(API.handleResponse).toBeCalledWith(
        expect.objectContaining(response)
      );
    });
  });

  describe('.handleResponse()', () => {
    const t = {};
    const storage = {};
    const res = {};
    let API;

    describe('when request is succeeded', () => {
      beforeAll(() => {
        res.ok = true;
        res.json = jest.fn();
      });

      beforeEach(() => {
        API = new HabiticaApi(t, storage);
      });

      it('returns json response', () => {
        API.handleResponse(res);
        expect(res.json).toBeCalled();
      });
    });

    describe('when request is failed', () => {
      beforeAll(() => {
        res.ok = false;
      });

      beforeEach(() => {
        API = new HabiticaApi(t, storage);
        API.handleError = jest.fn();
      });

      it('handles the error', () => {
        API.handleResponse(res);
        expect(API.handleError).toBeCalledWith(res);
      });
    });
  });

  describe('.handleError()', () => {
    const t = {};
    const storage = {};
    const error = {};
    let API;

    beforeAll(() => {
      storage.removeUser = jest.fn(async () => {});
      storage.removeTask = jest.fn(async () => {});
    });

    beforeEach(() => {
      API = new HabiticaApi(t, storage);
      API.notify = jest.fn();
    });

    describe('when 401 Unauthorized', () => {
      beforeAll(() => {
        error.status = 401;
      });

      it('removes user data from the storage', async () => {
        await API.handleError(error);
        expect(API.storage.removeUser).toBeCalled();
      });

      it('notifies user about wrong credentials', async () => {
        await API.handleError(error);
        expect(API.notify).toBeCalledWith(
          expect.stringContaining('User ID or API Token'),
          'error'
        );
      });
    });

    describe('when 404 Not Found', () => {
      beforeAll(() => {
        error.status = 404;
      });

      it('removes task data from the storage', async () => {
        await API.handleError(error);
        expect(API.storage.removeTask).toBeCalled();
      });
    });
  });

  describe('.authHeaders()', () => {
    const t = {};
    const storage = {};
    let API;
    let secrets;

    beforeAll(() => {
      secrets = {
        userId: 'qwer',
        apiToken: 'asdf'
      };
      t.loadSecret = jest.fn(async key => secrets[key]);
    });

    beforeEach(() => {
      API = new HabiticaApi(t, storage);
    });

    it('loads user id from local storage', async () => {
      await API.authHeaders();
      expect(API.t.loadSecret).toBeCalledWith('userId');
    });

    it('loads api token from local storage', async () => {
      await API.authHeaders();
      expect(API.t.loadSecret).toBeCalledWith('apiToken');
    });

    it('returns proper headers', async () => {
      const headers = await API.authHeaders();
      expect(headers).toEqual(
        expect.objectContaining({
          'x-api-user': secrets.userId,
          'x-api-key': secrets.apiToken
        })
      );
    });
  });

  describe('.addTask()', () => {
    const t = {};
    const storage = {};
    let API;
    let params;

    beforeAll(() => {
      params = { type: 'todo', text: 'Todo text', priority: 1 };
    });

    beforeEach(() => {
      API = new HabiticaApi(t, storage);
      API.request = jest.fn();
    });

    it('starts request to proper url', () => {
      API.addTask(params);
      expect(API.request).toBeCalledWith(
        expect.stringContaining(`/tasks/user`),
        expect.anything()
      );
    });

    it('starts request with proper method type', () => {
      API.addTask(params);
      expect(API.request).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('starts request with proper body', () => {
      API.addTask(params);
      expect(API.request).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify(params)
        })
      );
    });
  });

  describe('.updateTask()', () => {
    const t = {};
    const storage = {};
    let API;
    let id;
    let params;

    beforeAll(() => {
      id = 123;
      params = { priority: 2 };
    });

    beforeEach(() => {
      API = new HabiticaApi(t, storage);
      API.request = jest.fn();
    });

    it('starts request to proper url', () => {
      API.updateTask(id, params);
      expect(API.request).toBeCalledWith(
        expect.stringContaining(`/tasks/${id}`),
        expect.anything()
      );
    });

    it('starts request with proper method type', () => {
      API.updateTask(id, params);
      expect(API.request).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: 'PUT'
        })
      );
    });

    it('starts request with proper body', () => {
      API.updateTask(id, params);
      expect(API.request).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify(params)
        })
      );
    });
  });

  describe('.doTask()', () => {
    const t = {};
    const storage = {};
    let API;
    let id;

    beforeAll(() => {
      id = 123;
    });

    beforeEach(() => {
      API = new HabiticaApi(t, storage);
      API.request = jest.fn();
    });

    it('starts request to proper url', () => {
      API.doTask(id);
      expect(API.request).toBeCalledWith(
        expect.stringContaining(`/tasks/${id}/score/up`),
        expect.anything()
      );
    });

    it('starts request with proper method type', () => {
      API.doTask(id);
      expect(API.request).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  describe('.undoTask()', () => {
    const t = {};
    const storage = {};
    let API;
    let id;

    beforeAll(() => {
      id = 123;
    });

    beforeEach(() => {
      API = new HabiticaApi(t, storage);
      API.request = jest.fn();
    });

    it('starts request to proper url', () => {
      API.undoTask(id);
      expect(API.request).toBeCalledWith(
        expect.stringContaining(`/tasks/${id}/score/down`),
        expect.anything()
      );
    });

    it('starts request with proper method type', () => {
      API.undoTask(id);
      expect(API.request).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  describe('.removeTask()', () => {
    const t = {};
    const storage = {};
    let API;
    let id;

    beforeAll(() => {
      id = 123;
    });

    beforeEach(() => {
      API = new HabiticaApi(t, storage);
      API.request = jest.fn();
    });

    it('starts request to proper url', () => {
      API.removeTask(id);
      expect(API.request).toBeCalledWith(
        expect.stringContaining(`/tasks/${id}`),
        expect.anything()
      );
    });

    it('starts request with proper method type', () => {
      API.removeTask(id);
      expect(API.request).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('.getUserProfile()', () => {
    const t = {};
    const storage = {};
    let API;

    beforeEach(() => {
      API = new HabiticaApi(t, storage);
      API.request = jest.fn();
    });

    it('starts request to proper url', () => {
      API.getUserProfile();
      expect(API.request).toBeCalledWith(
        expect.stringContaining('/user?userFields='),
        expect.anything()
      );
    });

    it('starts request with proper method type', () => {
      API.getUserProfile();
      expect(API.request).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });
});
