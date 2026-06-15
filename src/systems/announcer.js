/** Dramatic announcer text overlays */

const STYLES = {
  round: { color: '#ffd700', outline: '#000', size: 'clamp(0.7rem, 3vw, 1.25rem)' },
  fight: { color: '#ff2200', outline: '#ffdd00', size: 'clamp(0.8rem, 3.5vw, 1.6rem)' },
  ko: { color: '#ff0044', outline: '#fff', size: 'clamp(0.9rem, 4vw, 1.75rem)' },
  perfect: { color: '#00ffff', outline: '#000', size: 'clamp(0.6rem, 2.5vw, 1rem)' },
  timeover: { color: '#ff8800', outline: '#000', size: 'clamp(0.7rem, 3vw, 1.2rem)' },
  counter: { color: '#ffff00', outline: '#000', size: 'clamp(0.5rem, 2vw, 0.75rem)' },
  punish: { color: '#ff6600', outline: '#000', size: 'clamp(0.5rem, 2vw, 0.75rem)' },
  blocked: { color: '#88ccff', outline: '#000', size: 'clamp(0.42rem, 1.7vw, 0.6rem)' },
  super: { color: '#ff8800', outline: '#fff', size: 'clamp(0.7rem, 3vw, 1.2rem)' },
  special: { color: '#ffd700', outline: '#ff2200', size: 'clamp(0.42rem, 1.7vw, 0.65rem)' },
  combo: { color: '#ffdd00', outline: '#000', size: 'clamp(0.55rem, 2.2vw, 0.85rem)' },
  milestone: { color: '#ff2200', outline: '#fff', size: 'clamp(0.6rem, 2.5vw, 1rem)' },
  winner: { color: '#ffd700', outline: '#000', size: 'clamp(0.8rem, 3.5vw, 1.5rem)' },
  flawless: { color: '#00ff88', outline: '#000', size: 'clamp(0.6rem, 2.5vw, 0.95rem)' },
  draw: { color: '#aaaaaa', outline: '#000', size: 'clamp(0.7rem, 3vw, 1.2rem)' },
  countdown: { color: '#ffffff', outline: '#ff2200', size: 'clamp(1.4rem, 7vw, 3rem)' },
}

export class Announcer {
  constructor() {
    this.queue = []
    this.current = null
  }

  reset() {
    this.queue = []
    this.current = null
  }

  show(text, type = 'round', anim = 'slam', duration = 1400, subtitle = null) {
    const now = performance.now()
    const entry = {
      text,
      subtitle,
      type,
      anim,
      start: now,
      duration,
      style: STYLES[type] || STYLES.round,
    }
    if (!this.current || type === 'ko' || type === 'winner') {
      this.current = entry
    } else {
      this.queue.push(entry)
    }
  }

  tick(now) {
    if (this.current && now - this.current.start > this.current.duration) {
      this.current = this.queue.shift() || null
    }
  }

  getDisplay(now) {
    if (!this.current) return null
    const age = now - this.current.start
    if (age > this.current.duration) return null
    const progress = age / this.current.duration
    const fade = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1
    return { ...this.current, age, progress, fade }
  }

  onRoundIntro(round) {
    this.show(`ROUND ${round}`, 'round', 'zoom', 1800)
  }

  onFight() {
    this.show('FIGHT!', 'fight', 'slam', 1200)
  }

  onCountdown(value) {
    this.show(String(value), 'countdown', 'slam', 750)
  }

  onKO() {
    this.show('K.O.!', 'ko', 'slam', 2000)
  }

  onPerfect() {
    this.show('PERFECT!', 'perfect', 'zoom', 1500)
  }

  onTimeOver() {
    this.show('TIME OVER', 'timeover', 'slam', 1800)
  }

  onCounter() {
    this.show('COUNTER!', 'counter', 'slam', 900)
  }

  onPunish() {
    this.show('PUNISH!', 'punish', 'slam', 900)
  }

  onBlocked() {
    this.show('BLOCKED!', 'blocked', 'fade', 700)
  }

  onSuper() {
    this.show('SUPER!', 'super', 'slam', 1200)
  }

  onSpecialMove(text) {
    this.show(text, 'special', 'zoom', 1200)
  }

  onTauntQuote(text) {
    this.show(text, 'round', 'fade', 2800)
  }

  onFighterWin(name, description = '') {
    this.show(`${name.toUpperCase()} WINS!`, 'winner', 'slam', 2800, description || null)
  }

  onComboMilestone(text, color) {
    this.show(text, 'milestone', 'zoom', 1000)
    if (this.current) this.current.style = { ...STYLES.milestone, color }
  }

  onWinner(playerNum, name) {
    this.show(`PLAYER ${playerNum} WINS!`, 'winner', 'slam', 3000)
  }

  onFlawless() {
    this.show('FLAWLESS VICTORY', 'flawless', 'zoom', 2500)
  }

  onDraw() {
    this.show('DRAW!', 'draw', 'slam', 1500)
  }
}
