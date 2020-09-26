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
    this.assignValues();
    this.listenToSubmit();
  }

  initializeElements() {
    this.$submitButton = document.getElementById('submit-btn');
    this.$userId = document.getElementById('user-id');
    this.$apiToken = document.getElementById('api-token');
    this.$secureCredentials = document.getElementById('secure-credentials');
  }

  async assignValues() {
    const { secureCredentials } = await this.storage.getSettings()

    this.$userId.value = secureCredentials 
        ? await this.t.loadSecret('userId') 
        : await this.t.get('board', 'private', 'userId', '')

    this.$apiToken.value = secureCredentials 
        ? await this.t.loadSecret('apiToken') 
        : await this.t.get('board', 'private', 'apiToken', '')

    this.$secureCredentials.checked = secureCredentials
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

    const secureCredentials = this.$secureCredentials.checked

    await this.storage.setSettings({ secureCredentials })

    if (secureCredentials) {
      await this.t.storeSecret('userId', this.$userId.value)
      await this.t.storeSecret('apiToken', this.$apiToken.value)
      this.t.remove('board', 'private', 'userId')
      this.t.remove('board', 'private', 'apiToken')
    } else {
      await this.t.set('board', 'private', 'userId', this.$userId.value)
      await this.t.set('board', 'private', 'apiToken', this.$apiToken.value)
      this.t.clearSecret('userId')
      this.t.clearSecret('apiToken')
    }

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
