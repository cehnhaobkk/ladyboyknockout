import { useEffect } from 'react'

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function collapseMobileBrowserChrome() {
  window.scrollTo(0, 1)
  document.documentElement.scrollTop = 1
  document.body.scrollTop = 1
}

function syncAppHeight() {
  const height = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${height}px`)
}

/** Minimize iOS Safari URL bar on load and keep layout synced to the visible viewport. */
export default function useHideMobileBrowserBar() {
  useEffect(() => {
    syncAppHeight()

    if (!isIOS()) {
      const onResize = () => syncAppHeight()
      window.addEventListener('resize', onResize)
      window.visualViewport?.addEventListener('resize', onResize)
      return () => {
        window.removeEventListener('resize', onResize)
        window.visualViewport?.removeEventListener('resize', onResize)
      }
    }

    const hideChrome = () => {
      syncAppHeight()
      requestAnimationFrame(() => {
        collapseMobileBrowserChrome()
        requestAnimationFrame(collapseMobileBrowserChrome)
      })
    }

    hideChrome()

    const onFirstTouch = () => {
      hideChrome()
      document.removeEventListener('touchstart', onFirstTouch)
    }

    document.addEventListener('touchstart', onFirstTouch, { passive: true })
    window.addEventListener('orientationchange', hideChrome)
    window.addEventListener('resize', hideChrome)
    window.visualViewport?.addEventListener('resize', hideChrome)
    window.visualViewport?.addEventListener('scroll', syncAppHeight)

    return () => {
      document.removeEventListener('touchstart', onFirstTouch)
      window.removeEventListener('orientationchange', hideChrome)
      window.removeEventListener('resize', hideChrome)
      window.visualViewport?.removeEventListener('resize', hideChrome)
      window.visualViewport?.removeEventListener('scroll', syncAppHeight)
    }
  }, [])
}
