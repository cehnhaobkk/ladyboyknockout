import { HitFreeze } from './hitFreeze.js'
import { ParticleSystem } from './particles.js'
import { ComboCounter } from './comboCounter.js'
import { SuperMeter } from './superMeter.js'
import { RoundSystem, ROUND_TIME, ROUND_PHASE } from './roundSystem.js'
import { Announcer } from './announcer.js'
import { KnockdownSystem } from './knockdown.js'
import { PushbackSystem, classifyHitType } from './pushback.js'
import { TauntSystem } from './taunts.js'
import { AiController } from './aiController.js'
import { VictoryScreen, createMatchStats } from './victoryScreen.js'

export { ROUND_TIME, ROUND_PHASE, FIGHT_START_POSITIONS } from './roundSystem.js'
export { classifyHitType } from './pushback.js'
export { createMatchStats } from './victoryScreen.js'

/** Coordinates all fight enhancement systems */
export class GameSystemsManager {
  constructor(difficulty = 'medium') {
    this.hitFreeze = new HitFreeze()
    this.particles = new ParticleSystem()
    this.combo = new ComboCounter()
    this.superMeter = new SuperMeter()
    this.rounds = new RoundSystem()
    this.announcer = new Announcer()
    this.knockdown = new KnockdownSystem()
    this.pushback = new PushbackSystem()
    this.taunts = new TauntSystem()
    this.ai = new AiController(difficulty)
    this.victory = new VictoryScreen()
  }

  setDifficulty(level) {
    this.ai.setDifficulty(level)
  }

  reset() {
    this.hitFreeze.reset()
    this.particles.reset()
    this.combo.reset()
    this.superMeter.reset()
    this.rounds.reset()
    this.announcer.reset()
    this.knockdown.reset()
    this.pushback.reset()
    this.taunts.reset()
    this.ai.reset()
    this.victory.reset()
  }

  startMatch(now, round = 1) {
    this.rounds.startMatch(now, round)
    this.announcer.onRoundIntro(round)
  }

  startRound(round, now) {
    this.combo.resetRound()
    this.knockdown.resetRound()
    this.rounds.startRoundIntro(now, round)
    this.announcer.onRoundIntro(round)
  }

  /** Process a hit event from the game loop */
  onHit(ctx) {
    const {
      attacker,
      defender,
      damage,
      attackType,
      isSpecial,
      isSuper,
      isKO,
      blocked,
      x,
      y,
      now,
      defenderMaxHp,
      defenderHp,
      defenderHpAfter,
    } = ctx

    const hitType = isSuper ? 'super' : classifyHitType(attackType, isSpecial)

    if (blocked) {
      this.hitFreeze.onBlock()
      this.particles.onHit({ x, y, blocked: true })
      this.combo.onBlock(defender, now)
      this.knockdown.onBlock(defender)
      this.announcer.onBlocked()
      return { damage: ctx.damage * 0.4, blocked: true }
    }

    const comboResult = this.combo.registerHit(attacker, now)
    const scaledDamage = damage * comboResult.mult

    this.hitFreeze.onHit({ hitType, isKO, isSuper })
    this.particles.onHit({ x, y, hitType, isSuper, isKO })
    this.pushback.applyHitPushback(ctx.fightState, attacker, hitType, isSuper)
    this.superMeter.onDamageTaken(defender, scaledDamage, defenderMaxHp)
    this.victory.trackDamage(attacker, scaledDamage)
    this.victory.trackCombo(comboResult.combo)

    const hpRatio = defenderHpAfter / defenderMaxHp
    const kd = this.knockdown.onHit({ defender, hitType, hpRatio, now })
    if (kd.knockedDown) {
      this.superMeter.onKnockdown(defender)
    }

    if (comboResult.milestone) {
      this.announcer.onComboMilestone(comboResult.milestone.text, comboResult.milestone.color)
      if (comboResult.milestone.flash) {
        this.superMeter.flashWhite = 3
      }
    }

    if (ctx.isCounter) this.announcer.onCounter()
    if (ctx.isPunish) this.announcer.onPunish()

    if (defender === 'player' || defender === 'enemy') {
      if (this.taunts.isTaunting(defender)) {
        this.taunts.interrupt(defender)
      }
    }

    return { damage: scaledDamage, combo: comboResult.combo, knockedDown: kd.knockedDown }
  }

