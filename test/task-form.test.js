import TaskForm from '../src/js/task-form'

describe('TaskForm class', () => {

  describe('.initialize()', () => {
    let t = {}, storage = {}, form, task

    beforeAll(() => {
      task = {
        priority: '1'
      }
      storage.getTask = jest.fn(async () => task )
    })

    beforeEach(() => {
      form = new TaskForm(t, storage)
      form.initializeElements = jest.fn()
      form.setPriority = jest.fn()
      form.listenToSubmit = jest.fn()
    })

    it('gets task data from the storage', () => {
      form.initialize()
      expect(form.storage.getTask).toBeCalledWith()
    })

    it('initializes dom elements', async () => {
      await form.initialize()
      expect(form.initializeElements).toBeCalledWith()
    })

    it('sets priority value from the storage', async () => {
      await form.initialize()
      expect(form.setPriority).toBeCalledWith(task.priority)
    })

    it('listens to submit', async () => {
      await form.initialize()
      expect(form.listenToSubmit).toBeCalledWith()
    })
  })

  describe('.setPriority()', () => {
    let t = {}, storage = {}, form

    beforeEach(() => {
      form = new TaskForm(t, storage)
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
      form = new TaskForm(t, storage)
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

  describe('.handleSubmit()', () => {
    let t = {}, storage = {}, form, task

    beforeAll(() => {
      task = {
        priority: '1'
      }
      storage.getTask = jest.fn(async () => task)
      t.closePopup = jest.fn()
    })

    beforeEach(() => {
      form = new TaskForm(t, storage)
      form.$submitButton = {}
      form.$priority = {}
      form.updatePriority = jest.fn(async () => ({}) )
    })

    it('disables submit button', () => {
      form.handleSubmit()
      expect(form.$submitButton.disabled).toBe(true)
    })

    it('gets task from the storage', () => {
      form.handleSubmit()
      expect(form.storage.getTask).toBeCalledWith()
    })

    describe('when task was changed', () => {
      beforeAll(() => {
        task.priority = '1'
      })

      beforeEach(() => {
        form.$priority.value = '2'
      })

      it('saves priority to storage', async () => {
        await form.handleSubmit()
        expect(form.updatePriority).toBeCalledWith(form.$priority.value)
      })
    })

    describe('when task was not changed', () => {
      beforeAll(() => {
        task.priority = '1'
      })

      beforeEach(() => {
        form.$priority.value = '1'
      })

      it('do nothing', async () => {
        await form.handleSubmit()
        expect(form.updatePriority).not.toBeCalled()
      })
    })
  })
})
