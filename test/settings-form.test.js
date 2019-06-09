import SettingsForm from '../src/js/settings-form';

// eslint-disable-next-line func-names
const initializeElementsMock = function() {
  this.$scope = {};
  this.$priority = {};
  this.$prependIcon = {};
  this.$showBadges = {};
  this.$showStats = {};
  this.$showStatsNotifications = {};
  this.$submitButton = { addEventListener: jest.fn() };
  this.$logoutButton = { addEventListener: jest.fn() };
};

describe('SettingsForm class', () => {
  describe('.initialize()', () => {
    const t = {};
    const storage = {};
    let form;

    beforeEach(() => {
      form = new SettingsForm(t, storage);
      form.initializeElements = jest.fn();
      form.assignValues = jest.fn();
      form.listenToSubmit = jest.fn();
      form.listenToLogout = jest.fn();
    });

    it('defined', () => {
      expect(form.initialize).toBeDefined();
    });

    it('initializes dom elements', async () => {
      await form.initialize();
      expect(form.initializeElements).toBeCalledWith();
    });

    it('assigns values from the storage to dom elements', async () => {
      await form.initialize();
      expect(form.assignValues).toBeCalledWith();
    });

    it('listens to submit', async () => {
      await form.initialize();
      expect(form.listenToSubmit).toBeCalledWith();
    });

    it('listens to logout', async () => {
      await form.initialize();
      expect(form.listenToLogout).toBeCalledWith();
    });
  });

  describe('.initializeElements()', () => {
    const t = {};
    const storage = {};
    let form;

    beforeEach(() => {
      form = new SettingsForm(t, storage);
    });

    it('defined', () => {
      expect(form.initializeElements).toBeDefined();
    });
  });

  describe('.assignValues()', () => {
    const t = {};
    const storage = {};
    let form;
    let settings;

    beforeAll(() => {
      settings = {
        scope: 'me',
        priority: 1,
        prependIcon: false,
        showBadges: true,
        showStats: true,
        showStatsNotifications: true
      };
      storage.getSettings = async () => settings;
    });

    beforeEach(() => {
      form = new SettingsForm(t, storage);
      form.initializeElements = initializeElementsMock;
    });

    it('defined', () => {
      expect(form.assignValues).toBeDefined();
    });

    it('sets scope value from the storage', async () => {
      await form.initialize();
      expect(form.$scope.value).toBe(settings.scope);
    });

    it('sets priority value from the storage', async () => {
      await form.initialize();
      expect(form.$priority.value).toBe(settings.priority);
    });

    it('sets prependIcon value from the storage', async () => {
      await form.initialize();
      expect(form.$prependIcon.checked).toBe(settings.prependIcon);
    });

    it('sets showBadges value from the storage', async () => {
      await form.initialize();
      expect(form.$showBadges.checked).toBe(settings.showBadges);
    });

    it('sets showStats value from the storage', async () => {
      await form.initialize();
      expect(form.$showStats.checked).toBe(settings.showStats);
    });

    it('sets showStatsNotifications value from the storage', async () => {
      await form.initialize();
      expect(form.$showStatsNotifications.checked).toBe(
        settings.showStatsNotifications
      );
    });
  });

  describe('.listenToSubmit()', () => {
    const t = {};
    const storage = {};
    let form;

    beforeEach(() => {
      form = new SettingsForm(t, storage);
      form.$submitButton = { addEventListener: jest.fn() };
    });

    it('defined', () => {
      expect(form.listenToSubmit).toBeDefined();
    });

    it('adds on click listener to submit button', () => {
      form.listenToSubmit();
      expect(form.$submitButton.addEventListener).toBeCalledWith(
        'click',
        expect.any(Function)
      );
    });
  });

  describe('.listenToLogout()', () => {
    const t = {};
    const storage = {};
    let form;

    beforeEach(() => {
      form = new SettingsForm(t, storage);
      form.$logoutButton = { addEventListener: jest.fn() };
    });

    it('defined', () => {
      expect(form.listenToLogout).toBeDefined();
    });

    it('adds on click listener to logout button', () => {
      form.listenToLogout();
      expect(form.$logoutButton.addEventListener).toBeCalledWith(
        'click',
        expect.any(Function)
      );
    });
  });

  describe('.handleSubmit()', () => {
    const t = {};
    const storage = {};
    let settings;
    let form;

    beforeAll(() => {
      settings = {
        scope: 'me',
        priority: 1,
        prependIcon: false,
        showBadges: true,
        showStats: true,
        showStatsNotifications: false
      };
      t.closePopup = jest.fn();
      storage.getSettings = async () => settings;
      storage.setSettings = jest.fn(async () => ({}));
    });

    beforeEach(() => {
      form = new SettingsForm(t, storage);
      form.initializeElements = initializeElementsMock;
      form.initialize();
    });

    it('defined', () => {
      expect(form.handleSubmit).toBeDefined();
    });

    it('disables submit button', () => {
      form.handleSubmit();
      expect(form.$submitButton.disabled).toBe(true);
    });

    it('saves scope to the storage', () => {
      form.handleSubmit();
      expect(form.storage.setSettings).toBeCalledWith(
        expect.objectContaining({
          scope: settings.scope
        })
      );
    });

    it('saves priority to the storage', () => {
      form.handleSubmit();
      expect(form.storage.setSettings).toBeCalledWith(
        expect.objectContaining({
          priority: settings.priority
        })
      );
    });

    it('saves prependIcon to the storage', () => {
      form.handleSubmit();
      expect(form.storage.setSettings).toBeCalledWith(
        expect.objectContaining({
          prependIcon: settings.prependIcon
        })
      );
    });

    it('saves showBadges to the storage', () => {
      form.handleSubmit();
      expect(form.storage.setSettings).toBeCalledWith(
        expect.objectContaining({
          showBadges: settings.showBadges
        })
      );
    });

    it('saves showStats to the storage', () => {
      form.handleSubmit();
      expect(form.storage.setSettings).toBeCalledWith(
        expect.objectContaining({
          showStats: settings.showStats
        })
      );
    });

    it('saves showStatsNotifications to the storage', () => {
      form.handleSubmit();
      expect(form.storage.setSettings).toBeCalledWith(
        expect.objectContaining({
          showStatsNotifications: settings.showStatsNotifications
        })
      );
    });

    it('closes the popup', async () => {
      await form.handleSubmit();
      expect(form.t.closePopup).toBeCalledWith();
    });
  });

  describe('.handleLogout()', () => {
    const t = {};
    const storage = {};
    let form;

    beforeAll(() => {
      t.closePopup = jest.fn();
      storage.removeUser = jest.fn(async () => ({}));
    });

    beforeEach(() => {
      form = new SettingsForm(t, storage);
      form.$logoutButton = {};
    });

    it('defined', () => {
      expect(form.handleLogout).toBeDefined();
    });

    it('disables logout button', () => {
      form.handleLogout();
      expect(form.$logoutButton.disabled).toBe(true);
    });

    it('removes user data from the storage', () => {
      form.handleLogout();
      expect(form.storage.removeUser).toBeCalledWith();
    });

    it('closes the popup', async () => {
      await form.handleLogout();
      expect(form.t.closePopup).toBeCalledWith();
    });
  });
});
