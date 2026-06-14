import { useCallback, useState } from 'react'
import styles from './TitleScreen.module.css'

const MARQUEE_TEXT =
  '⚠️ SIDE EFFECTS: BLACK EYES · BRUISED EGOS · UNEXPECTED LIFE CHOICES' +
  '\u00a0★\u00a0 NOT RESPONSIBLE FOR IDENTITY CRISES TRIGGERED DURING GAMEPLAY' +
  '\u00a0★\u00a0 THE EXPATS DIDN\'T STAND A CHANCE' +
  '\u00a0★\u00a0 INSPIRED BY TRUE EVENTS ON SUKHUMVIT SOI 11' +
  '\u00a0★\u00a0 NONG NUT DOESN\'T CARE. FIGHT ANYWAY. 👊' +
  '\u00a0★\u00a0 '

const CONTROLS = [
  { badges: ['←', '→'], label: 'Move left / right' },
  { badges: ['↑'], label: 'Jump' },
  { badges: ['↓'], label: 'Block' },
  { badges: ['J'], label: 'Punch' },
  { badges: ['K'], label: 'Kick' },
  { badges: ['L'], label: 'Special move' },
  { badges: ['I'], label: 'Fly kick' },
]

export default function TitleScreen({ onStart }) {
  const [loading, setLoading] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  const handleStart = useCallback(() => {
    if (loading) return
    setLoading(true)
    onStart()
  }, [loading, onStart])

  const openAbout = useCallback(() => setAboutOpen(true), [])
  const closeAbout = useCallback(() => setAboutOpen(false), [])

  return (
    <div className={styles.screen}>
      <div className={styles.marquee} aria-hidden>
        <div className={styles.marqueeTrack}>
          <span className={styles.marqueeText}>{MARQUEE_TEXT}</span>
          <span className={styles.marqueeText}>{MARQUEE_TEXT}</span>
        </div>
      </div>

      <div className={styles.bg} aria-hidden>
        <div className={styles.bgGlow} />
        <div className={styles.bgGrid} />
        <div className={styles.bgFloor} />
      </div>

      <div className={styles.content}>
        <div className={styles.logoWrap}>
          <img
            className={styles.logo}
            src="/assets/logo.png"
            alt="Ladyboy Knockout"
            draggable={false}
          />
        </div>

        <button
          type="button"
          className={`${styles.startBtn} ${loading ? styles.loading : ''}`}
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? '🥊 LOADING...' : 'TAP HERE TO START'}
        </button>
      </div>

      <div className={styles.chrome}>
        <button type="button" className={styles.aboutBtn} onClick={openAbout}>
          ABOUT THE GAME ▶
        </button>
        <p className={styles.advisory}>
          PG15+ — PARENTAL ADVISORY | © Made with <span className={styles.heart}>♥</span> in BKK
        </p>
      </div>
      <div
        className={`${styles.aboutOverlay} ${aboutOpen ? styles.open : ''}`}
        onClick={closeAbout}
        aria-hidden={!aboutOpen}
      />
      <aside
        className={`${styles.aboutPanel} ${aboutOpen ? styles.open : ''}`}
        aria-hidden={!aboutOpen}
        aria-label="About Ladyboy Knockout"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.closeBtn} onClick={closeAbout}>
          ✕ CLOSE
        </button>

        <div className={styles.panelBody}>
          <h1 className={styles.aboutTitle}>LADYBOY KNOCKOUT</h1>

          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>ABOUT THE GAME</h2>
            <p className={styles.sectionBody}>
              A retro arcade fighter set on the streets of Thailand. Pick your farang fighter —
              Dave the Pattaya Geezer, Kyle the Passport Bro, Xiaoming the Tour Boss, Rajesh the
              Delhi Dynamo, or Dmitri the Phuket Patriarch — then step into the ring against Nong
              Nut, the Knockout Queen.
            </p>
            <p className={styles.sectionBody}>
              Win two out of three rounds across Bangkok, Pattaya, Phuket, or Chiang Mai. Chain
              combos, land specials, and survive her signature moves. Choose your rival or let
              fate decide. They always find out the hard way. 💅
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>HOW TO PLAY</h2>
            <p className={styles.sectionBody}>
              Tap start, pick a fighter, then select a stage. Each character has unique stats,
              taunts, and a signature special. Block to reduce damage. Build combos within 1.5
              seconds for bonus hits and score.
            </p>
            <div className={styles.controls}>
              {CONTROLS.map((row) => (
                <div key={row.label} className={styles.controlRow}>
                  <div className={styles.badges}>
                    {row.badges.map((badge) => (
                      <span key={`${row.label}-${badge}`} className={styles.badge}>
                        {badge}
                      </span>
                    ))}
                  </div>
                  <span className={styles.controlLabel}>{row.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>BUY US A COFFEE</h2>
            <p className={styles.sectionBody}>
              Nong Nut fights for free. We don&apos;t. Server bills, sprite sheets, and Dave&apos;s
              emergency Singha fund add up fast. Toss a coffee our way — cheaper than a tuk-tuk
              argument at 2am, and it actually helps ship the next update.
            </p>
            <a
              className={styles.coffeeBtn}
              href="https://buymeacoffee.com/vntd"
              target="_blank"
              rel="noopener noreferrer"
            >
              ☕ BUY ME A COFFEE
            </a>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>CONTACT</h2>
            <p className={styles.sectionBody}>
              Bugs, feedback, or collab ideas? Drop us a line. We read every message between
              rounds.
            </p>
            <div className={styles.contactBlock}>
              <a className={styles.contactLink} href="mailto:hi@ladyboyknockout.com">
                hi@ladyboyknockout.com
              </a>
            </div>
            <p className={styles.version}>© LBKO All rights reserved.</p>
          </section>
        </div>
      </aside>
    </div>
  )
}
