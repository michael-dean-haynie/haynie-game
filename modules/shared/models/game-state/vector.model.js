module.exports = class Vector {
  constructor({
    x,
    y
  } = {}) {
    this.x = x
    this.y = y
  }

  // return new copy
  invert() {
    return new Vector({
      x: this.x * -1,
      y: this.y * -1
    })
  }

  // returns new copy
  add(vector) {
    return new Vector({
      x: this.x + vector.x,
      y: this.y + vector.y
    })
  }
}
