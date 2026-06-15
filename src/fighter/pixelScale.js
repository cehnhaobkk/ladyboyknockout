/** Base arena height ratio — same for every fighter */
export const UNIFIED_FIGHTER_HEIGHT_RATIO = 0.58

/** Reference body fill used to normalize on-screen height across fighters. */
const REFERENCE_BODY_HEIGHT_RATIO = 0.838

/** Visible body height as a fraction of canvas height. */
const FIGHTER_BODY_HEIGHT_RATIO = {
  dave: 0.93,
  kyle: 0.875,
  xiaoming: 0.93,
  rajesh: 0.93,
  dmitri: 0.882,
  nong_nut: 0.93,
  somchai: 0.93,
  malee: 0.93,
  petch: 0.93,
  ali: 0.93,
}

const DAVE_BODY_HEIGHT_RATIO = REFERENCE_BODY_HEIGHT_RATIO

/** Compensate for extra transparent padding in specific sprite sheets. */
const FIGHTER_SCALE_TUNING = {
  nong_nut: 1.12,
}

/** Normalize on-screen body size so every fighter reads the same height as Dave. */
export function getFighterVisualScale(characterId) {
  const bodyRatio = FIGHTER_BODY_HEIGHT_RATIO[characterId] ?? DAVE_BODY_HEIGHT_RATIO
  const tuning = FIGHTER_SCALE_TUNING[characterId] ?? 1
  return (DAVE_BODY_HEIGHT_RATIO / bodyRatio) * tuning
}

/** Body fill in desktop/mobile selector portrait PNGs (measured alpha bounds). */
const CHAR_SELECT_BODY_HEIGHT_RATIO = {
  dave: 0.8,
  kyle: 0.836,
  xiaoming: 0.768,
  rajesh: 1,
  dmitri: 0.831,
  somchai: 1,
  malee: 1,
  petch: 1,
  ali: 0.998,
}

const CHAR_SELECT_PORTRAIT_TUNING = {
  rajesh: 1.1,
  somchai: 1.1,
  malee: 1.1,
  petch: 1.1,
  ali: 1.1,
}

const CHAR_SELECT_REFERENCE_BODY_RATIO = CHAR_SELECT_BODY_HEIGHT_RATIO.dave

/** Scale selector portraits so every fighter reads the same height as Dave. */
export function getCharSelectPortraitScale(characterId) {
  const bodyRatio = CHAR_SELECT_BODY_HEIGHT_RATIO[characterId] ?? CHAR_SELECT_REFERENCE_BODY_RATIO
  const tuning = CHAR_SELECT_PORTRAIT_TUNING[characterId] ?? 1
  return (CHAR_SELECT_REFERENCE_BODY_RATIO / bodyRatio) * tuning
}

/** @deprecated kept for imports that read the map directly */
export const FIGHTER_VISUAL_SCALE = Object.fromEntries(
  Object.keys(FIGHTER_BODY_HEIGHT_RATIO).map((id) => [id, getFighterVisualScale(id)]),
)

/**
 * Snap to a clean 0.25× scale when possible, but never draw taller than targetHeight.
 */
export function snapPixelHeight(nativeHeight, targetHeight) {
  if (!nativeHeight || !targetHeight) return targetHeight || nativeHeight || 180
  const rawScale = targetHeight / nativeHeight
  const quarterScale = Math.max(0.25, Math.round(rawScale * 4) / 4)
  const quarterHeight = Math.round(nativeHeight * quarterScale)
  if (quarterHeight <= targetHeight) {
    if (quarterHeight < targetHeight * 0.85) {
      return Math.min(targetHeight, Math.round(nativeHeight * rawScale))
    }
    return quarterHeight
  }
  return Math.min(targetHeight, Math.round(nativeHeight * rawScale))
}

export function snapPixelWidth(nativeWidth, nativeHeight, displayHeight) {
  if (!nativeWidth || !nativeHeight) return undefined
  return Math.round((nativeWidth * displayHeight) / nativeHeight)
}

