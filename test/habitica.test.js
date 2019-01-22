const h = require('../public/js/habitica')
const t = mockT = require('./helpers/trello-storage')

describe('.withHeaders', () => {
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
  
    test('returns proper headers', (done) => {
      h.withHeaders(mockT, headers => {
        t.get('member', 'private').then(member => {
          done()
          expect(headers).toEqual({
            'x-api-user': member.userId,
            'x-api-key': member.apiToken,
            'Content-Type': 'application/json'
          })
        })
      })
    })

  })

  describe('with invalid arguments', () => {
    test('throws TypeError without trello storage', () => {
      const noStorage = undefined
      const callback = jest.fn()

      expect(() => { 
        h.withHeaders(noStorage, callback)
      }).toThrow(TypeError)
    })

    test('falls to .catch with TypeError without callback', (done) => {
      const noCallback = undefined
      
      h.withHeaders(mockT, noCallback).catch((e) => {
        expect(e.toString()).toMatch(/TypeError/)
        done()
      })
    })
  })
})
