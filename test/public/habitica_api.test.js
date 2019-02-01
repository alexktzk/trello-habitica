const h = require('../../public/js/habitica')
const t = mockT = require('../helpers/trello-storage')

describe('.authHeaders', () => {
  test('method exists', () => {
    expect(h.withHeaders).not.toBeUndefined()
  })

  describe('with valid arguments', () => {
    beforeAll(() => {
      t.set('member', 'private', {
        userId: 123,
        apiToken: 456
      })
    })

    test('calls provided callback', (done) => {
      h.withHeaders(mockT, () => done())
    })
  
    test('returns proper headers', async () => {
      const headers = await h.withHeaders(mockT)
      const member  = await t.get('member', 'private')

      expect(headers).toEqual({
        'x-api-user': member.userId,
        'x-api-key': member.apiToken,
        'Content-Type': 'application/json'
      })
    })
  })

  describe('with invalid arguments', () => {
    test('throws TypeError without trello storage', async () => {
      const noStorage = undefined
      const callback = jest.fn()
      
      expect.assertions(1)
      await h.withHeaders(noStorage, callback).catch((e) => {
        expect(e.toString()).toMatch(/TypeError.+get/)
      })
    })

    test('falls to .catch with TypeError without callback', async () => {
      const noCallback = undefined
      
      expect.assertions(1)
      await h.withHeaders(mockT, noCallback).catch((e) => {
        expect(e.toString()).toMatch(/TypeError.+callback/)
      })
    })
  })
})
