export default function MobCharSelectPortrait({ src, alt, flipped = false }) {
  return (
    <div className={`mob-vs-portrait ${flipped ? 'is-flipped' : ''}`}>
      <img src={src} alt={alt} />
    </div>
  )
}