/**
 * Transparent padding below the body in each lose sprite (px at 506×456).
 * Fallback when sprite bounds have not been measured yet.
 */
const KO_SPRITE_BOTTOM_PAD_PX = {
  dave: 22,
  kyle: 35,
  xiaoming: 25,
  rajesh: 20,
  dmitri: 12,
  nong_nut: 19,
}

const KO_SPRITE_NATIVE_HEIGHT = 456

export function measureSpriteBounds(img) {
  const w = img.naturalWidth
  const h = img.naturalHeight
  if (!w || !h) {
    return { w: 0, h: 0, topPad: 0, bottomPad: 0, bodyH: 0, bodyW: 0 }
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return { w, h, topPad: 0, bottomPad: 0, bodyH: h, bodyW: w }
  }

  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, w, h).data

  let minX = w
  let maxX = -1
  let minY = h
  let maxY = -1
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3] > 10) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (maxY < 0) {
    return { w, h, topPad: 0, bottomPad: 0, bodyH: h, bodyW: w }
  }

  const topPad = minY
  const bottomPad = h - 1 - maxY
  const bodyH = maxY - minY + 1
  const bodyW = maxX - minX + 1

  return { w, h, topPad, bottomPad, bodyH, bodyW }
}

export const spriteBoundsCache = new Map()

export function preloadSpriteBounds(src) {
  if (!src || spriteBoundsCache.has(src)) return
  const img = new Image()
  img.onload = () => {
    if (!spriteBoundsCache.has(src)) {
      spriteBoundsCache.set(src, measureSpriteBounds(img))
    }
  }
  img.src = src
}

/** @deprecated use measureSpriteBounds */
export function measureSpriteBottomPad(img) {
  return measureSpriteBounds(img).bottomPad
}

export function getKoBottomPadDisplay(
  characterId,
  displayHeight,
  nativeHeight = KO_SPRITE_NATIVE_HEIGHT,
  measuredBottomPadPx,
) {
  const bottomPad =
    measuredBottomPadPx !== undefined
      ? measuredBottomPadPx
      : (KO_SPRITE_BOTTOM_PAD_PX[characterId] ?? 20)
  if (!displayHeight || !nativeHeight) return 0
  return Math.round((bottomPad / nativeHeight) * displayHeight)
}

function isAttackMoveState(state) {
  return state === 'SPECIAL' || state === 'FLYKICK' || state === 'SUPER'
}

/** Extra padding so CSS move animations are not clipped by the sprite box. */
function getFightAnimHeadroom(characterId, state, targetBodyHeight) {
  const topDefault = Math.ceil(targetBodyHeight * 0.06)
  const sideDefault = Math.ceil(targetBodyHeight * 0.1)

  if (characterId === 'rajesh') {
    let top = Math.ceil(targetBodyHeight * 0.1)
    let side = Math.ceil(targetBodyHeight * 0.12)
    if (state === 'SPECIAL') {
      // rajeshSpecialForward lunges ~78px forward on screen.
      side = Math.max(Math.ceil(targetBodyHeight * 0.5), 80)
    } else if (state === 'FLYKICK') {
      top = Math.ceil(targetBodyHeight * 0.2)
      side = Math.ceil(targetBodyHeight * 0.2)
    } else if (state === 'WIN') {
      top = Math.ceil(targetBodyHeight * 0.15)
    } else if (state === 'KICK') {
      top = Math.ceil(targetBodyHeight * 0.12)
    }
    return { top, side }
  }

  if (characterId === 'malee') {
    if (state === 'PUNCH' || state === 'KICK') {
      return {
        top: Math.ceil(targetBodyHeight * 0.1),
        side: Math.ceil(targetBodyHeight * 0.16),
      }
    }
    if (isAttackMoveState(state)) {
      return {
        top: Math.ceil(targetBodyHeight * 0.14),
        side: Math.ceil(targetBodyHeight * 0.14),
      }
    }
  }

  return { top: topDefault, side: sideDefault }
}

