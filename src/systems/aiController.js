/** AI state machine with 3 difficulty levels */

export const AI_STATE = {
  IDLE: 'IDLE',
  APPROACH: 'APPROACH',
  ATTACK: 'ATTACK',
  DEFEND: 'DEFEND',
  PUNISH: 'PUNISH',
  RETREAT: 'RETREAT',
}

const DIFFICULTY = {
  easy: {
    blockChance: 0.3,
    punishChance: 0.1,
    useSuper: false,
    tauntChance: 0.02,
    wrongDirectionChance: 0.15,
    attackRange: 150,
    preferredDist: 120,
  },
  medium: {
    blockChance: 0.55,
    punishChance: 0.45,
    useSuper: true,
    tauntChance: 0.005,
    wrongDirectionChance: 0,
    attackRange: 160,
    preferredDist: 130,
  },
  hard: {
    blockChance: 0.8,
    punishChance: 0.9,
    useSuper: true,
    tauntChance: 0.03,
    wrongDirectionChance: 0,
    attackRange: 170,
    preferredDist: 90,
  },
}

export class AiController {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty
    this.state = AI_STATE.IDLE
    this.nextThink = 0
    this.nextAttack = 0
    this.blocking = false
    this.patternMemory = []
    this.lastPlayerAttack = null
  }

  setDifficulty(level) {
    this.difficulty = DIFFICULTY[level] ? level : 'medium'
  }

  getConfig() {
    return DIFFICULTY[this.difficulty] || DIFFICULTY.medium
  }

  reset() {
    this.state = AI_STATE.IDLE
    this.nextThink = 0
    this.nextAttack = 0
    this.blocking = false
    this.patternMemory = []
    this.lastPlayerAttack = null
  }

  recordPlayerAttack(attackType) {
    this.patternMemory.push(attackType)
    if (this.patternMemory.length > 8) this.patternMemory.shift()
    this.lastPlayerAttack = { type: attackType, time: performance.now() }
  }

  /** @returns {{ action: string, attack?: string, block?: boolean, taunt?: boolean, super?: boolean }} */
  think(now, ctx) {
    const cfg = this.getConfig()
    const {
      dist,
      enemyHpRatio,
      playerAttacking,
      playerInRecovery,
      playerWhiffed,
      rageFull,
      cornered,
      onGround,
      attackLock,
    } = ctx

    if (attackLock > now) return { action: 'wait' }

    // Super when full (medium/hard)
    if (cfg.useSuper && rageFull && dist < cfg.attackRange + 40) {
      return { action: 'super' }
    }

    // Random taunt bait (easy/hard)
    if (onGround && Math.random() < cfg.tauntChance) {
      return { action: 'taunt' }
    }

    // Block incoming
    if (playerAttacking && Math.random() < cfg.blockChance && onGround) {
      this.blocking = true
      this.state = AI_STATE.DEFEND
      return { action: 'block', block: true }
    }
    this.blocking = false

    // Punish whiffs / recovery
    if ((playerWhiffed || playerInRecovery) && Math.random() < cfg.punishChance && dist < cfg.attackRange) {
      this.state = AI_STATE.PUNISH
      const attacks = ['PUNCH', 'KICK', 'SPECIAL']
      const pick = this._predictCounter(attacks)
      return { action: 'attack', attack: pick, punish: true }
    }

    // Corner trap (hard)
    if (cornered && this.difficulty === 'hard' && dist < cfg.attackRange) {
      this.state = AI_STATE.ATTACK
      return { action: 'attack', attack: Math.random() < 0.5 ? 'KICK' : 'PUNCH' }
    }

    // Approach / attack by distance
    if (dist > cfg.preferredDist + 30) {
      this.state = AI_STATE.APPROACH
      const wrongDir = Math.random() < cfg.wrongDirectionChance
      return { action: 'move', direction: wrongDir ? -1 : 1 }
    }

    if (dist < 70 && Math.random() < 0.25) {
      this.state = AI_STATE.RETREAT
      return { action: 'move', direction: -1 }
    }

    if (dist < cfg.attackRange && now >= this.nextAttack) {
      this.state = AI_STATE.ATTACK
      this.nextAttack = now + 400 + Math.random() * 600
      const r = Math.random()
      if (r < 0.35) return { action: 'attack', attack: 'PUNCH' }
      if (r < 0.65) return { action: 'attack', attack: 'KICK' }
      if (r < 0.85) return { action: 'attack', attack: 'FLYKICK' }
      return { action: 'attack', attack: 'SPECIAL' }
    }

    this.state = AI_STATE.IDLE
    if (dist > cfg.preferredDist) {
      return { action: 'move', direction: 1 }
    }
    return { action: 'idle' }
  }

  _predictCounter(attacks) {
    if (this.difficulty !== 'hard' || this.patternMemory.length < 3) {
      return attacks[Math.floor(Math.random() * attacks.length)]
    }
    const last = this.patternMemory[this.patternMemory.length - 1]
    if (last === 'punch') return 'KICK'
    if (last === 'kick') return 'PUNCH'
    return 'SPECIAL'
  }
}

export { DIFFICULTY }
