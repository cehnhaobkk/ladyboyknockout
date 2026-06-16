/** Fallback UI sounds when sample files are unavailable. */

const MASTER_GAIN = 0.68

function envelope(ctx, peak, attack, hold, release) {
  const gain = ctx.createGain()
  const t = ctx.currentTime
  const sustain = Math.max(peak, 0.0001)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(sustain * MASTER_GAIN, t + attack)
  gain.gain.setValueAtTime(sustain * MASTER_GAIN, t + attack + hold)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release)
  return gain
}

function playClick(ctx, { freq, endFreq, duration, peak, type = 'square', attack = 0.001 }) {
  const osc = ctx.createOscillator()
  osc.type = type
  const t = ctx.currentTime
  osc.frequency.setValueAtTime(freq, t)
  if (endFreq && endFreq !== freq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 30), t + duration * 0.85)
  }
  const gain = envelope(ctx, peak, attack, 0, duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + duration + 0.03)
}

export function playProceduralCountdown(ctx, value) {
  const freq = value === 1 ? 660 : value === 2 ? 520 : 390
  playClick(ctx, { freq, duration: 0.09, peak: 0.22, type: 'square' })
}

export function playProceduralFightBell(ctx) {
  playClick(ctx, { freq: 880, duration: 0.12, peak: 0.28, type: 'triangle' })
  playClick(ctx, { freq: 1320, duration: 0.18, peak: 0.14, type: 'sine' })
}
