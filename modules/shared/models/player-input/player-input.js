module.exports = class PlayerInput {
  constructor(param) {
    Object.assign(this, param)
    const { inputType, playerId } = param
    this.inputType = inputType || this.constructor.name
    this.playerId = playerId
  }

  computeAndExecuteMutations(gameState) {
    throw new Error('This is the base class, computeAndExecuteMutations() needs to be overridden!')
    return []
  }
}
