export function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function isStandaloneMode() {
  if (typeof window === 'undefined') return false
  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  )
}

export async function requestAppFullscreen() {
  const el = document.documentElement
  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen()
      return true
    }
    if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen()
      return true
    }
  } catch {
    return false
  }
  return false
}
