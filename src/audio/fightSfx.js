import { publicUrl } from '../utils/publicUrl'
import { playProceduralCountdown, playProceduralFightBell } from './fightSfxProcedural'

export const NONG_NUT_ID = 'nong_nut'

const MUTE_STORAGE_KEY = 'ladyboy-knockout-music-muted'

const SAMPLE_FILES = {
  punchWhoosh: publicUrl('/audio/sfx/punch-whoosh.mp3'),
  punchHit: publicUrl('/audio/sfx/punch-hit.wav'),
  kickHit: publicUrl('/audio/sfx/kick-hit.wav'),
  karateHit: publicUrl('/audio/sfx/karate-hit.wav'),
  fighterGrunt: publicUrl('/audio/sfx/fighter-grunt.wav'),
  nongNutEffort: publicUrl('/audio/sfx/nong-nut-effort.wav'),
  nongNutPain: publicUrl('/audio/sfx/nong-nut-pain.wav'),
  nongNutLaugh: publicUrl('/audio/sfx/nong-nut-laugh.wav'),
}

const MASTER_GAIN = 0.82

function readMutedPreference() {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

let audioCtx = null
let muted = readMutedPreference()
const buffers = new Map()
let loadPromise = null

function isNongNut(fighterId) {
  return fighterId === NONG_NUT_ID
}

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

async function fetchSample(ctx, key, url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to load ${key}`)
  const data = await response.arrayBuffer()
  return ctx.decodeAudioData(data)
}

export function preloadFightSfx() {
  const ctx = getCtx()
  if (!ctx) return Promise.resolve(false)
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const entries = Object.entries(SAMPLE_FILES)
    const results = await Promise.allSettled(
      entries.map(async ([key, url]) => {
        const buffer = await fetchSample(ctx, key, url)
        buffers.set(key, buffer)
      }),
    )
    return results.some((r) => r.status === 'fulfilled')
  })()

  return loadPromise
}

export function unlockFightSfx() {
  const ctx = getCtx()
  if (!ctx) return Promise.resolve(false)
  if (ctx.state === 'running') return Promise.resolve(true)
  return ctx.resume().then(() => true).catch(() => false)
}

export function setFightSfxMuted(nextMuted) {
  muted = Boolean(nextMuted)
}

function playBuffer(ctx, key, {
  volume = 1,
  rate = 1,
  offset = 0,
  duration,
  delay = 0,
} = {}) {
  const buffer = buffers.get(key)
  if (!buffer) return false

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.playbackRate.value = rate

  const gain = ctx.createGain()
  gain.gain.value = volume * MASTER_GAIN

  source.connect(gain)
  gain.connect(ctx.destination)

  const when = ctx.currentTime + delay
  const playDuration = duration ?? Math.max(0.05, buffer.duration - offset)
  source.start(when, offset, playDuration)
  return true
}

function playWhoosh(ctx, { rate = 1, volume = 0.72 } = {}) {
  return playBuffer(ctx, 'punchWhoosh', { volume, rate, duration: 0.22 })
}

function playGrunt(ctx, { volume = 0.55, rate = 1, delay = 0 } = {}) {
  return playBuffer(ctx, 'fighterGrunt', { volume, rate, offset: 0, duration: 0.45, delay })
}

function playNongNutEffort(ctx, { volume = 0.88, rate = 1, delay = 0 } = {}) {
  return playBuffer(ctx, 'nongNutEffort', { volume, rate, duration: 0.42, delay })
}

function playNongNutPain(ctx, { volume = 0.9, rate = 1, delay = 0 } = {}) {
  return playBuffer(ctx, 'nongNutPain', { volume, rate, duration: 0.55, delay })
}

function playNongNutLaugh(ctx, { volume = 0.92, rate = 1, delay = 0 } = {}) {
  return playBuffer(ctx, 'nongNutLaugh', { volume, rate, duration: 0.9, delay })
}

function playAttackVoice(ctx, fighterId, { delay = 0.02, volume = 0.55 } = {}) {
  if (isNongNut(fighterId)) {
    playNongNutEffort(ctx, { volume: 0.9, delay })
    return
  }
  playGrunt(ctx, { volume, delay })
}

function playPunchSwing(ctx, opts = {}) {
  playWhoosh(ctx, { rate: 1.05, volume: 0.68 })
  if (isNongNut(opts.fighterId)) {
    playNongNutEffort(ctx, { volume: 0.92, delay: 0.01 })
  }
}

function playKickSwing(ctx, opts = {}) {
  playWhoosh(ctx, { rate: 0.88, volume: 0.78 })
  playAttackVoice(ctx, opts.fighterId, { delay: 0.02, volume: 0.38 })
}

function playFlykickSwing(ctx, opts = {}) {
  playWhoosh(ctx, { rate: 0.95, volume: 0.82 })
  playAttackVoice(ctx, opts.fighterId, { delay: 0.03, volume: 0.45 })
}

function playSpecialSwing(ctx, opts = {}) {
  playWhoosh(ctx, { rate: 0.9, volume: 0.85 })
  playAttackVoice(ctx, opts.fighterId, { delay: 0.04, volume: 0.5 })
}

function playSuperSwing(ctx, opts = {}) {
  playWhoosh(ctx, { rate: 0.82, volume: 0.9 })
  playAttackVoice(ctx, opts.fighterId, { delay: 0.05, volume: 0.62 })
}

function playPunchImpact(ctx, opts = {}) {
  playBuffer(ctx, 'punchHit', { volume: 0.95, rate: 1.02, duration: 0.35 })
  if (isNongNut(opts.victimFighterId)) {
    playNongNutPain(ctx, { volume: 0.85, delay: 0.03 })
  }
}

function playKickImpact(ctx, opts = {}) {
  playBuffer(ctx, 'kickHit', { volume: 0.88, rate: 1, offset: 0, duration: 0.32 })
  if (isNongNut(opts.victimFighterId)) {
    playNongNutPain(ctx, { volume: 0.9, delay: 0.04 })
  } else {
    playGrunt(ctx, { volume: 0.42, rate: 1.08, delay: 0.02 })
  }
}

function playKarateImpact(ctx, { volume = 0.92, rate = 1 } = {}) {
  playBuffer(ctx, 'karateHit', { volume, rate, duration: 0.4 })
}

function playBlockImpact(ctx, opts = {}) {
  playKarateImpact(ctx, { volume: 0.48, rate: 1.15 })
  if (isNongNut(opts.victimFighterId)) {
    playNongNutPain(ctx, { volume: 0.35, rate: 1.05, delay: 0.02 })
  }
}

function playSuperImpact(ctx, opts = {}) {
  playKarateImpact(ctx, { volume: 1, rate: 0.95 })
  playBuffer(ctx, 'kickHit', { volume: 0.55, rate: 0.92, duration: 0.28, delay: 0.04 })
  if (isNongNut(opts.victimFighterId)) {
    playNongNutPain(ctx, { volume: 0.95, delay: 0.05 })
  } else {
    playGrunt(ctx, { volume: 0.7, rate: 1, delay: 0.05 })
  }
}

function playHit(ctx, opts = {}) {
  const { type = 'punch', blocked = false, isSuper = false } = opts

  if (blocked) {
    playBlockImpact(ctx, opts)
    return
  }
  if (isSuper) {
    playSuperImpact(ctx, opts)
    return
  }
  if (type === 'special') {
    playKarateImpact(ctx, { volume: 0.9, rate: 1.05 })
    if (isNongNut(opts.victimFighterId)) {
      playNongNutPain(ctx, { volume: 0.88, delay: 0.03 })
    } else {
      playGrunt(ctx, { volume: 0.5, rate: 1.1, delay: 0.03 })
    }
    return
  }
  if (type === 'kick' || type === 'flykick') {
    playKickImpact(ctx, opts)
    return
  }
  playPunchImpact(ctx, opts)
}

function playKo(ctx, opts = {}) {
  playKarateImpact(ctx, { volume: 1, rate: 0.88 })
  if (isNongNut(opts.winnerFighterId)) {
    playNongNutLaugh(ctx, { volume: 0.95, delay: 0.1 })
  } else if (isNongNut(opts.victimFighterId)) {
    playNongNutPain(ctx, { volume: 1, delay: 0.06 })
  } else {
    playGrunt(ctx, { volume: 0.75, rate: 0.9, delay: 0.08 })
  }
  playBuffer(ctx, 'kickHit', { volume: 0.5, rate: 0.85, duration: 0.35, delay: 0.12 })
}

function playTaunt(ctx, opts = {}) {
  if (isNongNut(opts.fighterId)) {
    playNongNutLaugh(ctx, { volume: 0.78, rate: 1.02 })
  }
}

const ATTACK_SFX = {
  punch: (ctx, opts) => playPunchSwing(ctx, opts),
  kick: (ctx, opts) => playKickSwing(ctx, opts),
  flykick: (ctx, opts) => playFlykickSwing(ctx, opts),
  special: (ctx, opts) => playSpecialSwing(ctx, opts),
  super: (ctx, opts) => playSuperSwing(ctx, opts),
}

function dispatchSfx(ctx, name, opts = {}) {
  switch (name) {
    case 'hit':
      playHit(ctx, opts)
      break
    case 'block':
      playHit(ctx, { ...opts, blocked: true })
      break
    case 'ko':
      playKo(ctx, opts)
      break
    case 'taunt':
      playTaunt(ctx, opts)
      break
    case 'countdown':
      playProceduralCountdown(ctx, opts.value ?? 3)
      break
    case 'fight':
      playProceduralFightBell(ctx)
      break
    case 'punch':
    case 'kick':
    case 'flykick':
    case 'special':
    case 'super':
      ATTACK_SFX[name]?.(ctx, opts)
      break
    default:
      break
  }
}

export function playFightSfx(name, opts = {}) {
  if (muted) return
  void unlockFightSfx().then(async (ready) => {
    if (!ready) return
    const ctx = getCtx()
    if (!ctx || ctx.state !== 'running') return
    if (!buffers.size) await preloadFightSfx()
    dispatchSfx(ctx, name, opts)
  })
}

export function getAttackSfxName(attackState) {
  switch (attackState) {
    case 'PUNCH':
      return 'punch'
    case 'KICK':
      return 'kick'
    case 'FLYKICK':
      return 'flykick'
    case 'SPECIAL':
      return 'special'
    case 'SUPER':
      return 'super'
    default:
      return null
  }
}
