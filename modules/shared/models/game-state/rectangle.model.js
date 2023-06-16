module.exports = class Rectangle {
  constructor({
    minX,
    minY,
    maxX,
    maxY,
  } = {}) {
    this.minX = minX
    this.minY = minY
    this.maxX = maxX
    this.maxY = maxY
  }
}
