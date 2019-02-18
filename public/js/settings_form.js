class SettingsForm {
  constructor(
    trello,
    storage = new Storage(trello)
  ) {
    this.t = trello
    this.storage = storage
  }

  async initialize() {
    await this.fetchSettings()
    this.initializeElements()
    this.initializeScope()
    this.initializePriority()
    this.listenToSubmit()
    this.listenToLogout()
  }

  initializeElements() {
    this.$scope = document.getElementById('scope')
    this.$priority = document.getElementById('priority')
    this.$submitButton = document.getElementById('submit-btn')
    this.$logoutButton = document.getElementById('logout-btn')
  }

  async fetchSettings() {
    this.settings = await this.storage.getSettings()
  }

  initializeScope() {
    this.$scope.value = this.settings.scope
  }

  initializePriority() {
    this.$priority.value = this.settings.priority
  }

  listenToSubmit() {
    this.$submitButton.addEventListener('click', this.handleSubmit.bind(this))
  }

  listenToLogout() {
    this.$logoutButton.addEventListener('click', this.handleLogout.bind(this))
  }

  handleSubmit() {
    this.$submitButton.disabled = true
        
    return this.storage.setSettings({ 
      scope: this.$scope.value,
      priority: this.$priority.value
    }).then(() => this.t.closePopup())
  }

  handleLogout() {
    this.$logoutButton.disabled = true

    return this.storage.removeUser().then(() => this.t.closePopup())
  }
}
