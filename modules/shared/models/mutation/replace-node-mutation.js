const jp = require('jsonpath')
const Mutation = require('./mutation')

module.exports = class ReplaceNodeMutation extends Mutation {
  constructor(param) {
    super(param)

    const { path, initialValue, newValue } = param
    this.path = path
    this.initialValue = initialValue
    this.newValue = newValue

  }

  mutate(gameState) {
    jp.value(gameState, this.path, this.newValue)
  }

  revert(gameState) {
    jp.value(gameState, this.path, this.initialValue)
  }
}
