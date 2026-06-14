const processedCache = new Map()

function hasTransparentPixels(imageData) {
  const data = imageData.data
  for (let i = 3; i < data.length; i += 16) {
    if (data[i] < 250) return true
  }
  return false
}

/**
 * Only process flat-black-backdrop sprites. RGBA PNGs are returned unchanged
 * so pixel edges (hair, outlines) stay identical to the source files.
 */
export function removeBlackBackground(imageSrc) {
  if (processedCache.has(imageSrc)) {
    return Promise.resolve(processedCache.get(imageSrc))
  }

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      if (hasTransparentPixels(imageData)) {
        processedCache.set(imageSrc, imageSrc)
        resolve(imageSrc)
        return
      }

      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        if (r < 24 && g < 24 && b < 24) {
          data[i + 3] = 0
        }
      }

      ctx.putImageData(imageData, 0, 0)
      const result = canvas.toDataURL('image/png')
      processedCache.set(imageSrc, result)
      resolve(result)
    }
    img.onerror = () => {
      processedCache.set(imageSrc, imageSrc)
      resolve(imageSrc)
    }
    img.src = imageSrc
  })
}

/** Clear cached canvas re-encodes after pipeline change */
export function clearProcessedAssetCache() {
  processedCache.clear()
}
