const MoveInput = require('../shared/models/player-input/move-input.model')
module.exports = class PlayerInputController {
  constructor () {
    this.subscriptions = []

    this.keyToDirectionMap = {
      ArrowUp: 'up',
      ArrowRight: 'right',
      ArrowDown: 'down',
      ArrowLeft: 'left'
    }
    this.pks = ['none'] // pressed key stack

    document.onkeydown = (event) => {
      const direction = this.keyToDirectionMap[event.key]
      if (direction && !this.pks.includes(direction)) {
        this.pks.push(direction)
        const input = new MoveInput({ direction })
        this.publish(input)
      }
    }
    document.onkeyup = (event) => {
      const direction = this.keyToDirectionMap[event.key]
      if (direction) {
        this.pks = this.pks.filter(dir => dir !== direction)
        const dir = this.pks.at(-1)
        const input = new MoveInput({ direction: dir })
        this.publish(input)
      }
    }
  }

  registerSubscription (subscription) {
    this.subscriptions.push(subscription)
  }

  publish (playerInput) {
    this.subscriptions.forEach(subscription => {
      subscription(playerInput)
    })
  }
}
