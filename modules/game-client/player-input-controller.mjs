import { Logger} from "../shared/util/logger.mjs";

export class PlayerInputController {
    constructor() {
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
                this.publish(`move_${direction}`)
                // Logger.debug(this.pks);
            }
        }
        document.onkeyup = (event) => {
            const direction = this.keyToDirectionMap[event.key]
            if (direction) {
                this.pks = this.pks.filter(dir => dir !== direction)
                this.publish(`move_${this.pks.at(-1)}`)
                // Logger.debug(this.pks);
            }
        }
    }

    registerSubscription(subscription) {
        this.subscriptions.push(subscription)
    }

    publish(playerInput) {
        this.subscriptions.forEach(subscription => {
            subscription(playerInput)
        })
    }
}
