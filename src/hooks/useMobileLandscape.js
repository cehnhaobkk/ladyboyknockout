import { useEffect, useState } from 'react'

/** Phone landscape: height is the short edge (e.g. iPhone 14 Pro Max ≈ 932×430). */
export const MOBILE_LANDSCAPE_QUERY = '(orientation: landscape) and (max-height: 520px)'

export default function useMobileLandscape() {
  const [isMobileLandscape, setIsMobileLandscape] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(MOBILE_LANDSCAPE_QUERY).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_LANDSCAPE_QUERY)
    const update = () => setIsMobileLandscape(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isMobileLandscape
}
