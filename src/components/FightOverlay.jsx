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
          const prevKey = `${prev.announcer?.text || ''}|${prev.combo?.combo || 0}|${prev.showGetUp}|${prev.flashWhite}`
          const nextKey = `${next.announcer?.text || ''}|${next.combo?.combo || 0}|${next.showGetUp}|${next.flashWhite}`
          return prevKey === nextKey ? prev : next
        })
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [arenaRef, particles, systemsRef])

  const announcer = hud.announcer
  const combo = hud.combo

  return (
    <div className="fight-overlay" aria-hidden>
      <canvas ref={canvasRef} className="fight-particles-canvas" />

      {hud.flashWhite && <div className="super-flash-white" />}

      {announcer && (
        <div
          className={`announcer-text announcer-${announcer.anim} announcer-type-${announcer.type}`}
          style={{
            color: announcer.style?.color,
            fontSize: announcer.style?.size,
            opacity: announcer.fade,
            textShadow: `2px 2px 0 ${announcer.style?.outline}, -2px -2px 0 ${announcer.style?.outline}, 2px -2px 0 ${announcer.style?.outline}, -2px 2px 0 ${announcer.style?.outline}`,
          }}
        >
          {announcer.text}
        </div>
      )}

      {combo && combo.combo >= 2 && (
        <div
          className="combo-display"
          style={{
            transform: `translate(-50%, -50%) scale(${combo.scale})`,
            opacity: combo.fade,
          }}
        >
          <span className="combo-number">{combo.combo}</span>
          <span className="combo-label">HIT COMBO</span>
        </div>
      )}

      {hud.showGetUp && (
        <div className="get-up-prompt">GET UP!</div>
      )}
    </div>
  )
}
