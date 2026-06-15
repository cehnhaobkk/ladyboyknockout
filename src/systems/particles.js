const COLORS = {
  light: ['#fffacd', '#ffff00', '#ffffff'],
  heavy: ['#ff6600', '#ff3300', '#ffaa00', '#ff0000'],
  block: ['#88ccff', '#ffffff', '#4488ff'],
  super: ['#ff8800', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'],
  ko: ['#ffd700', '#ffff00', '#ffffff', '#ffaa00'],
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const MAX_PARTICLES = 140

export class ParticleSystem {
  constructor() {
    this.particles = []
    this.vignetteFlash = 0
    this.koStars = []
  }

  reset() {
    this.particles = []
    this.vignetteFlash = 0
    this.koStars = []
  }

  spawnBurst(x, y, type = 'light', count) {
    const palette = COLORS[type] || COLORS.light
    const n = count ?? (type === 'heavy' ? 10 : type === 'super' ? 20 : 5)
    const room = Math.max(0, MAX_PARTICLES - this.particles.length)
    const spawn = Math.min(n, room)
    for (let i = 0; i < spawn; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = type === 'heavy' ? 2 + Math.random() * 4 : 1.5 + Math.random() * 3
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'block' ? 2 : 0),
        life: type === 'heavy' ? 18 : type === 'super' ? 24 : 12,
        maxLife: type === 'heavy' ? 18 : type === 'super' ? 24 : 12,
        size: type === 'heavy' ? 3 + Math.random() * 2 : 2 + Math.random(),
        color: randChoice(palette),
        trail: type === 'heavy' || type === 'super',
        gravity: type === 'block' ? -0.05 : 0.08,
      })
    }
    if (type === 'super') this.vignetteFlash = 8
    if (type === 'block') {
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 20,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: -2 - Math.random() * 3,
          life: 14,
          maxLife: 14,
          size: 2 + Math.random(),
          color: randChoice(palette),
          trail: false,
          gravity: -0.02,
        })
      }
    }
  }

  spawnKOStars(x, y) {
    for (let i = 0; i < 6; i++) {
      this.koStars.push({
        x,
        y: y - 40,
        angle: (i / 6) * Math.PI * 2,
        radius: 30 + Math.random() * 15,
        speed: 0.04 + Math.random() * 0.02,
        life: 90,
        maxLife: 90,
        size: 4 + Math.random() * 3,
      })
    }
    this.spawnBurst(x, y, 'ko', 16)
  }

  tick() {
    for (const p of this.particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += p.gravity
      p.life -= 1
      if (p.trail && p.life % 2 === 0 && this.particles.length < MAX_PARTICLES) {
        this.particles.push({
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          life: 4,
          maxLife: 4,
          size: p.size * 0.6,
          color: p.color,
          trail: false,
          gravity: 0,
        })
      }
    }
    this.particles = this.particles.filter((p) => p.life > 0)

    for (const s of this.koStars) {
      s.angle += s.speed
      s.life -= 1
    }
    this.koStars = this.koStars.filter((s) => s.life > 0)

    if (this.vignetteFlash > 0) this.vignetteFlash -= 1
  }

  draw(ctx, w, h) {
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)

    for (const p of this.particles) {
      const alpha = p.life / p.maxLife
      ctx.globalAlpha = alpha
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
    }

    for (const s of this.koStars) {
      const alpha = s.life / s.maxLife
      const sx = s.x + Math.cos(s.angle) * s.radius
      const sy = s.y + Math.sin(s.angle) * s.radius * 0.4
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.moveTo(sx, sy - s.size)
      ctx.lineTo(sx + s.size * 0.3, sy)
      ctx.lineTo(sx, sy + s.size)
      ctx.lineTo(sx - s.size * 0.3, sy)
      ctx.closePath()
      ctx.fill()
    }

    ctx.globalAlpha = 1

    if (this.vignetteFlash > 0) {
      const alpha = (this.vignetteFlash / 8) * 0.35
      const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7)
      grad.addColorStop(0, 'transparent')
      grad.addColorStop(1, `rgba(255,255,255,${alpha})`)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    }
  }

  onHit({ x, y, hitType = 'light', isSuper = false, isKO = false, blocked = false } = {}) {
    if (blocked) {
      this.spawnBurst(x, y, 'block', 8)
      return
    }
    if (isKO) {
      this.spawnKOStars(x, y)
      return
    }
    if (isSuper) {
      this.spawnBurst(x, y, 'super', 24)
      return
    }
    this.spawnBurst(x, y, hitType === 'heavy' ? 'heavy' : 'light')
  }
}
