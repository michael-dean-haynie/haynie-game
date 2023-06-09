const SpliceArrayMutation = require('./models/mutation/splice-array-mutation')
const ReplaceNodeMutation = require('./models/mutation/replace-node-mutation')
module.exports = class GameStateMutator {
  constructor({
    gameState,
    mutationStore,
    tick = 0
  } = {}) {
    this.gameState = gameState
    this.mutationStore = mutationStore
    this.tick = tick
  }

  stepForward() {
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

  instantiateMutation(mutation) {
    switch(mutation.mutationType) {
      case SpliceArrayMutation.name:
        return new SpliceArrayMutation(mutation)
      case ReplaceNodeMutation.name:
        return new ReplaceNodeMutation(mutation)
    }
  }
}
