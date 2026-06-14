import { useEffect } from 'react'

const ORIENTATION_COLLAPSE_DELAYS_MS = [0, 80, 180, 320, 520, 800]

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function isMobileSafari() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/i.test(ua) && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)
}

function syncAppHeight() {
  const height = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${height}px`)
}

function getCollapseScrollY() {
  const scrollable = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    document.body.scrollHeight - window.innerHeight,
    1,
  )
  return Math.min(3, scrollable)
}

function collapseMobileBrowserChrome() {
  const y = getCollapseScrollY()
  window.scrollTo(0, y)
  document.documentElement.scrollTop = y
  document.body.scrollTop = y
}

function ensurePageCanScroll() {
  document.documentElement.style.height = 'auto'
  document.body.style.minHeight = 'calc(100lvh + 3px)'
}

/** Minimize iOS Safari URL bar on load, rotation, and viewport changes. */
export default function useHideMobileBrowserBar() {
  useEffect(() => {
    syncAppHeight()
    ensurePageCanScroll()

    const shouldCollapseChrome = isIOS() || isMobileSafari()

    const collapseSoon = () => {
      syncAppHeight()
      ensurePageCanScroll()
      requestAnimationFrame(() => {
        collapseMobileBrowserChrome()
        requestAnimationFrame(collapseMobileBrowserChrome)
      })
    }

    const collapseAfterOrientation = () => {
      ensurePageCanScroll()
      ORIENTATION_COLLAPSE_DELAYS_MS.forEach((delay) => {
        window.setTimeout(() => {
          syncAppHeight()
          collapseMobileBrowserChrome()
        }, delay)
      })
    }

    if (shouldCollapseChrome) {
      collapseSoon()
      collapseAfterOrientation()
    }

    const onFirstTouch = () => {
      collapseSoon()
      document.removeEventListener('touchstart', onFirstTouch)
    }

    const landscapeMq = window.matchMedia('(orientation: landscape)')

    document.addEventListener('touchstart', onFirstTouch, { passive: true })
    window.addEventListener('orientationchange', collapseAfterOrientation)
    window.addEventListener('resize', collapseSoon)
    landscapeMq.addEventListener('change', collapseAfterOrientation)
    window.visualViewport?.addEventListener('resize', collapseSoon)
    window.visualViewport?.addEventListener('scroll', syncAppHeight)
    window.screen.orientation?.addEventListener('change', collapseAfterOrientation)

    return () => {
      document.removeEventListener('touchstart', onFirstTouch)
      window.removeEventListener('orientationchange', collapseAfterOrientation)
      window.removeEventListener('resize', collapseSoon)
      landscapeMq.removeEventListener('change', collapseAfterOrientation)
      window.visualViewport?.removeEventListener('resize', collapseSoon)
      window.visualViewport?.removeEventListener('scroll', syncAppHeight)
      window.screen.orientation?.removeEventListener('change', collapseAfterOrientation)
      document.body.style.minHeight = ''
    }
  }, [])
}
