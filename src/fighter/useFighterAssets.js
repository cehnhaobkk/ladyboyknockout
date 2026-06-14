import { useEffect, useState } from 'react'
import { CHARACTER_POSES, FIGHT_CHARACTERS } from './characterConfig'

const globalAssetCache = {}

export function useFighterAssets(characterId) {
  const [assets, setAssets] = useState(globalAssetCache[characterId] || {})
  const [loaded, setLoaded] = useState(Boolean(globalAssetCache[characterId]))

  useEffect(() => {
    const poses = CHARACTER_POSES[characterId]
    if (!poses) {
      setLoaded(true)
      return undefined
    }

    if (globalAssetCache[characterId]) {
      setAssets(globalAssetCache[characterId])
      setLoaded(true)
      return undefined
    }

    globalAssetCache[characterId] = { ...poses }
    setAssets(globalAssetCache[characterId])
    setLoaded(true)
    return undefined
  }, [characterId])

  return { assets, loaded }
}

export function preloadAllFighterAssets() {
  FIGHT_CHARACTERS.forEach((charId) => {
    const poses = CHARACTER_POSES[charId]
    if (!poses || globalAssetCache[charId]) return
    globalAssetCache[charId] = { ...poses }
    Object.values(poses).forEach((src) => {
      const img = new Image()
      img.src = src
    })
  })
}
