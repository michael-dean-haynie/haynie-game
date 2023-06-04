module.exports = class LiveDiagnostics {
  constructor () {
    this.fps = 0 // frames per second ('frame' being a single render of canvas)
    this.frames = 0 // total frames rendered
    this.tps = 0 // ticks per second ('tick' being a single game loop with potential state changes)
    this.ticks = 0 // total ticks executed
    this.aps = 0 // actions per second ('action' being a player input received by the game-server)
    this.ups = 0 // updates per second ('update' being a socket message received from the game-server)
    this.ping = 0 // round-trip duration in ms (client -> server -> client)
  }
}
