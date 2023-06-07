const VectorUtil = require('../../util/geometry/vector-util')
const PointUtil = require('../../util/geometry/point-util')
const Rectangle = require('./rectangle.model')
const RegionUtil = require('../../util/geometry/region-util')

module.exports = class Player {
  constructor({
    id,
    color,
    width,
    position,
    moveSpeed,
    vector,
  } = {}) {
    this.id = id
    this.color = color
    this.width = width
    this.position = position
    this.moveSpeed = moveSpeed
    this.vector = vector
  }

  mutate(gameState) {
    if (VectorUtil.calculateMagnitude(this.vector)) {
      const noCollisionTargetPosition = PointUtil.translate(this.position, this.vector)
      const noCollisionTargetRect = RegionUtil.calcSquareAtPoint(noCollisionTargetPosition, this.width / 2)

      const { gameHeight: gh, gameWidth: gw } = gameState
      const obstacleRects = [
        new Rectangle({ minX: 0, minY: 0, maxX: gw, maxY: 0 }), // bottom
        new Rectangle({ minX: 0, minY: 0, maxX: 0, maxY: gh }), // left
        new Rectangle({ minX: 0, minY: gh, maxX: gw, maxY: gh }), // top
        new Rectangle({ minX: gw, minY: 0, maxX: gw, maxY: gh }), // left
        // other players' occupied rects
        ...(gameState.players.filter(player => player.id !== this.id)
          .map(player => RegionUtil.calcSquareAtPoint(player.position, player.width / 2)))
      ]

      let correctedPosition = noCollisionTargetPosition
      let correctedTargetRect = noCollisionTargetRect
      const correctionVector = VectorUtil.invertAndNormalize(this.vector)
      for (let obstacleRect of obstacleRects) {
        while(RegionUtil.doRectanglesOverlap(correctedTargetRect, obstacleRect)) {
          correctedPosition = PointUtil.translate(correctedPosition, correctionVector)
          correctedTargetRect = RegionUtil.calcSquareAtPoint(correctedPosition, this.width / 2)
        }
      }

      this.position = correctedPosition;
    }
  }

  revert(gameState) {
    const noCollisionTargetPosition = PointUtil.translate(this.position, VectorUtil.invert(this.vector))
    this.position = noCollisionTargetPosition;
  }

}
