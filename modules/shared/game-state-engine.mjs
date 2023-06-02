import { config } from "./config.mjs"

export class GameStateEngine {
    constructor() {
        this.gameHeight = config.gameHeight
        this.gameWidth = config.gameWidth
        this.subscriptions = []
        this.inputQueue = []
        this.gameState = {
            players: []
        }
        this.stateHasChanges = false
    }

    update(lastTickTs, currentTickTs) {
        this.stateHasChanged = false

        // timestamp to which the game state has been updated so far
        let lastUpdateTs = lastTickTs
        while(this.inputQueue.length) {
            const input = this.inputQueue.shift()
            const player = this.gameState.players.find(player => player.id === input.playerId)

            // ms between this input and the latest ts to which the game state has been updated
            const msFromLastUpdateToInput = input.timestamp - lastUpdateTs

            // update discrete game state
            if (input.type === 'move') {
                // adjust the direction the player is moving
                player.direction = input.value
                this.stateHasChanged = true
            }

            // actually advance game state
            this.advanceContinuousState(msFromLastUpdateToInput)

            // update the timestamp to which the game state has been updated so far
            lastUpdateTs = input.timestamp
        }

        // advance state for any remaining time between last input and current tick timestamp
        const msFromLastUpdateToCurrentTick = currentTickTs - lastUpdateTs
        if (msFromLastUpdateToCurrentTick > 0) {
            this.advanceContinuousState(msFromLastUpdateToCurrentTick)
        }

        // publish updates to clients
        this.publish()
    }

    advanceContinuousState(msDuration) {
        // advance all player positions
        this.gameState.players.forEach(player => {
            if (['up', 'right', 'down', 'left'].includes(player.direction)) {
                this.updatePlayer(player, msDuration)
                this.stateHasChanged = true
            }
        });
    }

    updatePlayer(player, msDuration) {
        const projectedPosition = this.projectPlayerPosition(player, msDuration)
        const correctedPosition = this.detectCollisionAndCorrectProjection(player, projectedPosition)
        player.x = correctedPosition.x
        player.y = correctedPosition.y
    }

    // calculate where player will move to if no collisions happen
    projectPlayerPosition(player, msDuration) {
        const newPosition = {
            x: player.x,
            y: player.y
        }

        if (['up', 'right', 'down', 'left'].includes(player.direction)) {
            const dist = (player.speed.distance * msDuration) / player.speed.time
            switch(player.direction) {
                case 'up':
                    newPosition.y += dist
                    break;
                case 'right':
                    newPosition.x += dist
                    break;
                case 'down':
                    newPosition.y -= dist
                    break;
                case 'left':
                    newPosition.x -= dist
                    break;
            }
        }

        return newPosition
    }

    detectCollisionAndCorrectProjection(player, projectedPosition) {
        const correctedPosition = {
            x: projectedPosition.x,
            y: projectedPosition.y
        }

        // detect collision with map bounds
        const minX = player.width / 2
        const maxX = this.gameWidth - (player.width / 2)
        const minY = player.width / 2
        const maxY = this.gameHeight - (player.width / 2)

        // correct collision
        if (projectedPosition.x < minX) {
            correctedPosition.x = minX
        }
        if (projectedPosition.x > maxX) {
            correctedPosition.x = maxX
        }
        if (projectedPosition.y < minY) {
            correctedPosition.y = minY
        }
        if (projectedPosition.y > maxY) {
            correctedPosition.y = maxY
        }

        // detect collision with other players
        const playerPathing = this.calculatePlayerPathingAtPosition(player, projectedPosition)
        const otherPlayers = this.gameState.players.filter(plyr => plyr.id !== player.id)
        for (let otherPlayer of otherPlayers) {
            const otherPlayerPosition = {
                x: otherPlayer.x,
                y: otherPlayer.y
            }
            const otherPlayerPathing = this.calculatePlayerPathingAtPosition(otherPlayer, otherPlayerPosition)
            if (this.pathingsOverlap(playerPathing, otherPlayerPathing)) {
                // correct collision
                switch(player.direction) {
                    case 'up':
                        correctedPosition.y = (otherPlayerPathing.y.min - 1) - (player.width / 2)
                        break;
                    case 'right':
                        correctedPosition.x = (otherPlayerPathing.x.min - 1) - (player.width / 2)
                        break;
                    case 'down':
                        correctedPosition.y = (otherPlayerPathing.y.max + 1) + (player.width / 2)
                        break;
                    case 'left':
                        correctedPosition.x = (otherPlayerPathing.x.max + 1) + (player.width / 2)
                        break;
                }
            }
        }

        return correctedPosition
    }

    calculatePlayerPathingAtPosition(player, position) {
        return {
            x: {
                min: position.x - (player.width / 2),
                max: position.x + (player.width / 2)
            },
            y: {
                min: position.y - (player.width / 2),
                max: position.y + (player.width / 2)
            },

        }
    }

    pathingsOverlap(pA, pB) {
        return ( // overlap on x-axis
            this.isBetween(pA.x.min, pB.x.min, pB.x.max)
            || this.isBetween(pA.x.max, pB.x.min, pB.x.max)
        )
        && ( // overlap on y-axis
            this.isBetween(pA.y.min, pB.y.min, pB.y.max)
            || this.isBetween(pA.y.max, pB.y.min, pB.y.max)
        )
    }

    // (inclusive)
    isBetween(val, min, max) {
        return val >= min && val <= max
    }


    registerSubscription(subscription) {
        this.subscriptions.push(subscription)
    }

    publish() {
        if (this.stateHasChanged) {
            this.subscriptions.forEach(subscription => {
                subscription(this.gameState)
            })
        }
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
