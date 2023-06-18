const PlayerInput = require('./player-input')
const Player = require('../game-state/player.model')
const { getRandomColor, getRandomIntInclusive } = require('../../util/util')
const Point = require('../game-state/point.model')
const Vector = require('../game-state/vector.model')
const SpliceArrayMutation = require('../mutation/splice-array-mutation')

module.exports = class JoinInput extends PlayerInput {
  constructor(param = {}) {
    super(param)
  }

  computeAndExecuteMutations(gameState) {
    const width = 50
    const player = new Player({
      id: this.playerId,
      color: getRandomColor(),
      width,
      position: new Point({
        x: getRandomIntInclusive(width, gameState.gameWidth - width),
        y: getRandomIntInclusive(width, gameState.gameHeight - width)
      }),
      moveSpeed: getRandomIntInclusive(10, 15),
      vector: new Vector({
        x: 0,
        y: 0
      })
    })

    const mutations = [new SpliceArrayMutation({
      path: '$.players',
      start: gameState.players.length,
      itemsToDelete: [],
      itemsToAdd: [player]
    })]

    // execute effect
    gameState.players.push(player)

    // return mutations
    return mutations
  }
}
