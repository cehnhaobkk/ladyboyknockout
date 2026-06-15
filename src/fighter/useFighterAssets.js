import { useMemo } from 'react'
import { CHARACTER_POSES, FIGHT_CHARACTERS } from './characterConfig'
import { preloadSpriteBounds } from './pixelScale'

const globalAssetCache = {}

function resolveFighterAssets(characterId) {
  const poses = CHARACTER_POSES[characterId]
  if (!poses) {
    return { assets: {}, loaded: false }
  }
  if (!globalAssetCache[characterId]) {
    globalAssetCache[characterId] = { ...poses }
  }
  return { assets: globalAssetCache[characterId], loaded: true }
}

export function useFighterAssets(characterId) {
  return useMemo(() => resolveFighterAssets(characterId), [characterId])
}

export function preloadAllFighterAssets() {
  FIGHT_CHARACTERS.forEach((charId) => {
    const poses = CHARACTER_POSES[charId]
    if (!poses || globalAssetCache[charId]) return
    globalAssetCache[charId] = { ...poses }
    Object.values(poses).forEach((src) => {
      preloadSpriteBounds(src)
      const img = new Image()
      img.src = src
    })
  })
}
