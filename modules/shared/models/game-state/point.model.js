module.exports = class Point {
  constructor({
    x,
    y
  } = {}) {
    this.x = x
    this.y = y
  }

  asTranslated(vector) {
    return new Point({
      x: this.x + vector.x,
      y: this.y + vector.y,
    })
  }
}
