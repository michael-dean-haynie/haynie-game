const Vector = require('../../models/game-state/vector.model')

module.exports = class VectorUtil {
  static invert(sourceVector) {
    return new Vector({
      x: sourceVector.x * -1,
      y: sourceVector.y * -1
    })
  }

  static calculateMagnitude(vector) {
    return Math.sqrt((vector.x ** 2) + (vector.y ** 2))
  }

  // invert but with a small magnitude for step-wise collision correction
  static invertAndNormalize(sourceVector) {
    const invVector = VectorUtil.invert(sourceVector)
    const magnitude = VectorUtil.calculateMagnitude(invVector)
    invVector.x = invVector.x / magnitude
    invVector.y = invVector.y / magnitude
    return invVector
  }

  static add(vectorA, vectorB) {
    return new Vector({
      x: vectorA.x + vectorB.x,
      y: vectorA.y + vectorB.y
    })
  }
}
