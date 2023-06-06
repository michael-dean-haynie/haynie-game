const MoveInput = require('../shared/models/player-input/move-input.model')
module.exports = class PlayerInputController {
  keyToDirectionMap = {
    ArrowUp: 'up',
    ArrowRight: 'right',
    ArrowDown: 'down',
    ArrowLeft: 'left'
  }
  pks = ['none'] // pressed key stack
  lastMoveInput

  subscriptions = []

  constructor () {
    document.onkeydown = (event) => {
      const direction = this.keyToDirectionMap[event.key]
      if (direction && !this.pks.includes(direction)) {
        this.pks.push(direction)
        const input = new MoveInput({ direction })
        this.publishIfNew(input)
      }
    }
    document.onkeyup = (event) => {
      const direction = this.keyToDirectionMap[event.key]
      if (direction) {
        this.pks = this.pks.filter(dir => dir !== direction)
        const dir = this.pks.at(-1)
        const input = new MoveInput({ direction: dir })
        this.publishIfNew(input)
      }
    }
  }

  registerSubscription (subscription) {
    this.subscriptions.push(subscription)
  }

  publishIfNew (playerInput) {
    if (playerInput.inputType === MoveInput.name){
      if (this.lastMoveInput && this.lastMoveInput.direction === playerInput.direction) {
        return // skip because it's the same as the last time
      }
      this.lastMoveInput = playerInput
    }
    this.subscriptions.forEach(subscription => {
      subscription(playerInput)
    })
  }
}
