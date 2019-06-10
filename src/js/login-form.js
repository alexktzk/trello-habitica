import Storage from './storage';
import HabiticaApi from './habitica-api';

export default class LoginForm {
  constructor(
    trello,
    storage = new Storage(trello),
    api = new HabiticaApi(trello)
  ) {
    this.t = trello;
    this.storage = storage;
    this.api = api;
  }

  async initialize() {
    this.initializeElements();
    this.listenToClear();
    this.listenToSubmit();

    return Promise.all([
      this.t.loadSecret('userId').then(val => this.setUserId(val)),
      this.t.loadSecret('apiToken').then(val => this.setApiToken(val))
    ]);
  }

  initializeElements() {
    this.$clearButton = document.getElementById('clear-btn');
    this.$submitButton = document.getElementById('submit-btn');
    this.$userId = document.getElementById('user-id');
    this.$apiToken = document.getElementById('api-token');
  }

  setUserId(val) {
    this.$userId.value = val;
  }

  setApiToken(val) {
    this.$apiToken.value = val;
  }

  listenToClear() {
    this.$clearButton.addEventListener('click', () => this.handleClear());
  }

  listenToSubmit() {
    this.$submitButton.addEventListener('click', () => this.handleSubmit());
  }

  async handleClear() {
    this.$clearButton.disabled = true;

    return Promise.all([
      this.t.clearSecret('userId'),
      this.t.clearSecret('apiToken')
    ]).then(() => this.t.closePopup());
  }

  async handleSubmit() {
    this.$submitButton.disabled = true;

    await Promise.all([
      this.t.storeSecret('userId', this.$userId.value),
      this.t.storeSecret('apiToken', this.$apiToken.value)
    ]);

    return this.api.getUserProfile().then(res => {
      const userParams = {
        name: res.data.profile.name,
        loggedIn: true
      };

      return this.storage.setUser(userParams).then(() => this.t.closePopup());
    });
  }
}
