/** Dramatic announcer text overlays */

const STYLES = {
  round: { color: '#ffd700', outline: '#000', size: 'clamp(1.2rem, 5vw, 2.2rem)' },
  fight: { color: '#ff2200', outline: '#ffdd00', size: 'clamp(1.4rem, 6vw, 2.8rem)' },
  ko: { color: '#ff0044', outline: '#fff', size: 'clamp(1.6rem, 7vw, 3rem)' },
  perfect: { color: '#00ffff', outline: '#000', size: 'clamp(1rem, 4vw, 1.8rem)' },
  timeover: { color: '#ff8800', outline: '#000', size: 'clamp(1.2rem, 5vw, 2rem)' },
  counter: { color: '#ffff00', outline: '#000', size: 'clamp(0.8rem, 3vw, 1.2rem)' },
  punish: { color: '#ff6600', outline: '#000', size: 'clamp(0.8rem, 3vw, 1.2rem)' },
  blocked: { color: '#88ccff', outline: '#000', size: 'clamp(0.6rem, 2.5vw, 0.9rem)' },
  super: { color: '#ff8800', outline: '#fff', size: 'clamp(1.2rem, 5vw, 2rem)' },
  combo: { color: '#ffdd00', outline: '#000', size: 'clamp(0.9rem, 3.5vw, 1.4rem)' },
  milestone: { color: '#ff2200', outline: '#fff', size: 'clamp(1rem, 4vw, 1.8rem)' },
  winner: { color: '#ffd700', outline: '#000', size: 'clamp(1.4rem, 6vw, 2.6rem)' },
  flawless: { color: '#00ff88', outline: '#000', size: 'clamp(1rem, 4vw, 1.6rem)' },
  draw: { color: '#aaaaaa', outline: '#000', size: 'clamp(1.2rem, 5vw, 2rem)' },
  getup: { color: '#ffff00', outline: '#ff0000', size: 'clamp(0.7rem, 3vw, 1rem)' },
  countdown: { color: '#ffffff', outline: '#ff2200', size: 'clamp(2.4rem, 12vw, 5rem)' },
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

  show(text, type = 'round', anim = 'slam', duration = 1400) {
    const now = performance.now()
    const entry = {
      text,
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

  onGetUp() {
    this.show('GET UP!', 'getup', 'pulse', 2000)
  }

  onDraw() {
    this.show('DRAW!', 'draw', 'slam', 1500)
  }
}
