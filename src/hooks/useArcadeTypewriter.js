import { useEffect, useState } from 'react'

/** Arcade-style type → hold → erase → next line. */
export function useArcadeTypewriter(
  messages,
  { charMs = 52, holdMs = 2600, eraseMs = 28, gapMs = 420 } = {},
) {
  const [lineIndex, setLineIndex] = useState(0)
  const [text, setText] = useState('')
  const [erasing, setErasing] = useState(false)

  useEffect(() => {
    const full = messages[lineIndex] ?? ''
    if (!erasing) {
      if (text.length < full.length) {
        const timer = setTimeout(() => setText(full.slice(0, text.length + 1)), charMs)
        return () => clearTimeout(timer)
      }
      const timer = setTimeout(() => setErasing(true), holdMs)
      return () => clearTimeout(timer)
    }
    if (text.length > 0) {
      const timer = setTimeout(() => setText(text.slice(0, -1)), eraseMs)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => {
      setErasing(false)
      setLineIndex((i) => (i + 1) % messages.length)
    }, gapMs)
    return () => clearTimeout(timer)
  }, [messages, lineIndex, text, erasing, charMs, holdMs, eraseMs, gapMs])

  const fullLine = messages[lineIndex] ?? ''
  const isTyping = !erasing && text.length < fullLine.length

  return { text, isTyping, showCursor: isTyping || erasing || text.length > 0 }
}
