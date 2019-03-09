const SettingsForm = require('../src/js/settings-form')

describe('SettingsForm class', () => {

  describe('.initialize()', () => {
    let t = {}, storage = {}, form, settings

    beforeAll(() => {
      settings = {
        scope: 'me',
        priority: '1',
        showBadges: true,
        prependIcon: false
      }
      storage.getSettings = jest.fn(async () => settings )
    })

    beforeEach(() => {
      form = new SettingsForm(t, storage)
      form.initializeElements = jest.fn()
      form.setScope = jest.fn()
      form.setPriority = jest.fn()
      form.setShowBadges = jest.fn()
      form.setPrependIcon = jest.fn()
      form.listenToSubmit = jest.fn()
      form.listenToLogout = jest.fn()
    })

    it('gets settings from the storage', () => {
      form.initialize()
      expect(form.storage.getSettings).toBeCalledWith()
    })

    it('initializes dom elements', async () => {
      await form.initialize()
      expect(form.initializeElements).toBeCalledWith()
    })

    it('sets scope value from the storage', async () => {
      await form.initialize()
      expect(form.setScope).toBeCalledWith(settings.scope)
    })

    it('sets priority value from the storage', async () => {
      await form.initialize()
      expect(form.setPriority).toBeCalledWith(settings.priority)
    })

    it('sets showBadges value from the storage', async () => {
      await form.initialize()
      expect(form.setShowBadges).toBeCalledWith(settings.showBadges)
    })

    it('sets prependIcon value from the storage', async () => {
      await form.initialize()
      expect(form.setPrependIcon).toBeCalledWith(settings.prependIcon)
    })

    it('listens to submit', async () => {
      await form.initialize()
      expect(form.listenToSubmit).toBeCalledWith()
    })

    it('listens to logout', async () => {
      await form.initialize()
      expect(form.listenToLogout).toBeCalledWith()
    })
  })

  describe('.setScope()', () => {
    let t = {}, storage = {}, form

    beforeEach(() => {
      form = new SettingsForm(t, storage)
      form.$scope = {}
    })

    it('assigns passed value to scope', () => {
      let val = 'me'
      form.setScope(val)
      expect(form.$scope.value).toBe(val)
    })
  })

  describe('.setPriority()', () => {
    let t = {}, storage = {}, form

    beforeEach(() => {
      form = new SettingsForm(t, storage)
      form.$priority = {}
    })

    it('assigns passed value to priority', () => {
      let val = '1'
      form.setPriority(val)
      expect(form.$priority.value).toBe(val)
    })
  })

  describe('.listenToSubmit()', () => {
    let t = {}, storage = {}, form

    beforeEach(() => {
      form = new SettingsForm(t, storage)
      form.$submitButton = { addEventListener: jest.fn() }
    })

    it('adds on click listener to submit button', () => {
      form.listenToSubmit()
      expect(form.$submitButton.addEventListener).toBeCalledWith(
        'click',
        expect.any(Function)
      )
    })
  })

  describe('.listenToLogout()', () => {
    let t = {}, storage = {}, form

    beforeEach(() => {
      form = new SettingsForm(t, storage)
      form.$logoutButton = { addEventListener: jest.fn() }
    })

    it('adds on click listener to logout button', () => {
      form.listenToLogout()
      expect(form.$logoutButton.addEventListener).toBeCalledWith(
        'click',
        expect.any(Function)
      )
    })
  })

  describe('.handleSubmit()', () => {
    let t = {}, storage = {}, form

    beforeAll(() => {
      t.closePopup = jest.fn()
      storage.setSettings = jest.fn(async () => ({}) )
    })

    beforeEach(() => {
      form = new SettingsForm(t, storage)
      form.$submitButton = {}
      form.$scope = { value: 'me' }
      form.$priority = { value: '1' }
      form.getShowBadges = jest.fn()
      form.getPrependIcon = jest.fn()
    })

    it('disables submit button', () => {
      form.handleSubmit()
      expect(form.$submitButton.disabled).toBe(true)
    })

    it('saves scope to storage', () => {
      form.handleSubmit()
      expect(form.storage.setSettings).toBeCalledWith(
        expect.objectContaining({
          scope: form.$scope.value
        })
      )
    })

    it('saves priority to storage', () => {
      form.handleSubmit()
      expect(form.storage.setSettings).toBeCalledWith(
        expect.objectContaining({
          priority: form.$priority.value
        })
      )
    })

    it('closes the popup', async () => {
      await form.handleSubmit()
      expect(form.t.closePopup).toBeCalledWith()
    })
  })

  describe('.handleLogout()', () => {
    let t = {}, storage = {}, form

    beforeAll(() => {
      t.closePopup = jest.fn()
      storage.removeUser = jest.fn(async () => ({}) )
    })

    beforeEach(() => {
      form = new SettingsForm(t, storage)
      form.$logoutButton = {}
    })

    it('disables logout button', () => {
      form.handleLogout()
      expect(form.$logoutButton.disabled).toBe(true)
    })

    it('removes user data from the storage', () => {
      form.handleLogout()
      expect(form.storage.removeUser).toBeCalledWith()
    })

    it('closes the popup', async () => {
      await form.handleLogout()
      expect(form.t.closePopup).toBeCalledWith()
    })
  })
})
