/** Best-of-3 round flow with announcements and walk-back */

export const ROUND_TIME = 60

export const FIGHT_START_POSITIONS = { px: 0.22, ex: 0.62 }

export const ROUND_PHASE = {
  INTRO: 'intro',
  RESULT: 'result',
  WALKBACK: 'walkback',
  COUNTDOWN: 'countdown',
  FIGHT_ANNOUNCE: 'fight_announce',
  FIGHTING: 'fighting',
}

const INTRO_DURATION = 2200
const RESULT_DURATION = 2000
const MATCH_END_DELAY = 2200
const WALKBACK_DURATION = 1500
const COUNTDOWN_STEP_DURATION = 800
const FIGHT_ANNOUNCE_DURATION = 1200

export class RoundSystem {
  constructor() {
    this.phase = ROUND_PHASE.INTRO
    this.phaseUntil = 0
    this.roundWinner = null
    this.isDraw = false
    this.roundDamagePlayer = 0
    this.roundDamageEnemy = 0
    this.walkbackProgress = 0
    this.startPositions = { ...FIGHT_START_POSITIONS }
    this.countdownValue = 0
  }

  reset() {
    this.phase = ROUND_PHASE.INTRO
    this.phaseUntil = 0
    this.roundWinner = null
    this.isDraw = false
    this.roundDamagePlayer = 0
    this.roundDamageEnemy = 0
    this.walkbackProgress = 0
    this.countdownValue = 0
  }

  startMatch(now, round = 1) {
    this.phase = ROUND_PHASE.INTRO
    this.phaseUntil = now + INTRO_DURATION
    this.round = round
    this.roundWinner = null
    this.isDraw = false
    this.roundDamagePlayer = 0
    this.roundDamageEnemy = 0
  }

  startRoundIntro(now, round) {
    this.round = round
    this.phase = ROUND_PHASE.INTRO
    this.phaseUntil = now + INTRO_DURATION
    this.roundWinner = null
    this.isDraw = false
    this.roundDamagePlayer = 0
    this.roundDamageEnemy = 0
    this.walkbackProgress = 0
    this.countdownValue = 0
  }

  isFighting() {
    return this.phase === ROUND_PHASE.FIGHTING
  }

  canProcessCombat() {
    return this.phase === ROUND_PHASE.FIGHTING
  }

  tick(now, fightState) {
    if (this.phaseUntil > 0 && now < this.phaseUntil) return

    switch (this.phase) {
      case ROUND_PHASE.INTRO:
        this.phase = ROUND_PHASE.COUNTDOWN
        this.countdownValue = 3
        this.phaseUntil = now + COUNTDOWN_STEP_DURATION
        break
      case ROUND_PHASE.COUNTDOWN:
        if (this.countdownValue > 1) {
          this.countdownValue -= 1
          this.phaseUntil = now + COUNTDOWN_STEP_DURATION
        } else {
          this.phase = ROUND_PHASE.FIGHT_ANNOUNCE
          this.countdownValue = 0
          this.phaseUntil = now + FIGHT_ANNOUNCE_DURATION
        }
        break
      case ROUND_PHASE.FIGHT_ANNOUNCE:
        this.phase = ROUND_PHASE.FIGHTING
        this.phaseUntil = 0
        fightState.roundActive = true
        break
      case ROUND_PHASE.RESULT:
        if (fightState.matchOver) break
        this.phase = ROUND_PHASE.WALKBACK
        this.phaseUntil = now + WALKBACK_DURATION
        this.walkbackProgress = 0
        fightState.php = fightState.pmax
        fightState.ehp = fightState.emax
        fightState.timeLeft = ROUND_TIME
        fightState.roundDamageTakenPlayer = 0
        fightState.roundDamageTakenEnemy = 0
        break
      case ROUND_PHASE.WALKBACK:
        if (!fightState.matchOver) {
          this.startRoundIntro(now, fightState.round + 1)
          fightState.round += 1
        }
        break
      default:
        break
    }
  }

  /** @returns {{ winner: string|null, isDraw: boolean }} */
  endRound(now, fightState, reason) {
    fightState.roundActive = false
    let winner = null
    let isDraw = false

    if (reason === 'ko') {
      winner = fightState.roundWinnerSide
    } else if (reason === 'timeout') {
      if (fightState.php > fightState.ehp) winner = 'player'
      else if (fightState.ehp > fightState.php) winner = 'enemy'
      else isDraw = true
    }

    if (isDraw) {
      this.isDraw = true
      this.roundWinner = null
      this.phase = ROUND_PHASE.RESULT
      this.phaseUntil = now + RESULT_DURATION
      return { winner: null, isDraw: true }
    }

    if (winner === 'player') {
      fightState.pw += 1
      fightState.score += 900
    } else if (winner === 'enemy') {
      fightState.ew += 1
    }

    this.roundWinner = winner
    this.isDraw = false
    this.phase = ROUND_PHASE.RESULT
    this.phaseUntil = now + RESULT_DURATION

    if (fightState.pw >= 2) {
      fightState.matchOver = true
      fightState.matchWinner = 'player'
    } else if (fightState.ew >= 2) {
      fightState.matchOver = true
      fightState.matchWinner = 'enemy'
    }

    if (fightState.matchOver) {
      fightState.roundEndAt = now + MATCH_END_DELAY
    } else {
      fightState.roundEndAt = now + RESULT_DURATION + WALKBACK_DURATION + INTRO_DURATION
        + COUNTDOWN_STEP_DURATION * 3 + FIGHT_ANNOUNCE_DURATION
    }

    return { winner, isDraw: false }
  }

  trackDamage(side, amount) {
    if (side === 'player') this.roundDamagePlayer += amount
    else this.roundDamageEnemy += amount
  }

  isPerfectRound(winner) {
    if (winner === 'player') return this.roundDamagePlayer <= 0
    if (winner === 'enemy') return this.roundDamageEnemy <= 0
    return false
  }

  getAnnouncerForPhase() {
    switch (this.phase) {
      case ROUND_PHASE.INTRO:
        return { text: `ROUND ${this.round}`, type: 'round', anim: 'zoom' }
      case ROUND_PHASE.COUNTDOWN:
        return { text: String(this.countdownValue), type: 'countdown', anim: 'slam' }
      case ROUND_PHASE.FIGHT_ANNOUNCE:
        return { text: 'FIGHT!', type: 'fight', anim: 'slam' }
      case ROUND_PHASE.RESULT:
        if (this.isDraw) return { text: 'DRAW!', type: 'draw', anim: 'slam' }
        if (this.roundWinner === 'player') return { text: 'K.O.!', type: 'ko', anim: 'slam', duration: 2000 }
        return { text: 'K.O.!', type: 'ko', anim: 'slam', duration: 2000 }
      default:
        return null
    }
  }

  updateWalkback(fightState, dt) {
    if (this.phase !== ROUND_PHASE.WALKBACK) return
    const targetPx = fightState.arenaW * this.startPositions.px
    const targetEx = fightState.arenaW * this.startPositions.ex
    if (this.walkbackProgress === 0) {
      fightState.px = targetPx
      fightState.ex = targetEx
      fightState.pvx = 0
      fightState.evx = 0
      fightState.py = 0
      fightState.ey = 0
      this.walkbackProgress = 1
      return
    }
    const speed = 3 * (dt / 16)
    fightState.px += (targetPx - fightState.px) * speed * 0.15
    fightState.ex += (targetEx - fightState.ex) * speed * 0.15
    fightState.pvx = 0
    fightState.evx = 0
    fightState.py = 0
    fightState.ey = 0
  }
}
