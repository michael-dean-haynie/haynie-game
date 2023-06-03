export class PlayerInputController {
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
        const input = {
          type: 'move',
          value: direction
        }
        this.publish(input)
      }
    }
    document.onkeyup = (event) => {
      const direction = this.keyToDirectionMap[event.key]
      if (direction) {
        this.pks = this.pks.filter(dir => dir !== direction)
        const input = {
          type: 'move',
          value: this.pks.at(-1)
        }
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
