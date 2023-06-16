const { v4: uuidv4 } = require('uuid')

module.exports = class MutationStore {
  mutationsByTick = new Map()
  tickSetSize = 0
  maxTick = 0
  subscriptions = new Map()
  logger = require('../shared/util/logger')(this.constructor.name)

  add(tick, mutation) {
    if (this.mutationsByTick.has(tick)) {
      this.mutationsByTick.get(tick).push(mutation)
    }
    else {
      this.mutationsByTick.set(tick, [mutation])
      this.tickSetSize++
      this.maxTick = tick > this.maxTick ? tick : this.maxTick
    }
    this.publish(tick, this.mutationsByTick.get(tick))
  }

  addRange(tick, mutations) {
    if (this.mutationsByTick.has(tick)) {
      this.mutationsByTick.get(tick).concat(mutations)
    }
    else {
      this.mutationsByTick.set(tick, mutations)
      this.tickSetSize++
      this.maxTick = tick > this.maxTick ? tick : this.maxTick
    }
    this.publish(tick, this.mutationsByTick.get(tick))
  }

  getMutationsByTick(tick) {
    // this.logger('entering GetMutationsByTick()')
    if (this.mutationsByTick.has(tick)){
      return this.mutationsByTick.get(tick)
    }
    // this.logger('exiting GetMutationsByTick()')
    return []
  }

  subscribe(subscription) {
    const subKey = uuidv4()
    this.subscriptions.set(subKey, subscription)
    return subKey
  }

  unsubscribe(subKey) {
    this.subscriptions.delete(subKey)
  }

  publish(tick, mutations) {
    for (let [subKey, sub] of [...this.subscriptions]) {
      sub(tick, mutations)
    }
  }
}
