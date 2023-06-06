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
    const noCollisionTargetPosition = this.position.asTranslated(this.vector)
    this.position = noCollisionTargetPosition;
  }

  revert(gameState) {
    const noCollisionTargetPosition = this.position.asTranslated(this.vector.invert())
    this.position = noCollisionTargetPosition;
  }

}