  onBlock(ctx) {
    return this.onHit({ ...ctx, blocked: true, damage: ctx.damage })
  }

  onKO(winner) {
    this.announcer.onKO()
    this.hitFreeze.onHit({ isKO: true })
  }

  onSuperActivate(side) {
    this.announcer.onSuper()
    this.victory.trackSuper(side)
  }

  onRoundEnd(winner, reason, fightState, now) {
    if (reason === 'timeout' && !winner) {
      this.announcer.onDraw()
      fightState.php = fightState.pmax
      fightState.ehp = fightState.emax
      fightState.timeLeft = ROUND_TIME
      fightState.roundActive = false
      this.rounds.startRoundIntro(now, fightState.round)
      this.announcer.onRoundIntro(fightState.round)
      return { winner: null, isDraw: true }
    }
    const result = this.rounds.endRound(now, fightState, reason)
    if (winner) {
      this.victory.trackRoundWin(winner)
      if (this.rounds.isPerfectRound(winner)) {
        this.announcer.onPerfect()
      }
    }
    if (reason === 'timeout') {
      this.announcer.onTimeOver()
    }
    return result
  }

  onMatchEnd(winner, flawless) {
    this.victory.onMatchEnd(winner, flawless)
    const playerNum = winner === 'player' ? 1 : 2
    this.announcer.onWinner(playerNum, '')
    if (flawless) this.announcer.onFlawless()
  }

  trySuper(side, maxHp, now) {
    const result = this.superMeter.tryActivate(side, maxHp, now)
    if (result.activated) {
      this.onSuperActivate(side)
    }
    return result
  }

  tick(now, fightState, dt) {
    const timeScale = this.superMeter.getTimeScale(now)
    const scaledDt = dt * timeScale

    this.hitFreeze.tick?.()
    this.particles.tick()
    this.combo.tick(now)
    this.superMeter.tick(now)
    this.knockdown.tick(now)
    this.taunts.tick(now)
    this.announcer.tick(now)
    this.victory.tick(scaledDt, fightState.roundActive)
    this.rounds.tick(now, fightState)

    if (this.rounds.phase === ROUND_PHASE.COUNTDOWN) {
      const step = this.rounds.countdownValue
      if (this._lastCountdownStep !== step) {
        this._lastCountdownStep = step
        this.announcer.onCountdown(step)
      }
    } else {
      this._lastCountdownStep = null
    }

    const ann = this.rounds.getAnnouncerForPhase()
    if (ann && this.rounds.phaseUntil > now - 100) {
      if (ann.type === 'fight' && this.rounds.phase === ROUND_PHASE.FIGHT_ANNOUNCE) {
        if (!this._fightAnnounced) {
          this.announcer.onFight()
          this._fightAnnounced = true
        }
      }
    }
    if (this.rounds.phase === ROUND_PHASE.FIGHTING) {
      this._fightAnnounced = false
    }

    const completedTaunt = this.taunts.consumeCompletedTaunt()
    if (completedTaunt) {
      this.superMeter.onTauntComplete(completedTaunt)
    }
  }

  updateWalkback(fightState, dt) {
    this.rounds.updateWalkback(fightState, dt)
  }

  getShakeOffset() {
    return this.hitFreeze.getShakeOffset()
  }

  shouldFreezeFrame() {
    return this.hitFreeze.shouldSkipFrame()
  }

  getHudState(now) {
    return {
      combo: this.combo.getDisplay(now),
      announcer: this.announcer.getDisplay(now),
      playerRage: this.superMeter.playerMeter,
      enemyRage: this.superMeter.enemyMeter,
      playerRageReady: this.superMeter.isFull('player'),
      enemyRageReady: this.superMeter.isFull('enemy'),
      flashWhite: this.superMeter.flashWhite > 0,
      roundPhase: this.rounds.phase,
      playerDown: this.knockdown.isDown('player'),
      enemyDown: this.knockdown.isDown('enemy'),
      showGetUp: this.knockdown.isDown('player'),
      superActive: this.superMeter.superActive,
    }
  }
}
