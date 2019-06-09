/* eslint-disable class-methods-use-this */

import Storage from './storage';

export default class SettingsForm {
  constructor(trello, storage = new Storage(trello)) {
    this.t = trello;
    this.storage = storage;
  }

  initialize() {
    this.initializeElements();
    this.assignValues();
    this.listenToSubmit();
    this.listenToLogout();
  }

  initializeElements() {
    this.$scope = document.getElementById('scope');
    this.$priority = document.getElementById('priority');
    this.$prependIcon = document.getElementById('prepend-icon');
    this.$showBadges = document.getElementById('show-badges');
    this.$showStats = document.getElementById('show-stats');
    this.$submitButton = document.getElementById('submit-btn');
    this.$logoutButton = document.getElementById('logout-btn');
    this.$showStatsNotifications = document.getElementById(
      'show-stats-notifications'
    );
  }

  assignValues() {
    return this.storage.getSettings().then(async settings => {
      this.$scope.value = settings.scope;
      this.$priority.value = settings.priority;
      this.$prependIcon.checked = settings.prependIcon;
      this.$showBadges.checked = settings.showBadges;
      this.$showStats.checked = settings.showStats;
      this.$showStatsNotifications.checked = settings.showStatsNotifications;
    });
  }

  listenToSubmit() {
    this.$submitButton.addEventListener('click', () => this.handleSubmit());
  }

  listenToLogout() {
    this.$logoutButton.addEventListener('click', () => this.handleLogout());
  }

  handleSubmit() {
    this.$submitButton.disabled = true;

    return this.storage
      .setSettings({
        scope: this.$scope.value,
        priority: this.$priority.value,
        prependIcon: this.$prependIcon.checked,
        showBadges: this.$showBadges.checked,
        showStats: this.$showStats.checked,
        showStatsNotifications: this.$showStatsNotifications.checked
      })
      .then(() => this.t.closePopup());
  }

  handleLogout() {
    this.$logoutButton.disabled = true;

    return this.storage.removeUser().then(() => this.t.closePopup());
  }
}
