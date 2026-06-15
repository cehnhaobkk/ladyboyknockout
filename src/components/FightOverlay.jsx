import { useEffect, useRef, useState } from 'react'

export default function FightOverlay({
  particles,
  systemsRef,
  arenaRef,
}) {
  const canvasRef = useRef(null)
  const [hud, setHud] = useState({})
  const arenaSizeRef = useRef({ w: 0, h: 0 })
  const frameRef = useRef(0)

  useEffect(() => {
    let raf
    const draw = () => {
      frameRef.current += 1
      const canvas = canvasRef.current
      const arena = arenaRef?.current
      if (canvas && arena && particles) {
        if (frameRef.current % 20 === 0) {
          const rect = arena.getBoundingClientRect()
          arenaSizeRef.current = { w: rect.width, h: rect.height }
        }
        const { w, h } = arenaSizeRef.current
        if (w > 0 && h > 0) {
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w
            canvas.height = h
          }
          const ctx = canvas.getContext('2d')
          particles.draw(ctx, w, h)
        }
      }

      const sys = systemsRef?.current
      if (sys && frameRef.current % 2 === 0) {
        const next = sys.getHudState(performance.now())
        setHud((prev) => {
          const prevKey = `${prev.announcer?.text || ''}|${prev.announcer?.subtitle || ''}|${prev.combo?.combo || 0}|${prev.flashWhite}`
          const nextKey = `${next.announcer?.text || ''}|${next.announcer?.subtitle || ''}|${next.combo?.combo || 0}|${next.flashWhite}`
          return prevKey === nextKey ? prev : next
        })
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [arenaRef, particles, systemsRef])

  const announcer = hud.announcer

  return (
    <div className="fight-overlay" aria-hidden>
      <canvas ref={canvasRef} className="fight-particles-canvas" />

      {hud.flashWhite && <div className="super-flash-white" />}

      {announcer && (
        <div
          className={`announcer-text announcer-${announcer.anim} announcer-type-${announcer.type}${announcer.subtitle ? ' has-subtitle' : ''}`}
          style={{
            color: announcer.style?.color,
            fontSize: announcer.style?.size,
            opacity: announcer.fade,
            textShadow: `1px 1px 0 ${announcer.style?.outline}, -1px -1px 0 ${announcer.style?.outline}, 1px -1px 0 ${announcer.style?.outline}, -1px 1px 0 ${announcer.style?.outline}`,
          }}
        >
          <div className="announcer-title">{announcer.text}</div>
          {announcer.subtitle && (
            <div className="announcer-subtitle">{announcer.subtitle}</div>
          )}
        </div>
      )}

    </div>
  )
}
