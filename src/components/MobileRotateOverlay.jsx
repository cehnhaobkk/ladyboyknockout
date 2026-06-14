import styles from './MobileRotateOverlay.module.css'

export default function MobileRotateOverlay() {
  return (
    <div className={styles.overlay} aria-hidden>
      <span className={styles.phoneEmoji}>📱</span>
      <p className={styles.rotateText}>ROTATE YOUR PHONE TO PLAY</p>
    </div>
  )
}
