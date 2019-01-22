let isObject = (val) => (
  val && typeof val === 'object' && val.constructor === Object
)

let isString = (val) => (
  typeof val === 'string' || val instanceof String
)

module.exports = t = {
  storage: {
    member: { private: {}, shared: {} },
    board: { private: {}, shared: {} },
    card: { private: {}, shared: {} }
  },
  get: (scope, visibility, key, def) => {
    if (key) { 
      return new Promise((resolve, _reject) => 
        resolve(t.storage[scope][visibility][key] || def)
      )
    }
    else if(visibility) { 
      return new Promise((resolve, _reject) => 
        resolve(t.storage[scope][visibility] || def)
      )
    }
    else { throw "Key is required." }
  },
  getAll: () => (t.storage),
  set: (scope, visibility, key, val) => {
    if (key) { 
      if (isString(key)) {
        return new Promise((resolve, _reject) => 
          resolve(t.storage[scope][visibility][key] = val)
        ) 
      } else if (isObject(key)) {
        return new Promise((resolve, _reject) => 
          resolve(
            t.storage[scope][visibility] = Object.assign(
              {}, 
              t.storage[scope][visibility], 
              key
            )
          )
        )   
      }
    }
    else { throw "Key is required." }
  }
}
