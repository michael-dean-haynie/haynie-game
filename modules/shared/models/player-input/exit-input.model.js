const PlayerInput = require('./player-input')
const SpliceArrayMutation = require('../mutation/splice-array-mutation')

module.exports = class ExitInput extends PlayerInput {
  constructor(param = {}) {
    super(param)
  }

  computeAndExecuteMutations(gameState) {
    const playerIndex = gameState.players.findIndex(plyr => plyr.id === this.playerId)
    const player = gameState.players[playerIndex]

    const mutations = [new SpliceArrayMutation({
      path: '$.players',
      start: playerIndex,
      itemsToDelete: [player],
      itemsToAdd: []
    })]

    // execute effect
    gameState.players.splice(playerIndex, 1)

    // return mutations
    return mutations
  }
}
