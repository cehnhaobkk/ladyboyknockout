/** Knockdown — 3 consecutive hits or heavy at low HP */

const CONSECUTIVE_HIT_THRESHOLD = 5
const LOW_HP_RATIO = 0.2
const KNOCKDOWN_DURATION_MS = 2000
const WAKEUP_INVULN_FRAMES = 20
const FRAME_MS = 1000 / 60

export class KnockdownSystem {
  constructor() {
    this.playerConsecutive = 0
    this.enemyConsecutive = 0
    this.playerDown = null
    this.enemyDown = null
    this.wakeupInvuln = { player: 0, enemy: 0 }
    this.mashCount = { player: 0, enemy: 0 }
  }

  reset() {
    this.playerConsecutive = 0
    this.enemyConsecutive = 0
    this.playerDown = null
    this.enemyDown = null
    this.wakeupInvuln = { player: 0, enemy: 0 }
    this.mashCount = { player: 0, enemy: 0 }
  }

  resetRound() {
    this.playerConsecutive = 0
    this.enemyConsecutive = 0
    this.playerDown = null
    this.enemyDown = null
    this.mashCount = { player: 0, enemy: 0 }
  }

  isDown(side) {
    return side === 'player' ? Boolean(this.playerDown) : Boolean(this.enemyDown)
  }

  isInvulnerable(side) {
    return this.wakeupInvuln[side] > 0
  }

  tick(now) {
    for (const side of ['player', 'enemy']) {
      if (this.wakeupInvuln[side] > 0) this.wakeupInvuln[side] -= 1
    }

    if (this.playerDown && now >= this.playerDown.getUpAt) {
      this._rise('player', now)
    }
    if (this.enemyDown && now >= this.enemyDown.getUpAt) {
      this._rise('enemy', now)
    }
  }

  _rise(side, now) {
    if (side === 'player') this.playerDown = null
    else this.enemyDown = null
    this.wakeupInvuln[side] = WAKEUP_INVULN_FRAMES
    this.mashCount[side] = 0
    void now
  }

  onHit() {
    return { knockedDown: false }
  }

  onBlock(defender) {
    if (defender === 'enemy') this.playerConsecutive = 0
    else this.enemyConsecutive = 0
  }

  onAttackerHit(attacker) {
    if (attacker === 'player') this.playerConsecutive = 0
    else this.enemyConsecutive = 0
  }

  triggerKnockdown(side, now) {
    const mashReduction = Math.min(800, this.mashCount[side] * 40)
    const down = {
      start: now,
      getUpAt: now + KNOCKDOWN_DURATION_MS - mashReduction,
    }
    if (side === 'player') this.playerDown = down
    else this.enemyDown = down
  }

  registerMash(side) {
    if (!this.isDown(side)) return
    this.mashCount[side] += 1
    const down = side === 'player' ? this.playerDown : this.enemyDown
    if (down) {
      down.getUpAt -= 50
      const minTime = down.start + 600
      if (down.getUpAt < minTime) down.getUpAt = minTime
    }
  }

  canAttackDownedOpponent(attackerSide) {
    const defender = attackerSide === 'player' ? 'enemy' : 'player'
    return !this.isDown(defender)
  }
}

export { WAKEUP_INVULN_FRAMES, KNOCKDOWN_DURATION_MS }
