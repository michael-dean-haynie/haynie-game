const PlayerInput = require('./player-input')
const Vector = require('../game-state/vector.model')
const ReplaceNodeMutation = require('../mutation/replace-node-mutation')
const jp = require('jsonpath')

module.exports = class MoveInput extends PlayerInput {
  constructor(param = {}) {
    super(param)

    const { direction } = param
    this.direction = direction
  }

  computeAndExecuteMutations(gameState) {
    const playerIndex = gameState.players.findIndex(plyr => plyr.id === this.playerId)
    const player = gameState.players[playerIndex]
    const initialVector = player.vector
    const directionVectorMap = {
      none: new Vector({ x: 0, y: 0 }),
      up: new Vector({ x: 0, y: player.moveSpeed }),
      right: new Vector({ x: player.moveSpeed, y: 0 }),
      down: new Vector({ x: 0, y: player.moveSpeed * -1 }),
      left: new Vector({ x: player.moveSpeed * -1, y: 0 }),
    }
    const newVector = directionVectorMap[this.direction]

    const mutations = [new ReplaceNodeMutation({
      path: jp.stringify(['$', 'players', playerIndex, 'vector']),
      initialValue: initialVector,
      newValue: newVector
    })]

    // execute effect
    player.vector = newVector

    // return mutations
    return mutations
  }
}
