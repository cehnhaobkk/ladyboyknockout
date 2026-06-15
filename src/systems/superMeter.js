/** Rage / super meter — fills on damage taken + passive gain */

const PASSIVE_FILL_PER_FRAME = 0.008
const DAMAGE_FILL_RATIO = 0.35
const KNOCKDOWN_BONUS = 15
const TAUNT_BONUS = 25
const SUPER_DAMAGE_RATIO = 0.4

export class SuperMeter {
  constructor() {
    this.playerMeter = 0
    this.enemyMeter = 0
    this.superActive = null
    this.timeScale = 1
    this.timeScaleUntil = 0
    this.flashWhite = 0
    this.stats = { playerSupers: 0, enemySupers: 0 }
  }

  reset() {
    this.playerMeter = 0
    this.enemyMeter = 0
    this.superActive = null
    this.timeScale = 1
    this.timeScaleUntil = 0
    this.flashWhite = 0
  }

  resetRound() {
    // Meters persist across rounds per spec (fills during fight)
  }

  getMeter(side) {
    return side === 'player' ? this.playerMeter : this.enemyMeter
  }

  isFull(side) {
    return this.getMeter(side) >= 100
  }

  tick(now) {
    this.playerMeter = Math.min(100, this.playerMeter + PASSIVE_FILL_PER_FRAME)
    this.enemyMeter = Math.min(100, this.enemyMeter + PASSIVE_FILL_PER_FRAME)

    if (this.timeScaleUntil > 0 && now >= this.timeScaleUntil) {
      this.timeScale = 1
      this.timeScaleUntil = 0
    }
    if (this.flashWhite > 0) this.flashWhite -= 1
  }

  onDamageTaken(defenderSide, damage, maxHp) {
    const fill = (damage / maxHp) * 100 * DAMAGE_FILL_RATIO
    if (defenderSide === 'player') {
      this.playerMeter = Math.min(100, this.playerMeter + fill)
    } else {
      this.enemyMeter = Math.min(100, this.enemyMeter + fill)
    }
  }

  onKnockdown(defenderSide) {
    if (defenderSide === 'player') {
      this.playerMeter = Math.min(100, this.playerMeter + KNOCKDOWN_BONUS)
    } else {
      this.enemyMeter = Math.min(100, this.enemyMeter + KNOCKDOWN_BONUS)
    }
  }

  onTauntComplete(side) {
    if (side === 'player') {
      this.playerMeter = Math.min(100, this.playerMeter + TAUNT_BONUS)
    } else {
      this.enemyMeter = Math.min(100, this.enemyMeter + TAUNT_BONUS)
    }
  }

  canActivate(side) {
    return this.isFull(side) && !this.superActive
  }

  /** @returns {{ activated: boolean, damage: number }} */
  tryActivate(side, maxHp, now) {
    if (!this.canActivate(side)) return { activated: false, damage: 0 }
    if (side === 'player') {
      this.playerMeter = 0
      this.stats.playerSupers += 1
    } else {
      this.enemyMeter = 0
      this.stats.enemySupers += 1
    }
    this.superActive = { side, start: now, phase: 'dash' }
    this.flashWhite = 1
    this.timeScale = 0.3
    this.timeScaleUntil = now + 1000
    return { activated: true, damage: maxHp * SUPER_DAMAGE_RATIO }
  }

  getSuperDamage(maxHp) {
    return maxHp * SUPER_DAMAGE_RATIO
  }

  clearSuper() {
    this.superActive = null
  }

  getTimeScale(now) {
    if (this.timeScaleUntil > 0 && now < this.timeScaleUntil) return this.timeScale
    return 1
  }
}
