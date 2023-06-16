const ClientReplayEngine = require('./client-replay-engine')
const GameStateMutator = require('../shared/game-state-mutator')
const GameState = require('../shared/models/game-state/game-state.model')
const Renderer = require('./renderer')
const LiveDiagnostics = require('./live-diagnostics')
const config = require('../shared/config.js')

module.exports = class MenuController {
  constructor() {
    this.gameKeys = null
    this.newGameSubscriptions = []
    this.joinGameSubscriptions = []
    this.exitGameSubscriptions = []

    this.clientReplayEngine = null

    // elements
    this.canvas = document.getElementById('canvas')
    this.inGameMenuDiv = document.getElementById('inGameMenu')
    this.exitGameBtn = document.getElementById('exitGameBtn')
    this.replayMenuDiv = document.getElementById('replayMenu')
    this.slider = document.getElementById('slider')
    this.rewindBtn = document.getElementById('rewind')
    this.pauseBtn = document.getElementById('pause')
    this.playBtn = document.getElementById('play')
    this.menuDiv = document.getElementById('menu')
    this.newGameBtn = document.getElementById('newGameBtn')
    this.joinGameBtn = document.getElementById('joinGameBtn')
    this.replaysDiv = document.getElementById('replays')

    // replay data
    this.replayData = []

    // bind button clicks
    this.newGameBtn.addEventListener('click', (event) => {
      this.newGameSubscriptions.forEach(sub => {
        sub()
      })
    })

    this.joinGameBtn.addEventListener('click', (event) => {
      this.joinGameSubscriptions.forEach(sub => {
        sub(this.gameKeys[0])
      })
    })

    this.exitGameBtn.addEventListener('click', (event) => {
      this.exitGameSubscriptions.forEach(sub => {
        sub()
      })
    })

    this.playBtn.addEventListener('click', () => {
      this.clientReplayEngine.play()
    })

    this.pauseBtn.addEventListener('click', () => {
      this.clientReplayEngine.pause()
    })

    this.rewindBtn.addEventListener('click', () => {
      this.clientReplayEngine.rewind()
    })

    // show menu on page load
    this.refreshMenu()
    this.showMenu()
    this.hideCanvas()
    this.hideInGameMenu()
    this.hideReplayMenu()
  }

  subscribe(buttonName, sub) {
    if (buttonName === 'newGame') {
      this.newGameSubscriptions.push(sub)
    }
    if (buttonName === 'joinGame') {
      this.joinGameSubscriptions.push(sub)
    }
    if (buttonName === 'exitGame') {
      this.exitGameSubscriptions.push(sub)
    }
  }

  showMenu() {
    this.menuDiv.style.display = 'unset'
  }

  hideMenu() {
    this.menuDiv.style.display = 'none'
  }

  refreshMenu(gameKeys = null) {
    this.gameKeys = gameKeys
    this.joinGameBtn.style.display = 'none'
    this.newGameBtn.style.display = 'none'

    if (this.gameKeys !== null) {
      if (this.gameKeys.length){
        this.joinGameBtn.style.display = 'unset'
      }
      else {
        this.newGameBtn.style.display = 'unset'
      }
    }
  }

  refreshReplays() {
    this.replaysDiv.innerHTML = ""
    for (let i = 0; i < this.replayData.length; i++) {
      const mutationStore = this.replayData[i]
      const button = document.createElement('button')
      button.innerHTML = `Watch replay ${i}`
      this.replaysDiv.appendChild(button)
      button.addEventListener('click', () => {
        const gameState = new GameState({
          gameHeight: config.gameHeight,
          gameWidth: config.gameWidth
        })
        const gameStateMutator = new GameStateMutator({ gameState, mutationStore })
        const renderer = new Renderer(document.getElementById('canvas'), new LiveDiagnostics())
        this.clientReplayEngine = new ClientReplayEngine( { gameStateMutator, renderer })

        // TODO: configure slider. somewhere else bind change events?

        this.hideMenu()
        this.hideInGameMenu()
        this.showCanvas()
        this.showReplayMenu()
      })
    }
  }

  showCanvas() {
    this.canvas.style.display = 'unset'
  }

  hideCanvas() {
    this.canvas.style.display = 'none'
  }

  showInGameMenu() {
    this.inGameMenuDiv.style.display = 'unset'
  }

  hideInGameMenu() {
    this.inGameMenuDiv.style.display = 'none'
  }

  showReplayMenu() {
    this.replayMenuDiv.style.display = 'unset'
  }

  hideReplayMenu() {
    this.replayMenuDiv.style.display = 'none'
  }
}
