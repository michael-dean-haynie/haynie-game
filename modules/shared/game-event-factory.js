const { getRandomColor, getRandomIntInclusive } = require('./util/util')
const Player = require('./models/game-state/player.model')
const PlayerJoinedEvent = require('./models/game-event/player-joined-event.model')
const GameStartEvent = require('./models/game-event/game-start-event.model')
const Point = require('./models/game-state/point.model')
const Vector = require('./models/game-state/vector.model')
const PlayerVectorChangedEvent = require('./models/game-event/player-vector-changed-event.model')
const PlayerLeftEvent = require('./models/game-event/player-left-event.model')

module.exports = class GameEventFactory {
  constructor(gameStateManager) {
    this.gameStateManager = gameStateManager
    this.gameState = gameStateManager.gameState
  }

  addEvent(event) {
    this.gameStateManager.gameEventStore.add(
      this.gameState.tick + 1,
      event)
  }

  createGameStartEvent() {
    this.addEvent(new GameStartEvent())
  }

  createPlayerJoinedEvent(playerId) {
    const width = 50
    const player = new Player({
      id: playerId,
      color: getRandomColor(),
      width,
      position: new Point({
        x: getRandomIntInclusive(width, this.gameState.gameWidth - width),
        y: getRandomIntInclusive(width, this.gameState.gameHeight - width)
      }),
      moveSpeed: 10,
      vector: new Vector({
        x: 0,
        y: 0
      })
    })

    this.addEvent(new PlayerJoinedEvent({ player }))
  }

  createPlayerLeftEvent(playerId) {
    this.addEvent(new PlayerLeftEvent({
      playerId
    }))
  }

  createPlayerVectorChangedEvent(playerId, direction) {
    const player = this.gameState.players.find(plyr => plyr.id === playerId)
    const { moveSpeed } = player
    const directionVectorMap = {
      none: new Vector({ x: 0, y: 0 }),
      up: new Vector({ x: 0, y: moveSpeed }),
      right: new Vector({ x: moveSpeed, y: 0 }),
      down: new Vector({ x: 0, y: moveSpeed * -1 }),
      left: new Vector({ x: moveSpeed * -1, y: 0 }),
    }
    const newVector = directionVectorMap[direction]
    this.addEvent(new PlayerVectorChangedEvent({
      playerId,
      newVector
    }))
  }
}
