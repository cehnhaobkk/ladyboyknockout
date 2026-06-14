import { useCallback, useRef } from 'react'
import styles from './TouchControls.module.css'

const DPAD = [
  { code: 'ArrowLeft', label: '◀', className: styles.dpadLeft },
  { code: 'ArrowUp', label: '▲', className: styles.dpadUp },
  { code: 'ArrowDown', label: '▼', className: styles.dpadDown },
  { code: 'ArrowRight', label: '▶', className: styles.dpadRight },
]

const ACTIONS = [
  { code: 'KeyL', label: 'SP', title: 'Special', className: styles.actionSpecial },
  { code: 'KeyJ', label: 'P', title: 'Punch', className: styles.actionPunch },
  { code: 'KeyI', label: 'F', title: 'Fly kick', className: styles.actionFly },
  { code: 'KeyK', label: 'K', title: 'Kick', className: styles.actionKick },
]

export default function TouchControls({ keysRef, pressRef }) {
  const pointerCodesRef = useRef(new Map())
  const holdCountsRef = useRef(new Map())

  const press = useCallback(
    (code) => {
      const count = holdCountsRef.current.get(code) ?? 0
      if (count === 0) {
        keysRef.current.add(code)
        pressRef.current.add(code)
      }
      holdCountsRef.current.set(code, count + 1)
    },
    [keysRef, pressRef],
  )

  const release = useCallback(
    (code) => {
      const count = holdCountsRef.current.get(code) ?? 0
      if (count <= 1) {
        holdCountsRef.current.delete(code)
        keysRef.current.delete(code)
      } else {
        holdCountsRef.current.set(code, count - 1)
      }
    },
    [keysRef],
  )

  const releasePointer = useCallback(
    (pointerId) => {
      const code = pointerCodesRef.current.get(pointerId)
      if (!code) return
      pointerCodesRef.current.delete(pointerId)
      release(code)
    },
    [release],
  )

  const bindButton = (code) => ({
    onPointerDown: (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      if (!pointerCodesRef.current.has(e.pointerId)) {
        pointerCodesRef.current.set(e.pointerId, code)
        press(code)
      }
    },
    onPointerUp: (e) => {
      e.preventDefault()
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      releasePointer(e.pointerId)
    },
    onPointerCancel: (e) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      releasePointer(e.pointerId)
    },
    onLostPointerCapture: (e) => {
      releasePointer(e.pointerId)
    },
    onContextMenu: (e) => e.preventDefault(),
  })

  return (
    <div className={styles.controls} aria-hidden>
      <div className={styles.dpad}>
        {DPAD.map((btn) => (
          <button
            key={btn.code}
            type="button"
            className={`${styles.dpadBtn} ${btn.className}`}
            aria-label={btn.code}
            {...bindButton(btn.code)}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        {ACTIONS.map((btn) => (
          <button
            key={btn.code}
            type="button"
            className={`${styles.actionBtn} ${btn.className}`}
            title={btn.title}
            aria-label={btn.title}
            {...bindButton(btn.code)}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
