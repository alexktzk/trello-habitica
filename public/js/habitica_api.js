class HabiticaApi {
  constructor(trello) {
    this.t = trello
  }

  async request(url, userParams) {
    let defaultParams = { 
      headers: await this.authHeaders()
    }

    let params = Object.assign({}, defaultParams, userParams)
    return fetch(url, params).then((res) => this.handleResponse(res))
  }

  async authHeaders() {
    let member = await this.t.get('member', 'private')
    return {
      'x-api-user': member.userId,
      'x-api-key': member.apiToken,
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

  handleError(error) {
    let message = ''
    
    if (error.status == 404) {
      message = `The task might have been removed.`
      new HabiticaStorage(this.t).removeTask()
      this.notify(message, 'error')
    }

    console.error(`${error.status}: ${message}`)
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

  notify(message, display = 'info') {
    this.t.alert({
      message,
      display,
      duration: 3
    })
  }
}

// Fails in a browser, but required for tests.
try { module.exports = HabiticaApi } catch(_) {}
