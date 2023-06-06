module.exports = class MoveInput {
  constructor({
    direction
  } = {}) {
    this.inputType = this.constructor.name
    this.direction = direction
  }
}
