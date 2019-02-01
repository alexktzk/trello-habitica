class Storage {
  constructor(trello) {
    this.t = trello
  }
  
  getAll() {
    return this.t.getAll();
  }

  removeAll() {
    return Promise.all([
      this.t.remove('board', 'private', 'lists'),
      this.t.remove('board', 'private', 'settings'),
      this.t.remove('board', 'private', 'user')
    ]);
  }

  getUser() {
    return this.t.get('board', 'private', 'user', {});
  }

  setUser(obj) {
    return this.t.get('board', 'private', 'user', {}).then(current => {
      return this.t.set('board', 'private', 'user', Object.assign({}, current, obj));
    });
  }

  removeUser() {
    return this.t.remove('board', 'private', 'user');
  }

  getTask() {
    return this.t.get('card', 'private', 'task', {});
  }

  setTask(obj) {
    return this.t.get('card', 'private', 'task').then(current => {
      return this.t.set('card', 'private', 'task', Object.assign({}, current, obj));
    });
  }

  removeTask() {
    return this.t.remove('card', 'private', 'task');
  }

  getSettings() {
    let defaultSettings = {
      scope: 'me',
      priority: '1'
    };
    return this.t.get('board', 'private', 'settings', defaultSettings);
  }

  setSettings(obj) {
    return this.t.get('board', 'private', 'settings').then(current => {
      return this.t.set('board', 'private', 'settings', Object.assign({}, current, obj));
    });
  }

  getLists() {
    return this.t.get('board', 'private', 'lists', {});
  }

  setLists(obj) {
    return this.t.set('board', 'private', 'lists', obj);
  }
}

