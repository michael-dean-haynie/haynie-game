module.exports = class Mutation {
  constructor({
    mutationType
  } = {}) {
    this.mutationType = mutationType || this.constructor.name
  }

  mutate(gameState) {
    throw new Error('This is the base class, mutate() needs to be overridden!')
  }

  revert(gameState) {
    throw new Error('This is the base class, revert() needs to be overridden!')
  }
}
