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

  initialize() {
    this.initializeElements();

    this.t.loadSecret('userId').then(val => this.setUserId(val));
    this.t.loadSecret('apiToken').then(val => this.setApiToken(val));

    this.listenToSubmit();
  }

  initializeElements() {
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

  listenToSubmit() {
    this.$submitButton.addEventListener('click', () => this.handleSubmit());
  }

  async handleSubmit() {
    this.$submitButton.disabled = true;

    await Promise.all([
      this.t.storeSecret('userId', this.$userId.value),
      this.t.storeSecret('apiToken', this.$apiToken.value)
    ]);

    return this.api.getUserProfile().then(res => {
      return this.storage
        .setUser({
          name: res.data.profile.name,
          loggedIn: true
        })
        .then(() => this.t.closePopup());
    });
  }
}
