import { config } from "./config.mjs"

export class GameStateEngine {
    constructor() {
        this.gameHeight = config.gameHeight
        this.gameWidth = config.gameHeight
        this.subscriptions = []
        this.inputQueue = []
        this.gameState = {
            players: []
        }
    }

    update(delta) {
        while(this.inputQueue.length) {
            const input = this.inputQueue.shift()
            const player = this.gameState.players.find(player => player.id === input.playerId)
            if (input.type === 'move') {
                player.direction = input.value
            }
        }
        this.gameState.players.forEach(player => {
            this.updatePlayer(player, delta)
        });
        this.publish()
    }

    updatePlayer(player, delta) {
        if (['up', 'right', 'down', 'left'].includes(player.direction)) {
            const dist = (player.speed.distance * delta) / player.speed.time
            switch(player.direction) {
                case 'up':
                    player.y += dist
                    break;
                case 'right':
                    player.x += dist
                    break;
                case 'down':
                    player.y -= dist
                    break;
                case 'left':
                    player.x -= dist
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

    addPlayer(playerId) {
        const width = 50
        this.gameState.players.push({
            id: playerId,
            color: this.getRandomColor(),
            width,
            x: this.getRandomIntInclusive(width, this.gameWidth - width),
            y: this.getRandomIntInclusive(width, this.gameHeight - width),
            speed: {
                distance: 500,
                time: 1000
            },
            direction: 'none'
        })
    }

    removePlayer(playerId) {
        this.gameState.players = this.gameState.players.filter(player => player.id !== playerId)
    }

    getRandomColor(){
        return '#' + ['r', 'g', 'b'].map(_ => this.getRandomIntInclusive(50, 200).toString(16)).join('')
    }

    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
    }


}
