const jp = require('jsonpath')
const VectorUtil = require('./util/geometry/vector-util')
const ReplaceNodeMutation = require('./models/mutation/replace-node-mutation')
const PointUtil = require('./util/geometry/point-util')
module.exports = class GameStateMutationFactory {
  constructor(gameState) {
    this.inputQueue = []
    this.gameState = gameState
  }

  computeAndExecuteMutationsForNextTick() {
    this.gameState.tick++
    let mutations = []
    while(this.inputQueue.length) {
      const input = this.inputQueue.shift()
      const inputMutations = input.computeAndExecuteMutations(this.gameState)
      mutations = mutations.concat(inputMutations)
    }

    // move players
    for (let i = 0; i < this.gameState.players.length; i++) {
      const player = this.gameState.players[i]

      if (VectorUtil.calculateMagnitude(player.vector)) {
        const newPosition = PointUtil.translate(player.position, player.vector)
        mutations.push(new ReplaceNodeMutation({
          path: jp.stringify(['$', 'players', i, 'position']),
          initialValue: player.position,
          newValue: newPosition
        }))

        // execute effect
        player.position = newPosition
      }
    }

    return mutations
  }
}
