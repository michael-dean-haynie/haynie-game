module.exports = class MutationStore {
  mutationsByTick = new Map()
  tickSetSize = 0
  maxTick = 0
  subscriptions = []

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
    if (this.mutationsByTick.has(tick)){
      return this.mutationsByTick.get(tick)
    }
    return []
  }

  subscribe(subscription) {
    this.subscriptions.push(subscription)
  }

  publish(tick, mutations) {
    this.subscriptions.forEach(subscription => {
      subscription(tick, mutations)
    })
  }
}
