const Point = require('../../models/game-state/point.model')

module.exports = class PointUtil {
  static translate(sourcePoint, vector) {
    return new Point({
      x: sourcePoint.x + vector.x,
      y: sourcePoint.y + vector.y,
    })
  }
}
