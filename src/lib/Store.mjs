export default class Store {
  store = {}

  constructor (store = {}) {
    this.store = store

    this.set = this.set.bind(this)
    this.get = this.get.bind(this)
    this.del = this.del.bind(this)
    this.clone = this.clone.bind(this)
  }

  set (key, value) {
    if (value == null || !key) { return }
    this.store[key] = value
    return { [key]: value }
  }

  get (key) {
    if (!key) { return }
    return this.store[key]
  }

  del (key) {
    if (!key) { return }
    const value = this.store[key]
    delete this.store[key]
    return value
  }
}
