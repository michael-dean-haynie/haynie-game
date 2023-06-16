function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min) // The maximum is inclusive and the minimum is inclusive
}

function getRandomColor() {
  return '#' + ['r', 'g', 'b'].map(_ => getRandomIntInclusive(50, 200).toString(16)).join('')
}

// (inclusive)
function isBetween (min, val, max) {
  return val >= min && val <= max
}

// crude copy by serializeing/deserializing (breaking obj references so game state mutations don't bleed)
function cp(obj) {
  return JSON.parse(JSON.stringify(obj))
}


module.exports = {
  getRandomColor,
  getRandomIntInclusive,
  isBetween,
  cp
}
