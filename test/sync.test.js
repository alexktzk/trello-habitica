const Sync = require('../public/js/sync')
const Storage = require('../public/js/storage')

let taskMock = { 
  handleAdd: jest.fn(async () => {}),
  handleDo: jest.fn(),
  handleUndo: jest.fn(async () => {}),
  handleRemove: jest.fn()
}
let getTaskMock = jest.fn(() => taskMock)

describe('Sync class', () => {
  describe('constructor', () => {
    let t, storage, sync

    beforeAll(() => {
      t = {}
      storage = new Storage(t)
    })

    beforeEach(() => {
      sync = new Sync(t, storage)
    }) 

    it('assigns passed trello instance to local t variable', () => {
      expect(sync.t).toBeDefined()
      expect(sync.t).toBe(t)
    })

    it('assigns passed storage to local storage variable', () => {
      expect(sync.storage).toBeDefined()
      expect(sync.storage).toBe(storage)
    })
  })

  describe('.start()', () => {
    describe('preparations', () => {
      let t, storage, sync

      beforeAll(() => {
        t = {
          get: () => ({ scope: 'all' }),
          card: () => ({ members: [] }),
          getContext: () => ({ member: 123 })
        }
        storage = new Storage(t)
      })

      beforeEach(() => {
        sync = new Sync(t, storage)
      })

      it('gets card data from the storage', async () => {
        let card = jest.spyOn(sync.t, 'card')
        await sync.start()
        expect(card).toBeCalled()
      })

      it('gets settings from the storage', async () => {
        let getSettings = jest.spyOn(sync.storage, 'getSettings')
        await sync.start()
        expect(getSettings).toBeCalled()
      })

      it('gets task data from the storage', async () => {
        let getTask = jest.spyOn(sync.storage, 'getTask')
        await sync.start()
        expect(getTask).toBeCalled()
      })

    })

    describe('when syncing only cards that was assigned to me', () => {
      let t, storage, sync, me

      beforeAll(() => {
        me = { id: 123 }
        t = {
          get: () => ({ scope: 'me' }),
          getContext: () => ({ member: me.id }),
        }
        storage = new Storage(t)
      })

      describe('when card is not assigned to me', () => {

        beforeAll(() => {
          t.card = () => ({ members: [] })
        })

        beforeEach(() => {
          sync = new Sync(t, storage)
        })

        it('unmarks the card', async () => {
          let handleScoped = jest.spyOn(sync, 'handleScoped')
          await sync.start()
          expect(handleScoped).toBeCalled()
        })

        it('do not proceeds to the syncing', async () => {
          let handle = jest.spyOn(sync, 'handle')
          await sync.start()
          expect(handle).not.toBeCalled()
        })
      })

      describe('when card is assigned to me', () => {

        beforeAll(() => {
          t.card = () => ({ members: [me] })
        })

        beforeEach(() => {
          sync = new Sync(t, storage)
        })

        it('proceeds right to the syncing', async () => {
          let handleScoped = jest.spyOn(sync, 'handleScoped')
          let handle = jest.spyOn(sync, 'handle')
          await sync.start()
          expect(handleScoped).not.toBeCalled()
          expect(handle).toBeCalled()
        })
      })
    })

    describe('when syncing all the cards', () => {
      let t, storage, sync, getResponse, lists, task

      beforeAll(() => {
        getResponse = { scope: 'all' }
        lists = getResponse
        task = getResponse
        card = { idList: 456 }
        t = {
          get: () => getResponse,
          card: () => card,
        }
        storage = new Storage(t)
      })

      beforeEach(() => {
        sync = new Sync(t, storage)
      })

      it('proceeds right to the syncing', async () => {
        let handleScoped = jest.spyOn(sync, 'handleScoped')
        let handle = jest.spyOn(sync, 'handle')
        await sync.start()
        expect(handleScoped).not.toBeCalled()
        expect(handle).toBeCalled()
      })

      it('gets lists from the storage', async () => {
        let getLists = jest.spyOn(sync.storage, 'getLists')
        await sync.start()
        expect(getLists).toBeCalled()
      })

      it('calls sync handler with proper args', async () => {
        let handle = jest.spyOn(sync, 'handle')
        let listType = lists[card.idList]
        await sync.start()
        expect(handle).toBeCalledWith(task, listType)
      })
    })
  })

  describe('.handleScoped()', () => {
    let t = {}, storage, sync, taskData = {}

    beforeAll(() => {
      storage = new Storage(t)
    })

    beforeEach(() => {
      sync = new Sync(t, storage)
      sync.getTask = getTaskMock
    })

    describe('when to-do is present', () => {
      beforeAll(() => {
        taskData.id = 123
      })

      describe('when to-do is done', () => {
        beforeAll(() => {
          taskData.done = true
        })

        it('undo the to-do', () => {
          sync.handleScoped(taskData)
          expect(sync.getTask().handleUndo).toBeCalled()
        })

        it('removes the to-do', async () => {
          await sync.handleScoped(taskData)
          expect(sync.getTask().handleRemove).toBeCalled()
        })
      })

      describe('when task is not done', () => {
        beforeAll(() => {
          taskData.done = false
        })

        it('removes the to-do', () => {
          sync.handleScoped(taskData)
          expect(sync.getTask().handleRemove).toBeCalled()
        })
      })
    })
  })

  describe('.handle()', () => {
    let t = {}, storage, sync, listType, taskData = {}
    beforeAll(() => {
      storage = new Storage(t)
    })

    beforeEach(() => {
      sync = new Sync(t, storage)
      sync.getTask = getTaskMock
    })

    describe('when card is moved to a list of type DOING', () => {
      beforeAll(() => {
        listType = LIST_TYPES.DOING
      })

      describe('when task is present', () => {
        beforeAll(() => {
          taskData.id = 123
        })

        describe('when task is done', () => {
          beforeAll(() => {
            taskData.done = true
          })

          it('undo the task', () => {
            sync.handle(taskData, listType)
            expect(sync.getTask().handleUndo).toBeCalled()
          })
        })
      })

      describe('when task is not present', () => {
        beforeAll(() => {
          taskData.id = undefined
        })

        it('adds a task', () => {
          sync.handle(taskData, listType)
          expect(sync.getTask().handleAdd).toBeCalled()
        })
      })
    })

    describe('when card is moved to a list of type DONE', () => {
      beforeAll(() => {
        listType = LIST_TYPES.DONE
      })

      describe('when task is present', () => {
        beforeAll(() => {
          taskData.id = 123
        })

        describe('when task is not done', () => {
          beforeAll(() => {
            taskData.done = false
          })

          it('do the task', () => {
            sync.handle(taskData, listType)
            expect(sync.getTask().handleDo).toBeCalled()
          })
        })
      })

      describe('when task is not present', () => {
        beforeAll(() => {
          taskData.id = undefined
        })

        it('adds a task', () => {
          sync.handle(taskData, listType)
          expect(sync.getTask().handleAdd).toBeCalled()
        })

        it('do the task', async () => {
          await sync.handle(taskData, listType)
          expect(sync.getTask().handleDo).toBeCalled()
        })
      })
    })

    describe('when card is moved to other lists', () => {
      beforeAll(() => {
        listType = 'some other list'
      })

      describe('when task is present', () => {
        beforeAll(() => {
          taskData.id = 123
        })

        describe('when task is done', () => {
          beforeAll(() => {
            taskData.done = true
          })

          it('undo the task', () => {
            sync.handle(taskData, listType)
            expect(sync.getTask().handleUndo).toBeCalled()
          })

          it('removes the task', async () => {
            await sync.handle(taskData, listType)
            expect(sync.getTask().handleRemove).toBeCalled()
          })
        })

        describe('when task is not done', () => {
          beforeAll(() => {
            taskData.done = false
          })

          it('removes the task', () => {
            sync.handle(taskData, listType)
            expect(sync.getTask().handleRemove).toBeCalled()
          })
        })
      })
    })
  })
})