/** Measured standby body heights (px) for cross-fighter size matching vs Nong Nut. */
const FIGHT_STANDBY_BODY_H = {
  nong_nut: 421,
  dave: 366,
  kyle: 393,
  xiaoming: 354,
  rajesh: 393,
  dmitri: 402,
  somchai: 392,
  malee: 360,
  petch: 409,
  ali: 425,
}

const REFERENCE_BODY_H = FIGHT_STANDBY_BODY_H.nong_nut

/** Adjust body-normalization target so every fighter matches the reference on-screen size. */
export function getFighterBodyTargetHeight(characterId, referenceTarget) {
  const charBody = FIGHT_STANDBY_BODY_H[characterId] ?? REFERENCE_BODY_H
  return Math.round(referenceTarget * (charBody / REFERENCE_BODY_H))
}

/** Scale sprite so its visible body maps to targetBodyHeight. */
function scaleSpriteToBodyHeight(bounds, targetBodyHeight) {
  const { w, h, bodyH } = bounds
  const effectiveBodyH = Math.max(1, bodyH || h)
  const scale = targetBodyHeight / effectiveBodyH
  return {
    imgHeight: Math.max(1, Math.round(h * scale)),
    displayWidth: w ? Math.max(1, Math.round(w * scale)) : undefined,
  }
}

/** Fighters whose attack canvas normalizes smaller than punch/kick on screen. */
const CHARACTER_ATTACK_BODY_TARGET = {
  malee: 1.28,
}

/** Wide punch/kick art gets over-shrunk by the standing footprint width cap. */
const CHARACTER_SKIP_FIGHT_FOOTPRINT = {
  malee: true,
  nong_nut: true,
}

function shouldSkipFightFootprint(characterId, state, attackBoost) {
  return (
    CHARACTER_SKIP_FIGHT_FOOTPRINT[characterId] ||
    (isAttackMoveState(state) && attackBoost > 1)
  )
}

/** Max standing pose width vs standby — matches typical kick reach (~1.5×). */
const FIGHT_POSE_MAX_WIDTH_RATIO = 1.52

function getStandbyFootprint(standbyBounds, targetBodyHeight) {
  if (!standbyBounds?.bodyH) return null
  const standbyLayout = scaleSpriteToBodyHeight(standbyBounds, targetBodyHeight)
  if (!standbyLayout.displayWidth) return null
  return {
    maxHeight: standbyLayout.imgHeight,
    maxWidth: Math.round(standbyLayout.displayWidth * FIGHT_POSE_MAX_WIDTH_RATIO),
  }
}

/** Per-fighter lying-KO footprint vs standing pose (width/height multipliers on standW/standH). */
const CHARACTER_HORIZONTAL_KO_FOOTPRINT = {
  // Wide KO art with props (IV stand, books) reads small at the default kick-width cap.
  ali: { widthRatio: 2.0, heightRatio: 0.72 },
}

/** Upright stagger KO sprites (not lying flat) — cap vs standing box height. */
const CHARACTER_UPRIGHT_KO_HEIGHT_RATIO = {}

function isUprightStaggerSprite(bounds) {
  if (!bounds?.w || !bounds?.h) return false
  const bodyH = bounds.bodyH || bounds.h
  const bodyW = bounds.bodyW || bounds.w
  const canvasAspect = bounds.w / Math.max(1, bounds.h)
  const bodyAspect = bodyW / Math.max(1, bodyH)
  const bodyFillH = bodyH / Math.max(1, bounds.h)
  if (canvasAspect < 1.35 && bodyFillH >= 0.85) return true
  return bodyAspect < 1.2
}

