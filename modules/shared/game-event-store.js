module.exports = class GameEventStore {
  eventsByTick = new Map()
  tickSetSize = 0
  maxTick = 0

  add(tick, event) {
    if (this.eventsByTick.has(tick)) {
      this.eventsByTick.get(tick).push(event)
    }
    else {
      this.eventsByTick.set(tick, [event])
      this.tickSetSize++
      this.maxTick = tick > this.maxTick ? tick : this.maxTick
    }
  }

  getEventsByTick(tick) {
    if (this.eventsByTick.has(tick)){
      return this.eventsByTick.get(tick)
    }
    return []
  }
}
