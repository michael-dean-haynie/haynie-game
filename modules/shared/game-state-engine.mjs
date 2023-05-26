import { Logger } from "./util/logger.mjs";

export class GameStateEngine {
    constructor() {
        this.subscriptions = []
        this.inputQueue = []
        this.gameState = {
            units: [
                {
                    id: 'Michael',
                    x: 50,
                    y: 50,
                    speed: {
                        distance: 1000,
                        time: 1000
                    },
                    direction: 'none'
                }
            ]
        }
    }

    update(delta) {
        while(this.inputQueue.length) {
            const input = this.inputQueue.shift()
            if (input === 'move_up'){
                this.gameState.units[0].direction = 'up'
            }
            if (input === 'move_right'){
                this.gameState.units[0].direction = 'right'
            }
            if (input === 'move_down'){
                this.gameState.units[0].direction = 'down'
            }
            if (input === 'move_left'){
                this.gameState.units[0].direction = 'left'
            }
            if (input === 'move_none'){
                this.gameState.units[0].direction = 'none'
            }
        }
        this.gameState.units.forEach(unit => {
            unit = this.updateUnit(unit, delta)
        });
        this.publish()
    }

    updateUnit(unit, delta) {
        if (['up', 'right', 'down', 'left'].includes(unit.direction)) {
            const dist = (unit.speed.distance * delta) / unit.speed.time
            switch(unit.direction) {
                case 'up':
                    unit.y += dist
                    break;
                case 'right':
                    unit.x += dist
                    break;
                case 'down':
                    unit.y -= dist
                    break;
                case 'left':
                    unit.x -= dist
                    break;
            }
        }
    }

    registerSubscription(subscription) {
        this.subscriptions.push(subscription)
    }

    publish() {
        this.subscriptions.forEach(subscription => {
            subscription(this.gameState)
        })
    }


}
