const GameEventStore = require('./game-event-store')
const config = require('./config.js')
const GameEventFactory = require('./game-event-factory')

module.exports = class GameStateManager {
  gameEventStore = new GameEventStore()

  constructor ({
    gameState,
  } = {}) {
    this.gameState = gameState
    this.gameEventFactory = new GameEventFactory(this)
    this.subscriptions = []
  }

  stepForward() {
    const initialTick = this.gameState.tick
    const targetTick = initialTick + 1
    const targetTickEvents = this.gameEventStore.getEventsByTick(targetTick)

    // mutate for events of target tick
    for (let i = 0; i < targetTickEvents.length; i++) {
      const event = targetTickEvents[i]
      event.mutate(this.gameState)
    }

    // mutate each player
    for (let i = 0; i < this.gameState.players.length; i++) {
      const player = this.gameState.players[i]
      player.mutate(this.gameState)
    }

    this.gameState.tick = targetTick
    this.publish()
  }

  stepBackward() {
    const initialTick = this.gameState.tick
    const targetTick = initialTick - 1
    const initialTickEvents = this.gameEventStore.getEventsByTick(initialTick)


    // revert each player
    for (let i = this.gameState.players.length - 1; i >= 0; i--) {
      const player = this.gameState.players[i]
      player.revert(this.gameState)
    }

    // revert events of initial tick before going back
    for (let i = initialTickEvents.length - 1; i >= 0; i--) {
      const event = initialTickEvents[i]
      event.revert(this.gameState)
    }

    this.gameState.tick = targetTick
  }

  registerSubscription (subscription) {
    this.subscriptions.push(subscription)
  }

  publish () {
    this.subscriptions.forEach(subscription => {
      subscription(this.gameState)
    })
  }
}
