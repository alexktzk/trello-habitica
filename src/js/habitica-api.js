import { BASE_URL } from './constants';
import Storage from './storage';

export default class HabiticaApi {
  constructor(trello, storage = new Storage(trello)) {
    this.t = trello;
    this.storage = storage;
  }

  async request(path, userParams = {}) {
    const url = BASE_URL + path;
    const defaultParams = {
      headers: await this.authHeaders()
    };

    const params = Object.assign({}, defaultParams, userParams);

    // eslint-disable-next-line no-undef
    return fetch(url, params).then(res => this.handleResponse(res));
  }

  async authHeaders() {
    const { secureCredentials } = await this.storage.getSettings();

    const userID = secureCredentials
        ? await this.t.loadSecret('userId')
        : await this.t.get('board', 'private', 'userId', '');

    return {
      'x-client': `${userID}-trello-habitica`,
      'x-api-user': userID,
      'x-api-key': secureCredentials
        ? await this.t.loadSecret('apiToken')
        : await this.t.get('board', 'private', 'apiToken', ''),
      'Content-Type': 'application/json'
    };
  }

  handleResponse(res) {
    if (res.ok) return res.json();

    return this.handleError(res);
  }

  async handleError(error) {
    if (error.status === 401) {
      await this.storage
        .removeUser()
        .then(() =>
          this.notify(
            'Wrong User ID or API Token. Try to login again.',
            'error'
          )
        );
    } else if (error.status === 404) {
      await this.storage.removeTask();
    }

    return error;
  }

  addTask(params) {
    return this.request('/tasks/user', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  updateTask(id, params) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(params)
    });
  }

  doTask(id) {
    return this.request(`/tasks/${id}/score/up`, {
      method: 'POST'
    });
  }

  undoTask(id) {
    return this.request(`/tasks/${id}/score/down`, {
      method: 'POST'
    });
  }

  removeTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }

  getUserProfile() {
    return this.request('/user?userFields=profile', {
      method: 'GET'
    });
  }

  getUserStats() {
    return this.request('/user?userFields=stats', {
      method: 'GET'
    });
  }

  notify(message, display = 'info') {
    this.t.alert({
      message,
      display,
      duration: 10
    });
  }
}
