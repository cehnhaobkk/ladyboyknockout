/** Minimum distance + hit pushback with corner transfer */

const MIN_DISTANCE = 50
const PUSHBACK = { light: 20, heavy: 40, super: 80 }

export class PushbackSystem {
  constructor() {
    this.playerPush = 0
    this.enemyPush = 0
  }

  reset() {
    this.playerPush = 0
    this.enemyPush = 0
  }

  getPushAmount(hitType, isSuper = false) {
    if (isSuper) return PUSHBACK.super
    if (hitType === 'heavy') return PUSHBACK.heavy
    return PUSHBACK.light
  }

  applyHitPushback(fightState, attackerSide, hitType, isSuper = false) {
    const amount = this.getPushAmount(hitType, isSuper)
    const dir = attackerSide === 'player' ? 1 : -1
    const defenderSide = attackerSide === 'player' ? 'enemy' : 'player'

    if (defenderSide === 'enemy') {
      this.enemyPush += dir * amount
    } else {
      this.playerPush -= dir * amount
    }
  }

  enforceMinDistance(fightState, playerW, enemyW) {
    const pc = fightState.px + playerW / 2
    const ec = fightState.ex + enemyW / 2
    const dist = Math.abs(pc - ec)
    const minDist = MIN_DISTANCE + (playerW + enemyW) / 2 * 0.3

    if (dist < minDist && dist > 0) {
      const overlap = (minDist - dist) / 2
      const sign = pc < ec ? -1 : 1
      fightState.px += sign * overlap
      fightState.ex -= sign * overlap
    }
  }

  tick(fightState, playerW, enemyW, dt) {
    const lerp = 0.25 * (dt / 16)
    const arenaW = fightState.arenaW

    if (Math.abs(this.playerPush) > 0.5) {
      const move = this.playerPush * lerp
      const newPx = fightState.px + move
      const minX = 8
      const maxX = arenaW - playerW - 8

      if (newPx < minX || newPx > maxX) {
        this.enemyPush -= move
        fightState.px = Math.max(minX, Math.min(maxX, fightState.px))
      } else {
        fightState.px = newPx
      }
      this.playerPush *= 0.7
      if (Math.abs(this.playerPush) < 0.5) this.playerPush = 0
    }

    if (Math.abs(this.enemyPush) > 0.5) {
      const move = this.enemyPush * lerp
      const newEx = fightState.ex + move
      const minX = 8
      const maxX = arenaW - enemyW - 8

      if (newEx < minX || newEx > maxX) {
        this.playerPush -= move
        fightState.ex = Math.max(minX, Math.min(maxX, fightState.ex))
      } else {
        fightState.ex = newEx
      }
      this.enemyPush *= 0.7
      if (Math.abs(this.enemyPush) < 0.5) this.enemyPush = 0
    }

    fightState.px = Math.max(8, Math.min(arenaW - playerW - 8, fightState.px))
    fightState.ex = Math.max(8, Math.min(arenaW - enemyW - 8, fightState.ex))

    this.enforceMinDistance(fightState, playerW, enemyW)
  }
}

export function classifyHitType(attackType, isSpecial) {
  if (isSpecial) return 'heavy'
  if (attackType === 'kick' || attackType === 'flykick' || attackType === 'special') return 'heavy'
  return 'light'
}
