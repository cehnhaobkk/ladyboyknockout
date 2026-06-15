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

/** Shift KO lose poses down so fallen fighters sit on the stage floor. */
const KO_GROUND_OFFSET_RATIO = {
  dave: 0.24,
  kyle: 0.24,
  xiaoming: 0.22,
  rajesh: 0.24,
  dmitri: 0.22,
  nong_nut: 0.18,
}

export function getKoGroundOffset(characterId, displayHeight) {
  const ratio = KO_GROUND_OFFSET_RATIO[characterId] ?? 0.22
  return Math.round(displayHeight * ratio)
}
