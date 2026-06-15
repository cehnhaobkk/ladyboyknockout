/** Base arena height ratio — same for every fighter */
export const UNIFIED_FIGHTER_HEIGHT_RATIO = 0.58

/** Reference body fill used to normalize on-screen height across fighters. */
const REFERENCE_BODY_HEIGHT_RATIO = 0.838

/** Visible body height as a fraction of canvas height. */
const FIGHTER_BODY_HEIGHT_RATIO = {
  dave: 0.93,
  kyle: 0.875,
  xiaoming: 0.776,
  rajesh: 0.974,
  dmitri: 0.882,
  nong_nut: 0.93,
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
    return { w: 0, h: 0, topPad: 0, bottomPad: 0, bodyH: 0 }
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return { w, h, topPad: 0, bottomPad: 0, bodyH: h }
  }

  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, w, h).data

  let minY = h
  let maxY = -1
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3] > 10) {
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (maxY < 0) {
    return { w, h, topPad: 0, bottomPad: 0, bodyH: h }
  }

  const topPad = minY
  const bottomPad = h - 1 - maxY
  const bodyH = maxY - minY + 1

  return { w, h, topPad, bottomPad, bodyH }
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

export function getKoSpriteLayout(
  characterId,
  displayHeight,
  nativeHeight,
  bounds,
) {
  const h = nativeHeight || bounds?.h || KO_SPRITE_NATIVE_HEIGHT
  if (!displayHeight || !h) {
    return {
      wrapHeight: displayHeight || 0,
      imgHeight: displayHeight || 0,
      imgOffsetY: 0,
    }
  }

  const scale = displayHeight / h
  const bottomPad =
    bounds?.bottomPad !== undefined
      ? bounds.bottomPad
      : (KO_SPRITE_BOTTOM_PAD_PX[characterId] ?? 20)
  const topPad = bounds?.topPad ?? 0
  const bodyH = bounds?.bodyH ?? Math.max(1, h - topPad - bottomPad)

  return {
    wrapHeight: Math.max(1, Math.round(bodyH * scale)),
    imgHeight: displayHeight,
    imgOffsetY: Math.round(bottomPad * scale),
  }
}

/** @deprecated use getKoBottomPadDisplay */
export function getKoGroundOffset(characterId, displayHeight, nativeHeight) {
  return getKoBottomPadDisplay(characterId, displayHeight, nativeHeight)
}
