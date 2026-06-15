/** Combo tracking with damage scaling and announcements */

const COMBO_WINDOW_MS = 1500

export function getComboDamageMultiplier(hits) {
  if (hits <= 3) return 1
  if (hits <= 6) return 0.85
  if (hits <= 10) return 0.7
  return 0.55
}

const MILESTONES = [
  { hits: 15, text: 'UNSTOPPABLE!', color: '#ff00ff', flash: true },
  { hits: 10, text: 'SAVAGE!', color: '#ff0044', flash: true },
  { hits: 7, text: 'BRUTAL!', color: '#ff2200' },
  { hits: 5, text: 'NICE!', color: '#ff8800' },
  { hits: 3, text: 'COMBO!', color: '#ffdd00' },
]

export class ComboCounter {
  constructor() {
    this.playerCombo = 0
    this.enemyCombo = 0
    this.lastHitOnEnemy = 0
    this.lastHitOnPlayer = 0
    this.display = null
    this.displayUntil = 0
    this.longestCombo = 0
    this.lastMilestone = 0
  }

  reset() {
    this.playerCombo = 0
    this.enemyCombo = 0
    this.lastHitOnEnemy = 0
    this.lastHitOnPlayer = 0
    this.display = null
    this.displayUntil = 0
    this.lastMilestone = 0
  }

  resetRound() {
    this.playerCombo = 0
    this.enemyCombo = 0
    this.lastHitOnEnemy = 0
    this.lastHitOnPlayer = 0
    this.display = null
    this.displayUntil = 0
    this.lastMilestone = 0
  }

  /** @returns {{ combo: number, mult: number, milestone: object|null }} */
  registerHit(attackerSide, now) {
    const isPlayer = attackerSide === 'player'
    let combo
    if (isPlayer) {
      if (now - this.lastHitOnEnemy < COMBO_WINDOW_MS) this.playerCombo += 1
      else this.playerCombo = 1
      this.lastHitOnEnemy = now
      this.enemyCombo = 0
      combo = this.playerCombo
    } else {
      if (now - this.lastHitOnPlayer < COMBO_WINDOW_MS) this.enemyCombo += 1
      else this.enemyCombo = 1
      this.lastHitOnPlayer = now
      this.playerCombo = 0
      combo = this.enemyCombo
    }

    if (combo > this.longestCombo) this.longestCombo = combo

    const mult = getComboDamageMultiplier(combo)
    let milestone = null
    if (combo >= 2) {
      this.display = { combo, side: attackerSide, scale: 1 + combo * 0.04 }
      this.displayUntil = now + 1500
      for (const m of MILESTONES) {
        if (combo >= m.hits && m.hits > this.lastMilestone) {
          milestone = m
          this.lastMilestone = m.hits
          break
        }
      }
    }
    return { combo, mult, milestone }
  }

  onBlock(defenderSide, now) {
    if (defenderSide === 'player') {
      this.enemyCombo = 0
    } else {
      this.playerCombo = 0
    }
    this.lastMilestone = 0
  }

  tick(now) {
    if (this.display && now > this.displayUntil) {
      this.display = null
    }
  }

  getDisplay(now) {
    if (!this.display || now > this.displayUntil) return null
    const age = now - (this.displayUntil - 1500)
    const fade = Math.max(0, 1 - age / 1500)
    return { ...this.display, fade }
  }
}
