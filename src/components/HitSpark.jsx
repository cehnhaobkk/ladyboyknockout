const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

export default function HitSpark({ x, y, visible }) {
  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: '60px',
        height: '60px',
        pointerEvents: 'none',
        zIndex: 100,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {SPARK_ANGLES.map((angle) => (
        <div
          key={angle}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '3px',
            height: '20px',
            background: 'linear-gradient(#ffd700, transparent)',
            transformOrigin: '50% 0%',
            transform: `rotate(${angle}deg) translateX(-50%)`,
            animation: 'sparkLine 0.25s ease-out forwards',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 0 20px #ffd700, 0 0 40px #ff8800',
          animation: 'sparkCenter 0.25s ease-out forwards',
        }}
      />
    </div>
  )
}