function getHorizontalKoFootprint(
  characterId,
  standbyBounds,
  targetBodyHeight,
  boxWidth,
  boxHeight,
  aspect,
) {
  const fightFootprint = getStandbyFootprint(standbyBounds, targetBodyHeight)
  const standW = fightFootprint
    ? Math.round(fightFootprint.maxWidth / FIGHT_POSE_MAX_WIDTH_RATIO)
    : boxWidth
  const standH = fightFootprint?.maxHeight ?? boxHeight
  const custom = CHARACTER_HORIZONTAL_KO_FOOTPRINT[characterId]

  if (custom) {
    return {
      maxWidth: Math.round(standW * custom.widthRatio),
      maxHeight: Math.max(1, Math.round(standH * custom.heightRatio)),
    }
  }

  // Very wide lying sprites — balance between tiny width-squeeze and oversized KO.
  if (aspect >= 1.8) {
    return {
      maxWidth: Math.round(standW * 2.15),
      maxHeight: Math.round(standH * 0.52),
    }
  }

  return {
    maxWidth: fightFootprint?.maxWidth ?? Math.round(boxWidth * FIGHT_POSE_MAX_WIDTH_RATIO),
    maxHeight: Math.max(1, Math.round(standH * 0.62)),
  }
}

/** Lying-down hurt/KO sprites need down layout; upright stagger poses use fight scaling. */
export function shouldUseKoSpriteLayout(pose, bounds, standingBounds, targetBodyHeight, characterId) {
  if (!bounds?.w || !bounds?.h) return false
  if (pose !== 'lose' && pose !== 'underattack') return false
  if (isUprightStaggerSprite(bounds)) return false
  if (pose === 'lose') return true

  const standLayout =
    standingBounds?.bodyH > 0
      ? getFightSpriteLayout(standingBounds, targetBodyHeight, { characterId })
      : null

  const boxWidth = standLayout?.displayWidth ?? Math.round(targetBodyHeight * 0.72)
  const boxHeight = standLayout?.imgHeight ?? targetBodyHeight
  const canvasAspect = bounds.w / Math.max(1, bounds.h)
  const widthScale = boxWidth / Math.max(1, bounds.w)
  const heightScale = boxHeight / Math.max(1, bounds.h)
  return widthScale < heightScale && canvasAspect >= 1.35
}

function capSpriteToFootprint(imgHeight, displayWidth, footprint) {
  if (!footprint || !displayWidth) return { imgHeight, displayWidth }
  const shrink = Math.min(
    1,
    footprint.maxWidth / displayWidth,
    footprint.maxHeight / Math.max(1, imgHeight),
  )
  if (shrink >= 1) return { imgHeight, displayWidth }
  return {
    imgHeight: Math.max(1, Math.round(imgHeight * shrink)),
    displayWidth: Math.max(1, Math.round(displayWidth * shrink)),
  }
}

/**
 * Scale a fight sprite: body-normalized per pose, capped to standby height,
 * so SP/flykick cannot appear larger than punch/kick.
 */
export function getFightSpriteLayout(bounds, targetBodyHeight, options = {}) {
  const { characterId, state, standbyBounds } = options
  const { h } = bounds
  if (!h || !targetBodyHeight) {
    return {
      wrapHeight: targetBodyHeight || 0,
      imgHeight: targetBodyHeight || 0,
      displayWidth: undefined,
      paddingTop: 0,
      paddingSide: 0,
    }
  }

  const attackBoost = CHARACTER_ATTACK_BODY_TARGET[characterId] ?? 1
  const layoutTarget =
    isAttackMoveState(state) && attackBoost > 1
      ? Math.round(targetBodyHeight * attackBoost)
      : targetBodyHeight

  let { imgHeight, displayWidth } = scaleSpriteToBodyHeight(bounds, layoutTarget)

  const standBounds =
    standbyBounds?.bodyH > 0 ? standbyBounds : null
  if (standBounds) {
    const standbyLayout = scaleSpriteToBodyHeight(standBounds, targetBodyHeight)
    const maxImgHeight = Math.round(
      standbyLayout.imgHeight * (isAttackMoveState(state) && attackBoost > 1 ? attackBoost : 1),
    )
    if (imgHeight > maxImgHeight) {
      const ratio = maxImgHeight / imgHeight
      imgHeight = maxImgHeight
      displayWidth = displayWidth ? Math.max(1, Math.round(displayWidth * ratio)) : undefined
    }
  }

  const footprint = getStandbyFootprint(standBounds, targetBodyHeight)
  if (footprint && displayWidth && !shouldSkipFightFootprint(characterId, state, attackBoost)) {
    const capped = capSpriteToFootprint(imgHeight, displayWidth, footprint)
    imgHeight = capped.imgHeight
    displayWidth = capped.displayWidth
  }

  const { top: paddingTop, side: paddingSide } = getFightAnimHeadroom(
    characterId,
    state,
    targetBodyHeight,
  )

  return {
    imgHeight,
    displayWidth,
    paddingTop,
    paddingSide,
    wrapHeight: Math.max(1, imgHeight + paddingTop),
    wrapWidth: displayWidth ? displayWidth + paddingSide * 2 : undefined,
  }
}

