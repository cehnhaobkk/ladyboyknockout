import { memo, useEffect, useLayoutEffect, useState } from 'react'
import { getStateConfig } from '../fighter/characterConfig'
import { useFighterAssets } from '../fighter/useFighterAssets'
import {
  getFightSpriteLayout,
  getFighterBodyTargetHeight,
  getKoSpriteLayout,
  measureSpriteBounds,
  preloadSpriteBounds,
  shouldUseKoSpriteLayout,
  spriteBoundsCache,
} from '../fighter/pixelScale'

function Fighter({ character, state, flipped, height = 180, hitFlash = false }) {
  const { assets, loaded } = useFighterAssets(character)
  const [nativeSize, setNativeSize] = useState({
    w: 0,
    h: 0,
    topPad: 0,
    bottomPad: 0,
    bodyH: 0,
    bodyW: 0,
  })

  const [boundsTick, setBoundsTick] = useState(0)
  const config = getStateConfig(character, state)
  const poseImage = assets[config.pose] || assets.standby
  void boundsTick
  const standbyBounds = assets.standby ? spriteBoundsCache.get(assets.standby) : null
  const cachedPoseBounds = poseImage ? spriteBoundsCache.get(poseImage) : null
  const poseBounds = cachedPoseBounds ?? nativeSize
  const boundsReady = Boolean(cachedPoseBounds?.h)

  const isKo = state === 'KO'
  const pose = config.pose
  const bodyTargetHeight = getFighterBodyTargetHeight(character, height)
  const layoutPose = isKo ? 'lose' : pose
  const useKoLayout = shouldUseKoSpriteLayout(
    layoutPose,
    poseBounds,
    standbyBounds,
    bodyTargetHeight,
    character,
  )
  const useDownLayout = isKo || useKoLayout

  useLayoutEffect(() => {
    if (!poseImage) return
    const cached = spriteBoundsCache.get(poseImage)
    if (cached) {
      setNativeSize(cached)
      return
    }
    setNativeSize({ w: 0, h: 0, topPad: 0, bottomPad: 0, bodyH: 0, bodyW: 0 })
  }, [poseImage])

  useEffect(() => {
    if (!assets.standby || spriteBoundsCache.has(assets.standby)) return undefined
    const img = new Image()
    img.onload = () => {
      spriteBoundsCache.set(assets.standby, measureSpriteBounds(img))
      setBoundsTick((t) => t + 1)
    }
    img.src = assets.standby
    return undefined
  }, [assets.standby])

  useEffect(() => {
    const downPoses = [assets.lose, assets.underattack].filter(Boolean)
    downPoses.forEach((src) => preloadSpriteBounds(src))
  }, [assets.lose, assets.underattack])

  useEffect(() => {
    if (!poseImage) return undefined
    const cached = spriteBoundsCache.get(poseImage)
    if (cached) {
      setNativeSize(cached)
      return undefined
    }
    setNativeSize({ w: 0, h: 0, topPad: 0, bottomPad: 0, bodyH: 0, bodyW: 0 })
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) {
        const bounds = measureSpriteBounds(img)
        spriteBoundsCache.set(poseImage, bounds)
        setNativeSize(bounds)
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
    return <div style={{ width: 80, height, background: 'transparent' }} />
  }

  const hasBounds = boundsReady && poseBounds.h > 0 && poseBounds.bodyH > 0
  const hasDownBounds = boundsReady && poseBounds.w > 0 && poseBounds.h > 0

  if (useDownLayout && !hasDownBounds) {
    return <div style={{ width: 80, height, background: 'transparent' }} />
  }

  const koClass = config.koClass || ''
  const cssClass = config.cssClass || ''
  const cssAnimation = config.cssAnimation || 'none'

  const spriteLayout = useDownLayout
    ? hasDownBounds
      ? getKoSpriteLayout(character, bodyTargetHeight, poseBounds.h, poseBounds, {
          standingBounds: standbyBounds,
          pose,
        })
      : null
    : hasBounds
      ? getFightSpriteLayout(poseBounds, bodyTargetHeight, {
          characterId: character,
          state,
          standbyBounds,
        })
      : null

  const displayWidth = spriteLayout?.displayWidth
  const imgHeight = spriteLayout?.imgHeight ?? (useDownLayout ? undefined : height)
  const paddingTop = spriteLayout?.paddingTop ?? 0
  const paddingSide = spriteLayout?.paddingSide ?? 0

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

  const wrapTransform = flipped ? 'scaleX(-1)' : undefined

  const downStageWidth = spriteLayout?.wrapWidth
  const downStageHeight = spriteLayout?.wrapHeight ?? imgHeight

  const downImgTransform = useDownLayout
    ? ['translateX(-50%)', spriteLayout?.imgOffsetY ? `translateY(${spriteLayout.imgOffsetY}px)` : null]
        .filter(Boolean)
        .join(' ')
    : undefined

  return (
    <div
      className={`fighter-wrap${isKo || useDownLayout ? ' is-ko' : ''}`}
      style={{
        position: 'relative',
        transform: wrapTransform,
        transformOrigin: 'bottom center',
        overflow: 'visible',
      }}
    >
      <div
        className="fighter-sprite-stage"
        style={
          useDownLayout
            ? {
                position: 'relative',
                width: downStageWidth ? `${downStageWidth}px` : undefined,
                height: downStageHeight ? `${downStageHeight}px` : undefined,
                overflow: spriteLayout?.overflowVisible ? 'visible' : 'hidden',
              }
            : {
                position: 'relative',
                paddingTop: paddingTop ? `${paddingTop}px` : undefined,
                paddingLeft: paddingSide ? `${paddingSide}px` : undefined,
                paddingRight: paddingSide ? `${paddingSide}px` : undefined,
                overflow: 'visible',
              }
        }
      >
        <div className="fighter-shadow" />
        <img
          src={poseImage}
          alt=""
          draggable={false}
          className={`fighter-image ${cssClass} ${koClass}`.trim()}
          style={{
            width: displayWidth ? `${displayWidth}px` : 'auto',
            height: `${imgHeight}px`,
            maxWidth: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            filter: imgFilter,
            animation: useDownLayout ? 'none' : cssAnimation,
            position: useDownLayout ? 'absolute' : undefined,
            left: useDownLayout ? '50%' : undefined,
            bottom: useDownLayout ? 0 : undefined,
            transform: downImgTransform || undefined,
            transformOrigin: 'bottom center',
            transition: hitFlash ? 'filter 0.06s ease' : 'none',
            display: 'block',
            userSelect: 'none',
            pointerEvents: 'none',
            verticalAlign: 'bottom',
          }}
        />
      </div>
    </div>
  )
}

export default memo(Fighter)
