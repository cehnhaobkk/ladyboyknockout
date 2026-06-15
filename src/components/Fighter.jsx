import { useEffect, useState } from 'react'
import { getStateConfig } from '../fighter/characterConfig'
import { useFighterAssets } from '../fighter/useFighterAssets'
import { getKoGroundOffset, snapPixelHeight, snapPixelWidth } from '../fighter/pixelScale'

export default function Fighter({ character, state, flipped, height = 180, hitFlash = false }) {
  const { assets, loaded } = useFighterAssets(character)
  const [displayState, setDisplayState] = useState(state)
  const [nativeSize, setNativeSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (state !== displayState) setDisplayState(state)
  }, [state, displayState])

  const config = getStateConfig(character, displayState)
  const poseImage = assets[config.pose]

  useEffect(() => {
    if (!poseImage) return undefined
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) {
        setNativeSize({ w: img.naturalWidth, h: img.naturalHeight })
      }
    }
    img.src = poseImage
    return () => {
      cancelled = true
    }
  }, [poseImage])

  if (!loaded) {
    return <div style={{ width: 80, height, background: 'transparent' }} />
  }

  if (!poseImage) {
    return null
  }

  const koClass = config.koClass || ''
  const cssClass = config.cssClass || ''
  const cssAnimation = config.cssAnimation || 'none'
  const isKo = displayState === 'KO'

  const displayHeight = snapPixelHeight(nativeSize.h, height)
  const displayWidth = snapPixelWidth(nativeSize.w, nativeSize.h, displayHeight)
  const koGroundOffset = isKo ? getKoGroundOffset(character, displayHeight) : 0

  const koFilter =
    koClass === 'kyle-ko'
      ? 'brightness(0.65)'
      : koClass === 'dave-ko'
        ? 'brightness(0.7)'
        : koClass === 'dmitri-ko' || koClass === 'rajesh-ko'
          ? 'brightness(0.75)'
          : 'none'

  const hitFilter = hitFlash ? 'brightness(8) saturate(0)' : null
  const imgFilter = hitFilter || (koFilter !== 'none' ? koFilter : undefined)

  const wrapTransform = [
    flipped ? 'scaleX(-1)' : null,
    koGroundOffset ? `translateY(${koGroundOffset}px)` : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className="fighter-wrap"
      style={{
        position: 'relative',
        width: displayWidth ? `${displayWidth}px` : undefined,
        height: `${displayHeight}px`,
        transform: wrapTransform || undefined,
        transformOrigin: 'bottom center',
      }}
    >
      <div className="fighter-shadow" />
      <img
        src={poseImage}
        alt=""
        draggable={false}
        className={`fighter-image ${cssClass} ${koClass}`.trim()}
        style={{
          width: displayWidth ? `${displayWidth}px` : 'auto',
          height: `${displayHeight}px`,
          maxWidth: 'none',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          filter: imgFilter,
          animation: cssAnimation,
          transformOrigin: 'bottom center',
          transition: hitFlash ? 'filter 0.06s ease' : 'none',
          display: 'block',
          userSelect: 'none',
          pointerEvents: 'none',
          verticalAlign: 'bottom',
        }}
      />
    </div>
  )
}
