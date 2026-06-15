import { useCallback, useEffect, useRef, useState } from 'react'
import { publicUrl } from '../utils/publicUrl'

export const FIGHT_MUSIC_CANDIDATES = [
  '/audio/fight-music.mp3',
  '/audio/fight-music.ogg',
  '/audio/fight-music.wav',
  '/audio/fight-music.m4a',
].map(publicUrl)

const MUTE_STORAGE_KEY = 'ladyboy-knockout-music-muted'
const MUSIC_VOLUME = 0.45

function readMutedPreference() {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function probeAudioSource(src) {
  return new Promise((resolve) => {
    const probe = new Audio()
    const finish = (ok) => {
      probe.removeEventListener('canplaythrough', onReady)
      probe.removeEventListener('error', onFail)
      probe.src = ''
      resolve(ok ? src : null)
    }
    const onReady = () => finish(true)
    const onFail = () => finish(false)
    probe.addEventListener('canplaythrough', onReady, { once: true })
    probe.addEventListener('error', onFail, { once: true })
    probe.preload = 'auto'
    probe.src = src
    probe.load()
  })
}

async function resolveFightMusicSrc() {
  for (const src of FIGHT_MUSIC_CANDIDATES) {
    const match = await probeAudioSource(src)
    if (match) return match
  }
  return null
}

export default function useFightMusic(active) {
  const audioRef = useRef(null)
  const musicSrcRef = useRef(null)
  const [muted, setMuted] = useState(readMutedPreference)
  const [hasMusic, setHasMusic] = useState(false)

  const tryPlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || muted || !active || !musicSrcRef.current) return
    void audio.play().catch(() => {})
  }, [active, muted])

  useEffect(() => {
    let cancelled = false
    let audio = null

    resolveFightMusicSrc().then((src) => {
      if (cancelled) return

      if (!src) {
        setHasMusic(false)
        return
      }

      musicSrcRef.current = src
      audio = new Audio(src)
      audio.loop = true
      audio.volume = MUSIC_VOLUME
      audio.preload = 'auto'
      audioRef.current = audio
      setHasMusic(true)

      if (active && !muted) {
        void audio.play().catch(() => {})
      }
    })

    return () => {
      cancelled = true
      if (audio) {
        audio.pause()
        audio.src = ''
      }
      audioRef.current = null
      musicSrcRef.current = null
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0')
    } catch {
      /* ignore storage errors */
    }
  }, [muted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (active && !muted) {
      tryPlay()
      return
    }

    audio.pause()
    if (!active) {
      audio.currentTime = 0
    }
  }, [active, muted, tryPlay])

  useEffect(() => {
    if (!active || muted) return undefined

    const unlock = () => tryPlay()
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [active, muted, tryPlay])

  const toggleMute = useCallback(() => {
    setMuted((wasMuted) => {
      const nextMuted = !wasMuted
      const audio = audioRef.current

      if (!audio || !musicSrcRef.current) {
        return nextMuted
      }

      if (nextMuted) {
        audio.pause()
      } else if (active) {
        void audio.play().catch(() => {})
      }

      return nextMuted
    })
  }, [active])

  return { muted, toggleMute, hasMusic }
}
