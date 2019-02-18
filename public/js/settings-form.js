class SettingsForm {
  constructor(
    trello,
    storage = new Storage(trello)
  ) {
    this.t = trello
    this.storage = storage
  }

  initialize() {
    this.storage.getSettings().then(settings => {
      this.initializeElements()

      this.setScope(settings.scope)
      this.setPriority(settings.priority)

      this.listenToSubmit()
      this.listenToLogout()
    })
  }

  initializeElements() {
    this.$scope = document.getElementById('scope')
    this.$priority = document.getElementById('priority')
    this.$submitButton = document.getElementById('submit-btn')
    this.$logoutButton = document.getElementById('logout-btn')
  }

  setScope(val) {
    this.$scope.value = val
  }

  setPriority(val) {
    this.$priority.value = val
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
