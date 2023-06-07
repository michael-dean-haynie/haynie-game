const { isBetween } = require('../util')
const Rectangle = require('../../models/game-state/rectangle.model')

module.exports = class RegionUtil {
  static doRectanglesOverlap(rectA, rectB) {
    return ( // overlap on x-axis
      isBetween(rectB.minX, rectA.minX, rectB.maxX)
      || isBetween(rectB.minX, rectA.maxX, rectB.maxX)
      || isBetween(rectA.minX, rectB.minX, rectA.maxX)
      || isBetween(rectA.minX, rectB.maxX, rectA.maxX)
    ) && ( // overlap on y-axis
      isBetween(rectB.minY, rectA.minY, rectB.maxY)
      || isBetween(rectB.minY, rectA.maxY, rectB.maxY)
      || isBetween(rectA.minY, rectB.minY, rectA.maxY)
      || isBetween(rectA.minY, rectB.maxY, rectA.maxY)
    )
  }

  static calcSquareAtPoint(point, halfWidth) {
    return new Rectangle({
      minX: point.x - halfWidth,
      minY: point.y - halfWidth,
      maxX: point.x + halfWidth,
      maxY: point.y + halfWidth
    })
  }
}
