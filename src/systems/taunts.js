/** Character taunts — high risk, high reward */

export const TAUNT_DURATION = 1200
export const TAUNT_VULNERABILITY_MULT = 1.5

export const CHARACTER_TAUNTS = {
  nong_nut: { label: 'hair flip + wink', anim: 'winBounce 0.6s ease-in-out infinite' },
  dave: { label: 'beer swig', anim: 'daveBob 0.8s ease-in-out infinite' },
  kyle: { label: 'phone check', anim: 'kyleBob 0.7s ease-in-out infinite' },
  xiaoming: { label: 'cap adjust', anim: 'walkBob 0.5s ease-in-out infinite' },
  rajesh: { label: 'namaste bow', anim: 'rajeshBob 1s ease-in-out infinite' },
  dmitri: { label: 'flex', anim: 'dmitriBob 0.6s ease-in-out infinite' },
}

export class TauntSystem {
  constructor() {
    this.playerTaunting = false
    this.enemyTaunting = false
    this.playerTauntUntil = 0
    this.enemyTauntUntil = 0
    this.playerTauntCompleted = false
    this.enemyTauntCompleted = false
  }

  reset() {
    this.playerTaunting = false
    this.enemyTaunting = false
    this.playerTauntUntil = 0
    this.enemyTauntUntil = 0
    this.playerTauntCompleted = false
    this.enemyTauntCompleted = false
  }

  isTaunting(side) {
    return side === 'player' ? this.playerTaunting : this.enemyTaunting
  }

  canTaunt(side, now, attackLock) {
    if (attackLock > now) return false
    return !this.isTaunting(side)
  }

  startTaunt(side, now) {
    if (side === 'player') {
      this.playerTaunting = true
      this.playerTauntUntil = now + TAUNT_DURATION
      this.playerTauntCompleted = false
    } else {
      this.enemyTaunting = true
      this.enemyTauntUntil = now + TAUNT_DURATION
      this.enemyTauntCompleted = false
    }
    return true
  }

  tick(now) {
    if (this.playerTaunting && now >= this.playerTauntUntil) {
      this.playerTaunting = false
      this.playerTauntCompleted = true
    }
    if (this.enemyTaunting && now >= this.enemyTauntUntil) {
      this.enemyTaunting = false
      this.enemyTauntCompleted = true
    }
  }

  /** Returns side if taunt completed without being hit */
  consumeCompletedTaunt() {
    if (this.playerTauntCompleted) {
      this.playerTauntCompleted = false
      return 'player'
    }
    if (this.enemyTauntCompleted) {
      this.enemyTauntCompleted = false
      return 'enemy'
    }
    return null
  }

  interrupt(side) {
    if (side === 'player') {
      this.playerTaunting = false
      this.playerTauntCompleted = false
    } else {
      this.enemyTaunting = false
      this.enemyTauntCompleted = false
    }
  }

  getDamageMultiplier(defenderSide) {
    if (this.isTaunting(defenderSide)) return TAUNT_VULNERABILITY_MULT
    return 1
  }
}
