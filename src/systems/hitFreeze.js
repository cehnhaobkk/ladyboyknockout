/** Frame-based hit freeze and screen shake */

export const SHAKE_PRESETS = {
  light: { intensity: 3, frames: 3 },
  heavy: { intensity: 6, frames: 5 },
  super: { intensity: 12, frames: 8 },
  ko: { intensity: 15, frames: 12 },
}

export const FREEZE_PRESETS = {
  hit: () => 3 + Math.floor(Math.random() * 3),
  super: 8,
  ko: 12,
}

export class HitFreeze {
  constructor() {
    this.freezeFramesLeft = 0
    this.shake = {
      framesLeft: 0,
      intensity: 0,
      offsetX: 0,
      offsetY: 0,
    }
  }

  reset() {
    this.freezeFramesLeft = 0
    this.shake = { framesLeft: 0, intensity: 0, offsetX: 0, offsetY: 0 }
  }

  requestFreeze(frames) {
    this.freezeFramesLeft = Math.max(this.freezeFramesLeft, frames)
  }

  requestShake(preset = 'light') {
    const p = SHAKE_PRESETS[preset] || SHAKE_PRESETS.light
    if (p.frames > this.shake.framesLeft) {
      this.shake.framesLeft = p.frames
      this.shake.intensity = p.intensity
    }
  }

  /** Returns true if this frame should skip game logic (freeze active). */
  shouldSkipFrame() {
    if (this.freezeFramesLeft > 0) {
      this.freezeFramesLeft -= 1
      this._tickShake()
      return true
    }
    this._tickShake()
    return false
  }

  _tickShake() {
    if (this.shake.framesLeft > 0) {
      const i = this.shake.intensity
      this.shake.offsetX = (Math.random() * 2 - 1) * i
      this.shake.offsetY = (Math.random() * 2 - 1) * i
      this.shake.framesLeft -= 1
    } else {
      this.shake.offsetX = 0
      this.shake.offsetY = 0
    }
  }

  getShakeOffset() {
    return { x: this.shake.offsetX, y: this.shake.offsetY }
  }

  onHit({ hitType = 'light', isKO = false, isSuper = false } = {}) {
    if (isKO) {
      this.requestFreeze(FREEZE_PRESETS.ko)
      this.requestShake('ko')
    } else if (isSuper) {
      this.requestFreeze(FREEZE_PRESETS.super)
      this.requestShake('super')
    } else if (hitType === 'heavy') {
      this.requestFreeze(FREEZE_PRESETS.hit())
      this.requestShake('heavy')
    } else {
      this.requestFreeze(FREEZE_PRESETS.hit())
      this.requestShake('light')
    }
  }

  onBlock() {
    this.requestFreeze(2)
    this.requestShake('light')
  }
}