export function getKoSpriteLayout(
  characterId,
  targetBodyHeight,
  nativeHeight,
  bounds,
  options = {},
) {
  const { standingBounds, pose } = options
  if (!targetBodyHeight) {
    return {
      wrapHeight: 0,
      wrapWidth: undefined,
      imgHeight: 0,
      imgOffsetY: 0,
      displayWidth: undefined,
    }
  }

  const standLayout =
    standingBounds?.bodyH > 0
      ? getFightSpriteLayout(standingBounds, targetBodyHeight, { characterId })
      : null

  const boxWidth = standLayout?.displayWidth ?? Math.round(targetBodyHeight * 0.72)
  const boxHeight = standLayout?.imgHeight ?? targetBodyHeight
  const imgW = bounds?.w > 0 ? bounds.w : boxWidth
  const imgH = bounds?.h > 0 ? bounds.h : boxHeight
  const hasPoseBounds = bounds?.w > 0 && bounds?.h > 0

  // Wide lying-down sprites must scale to standing height, not squeeze into standby width.
  const aspect = imgW / Math.max(1, imgH)
  const widthScale = boxWidth / Math.max(1, imgW)
  const heightScale = boxHeight / Math.max(1, imgH)
  const isWidthLimited = widthScale < heightScale
  const isHorizontalDown = hasPoseBounds && isWidthLimited && aspect >= 1.35

  let displayWidth
  let imgHeight
  if (!hasPoseBounds) {
    displayWidth = boxWidth
    imgHeight = boxHeight
  } else if (isHorizontalDown) {
    const koFootprint = getHorizontalKoFootprint(
      characterId,
      standingBounds,
      targetBodyHeight,
      boxWidth,
      boxHeight,
      aspect,
    )
    const scale = Math.min(
      koFootprint.maxWidth / Math.max(1, imgW),
      koFootprint.maxHeight / Math.max(1, imgH),
    )
    imgHeight = Math.max(1, Math.round(imgH * scale))
    displayWidth = Math.max(1, Math.round(imgW * scale))
  } else {
    let scale = Math.min(boxWidth / Math.max(1, imgW), boxHeight / Math.max(1, imgH))
    const uprightKoRatio =
      pose === 'lose' ? CHARACTER_UPRIGHT_KO_HEIGHT_RATIO[characterId] : undefined
    if (uprightKoRatio) {
      const maxKoHeight = Math.max(1, Math.round(boxHeight * uprightKoRatio))
      const scaledHeight = Math.max(1, Math.round(imgH * scale))
      if (scaledHeight > maxKoHeight) {
        scale = maxKoHeight / Math.max(1, imgH)
      }
    }
    displayWidth = Math.max(1, Math.round(imgW * scale))
    imgHeight = Math.max(1, Math.round(imgH * scale))
  }

  const wrapWidth = isHorizontalDown ? displayWidth : boxWidth
  const wrapHeight = isHorizontalDown ? imgHeight : boxHeight

  return {
    wrapWidth,
    wrapHeight,
    imgHeight,
    displayWidth,
    imgOffsetY: 0,
    overflowVisible: isHorizontalDown,
  }
}

/** @deprecated use getKoBottomPadDisplay */
export function getKoGroundOffset(characterId, displayHeight, nativeHeight) {
  return getKoBottomPadDisplay(characterId, displayHeight, nativeHeight)
}
