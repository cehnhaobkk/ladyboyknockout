function SpeakerOnIcon() {
  return (
    <svg className="fight-music-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M4 9v6h4l5 4V5L8 9H4zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
      />
    </svg>
  )
}

function SpeakerMutedIcon() {
  return (
    <svg className="fight-music-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M4 9v6h4l5 4V5L8 9H4zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        d="M5.5 5.5l13 13M18.5 5.5l-13 13"
      />
    </svg>
  )
}

export default function FightMusicToggle({ muted, onToggle, hasMusic }) {
  return (
    <button
      type="button"
      className={`fight-music-toggle ${muted ? 'is-muted' : ''} ${hasMusic ? '' : 'is-unavailable'}`}
      onClick={onToggle}
      aria-label={muted ? 'Turn fight music on' : 'Turn fight music off'}
      aria-pressed={muted}
      title={
        hasMusic
          ? muted
            ? 'Turn music on'
            : 'Turn music off'
          : 'Add public/audio/fight-music.mp3 to enable music'
      }
    >
      {muted ? <SpeakerMutedIcon /> : <SpeakerOnIcon />}
    </button>
  )
}
