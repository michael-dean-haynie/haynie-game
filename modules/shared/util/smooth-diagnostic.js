// inspiration: https://stackoverflow.com/a/87333
module.exports = class SmoothDiagnostic {
  constructor (smoothingFactor, smoothingDelay) {
    this.smoothingFactor = smoothingFactor // closer to 1.0 = more smoothing
    this.smoothingDelay = smoothingDelay // first x updates will not be smoothed
    this.updates = 0
    this.smoothValue = 0
  }

  update (rawValue) {
    if (this.updates++ < this.smoothingDelay) {
      this.smoothValue = rawValue
    } else {
      this.smoothValue = (this.smoothValue * this.smoothingFactor) + (rawValue * (1.0 - this.smoothingFactor))
    }
  }
}
