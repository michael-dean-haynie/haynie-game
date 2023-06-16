const SpliceArrayMutation = require('./models/mutation/splice-array-mutation')
const ReplaceNodeMutation = require('./models/mutation/replace-node-mutation')
module.exports = class GameStateMutator {
  constructor({
    gameState,
    mutationStore,
    tick = 0
  } = {}) {
    this.logger = require('../shared/util/logger')(this.constructor.name)
    this.gameState = gameState
    this.mutationStore = mutationStore
    this.tick = tick
  }

  stepForward() {
    this.logger(`stepping forward [tick=${this.tick + 1}]`)
    this.tick++
    this.gameState.tick = this.tick
    const mutations = this.mutationStore.getMutationsByTick(this.tick)
    for (let mutation of mutations) {
      const mutationInst = this.instantiateMutation(mutation)
      mutationInst.mutate(this.gameState)
    }
  }

  stepForwardTillEnd() {
    while(this.tick < this.mutationStore.maxTick) {
      this.stepForward()
    }
  }

  stepBackward() {
    this.logger('stepping backward')
    const mutations = this.mutationStore.getMutationsByTick(this.tick)
    for (let i = mutations.length - 1; i >= 0 ; i--) {
      const mutation = mutations[i]
      const mutationInst = this.instantiateMutation(mutation)
      mutationInst.revert(this.gameState)
    }

    this.tick--
    this.gameState.tick = this.tick
  }

  instantiateMutation(mutation) {
    switch(mutation.mutationType) {
      case SpliceArrayMutation.name:
        return new SpliceArrayMutation(mutation)
      case ReplaceNodeMutation.name:
        return new ReplaceNodeMutation(mutation)
    }
  }
}
