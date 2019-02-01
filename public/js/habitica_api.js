class HabiticaApi {
  constructor(
    trello, 
    storage = new Storage(trello)
  ) {
    this.t = trello
    this.storage = storage
  }

  async request(url, userParams = {}) {
    let defaultParams = { 
      headers: await this.authHeaders()
    }

    let params = Object.assign({}, defaultParams, userParams)
    return fetch(url, params)
      .then((res) => this.handleResponse(res))
  }

  async authHeaders() {
    return {
      'x-api-user': await this.t.loadSecret('userId'),
      'x-api-key': await this.t.loadSecret('apiToken'),
      'Content-Type': 'application/json'
    }
  }

  handleResponse(res) {
    if (res.ok) {
      return res.json()
    } else {
      return this.handleError(res)
    }
  }

  async handleError(error) {
    if (error.status == 401) {
      await this.storage.removeUser().then(() => (
        this.notify(
          "Wrong User ID or API Token. Try to login again.", 
          'error'
        )
      ))
    } else if (error.status == 404) {
      await this.storage.removeTask()
    }

    console.error(error)
    return error
  }
  
  addTask(params) {
    return this.request(API + '/tasks/user', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  removeTask(id) {
    return this.request(API + `/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  doTask(id) {
    return this.request(API + `/tasks/${id}/score/up`, {
      method: 'POST',
    })
  }

  undoTask(id) {
    return this.request(API + `/tasks/${id}/score/down`, {
      method: 'POST',
    })
  }

  updateTask(id, params) {
    return this.request(API + `/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(params)
    })
  }

  getUserProfile() {
    return this.request(API + '/user?userFields=profile', {
      method: 'GET'
    })
  }

  notify(message, display = 'info') {
    this.t.alert({
      message,
      display,
      duration: 10
    })
  }
}

// Fails in a browser, but required for tests.
try { module.exports = HabiticaApi } catch(_) {}
