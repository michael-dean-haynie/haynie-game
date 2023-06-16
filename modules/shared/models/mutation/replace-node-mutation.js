const { cp } = require('../../util/util.js')
const jp = require('jsonpath')
const Mutation = require('./mutation')

module.exports = class ReplaceNodeMutation extends Mutation {
  constructor(param) {
    super(param)

    const { path, initialValue, newValue } = param
    this.path = path
    this.initialValue = cp(initialValue)
    this.newValue = cp(newValue)

  }

  mutate(gameState) {
    jp.value(gameState, this.path, cp(this.newValue))
  }

  revert(gameState) {
    jp.value(gameState, this.path, cp(this.initialValue))
  }
}
