const jp = require('jsonpath')
const Mutation = require('./mutation')

module.exports = class SpliceArrayMutation extends Mutation {
  constructor(param) {
    super(param)

    const { path, start, itemsToDelete, itemsToAdd } = param
    this.path = path
    this.start = start
    this.itemsToDelete = itemsToDelete
    this.itemsToAdd = itemsToAdd

  }

  mutate(gameState) {
    const srcArr = jp.value(gameState, this.path)
    srcArr.splice(this.start, this.itemsToDelete.length, ...this.itemsToAdd)
  }

  revert(gameState) {
    const srcArr = jp.value(gameState, this.path)
    srcArr.splice(this.start, this.itemsToAdd.length, ...this.itemsToDelete)
  }
}
