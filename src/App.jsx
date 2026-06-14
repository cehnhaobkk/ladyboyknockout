import { useCallback, useEffect, useRef, useState } from 'react'
import { getStateConfig, getAiTiming, usesDaveAi, usesKyleAi } from './fighter/characterConfig'
import { preloadAllFighterAssets } from './fighter/useFighterAssets'
import Fighter from './components/Fighter'
import HitSpark from './components/HitSpark'
import MobileRotateOverlay from './components/MobileRotateOverlay'
import TouchControls from './components/TouchControls'
import TitleScreen from './screens/TitleScreen'
import useMobileLandscape from './hooks/useMobileLandscape'
import {
  getFighterVisualScale,
  UNIFIED_FIGHTER_HEIGHT_RATIO,
} from './fighter/pixelScale'
import { publicUrl } from './utils/publicUrl.js'

const PLAYER = {
  id: 'nong_nut',
  name: 'Nong Nut',
  title: 'The Knockout Queen',
  tagline: 'They always find out the hard way!',
  hp: 100,
  atk: 20,
  special: 'STILETTO STORM 💅',
  img: '/characters/nong_nut.png',
}

const ENEMIES = [
  {
    id: 'dave',
    name: 'Dave',
    title: 'The Pattaya Geezer',
    hp: 95,
    atk: 16,
    special: 'Beer Belly Bash 🍺',
    taunt: 'Been coming here 20 years, love.',
    img: '/characters/dave.png',
    mobHeadshot: '/characters/headshots/dave.png',
    color: '#e8a838',
  },
  {
    id: 'kyle',
    name: 'Kyle',
    title: 'The Passport Bro',
    hp: 90,
    atk: 19,
    special: 'Red Pill Rush 📱',
    taunt: 'I escaped the matrix, bro.',
    img: '/characters/kyle.png',
    mobHeadshot: '/characters/headshots/kyle.png',
    color: '#5b9bd5',
  },
  {
    id: 'xiaoming',
    name: 'Xiaoming',
    title: 'The Tour Group Boss',
    hp: 92,
    atk: 18,
    special: 'Selfie Stick Smash 📸',
    taunt: 'CAOOOO! Very cheap here!',
    img: '/characters/xiaoming.png',
    mobHeadshot: '/characters/headshots/xiaoming.png',
    color: '#e63946',
  },
  {
    id: 'rajesh',
    name: 'Rajesh',
    title: 'The Delhi Dynamo',
    hp: 88,
    atk: 17,
    special: 'Curry Cyclone 🌶️',
    taunt: 'Can I get WhatsApp number?',
    img: '/characters/rajesh.png',
    mobHeadshot: '/characters/headshots/rajesh.png',
    color: '#f4a261',
  },
  {
    id: 'dmitri',
    name: 'Dmitri',
    title: 'The Phuket Patriarch',
    hp: 110,
    atk: 23,
    special: 'Vodka Volley 🥃',
    taunt: 'I buy this bar. I buy YOU.',
    img: '/characters/dmitri.png',
    mobHeadshot: '/characters/headshots/dmitri.png',
    color: '#9b59b6',
  },
]

const GAME_OVER_POSES = {
  dave: {
    win: '/characters/dave/06_DV_Win.png',
    lose: '/characters/dave/07_DV_lose.png',
  },
  kyle: {
    win: '/characters/kyle/6__KY_win.png',
    lose: '/characters/kyle/7_KY_lose.png',
  },
  xiaoming: {
    win: '/characters/xiaoming/7_xm_win.png',
    lose: '/characters/xiaoming/6_xm_lost.png',
  },
  rajesh: {
    win: '/characters/rajesh/6_RJ_win.png',
    lose: '/characters/rajesh/5_RJ_lose.png',
  },
  dmitri: {
    win: '/characters/dmitri/6_DM_win.png',
    lose: '/characters/dmitri/7_DM_lose.png',
  },
  nong_nut: {
    win: '/characters/nong_nut/5_NN_win.png',
    lose: '/characters/nong_nut/6_NN_lose.png',
  },
}

function getGameOverPose(fighterId, won) {
  const poses = GAME_OVER_POSES[fighterId]
  if (!poses) return publicUrl(`/characters/${fighterId}.png`)
  return won ? poses.win : poses.lose
}

function getFunnyLine(fighterId, won) {
  const lines = {
    dave: {
      win: 'Dave wins the fight — loses his wallet 20 minutes later, still calls it a great night.',
      lose: 'Dave is still on the floor. He thinks he slipped on Singha.',
    },
    kyle: {
      win: "Kyle is now undefeated in Thailand. Still can't get a date back home.",
      lose: "Kyle's phone is cracked. His ego is worse.",
    },
    xiaoming: {
      win: 'Xiaoming wins, checks his phone — 47 missed calls from the tour group, he does not care.',
      lose: 'The selfie stick did not help. The fanny pack did not help either.',
    },
    rajesh: {
      win: 'Rajesh got the number and the victory. Very good day.',
      lose: 'Rajesh is calling his mother. She is very disappointed.',
    },
    dmitri: {
      win: 'Dmitri bought the arena. He is renaming it after himself.',
      lose: 'Impossible. Dmitri blames the vodka. All 3 bottles.',
    },
  }
  if (!won) {
    return lines[fighterId]?.lose || 'Never try, never know. Now you know. Bye. 💅'
  }
  return lines[fighterId]?.win || 'Victory! Thailand remembers this day.'
}

function getScoreLabel(score) {
  if (score > 5000) return 'WORTHY OPPONENT 🙏'
  if (score > 3000) return 'IMPRESSIVE MOVES'
  if (score > 1500) return 'SOLID EFFORT'
  if (score > 500) return 'NOT BAD FOR A FARANG'
  return 'TOURIST PERFORMANCE'
}

/** Street Fighter–style shuffle indices, ending on finalIndex */
function buildShuffleSequence(itemCount, finalIndex) {
  const n = itemCount
  const sequence = []
  for (let i = 0; i < 26; i++) {
    sequence.push(Math.floor(Math.random() * n))
  }
  for (let i = 0; i < n; i++) {
    sequence.push(i)
  }
  for (let k = 3; k >= 0; k--) {
    sequence.push((finalIndex - k + n) % n)
  }
  sequence.push(finalIndex)
  return sequence
}

function buildFateShuffleSequence(finalIndex) {
  return buildShuffleSequence(ENEMIES.length, finalIndex)
}

function getFateStepDelay(stepIndex, totalSteps) {
  const t = stepIndex / Math.max(1, totalSteps - 1)
  if (t < 0.55) return 52
  if (t < 0.78) return 88
  if (t < 0.92) return 130
  return 200 + Math.floor((t - 0.92) * 600)
}

function GameOverScreen({
  result,
  playerFighter,
  score,
  onRematch,
  onNewFight,
  stageBg,
}) {
  const overlayRef = useRef(null)
  const playerWon = result === 'win'
  const scoreLabel = getScoreLabel(score)
  const winnerPoseImg = playerWon
    ? getGameOverPose(playerFighter.id, true)
    : getGameOverPose('nong_nut', true)
  const winnerName = playerWon ? playerFighter.name.toUpperCase() : 'NONG NUT'

  useEffect(() => {
    overlayRef.current?.scrollTo(0, 0)
  }, [])

  return (
    <div className="gameover-overlay" ref={overlayRef}>
      <div className="gameover-bg" aria-hidden>
        <img src={stageBg} alt="" />
      </div>
      <div className="gameover-scrim" aria-hidden />
      <div className="gameover-content">
        {playerWon ? (
          <>
            <div className="go-headline go-headline-win">YOU WIN!</div>
            <div className="go-score">SCORE: {score.toLocaleString()}</div>
            <div className="go-score-label">{scoreLabel}</div>
            <div className="go-message">{getFunnyLine(playerFighter.id, true)}</div>
          </>
        ) : (
          <>
            <div className="go-headline go-headline-lose">NONG NUT WINS! 💅</div>
            <div className="go-message go-message-lose">&ldquo;{PLAYER.tagline}&rdquo;</div>
          </>
        )}
        <img
          className="go-pose"
          src={winnerPoseImg}
          alt={winnerName}
          onError={(e) => {
            e.currentTarget.src = playerWon
              ? playerFighter.img || publicUrl(`/characters/${playerFighter.id}.png`)
              : PLAYER.img
          }}
        />
        <div className="go-actions">
          <button type="button" className="go-btn go-btn-rematch" onClick={onRematch}>
            REMATCH
          </button>
          <button type="button" className="go-btn go-btn-new" onClick={onNewFight}>
            NEW FIGHT
          </button>
        </div>
      </div>
    </div>
  )
}

const STAGES = [
  { id: 'bangkok', name: 'Bangkok', subtitle: 'Chao Phraya Rumble', img: '/stages/Bangkok.png' },
  { id: 'pattaya', name: 'Pattaya', subtitle: 'Walking Street Warfare', img: '/stages/Pattaya.png' },
  { id: 'phuket', name: 'Phuket', subtitle: 'Phuket Fight Club', img: '/stages/Phuket.png' },
  { id: 'chiangmai', name: 'Chiang Mai', subtitle: 'Lantern Festival Brawl', img: '/stages/Changmai.png' },
]

PLAYER.img = publicUrl(PLAYER.img)
ENEMIES.forEach((enemy) => {
  enemy.img = publicUrl(enemy.img)
  enemy.mobHeadshot = publicUrl(enemy.mobHeadshot)
})
Object.values(GAME_OVER_POSES).forEach((poses) => {
  poses.win = publicUrl(poses.win)
  poses.lose = publicUrl(poses.lose)
})
STAGES.forEach((stage) => {
  stage.img = publicUrl(stage.img)
})

/** Stage ground anchor; lowered ~15pp so fighters sit closer to the floor */
const STAGE_GROUND_BOTTOM = {
  bangkok: '5%',
  pattaya: '2%',
  phuket: '7%',
  chiangmai: '3%',
}

/** Extra top inset for sprites with tall hair / headroom in the PNG */
const FIGHTER_TOP_PADDING = {
  nong_nut: 24,
}

const FIGHTER_MAX_HEIGHT = 220
const ARENA_TOP_PADDING = 12
/** Player-side fighter renders 10% smaller than enemy for visual balance. */
const PLAYER_FIGHTER_SCALE = 0.9

function parseGroundPercent(groundBottomPercent) {
  const s = String(groundBottomPercent)
  if (s.endsWith('%')) return parseFloat(s) / 100
  return parseFloat(s) || 0.18
}

/** Max sprite height that fits from stage ground to top of arena (standing) */
function getMaxFighterHeight(arenaH, groundBottomPercent, characterId) {
  const groundPx = arenaH * parseGroundPercent(groundBottomPercent)
  const headroom = ARENA_TOP_PADDING + (FIGHTER_TOP_PADDING[characterId] ?? 0)
  return Math.floor(arenaH - groundPx - headroom)
}

function getFighterHeightForCharacter(characterId, arenaH, groundBottomPercent) {
  const desired = Math.floor(arenaH * UNIFIED_FIGHTER_HEIGHT_RATIO)
  const maxFit = getMaxFighterHeight(arenaH, groundBottomPercent, characterId)
  const capped = Math.max(80, Math.min(desired, maxFit, FIGHTER_MAX_HEIGHT))
  const visualScale = getFighterVisualScale(characterId)
  return Math.max(80, Math.round(capped * visualScale))
}

const FIGHT_SPRITE_ASPECT = 506 / 456

/** Hitbox width from display height and sprite aspect (506×456 fight sprites) */
function getSpriteWidthForCharacter(_characterId, displayHeight) {
  return Math.round(displayHeight * FIGHT_SPRITE_ASPECT)
}

function getUnifiedFightHeight(arenaH, groundBottomPercent, playerId, enemyId) {
  const desired = Math.floor(arenaH * UNIFIED_FIGHTER_HEIGHT_RATIO)
  const maxFit = Math.min(
    getMaxFighterHeight(arenaH, groundBottomPercent, playerId),
    getMaxFighterHeight(arenaH, groundBottomPercent, enemyId),
  )
  return Math.max(80, Math.min(desired, maxFit, FIGHTER_MAX_HEIGHT))
}

function computeFighterSizes(arenaH, groundBottomPercent, playerId, enemyId) {
  const baseHeight = getUnifiedFightHeight(arenaH, groundBottomPercent, playerId, enemyId)
  const playerFighterHeight = Math.max(
    80,
    Math.round(baseHeight * getFighterVisualScale(playerId) * PLAYER_FIGHTER_SCALE),
  )
  const enemyFighterHeight = Math.max(
    80,
    Math.round(baseHeight * getFighterVisualScale(enemyId)),
  )
  const playerSpriteW = getSpriteWidthForCharacter(playerId, playerFighterHeight)
  const enemySpriteW = getSpriteWidthForCharacter(enemyId, enemyFighterHeight)
  return {
    playerFighterHeight,
    enemyFighterHeight,
    playerSpriteW,
    enemySpriteW,
    spriteW: Math.max(playerSpriteW, enemySpriteW),
  }
}

const PUNCH_RANGE = 120
const KICK_RANGE = 135
const SPECIAL_RANGE = 145
const COMBO_WINDOW_MS = 1500
const COMBO_MULT = 1.45
const COMBO_MIN_HITS = 3
const GRAVITY = 0.55
const MOVE_SPEED = 4.2
const JUMP_VEL = 11.5
const BACKFLIP_VEL_X = 6.5
const BACKFLIP_VEL_Y = 12
const FRICTION = 0.82
const SPRITE_W = 176
const HITBOX_PAD = 24
const ROUND_TIME = 60

const ATTACK_STATES = ['PUNCH', 'KICK', 'FLYKICK', 'SPECIAL', 'DODGE']

function scheduleAttack(f, side, characterId, attackState, now) {
  const config = getStateConfig(characterId, attackState)
  const duration = config.duration || 350
  const lockKey = side === 'player' ? 'playerAttackLock' : 'enemyAttackLock'
  const pendingKey = side === 'player' ? 'pendingPlayerHit' : 'pendingEnemyHit'
  f[lockKey] = now + duration
  if (config.hitFrame != null) {
    const isSpecial = Boolean(config.isSpecial)
    f[pendingKey] = {
      t: now + config.hitFrame,
      type: attackState.toLowerCase(),
      range: config.range || PUNCH_RANGE,
      sp: isSpecial,
      characterId,
    }
  }
  return duration
}

function randRange(a, b) {
  return a + Math.random() * (b - a)
}

function rollDamage(atk, isSpecial) {
  const base = atk * randRange(0.6, 1.3)
  if (isSpecial) return base * randRange(1.5, 2.5)
  return base
}

function getEnemyById(id) {
  return ENEMIES.find((e) => e.id === id) || ENEMIES[0]
}

function getFighterById(id) {
  if (id === PLAYER.id) return PLAYER
  return getEnemyById(id)
}

function createFightState(playerId, stageId) {
  const playerFighter = getFighterById(playerId)
  return {
    playerId,
    enemyId: PLAYER.id,
    stageId,
    arenaW: 800,
    arenaH: 600,
    groundBottomPercent: '18%',
    playerFighterHeight: 200,
    enemyFighterHeight: 200,
    playerSpriteW: SPRITE_W,
    enemySpriteW: SPRITE_W,
    spriteW: SPRITE_W,
    playerHitFlashUntil: 0,
    enemyHitFlashUntil: 0,
    px: 180,
    py: 0,
    pvx: 0,
    pvy: 0,
    ex: 520,
    ey: 0,
    evx: 0,
    evy: 0,
    php: playerFighter.hp,
    pmax: playerFighter.hp,
    ehp: PLAYER.hp,
    emax: PLAYER.hp,
    playerAnim: 'idle',
    enemyAnim: 'idle',
    playerAnimUntil: 0,
    enemyAnimUntil: 0,
    round: 1,
    pw: 0,
    ew: 0,
    timeLeft: ROUND_TIME,
    roundActive: true,
    roundEndAt: 0,
    matchOver: false,
    matchWinner: null,
    lastHitOnEnemy: 0,
    playerCombo: 0,
    lastHitOnPlayer: 0,
    enemyCombo: 0,
    battleMsg: '',
    battleMsgUntil: 0,
    shakeUntil: 0,
    flashUntil: 0,
    score: 0,
    comboBonusHits: 0,
    damageNumbers: [],
    dnId: 1,
    aiNextThink: 0,
    aiNextAttack: 0,
    playerAttackLock: 0,
    enemyAttackLock: 0,
    pendingPlayerHit: null,
    pendingEnemyHit: null,
    playerInvuln: 0,
    enemyInvuln: 0,
    playerFacing: 1,
    enemyFacing: -1,
    enemyCharging: false,
    enemyChargeUntil: 0,
    playerCharging: false,
    playerChargeUntil: 0,
    playerBlocking: false,
    hurtSpark: null,
  }
}

const css = `
:root {
  --bg: #080010;
  --neon-pink: #ff2ea6;
  --neon-cyan: #4df9ff;
  --neon-gold: #ffd700;
}
body {
  font-family: 'Press Start 2P', monospace;
  background: var(--bg);
  color: #eee;
  min-height: 100vh;
  overflow-x: hidden;
}
#root { min-height: 100vh; }
.scanlines {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0,0,0,0.12),
    rgba(0,0,0,0.12) 1px,
    transparent 1px,
    transparent 3px
  );
  mix-blend-mode: overlay;
}
.neon-title {
  text-shadow: 0 0 8px var(--neon-pink), 0 0 16px #ff00ff, 0 0 24px #a020f0;
}
.blink {
  animation: blink 0.9s step-end infinite;
}
@keyframes blink {
  50% { opacity: 0; }
}
.screen {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.menu-dark {
  background: var(--bg);
  min-height: 100vh;
  min-height: 100dvh;
  padding: 1rem;
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  position: relative;
}
.char-select-screen,
.stage-select-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: clamp(3rem, 10vh, 6rem);
  padding-bottom: 2rem;
}
.char-select-screen .char-select-title {
  font-size: clamp(0.72rem, 3.25vw, 1.1rem);
  text-align: center;
}
.char-select-screen .char-select-subtitle {
  text-align: center;
  margin-top: 0.75rem;
  font-size: 0.52rem;
  line-height: 1.7;
  opacity: 0.85;
}
.char-select-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex-shrink: 0;
}
.char-select-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.char-select-body .vs-row {
  order: 1;
}
.char-select-body .enemy-grid {
  order: 2;
}
.stage-select-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.stage-select-subtitle {
  display: none;
}
.enemy-card-random {
  display: none;
}
.mob-advance-banner,
.mob-back-link {
  display: none;
}
.mob-char-select {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  max-height: 100dvh;
  min-height: 0;
  overflow: hidden;
  padding: max(0.4rem, env(safe-area-inset-top)) max(0.55rem, env(safe-area-inset-right))
    max(0.4rem, env(safe-area-inset-bottom)) max(0.55rem, env(safe-area-inset-left));
  gap: 0.35rem;
  box-sizing: border-box;
  text-align: center;
}
.mob-char-top {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  position: relative;
  flex-shrink: 0;
  width: 100%;
  padding-top: 10px;
}
.mob-char-top .stage-select-title,
.mob-stage-top .stage-select-title {
  margin: 0;
  font-size: clamp(0.42rem, 2.8vh, 0.55rem);
  line-height: 1.35;
  text-align: center;
}
.mob-char-top .stage-select-title {
  grid-column: 1;
  grid-row: 1;
  justify-self: center;
  min-width: 0;
}
.mob-char-top .mob-back-link {
  grid-column: 1;
  grid-row: 1;
  justify-self: start;
  position: static;
  transform: none;
  z-index: 1;
}
.mob-char-top .mob-back-link,
.mob-stage-top .mob-back-link {
  display: block;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  flex-shrink: 0;
  margin: 0;
  font-size: calc(clamp(0.3rem, 1.8vh, 0.36rem) + 2px);
  color: #666;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  padding: 0.1rem;
  white-space: nowrap;
}
.mob-char-top .mob-back-link:hover,
.mob-stage-top .mob-back-link:hover {
  color: #999;
}
.mob-vs {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: clamp(0.5rem, 2.5vw, 1.25rem);
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  margin-top: -55px;
  padding: 0.25rem 0;
  box-sizing: border-box;
}
.mob-picker-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  margin-top: -80px;
  gap: 0.12rem;
  box-sizing: border-box;
}
.mob-picker {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: center;
  gap: clamp(0.2rem, 1.2vw, 0.35rem);
  flex-shrink: 0;
  width: 100%;
  margin-top: 0;
  padding: 0.15rem 0 0.1rem;
  box-sizing: border-box;
}
.mob-picker-cell {
  flex: 1 1 0;
  min-width: 0;
  max-width: min(12vw, 58px);
  aspect-ratio: 1;
  border: 2px solid #333;
  background: #000;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  border-radius: 3px;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.mob-picker-cell:disabled {
  cursor: default;
  opacity: 0.7;
}
.mob-picker-cell.selected,
.mob-picker-cell.fate-locked {
  border-color: var(--neon-pink);
  box-shadow: 0 0 10px rgba(255, 46, 166, 0.75);
}
.mob-picker-cell.fate-active {
  border-color: var(--neon-gold);
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.85);
}
.mob-picker-headshot {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: block;
}
.mob-picker-headshot img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  display: block;
  image-rendering: pixelated;
}
.mob-picker-random {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.75rem, 4vh, 1.1rem);
  color: rgba(255, 255, 255, 0.55);
  border-style: dashed;
  background: rgba(255, 255, 255, 0.04);
}
.mob-vs-slot {
  flex: 1 1 0;
  min-width: 0;
  width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  gap: clamp(0.1rem, 0.8vh, 0.25rem);
  box-sizing: border-box;
}
.mob-vs-enemy {
  justify-content: center;
  align-items: center;
  padding: 0.15rem;
}
.mob-vs-enemy:not(.has-pick) {
  background: none;
  border: none;
  box-shadow: none;
  min-height: 0;
  justify-content: center;
}
.mob-vs-enemy.has-pick {
  justify-content: center;
  gap: clamp(0.1rem, 0.8vh, 0.25rem);
}
.mob-vs-figure {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  min-height: min(52.8vh, 52.8dvh, 220px);
}
.mob-vs-enemy .mob-vs-meta {
  min-height: clamp(2.35rem, 10.5vh, 3rem);
  justify-content: flex-start;
}
.mob-vs-placeholder-figure {
  align-items: flex-end;
}
.mob-vs-placeholder-q {
  font-size: clamp(1.75rem, 11vh, 3rem);
  color: rgba(255, 255, 255, 0.28);
  line-height: 1;
  font-family: inherit;
}
.mob-vs-figure img {
  width: auto;
  max-width: 100%;
  max-height: min(52.8vh, 52.8dvh, 220px);
  height: auto;
  image-rendering: pixelated;
  filter: drop-shadow(0 0 10px rgba(255, 0, 200, 0.45));
}
.mob-vs-meta {
  flex: 0 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.mob-vs-champ {
  padding: 0.15rem;
}
.mob-vs-label {
  flex: 0 0 auto;
  align-self: center;
  font-size: clamp(0.85rem, 5.5vh, 1.35rem);
  color: var(--neon-pink);
  padding-bottom: 0;
}
.mob-vs-placeholder {
  font-size: clamp(0.34rem, 2.2vh, 0.44rem);
  opacity: 0.55;
  line-height: 1.5;
  padding: 0;
  margin: 0;
}
.mob-vs-name {
  font-size: clamp(0.42rem, 2.6vh, 0.54rem);
  margin: 0;
  color: #fff;
  line-height: 1.2;
  text-align: center;
  width: 100%;
}
.mob-vs-tagline {
  font-size: clamp(0.36rem, 2.1vh, 0.46rem);
  margin: 0.05rem 0 0;
  color: var(--neon-cyan);
  line-height: 1.25;
  text-align: center;
  width: 100%;
}
.mob-vs-desc {
  font-size: calc(clamp(0.32rem, 1.85vh, 0.4rem) + 1px);
  margin: 0.08rem auto 0;
  color: #fff;
  line-height: 1.3;
  width: 100%;
  max-width: 100%;
  white-space: nowrap;
  opacity: 0.92;
  text-align: center;
}
.mob-char-select .mob-advance-banner {
  display: block;
  flex-shrink: 0;
  text-align: center;
  font-size: clamp(0.34rem, 2vh, 0.42rem);
  color: var(--neon-gold);
  letter-spacing: 0.08em;
  animation: blink 0.7s step-end infinite;
  margin: 0;
  width: 100%;
  line-height: 1.35;
  min-height: 1.35em;
}
.mob-advance-banner--hidden {
  visibility: hidden;
  animation: none;
}
.mob-stage-select {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  max-height: 100dvh;
  min-height: 0;
  overflow: hidden;
  padding: max(0.4rem, env(safe-area-inset-top)) max(0.55rem, env(safe-area-inset-right))
    max(0.4rem, env(safe-area-inset-bottom)) max(0.55rem, env(safe-area-inset-left));
  gap: 0.35rem;
  box-sizing: border-box;
  text-align: center;
}
.mob-stage-top {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 0.5rem;
  flex-shrink: 0;
  width: 100%;
  padding-top: 10px;
}
.mob-stage-top .stage-select-subtitle {
  display: block;
  margin: 0.12rem 0 0;
  font-size: clamp(0.3rem, 1.9vh, 0.38rem);
  color: var(--neon-cyan);
  opacity: 0.85;
  line-height: 1.35;
  text-align: center;
}
.mob-stage-grid {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 88%;
  width: 88%;
  max-width: 88%;
  margin: 0 auto;
  align-self: center;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: clamp(0.25rem, 1vh, 0.35rem);
  overflow: hidden;
}
.mob-stage-card {
  position: relative;
  border: 2px solid #333;
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  background: #120018;
  font-family: inherit;
  min-height: 0;
  height: 100%;
  width: 100%;
  aspect-ratio: auto;
  border-radius: 3px;
}
.mob-stage-card.stage-card {
  aspect-ratio: auto;
  height: 100%;
  border-width: 2px;
}
.mob-stage-card.selected,
.mob-stage-card.fate-active {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 12px rgba(77, 249, 255, 0.45);
}
.mob-stage-card img {
  width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: cover;
  display: block;
}
.mob-stage-card .stage-label {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.25rem 0.35rem;
  font-size: calc(clamp(0.3rem, 1.8vh, 0.38rem) + 2px);
}
.char-select-screen .vs-row {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: clamp(2rem, 5vw, 4rem);
  flex-wrap: wrap;
  margin: 2.25rem 0 2.75rem;
  width: 100%;
  max-width: 936px;
}
.char-select-screen .vs-row .vs-big {
  font-size: clamp(2.535rem, 6.76vw, 4.225rem);
}
.char-select-screen .vs-row .char-name {
  font-size: 0.7605rem;
}
.char-select-screen .vs-row .char-title,
.char-select-screen .vs-row .char-taunt {
  font-size: 0.5915rem;
  white-space: nowrap;
}
.char-select-screen .vs-row .char-tagline {
  font-size: 0.5915rem;
}
.char-select-screen .vs-row .char-tagline-secondary {
  font-size: 0.546rem;
}
.char-select-screen .vs-row .char-placeholder {
  font-size: 0.676rem;
}
.char-select-screen .vs-big {
  font-size: clamp(1.95rem, 5.2vw, 3.25rem);
  color: var(--neon-pink);
  align-self: center;
}
.char-select-screen .char-side {
  text-align: center;
  min-width: min(36vw, 260px);
}
.char-select-screen .char-side img {
  width: min(34vw, 234px);
  height: auto;
  image-rendering: pixelated;
  filter: drop-shadow(0 0 14px rgba(255,0,200,0.55));
  transition: width 0.2s ease, filter 0.2s ease;
}
.char-select-screen .char-side.player-side img {
  width: min(38vw, 272px);
}
.char-select-screen .char-side.enemy-side {
  min-height: min(38vw, 272px);
}
.char-select-screen .char-side.enemy-side img {
  width: min(38vw, 272px);
}
.char-select-screen .char-side.enemy-side.selected img {
  width: min(38vw, 272px);
}
.char-select-screen .char-name {
  font-size: 0.585rem;
  margin-top: 0.65rem;
  color: #fff;
}
.char-select-screen .char-tagline,
.char-select-screen .char-title {
  font-size: 0.455rem;
  margin-top: 0.45rem;
  color: var(--neon-cyan);
  line-height: 1.7;
}
.char-select-screen .char-tagline-secondary {
  font-size: 0.42rem;
  margin-top: 0.38rem;
  color: var(--neon-cyan);
  line-height: 1.75;
}
.char-select-screen .char-taunt {
  font-size: 0.455rem;
  margin-top: 0.45rem;
  color: var(--neon-cyan);
  line-height: 1.7;
  max-width: 260px;
  margin-left: auto;
  margin-right: auto;
}
.char-select-screen .char-placeholder {
  font-size: 0.52rem;
  opacity: 0.6;
  min-height: min(38vw, 272px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.char-select-screen .char-select-actions {
  text-align: center;
  margin-top: 1.75rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
  gap: 0.35rem;
}
.char-select-screen .char-select-actions .btn {
  font-size: 0.715rem;
  padding: 0.85rem 1.45rem;
  min-width: 11.5rem;
  box-sizing: border-box;
}
.char-select-screen .char-select-actions .back-link {
  font-size: 0.455rem;
  flex-basis: 100%;
  width: 100%;
}
.char-select-screen .enemy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1rem;
  max-width: 728px;
  margin: 0 auto;
  width: 100%;
}
.char-select-screen .enemy-card {
  border: 3px solid #333;
  padding: 0.45rem;
  cursor: pointer;
  background: #120018;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.char-select-screen .enemy-card:hover {
  border-color: #d257ff;
}
.char-select-screen .enemy-card.selected {
  border-color: var(--neon-pink);
  box-shadow: 0 0 16px rgba(255, 46, 166, 0.85), inset 0 0 14px rgba(255, 46, 166, 0.35);
}
.char-select-screen .enemy-grid.fate-shuffling .enemy-card {
  opacity: 0.4;
  transition: opacity 0.05s, border-color 0.05s, box-shadow 0.05s, transform 0.05s;
}
.char-select-screen .enemy-grid.fate-shuffling .enemy-card.fate-active {
  opacity: 1;
  border-color: var(--neon-gold);
  box-shadow: 0 0 22px rgba(255, 215, 0, 0.95), inset 0 0 12px rgba(255, 200, 0, 0.35);
  transform: scale(1.06);
  animation: fateCardPulse 0.12s steps(2) infinite;
}
.char-select-screen .enemy-card.fate-locked {
  animation: fateLand 0.45s ease-out;
  border-color: var(--neon-pink);
  box-shadow: 0 0 24px rgba(255, 46, 166, 1), inset 0 0 16px rgba(255, 46, 166, 0.45);
}
@keyframes fateCardPulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.35); }
}
@keyframes fateLand {
  0% { transform: scale(1.12); filter: brightness(1.5); }
  60% { transform: scale(1.04); }
  100% { transform: scale(1); filter: brightness(1); }
}
.char-side.enemy-side.fate-rolling img {
  animation: fatePortraitShuffle 0.1s steps(2) infinite;
}
.char-side.enemy-side.fate-locked img {
  animation: fatePortraitLand 0.5s ease-out;
}
@keyframes fatePortraitShuffle {
  0% { transform: translateX(-3px); filter: brightness(1.1); }
  50% { transform: translateX(3px); filter: brightness(1.25); }
  100% { transform: translateX(-3px); filter: brightness(1.1); }
}
@keyframes fatePortraitLand {
  0% { transform: scale(1.08); filter: brightness(1.4); }
  100% { transform: scale(1); filter: brightness(1); }
}
.fate-status {
  font-size: 0.5rem;
  color: var(--neon-gold);
  letter-spacing: 3px;
  margin-top: 0.35rem;
  animation: blink 0.35s step-end infinite;
}
.char-select-screen .enemy-card img {
  width: 100%;
  height: auto;
  image-rendering: pixelated;
  display: block;
}
.char-select-screen .enemy-card-name {
  font-size: 0.455rem;
  margin-top: 0.35rem;
}
.stage-select-screen .stage-select-title {
  font-size: clamp(0.72rem, 3.25vw, 1.1rem);
  text-align: center;
}
.stage-select-screen .stage-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  max-width: 936px;
  margin: 2.25rem auto 0;
  width: 100%;
  padding: 0 0.5rem;
}
.stage-select-screen .stage-card {
  position: relative;
  border: 3px solid #333;
  cursor: pointer;
  overflow: hidden;
  aspect-ratio: 16/10;
  padding: 0;
  background: #120018;
  font-family: inherit;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
}
.stage-select-screen .stage-card:hover,
.stage-select-screen .stage-card.selected {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 16px rgba(77,249,255,0.45);
  transform: scale(1.03);
}
.stage-select-screen .stage-grid.fate-shuffling .stage-card {
  opacity: 0.35;
  transition: opacity 0.05s, border-color 0.05s, box-shadow 0.05s, transform 0.05s;
}
.stage-select-screen .stage-grid.fate-shuffling .stage-card.fate-active {
  opacity: 1;
  border-color: var(--neon-gold);
  box-shadow: 0 0 24px rgba(255, 215, 0, 0.9), inset 0 0 10px rgba(255, 200, 0, 0.3);
  transform: scale(1.05);
  animation: fateCardPulse 0.12s steps(2) infinite;
  z-index: 2;
}
.stage-select-screen .stage-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.stage-select-screen .stage-label {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.65rem 0.78rem;
  font-size: calc(0.585rem + 2px);
  color: #fff;
  text-shadow: 0 0 6px rgba(0,0,0,0.9), 1px 1px 0 #000;
  background: linear-gradient(135deg, rgba(0,0,0,0.75), transparent);
  pointer-events: none;
}
.stage-select-screen .char-select-actions {
  text-align: center;
  margin-top: 1.75rem;
}
.stage-select-screen .btn {
  font-size: 0.715rem;
  padding: 0.85rem 1.45rem;
}
.vs-row {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: clamp(1.5rem, 4vw, 3rem);
  flex-wrap: wrap;
  margin: 2rem 0 2.5rem;
  width: 100%;
  max-width: 720px;
}
.vs-big {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  color: var(--neon-pink);
  align-self: center;
  neon-title: 1;
}
.char-side {
  text-align: center;
  min-width: min(28vw, 200px);
}
.char-side img {
  width: min(28vw, 180px);
  height: auto;
  image-rendering: pixelated;
  filter: drop-shadow(0 0 12px rgba(255,0,200,0.5));
}
.char-name {
  font-size: 0.45rem;
  margin-top: 0.5rem;
  color: #fff;
}
.char-tagline,
.char-title {
  font-size: 0.35rem;
  margin-top: 0.35rem;
  color: var(--neon-cyan);
  line-height: 1.7;
}
.char-taunt {
  font-size: 0.35rem;
  margin-top: 0.35rem;
  color: var(--neon-cyan);
  line-height: 1.7;
  white-space: nowrap;
  margin-left: auto;
  margin-right: auto;
}
.char-placeholder {
  font-size: 0.4rem;
  opacity: 0.6;
  min-height: min(28vw, 180px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.char-select-actions {
  text-align: center;
  margin-top: 1.5rem;
}
.back-link {
  display: block;
  margin: 1rem auto 0;
  font-size: calc(0.35rem + 2px);
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-decoration: underline;
}
.back-link:hover {
  color: #ccc;
}
.enemy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.75rem;
  max-width: 560px;
  margin: 0 auto;
}
.enemy-card {
  border: 3px solid #333;
  padding: 0.35rem;
  cursor: pointer;
  background: #120018;
  transition: border-color 0.15s, transform 0.15s;
}
.enemy-card:hover, .enemy-card.selected {
  border-color: var(--neon-pink);
  transform: scale(1.03);
}
.enemy-card img {
  width: 100%;
  height: auto;
  image-rendering: pixelated;
  display: block;
}
.stage-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  max-width: 720px;
  margin: 2rem auto 0;
  width: 100%;
}
.stage-card {
  position: relative;
  border: 3px solid #333;
  cursor: pointer;
  overflow: hidden;
  aspect-ratio: 16/10;
  padding: 0;
  background: #120018;
  font-family: inherit;
}
.stage-card:hover, .stage-card.selected {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 12px rgba(77,249,255,0.4);
}
.stage-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.stage-label {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.5rem 0.6rem;
  font-size: calc(0.45rem + 2px);
  color: #fff;
  text-shadow: 0 0 6px rgba(0,0,0,0.9), 1px 1px 0 #000;
  background: linear-gradient(135deg, rgba(0,0,0,0.75), transparent);
  pointer-events: none;
}
.btn {
  font-family: inherit;
  font-size: 0.55rem;
  padding: 0.75rem 1.25rem;
  border: 3px solid var(--neon-cyan);
  background: #1a0028;
  color: #fff;
  cursor: pointer;
  margin: 0.35rem;
}
.btn:hover { background: #2a1040; }
.btn-primary {
  border-color: var(--neon-pink);
  color: var(--neon-pink);
}
.fight-arena {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #000;
  height: 100vh;
  height: 100dvh;
  touch-action: none;
}
.fight-stage {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.fight-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  z-index: 35;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: rgba(255,255,255,0.35);
  letter-spacing: 2px;
  line-height: 2.2;
  pointer-events: none;
  text-shadow: 0 1px 4px rgba(0,0,0,0.9);
}
.fight-bg {
  position: absolute;
  inset: 0;
}
.fight-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ground-tint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 30%;
  background: linear-gradient(to top, rgba(0,0,0,0.65), transparent);
  pointer-events: none;
}
.fight-hud {
  flex-shrink: 0;
  height: 60px;
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem max(0.75rem, env(safe-area-inset-left)) 0.35rem max(0.75rem, env(safe-area-inset-right));
  padding-top: max(0.35rem, env(safe-area-inset-top));
  font-size: 0.45rem;
  background: linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0.5));
  border-bottom: 1px solid #1a1a2e;
  box-sizing: border-box;
}
.hud-side { display: flex; flex-direction: column; gap: 0.2rem; }
.hud-side.right { align-items: flex-end; }
.hud-bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  max-width: 240px;
}
.hud-side.right .hud-bar-row { flex-direction: row-reverse; }
.hud-portrait {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--neon-pink);
  image-rendering: pixelated;
}
.hud-portrait.enemy {
  border-color: #faa;
}
.bar-wrap {
  flex: 1;
  min-width: 0;
  height: 20px;
  border: 2px solid #fff;
  background: #222;
}
.bar-fill {
  height: 100%;
  transition: width 0.08s linear, background 0.2s;
}
.bar-fill.high { background: linear-gradient(90deg, #0a0, #4f4); }
.bar-fill.mid { background: linear-gradient(90deg, #a60, #fc4); }
.bar-fill.low { background: linear-gradient(90deg, #800, #f44); }
.pips {
  display: flex;
  gap: 4px;
}
.pip {
  width: 12px;
  height: 12px;
  border: 2px solid #888;
  border-radius: 2px;
}
.pip.on {
  background: var(--neon-gold);
  border-color: var(--neon-gold);
  box-shadow: 0 0 8px gold;
}
.timer-box {
  text-align: center;
  color: var(--neon-cyan);
  text-shadow: 0 0 6px #0ff;
}
.timer-value {
  font-size: clamp(20px, 4vw, 32px);
  line-height: 1;
  font-family: 'Press Start 2P', monospace;
}
.timer-value.urgent {
  animation: timerTick 0.8s ease-in-out infinite;
  color: #ff6;
}
@keyframes timerTick {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
.round-label {
  font-size: 10px;
  margin-top: 4px;
  color: var(--neon-gold);
  font-family: 'Press Start 2P', monospace;
}
.stage-label-hud {
  font-size: 5px;
  margin-top: 3px;
  color: #444;
  font-family: 'Press Start 2P', monospace;
  letter-spacing: 1px;
}
.battle-msg {
  position: absolute;
  left: 50%;
  top: 42%;
  transform: translate(-50%, -50%);
  z-index: 25;
  font-size: clamp(0.65rem, 2.5vw, 1rem);
  color: var(--neon-gold);
  text-shadow: 0 0 10px #f80, 0 0 20px #f00;
  pointer-events: none;
  white-space: nowrap;
}
.fighters {
  position: absolute;
  inset: 0;
  z-index: 10;
}
.fighter {
  position: absolute;
  transform-origin: 50% 100%;
  will-change: left, bottom;
}
.fighter-wrap {
  contain: layout style;
  border: none;
  outline: none;
  background: transparent;
  overflow: visible;
}
.fighter-shadow {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 12px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
}
.fighter img {
  height: auto;
  width: auto;
  display: block;
}
.fighter-image {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  -ms-interpolation-mode: nearest-neighbor;
  transform-origin: bottom center;
  will-change: transform;
  border: none;
  outline: none;
  background: transparent;
  box-shadow: none;
}
@keyframes walkBob {
  0%, 100% { transform: translateY(0) scaleY(1); }
  25% { transform: translateY(-4px) scaleY(1.04); }
  75% { transform: translateY(2px) scaleY(0.97); }
}
@keyframes genericPunch {
  0% { transform: translateX(0) scaleX(1); }
  35% { transform: translateX(24px) scaleX(1.1); }
  100% { transform: translateX(0) scaleX(1); }
}
@keyframes genericKick {
  0% { transform: translateY(0); }
  45% { transform: translateY(-10px) rotate(-4deg); }
  100% { transform: translateY(0) rotate(0); }
}
@keyframes daveBob {
  0%,100% { transform: translateY(0) scaleY(1) scaleX(1); }
  40%     { transform: translateY(-5px) scaleY(1.02) scaleX(0.99); }
  70%     { transform: translateY(-3px) scaleY(1.01) scaleX(1); }
}
@keyframes daveWalk {
  0%,100% { transform: translateY(0) rotate(-1deg) scaleX(1.02); }
  50%     { transform: translateY(-6px) rotate(1deg) scaleX(0.98); }
}
@keyframes davePunch {
  0%   { transform: translateX(0) scaleX(1); }
  30%  { transform: translateX(28px) scaleX(1.12) rotate(-3deg); }
  55%  { transform: translateX(32px) scaleX(1.15) rotate(-4deg); }
  100% { transform: translateX(0) scaleX(1) rotate(0); }
}
@keyframes daveKick {
  0%   { transform: translateY(0) rotate(0); }
  20%  { transform: translateY(4px) rotate(2deg); }
  50%  { transform: translateY(-8px) rotate(-5deg) scaleX(1.08); }
  100% { transform: translateY(0) rotate(0) scaleX(1); }
}
@keyframes daveFlyKick {
  0%   { transform: translateX(0) translateY(0) rotate(0); }
  20%  { transform: translateX(15px) translateY(-25px) rotate(-8deg); }
  50%  { transform: translateX(40px) translateY(-35px) rotate(-12deg); }
  75%  { transform: translateX(50px) translateY(-15px) rotate(-6deg); }
  100% { transform: translateX(0) translateY(0) rotate(0); }
}
@keyframes daveHurt {
  0%   { transform: translateX(0) rotate(0); filter: brightness(1); }
  15%  { transform: translateX(-20px) rotate(-8deg); filter: brightness(8) saturate(0); }
  40%  { transform: translateX(-25px) rotate(-10deg); filter: brightness(3) saturate(0); }
  70%  { transform: translateX(-18px) rotate(-6deg); filter: brightness(1.5); }
  100% { transform: translateX(0) rotate(0); filter: brightness(1); }
}
@keyframes daveWin {
  0%,100% { transform: translateY(0) rotate(0) scaleX(1); }
  20%     { transform: translateY(-18px) rotate(-8deg) scaleX(0.95); }
  50%     { transform: translateY(-10px) rotate(5deg) scaleX(1.05); }
  80%     { transform: translateY(-14px) rotate(-4deg) scaleX(0.98); }
}
@keyframes kyleBob {
  0%,100% { transform: translateY(0) scaleY(1) scaleX(1); }
  30%     { transform: translateY(-7px) scaleY(1.03) scaleX(0.98); }
  70%     { transform: translateY(-4px) scaleY(1.01) scaleX(1); }
}
@keyframes kyleWalk {
  0%,100% { transform: translateY(0) rotate(-2deg) scaleX(1.03); }
  50%     { transform: translateY(-8px) rotate(2deg) scaleX(0.97); }
}
@keyframes kylePunch {
  0%   { transform: translateX(0) scaleX(1) rotate(0); }
  25%  { transform: translateX(35px) scaleX(1.18) rotate(-4deg); }
  50%  { transform: translateX(38px) scaleX(1.2) rotate(-5deg); }
  100% { transform: translateX(0) scaleX(1) rotate(0); }
}
@keyframes kyleKick {
  0%   { transform: translateY(0) rotate(0) scaleX(1); }
  15%  { transform: translateY(5px) rotate(3deg) scaleX(0.95); }
  45%  { transform: translateY(-12px) rotate(-8deg) scaleX(1.12); }
  100% { transform: translateY(0) rotate(0) scaleX(1); }
}
@keyframes kyleFlyKick {
  0%   { transform: translateX(0) translateY(0); }
  35%  { transform: translateX(28px) translateY(-22px); }
  65%  { transform: translateX(48px) translateY(-30px); }
  100% { transform: translateX(0) translateY(0); }
}
@keyframes kyleCharge {
  0%   { transform: translateX(0) translateY(0) rotate(0) scaleX(1); }
  20%  { transform: translateX(20px) translateY(-15px) rotate(-5deg) scaleX(1.05); }
  45%  { transform: translateX(55px) translateY(-25px) rotate(-10deg) scaleX(1.1); }
  65%  { transform: translateX(70px) translateY(-10px) rotate(-5deg) scaleX(1.05); }
  100% { transform: translateX(0) translateY(0) rotate(0) scaleX(1); }
}
@keyframes kyleHurt {
  0%   { transform: translateX(0) rotate(0); filter: brightness(1); }
  10%  { transform: translateX(-18px) rotate(-6deg); filter: brightness(10) saturate(0); }
  35%  { transform: translateX(-28px) rotate(-10deg); filter: brightness(4) saturate(0.2); }
  65%  { transform: translateX(-22px) rotate(-7deg); filter: brightness(2); }
  100% { transform: translateX(0) rotate(0); filter: brightness(1); }
}
@keyframes kyleWin {
  0%,100% { transform: translateY(0) rotate(0) scaleX(1); }
  25%     { transform: translateY(-20px) rotate(-6deg) scaleX(0.96); }
  50%     { transform: translateY(-12px) rotate(4deg) scaleX(1.04); }
  75%     { transform: translateY(-16px) rotate(-3deg) scaleX(0.98); }
}
@keyframes kyleFall {
  0%   { transform: rotate(0) translateY(0); opacity: 1; }
  30%  { transform: rotate(-20deg) translateY(10px); }
  60%  { transform: rotate(-60deg) translateY(20px); }
  100% { transform: rotate(0deg) translateY(0); opacity: 1; }
}
@keyframes dmitriBob {
  0%,100% { transform: translateY(0) scaleY(1); }
  45%     { transform: translateY(-4px) scaleY(1.02); }
}
@keyframes dmitriWalk {
  0%,100% { transform: translateY(0) rotate(-1deg); }
  50%     { transform: translateY(-5px) rotate(1deg); }
}
@keyframes dmitriPunch {
  0%   { transform: translateX(0) scaleX(1); }
  35%  { transform: translateX(30px) scaleX(1.14) rotate(-3deg); }
  100% { transform: translateX(0) scaleX(1) rotate(0); }
}
@keyframes dmitriKick {
  0%   { transform: translateY(0) rotate(0); }
  25%  { transform: translateY(3px) rotate(2deg); }
  50%  { transform: translateY(-6px) rotate(-4deg) scaleX(1.06); }
  100% { transform: translateY(0) rotate(0) scaleX(1); }
}
@keyframes dmitriLunge {
  0%   { transform: translateX(0) translateY(0) rotate(0); }
  25%  { transform: translateX(18px) translateY(-8px) rotate(-4deg); }
  55%  { transform: translateX(55px) translateY(-12px) rotate(-8deg) scaleX(1.08); }
  100% { transform: translateX(0) translateY(0) rotate(0) scaleX(1); }
}
@keyframes dmitriSlam {
  0%   { transform: translateY(0) rotate(0); filter: brightness(1); }
  30%  { transform: translateY(-18px) rotate(-6deg); filter: brightness(1.2); }
  55%  { transform: translateY(8px) rotate(4deg) scaleX(1.1); filter: brightness(1.4); }
  100% { transform: translateY(0) rotate(0) scaleX(1); filter: brightness(1); }
}
@keyframes dmitriHurt {
  0%   { transform: translateX(0) rotate(0); filter: brightness(1); }
  15%  { transform: translateX(-22px) rotate(-8deg); filter: brightness(8) saturate(0); }
  100% { transform: translateX(0) rotate(0); filter: brightness(1); }
}
@keyframes dmitriWin {
  0%,100% { transform: translateY(0) rotate(0); }
  30%     { transform: translateY(-12px) rotate(-4deg); }
  60%     { transform: translateY(-6px) rotate(3deg); }
}
@keyframes rajeshBob {
  0%,100% { transform: translateY(0) scaleY(1); }
  50%     { transform: translateY(-5px) scaleY(1.03); }
}
@keyframes rajeshWalk {
  0%,100% { transform: translateY(0) rotate(-1deg); }
  50%     { transform: translateY(-6px) rotate(1deg); }
}
@keyframes rajeshPunch {
  0%   { transform: translateX(0) scaleX(1); }
  40%  { transform: translateX(20px) scaleX(1.08); }
  100% { transform: translateX(0) scaleX(1); }
}
@keyframes rajeshKick {
  0%   { transform: translateY(0) rotate(0); }
  20%  { transform: translateY(2px) rotate(1deg); }
  50%  { transform: translateY(-12px) rotate(-6deg) scaleX(1.1); }
  100% { transform: translateY(0) rotate(0) scaleX(1); }
}
@keyframes rajeshFlyKick {
  0%   { transform: translateX(0) translateY(0) rotate(0); }
  30%  { transform: translateX(12px) translateY(-20px) rotate(-10deg); }
  60%  { transform: translateX(35px) translateY(-28px) rotate(-14deg); }
  100% { transform: translateX(0) translateY(0) rotate(0); }
}
@keyframes rajeshSpecialForward {
  0%   { transform: translateX(0) translateY(0) scaleX(1); }
  20%  { transform: translateX(26px) translateY(-4px) scaleX(1.04); }
  45%  { transform: translateX(62px) translateY(-8px) scaleX(1.08); }
  70%  { transform: translateX(78px) translateY(-3px) scaleX(1.06); }
  100% { transform: translateX(0) translateY(0) scaleX(1); }
}
@keyframes rajeshHurt {
  0%   { transform: translateX(0) rotate(0); filter: brightness(1); }
  12%  { transform: translateX(-16px) rotate(-10deg); filter: brightness(10) saturate(0); }
  100% { transform: translateX(0) rotate(0); filter: brightness(1); }
}
@keyframes rajeshWin {
  0%,100% { transform: translateY(0) rotate(0); }
  25%     { transform: translateY(-22px) rotate(-5deg); }
  50%     { transform: translateY(-14px) rotate(4deg); }
  75%     { transform: translateY(-18px) rotate(-3deg); }
}
@keyframes sparkLine {
  0%   { height: 20px; opacity: 1; }
  100% { height: 35px; opacity: 0; }
}
@keyframes sparkCenter {
  0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}
@keyframes specialPulse {
  0% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(180deg) saturate(1.6); }
  100% { filter: hue-rotate(0deg); }
}
@keyframes hurtFlash {
  0% { filter: brightness(2.4) saturate(0.8); }
  100% { filter: none; }
}
@keyframes koFall {
  0% { transform: rotate(0deg) translateY(0); }
  100% { transform: rotate(-85deg) translateY(10px); }
}
@keyframes winBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.fighter-image.walk-bob { animation: walkBob 0.3s infinite; }
.fighter-image.generic-punch { animation: genericPunch 0.35s ease-out; }
.fighter-image.generic-kick { animation: genericKick 0.4s ease-out; }
.fighter-image.fly-fx { animation: genericKick 0.5s ease-out; }
.fighter-image.special-fx { animation: specialPulse 0.6s ease-in-out; }
.fighter-image.hurt-fx { animation: hurtFlash 0.45s ease-out; }
.fighter-image.ko-fx { animation: koFall 0.7s ease forwards; }
.fighter-image.win-fx { animation: winBounce 0.45s ease-in-out infinite; }
.fighter-image.dave-ko {
  animation: none !important;
  transform: none !important;
}
.fighter-image.kyle-ko {
  animation: kyleFall 0.5s ease forwards !important;
  transform: none !important;
}
.fighter-image.dmitri-ko {
  animation: none !important;
  transform: none !important;
}
.fighter-image.rajesh-ko {
  animation: none !important;
  transform: none !important;
}
.hit-flash.gold { background: rgba(230, 120, 30, 0.5); }
.hit-flash.cyan { background: rgba(0, 200, 255, 0.4); }
.shake {
  animation: shake 0.35s ease;
}
@keyframes shake {
  0%,100% { transform: translate(0,0); }
  20% { transform: translate(-6px, 3px); }
  40% { transform: translate(6px, -3px); }
  60% { transform: translate(-4px, -2px); }
  80% { transform: translate(4px, 2px); }
}
.hit-flash {
  position: absolute;
  inset: 0;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  z-index: 15;
  transition: opacity 0.05s;
}
.hit-flash.on { opacity: 0.25; }
.hit-flash.hit { background: rgba(255, 61, 0, 0.25); }
.damage-num {
  position: absolute;
  font-size: 0.65rem;
  color: #ff4444;
  text-shadow: 0 0 6px #f00, 1px 1px 0 #000;
  pointer-events: none;
  z-index: 30;
  animation: dmgFloat 0.85s ease-out forwards;
}
@keyframes dmgFloat {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-48px) scale(1.15); }
}
.hit-spark {
  position: absolute;
  z-index: 33;
  font-size: 1rem;
  pointer-events: none;
  animation: sparkOut 0.2s ease-out forwards;
}
@keyframes sparkOut {
  0% { opacity: 1; transform: scale(1) translateY(0); }
  100% { opacity: 0; transform: scale(1.3) translateY(-12px); }
}
.gameover-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: 100dvh;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  box-sizing: border-box;
  padding: max(1rem, calc(0.75rem + env(safe-area-inset-top, 0px)))
    max(1.25rem, env(safe-area-inset-right, 0px))
    max(1rem, calc(0.75rem + env(safe-area-inset-bottom, 0px)))
    max(1.25rem, env(safe-area-inset-left, 0px));
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.gameover-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}
.gameover-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.25) blur(6px);
}
.gameover-scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1;
  pointer-events: none;
}
.gameover-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  margin: auto;
  padding: 0.5rem 20px 0.75rem;
  box-sizing: border-box;
}
.go-headline {
  font-size: 13px;
  margin: 0 0 8px;
  letter-spacing: 4px;
  line-height: 1.45;
}
.go-headline-win {
  color: #ffd700;
  text-shadow: 0 0 30px #ffd700, 4px 4px 0 #000;
  animation: glow 1.5s infinite;
}
.go-headline-lose {
  color: #ff1493;
  text-shadow: 0 0 30px #ff1493, 4px 4px 0 #000;
  animation: glow 1.5s infinite;
  letter-spacing: 2px;
}
.go-score {
  font-size: 8px;
  color: #ffd700;
  margin: 0 0 4px;
  line-height: 1.5;
}
.go-score-label {
  font-size: 6px;
  color: rgba(255, 215, 0, 0.5);
  margin: 0 0 12px;
  line-height: 1.5;
}
.go-message {
  font-size: 9.9px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 2;
  font-style: italic;
  max-width: 600px;
  margin: 0 auto 16px;
}
.go-message-lose {
  font-size: 9px;
  max-width: 520px;
}
.go-pose {
  width: auto;
  height: clamp(151px, 23.76vw, 216px);
  object-fit: contain;
  image-rendering: pixelated;
  filter: drop-shadow(3px 6px 10px rgba(0, 0, 0, 0.9));
  animation: win 0.7s ease-in-out infinite;
  margin: 0 auto 6px;
  display: block;
  flex-shrink: 0;
}
.go-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 0;
  padding-bottom: 0.15rem;
}
.go-btn {
  background: #0a0022;
  border: 3px solid;
  font-family: inherit;
  font-size: clamp(7px, 1.5vw, 10px);
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1.5;
  flex: 0 1 auto;
}
.go-btn-rematch {
  border-color: #ff1493;
  color: #ff1493;
}
.go-btn-new {
  border-color: #00eeff;
  color: #00eeff;
}
.go-title-win {
  font-size: clamp(1rem, 5vw, 2rem);
  color: var(--neon-gold);
  animation: glowWin 1.2s ease-in-out infinite alternate;
}
.go-title-lose {
  font-size: clamp(0.85rem, 4vw, 1.6rem);
  color: #ff2244;
  animation: glowLose 1s ease-in-out infinite alternate;
}
@keyframes glowWin {
  from { text-shadow: 0 0 10px gold, 0 0 24px #fa0; }
  to { text-shadow: 0 0 20px #fff, 0 0 40px gold; }
}
@keyframes glowLose {
  from { text-shadow: 0 0 8px #f00; }
  to { text-shadow: 0 0 20px #f44, 0 0 30px #800; }
}
@keyframes glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}
@keyframes win {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes winFlip {
  0%, 100% { transform: scaleX(-1) translateY(0); }
  50% { transform: scaleX(-1) translateY(-8px); }
}
.go-fighters {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 2rem;
  margin: 1.5rem 0;
  align-items: flex-end;
}
.go-fighters img {
  width: min(32vw, 200px);
  image-rendering: pixelated;
}
.taunt {
  font-size: 0.4rem;
  color: var(--neon-cyan);
  max-width: 420px;
  margin: 0.5rem auto;
  line-height: 1.6;
}
.small {
  font-size: 0.4rem;
  line-height: 1.7;
  opacity: 0.85;
}
body.fight-active {
  overflow: hidden;
  touch-action: none;
}
@media (orientation: landscape) and (max-height: 520px) {
  .menu-dark.char-select-screen {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    max-height: 100dvh;
    min-height: 0;
    overflow: hidden;
    padding: max(0.35rem, env(safe-area-inset-top)) max(0.5rem, env(safe-area-inset-right))
      max(0.35rem, env(safe-area-inset-bottom)) max(0.5rem, env(safe-area-inset-left));
    gap: 0.25rem;
    justify-content: flex-start;
  }
  .menu-dark.stage-select-screen {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    max-height: 100dvh;
    min-height: 0;
    overflow: hidden;
    padding: max(0.35rem, env(safe-area-inset-top)) max(0.5rem, env(safe-area-inset-right))
      max(0.35rem, env(safe-area-inset-bottom)) max(0.5rem, env(safe-area-inset-left));
    gap: 0.3rem;
    justify-content: flex-start;
  }
  .char-select-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
    flex-shrink: 0;
    padding-left: 0.15rem;
  }
  .char-select-screen .char-select-title {
    display: none;
  }
  .char-select-screen .char-select-subtitle {
    font-size: clamp(0.36rem, 2.4vh, 0.46rem);
    margin: 0;
    line-height: 1.35;
    opacity: 0.9;
    text-align: left;
  }
  .char-select-body {
    flex: 1 1 auto;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 40%) minmax(0, 1fr);
    gap: 0.4rem;
    align-items: center;
    width: 100%;
  }
  .char-select-screen .vs-row {
    grid-column: 2;
    min-height: 0;
    margin: 0;
    gap: clamp(0.25rem, 1.5vw, 0.6rem);
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    height: 100%;
  }
  .char-select-screen .char-side {
    min-width: 0;
    flex: 1 1 0;
    max-width: 38%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
  }
  .char-select-screen .char-side.enemy-side {
    background: rgba(255, 255, 255, 0.06);
    border: 2px solid rgba(255, 255, 255, 0.12);
    border-radius: 4px;
    min-height: min(52vh, 52dvh, 200px);
    justify-content: center;
    padding: 0.25rem;
    box-sizing: border-box;
  }
  .char-select-screen .char-side.enemy-side.selected,
  .char-select-screen .char-side.enemy-side.fate-locked {
    border-color: var(--neon-pink);
    box-shadow: 0 0 12px rgba(255, 46, 166, 0.45);
  }
  .char-select-screen .vs-row .vs-big,
  .char-select-screen .vs-big {
    flex: 0 0 auto;
    font-size: clamp(0.85rem, 5.5vh, 1.35rem);
    align-self: center;
    margin: 0;
  }
  .char-select-screen .vs-row .char-side img,
  .char-select-screen .char-side.enemy-side img,
  .char-select-screen .char-side.player-side img {
    width: auto;
    max-width: min(18vw, 82px);
    max-height: min(24vh, 24dvh, 88px);
    height: auto;
  }
  .char-select-screen .char-side.enemy-side img {
    max-height: min(28vh, 28dvh, 100px);
  }
  .char-select-screen .char-placeholder {
    font-size: clamp(0.3rem, 1.8vh, 0.38rem);
    min-height: 0;
    padding: 0.15rem 0;
    opacity: 0.55;
  }
  .char-select-screen .char-name {
    font-size: clamp(0.3rem, 1.8vh, 0.38rem);
    margin-top: 0.15rem;
    line-height: 1.3;
  }
  .char-select-screen .char-title,
  .char-select-screen .char-taunt {
    display: none;
  }
  .char-select-screen .char-tagline,
  .char-select-screen .char-tagline-secondary {
    font-size: clamp(0.26rem, 1.5vh, 0.32rem);
    margin-top: 0.1rem;
    line-height: 1.35;
    display: block;
  }
  .char-select-screen .fate-status {
    font-size: clamp(0.26rem, 1.5vh, 0.32rem);
    margin-top: 0.1rem;
    letter-spacing: 1px;
  }
  .char-select-screen .enemy-grid {
    grid-column: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 0.3rem;
    overflow: visible;
    max-width: 100%;
    width: 100%;
    flex-shrink: 0;
    padding: 0;
    align-self: center;
  }
  .char-select-screen .enemy-card {
    aspect-ratio: 1;
    width: 100%;
    padding: 0;
    border-width: 2px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  .char-select-screen .enemy-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
  }
  .char-select-screen .enemy-card-name {
    display: none;
  }
  .enemy-card-random {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    font-size: clamp(0.9rem, 5vh, 1.35rem);
    color: rgba(255, 255, 255, 0.55);
    background: rgba(255, 255, 255, 0.06);
    border-style: dashed;
    cursor: pointer;
  }
  .enemy-card-random:hover {
    border-color: var(--neon-gold);
    color: var(--neon-gold);
  }
  .char-select-screen .char-select-actions {
    display: none;
  }
  .mob-advance-banner {
    display: block;
    flex-shrink: 0;
    text-align: center;
    font-size: clamp(0.34rem, 2vh, 0.42rem);
    color: var(--neon-gold);
    letter-spacing: 0.08em;
    animation: blink 0.7s step-end infinite;
    margin: 0;
  }
  .mob-back-link {
    display: block;
    flex-shrink: 0;
    margin: 0 auto;
    font-size: calc(clamp(0.3rem, 1.8vh, 0.36rem) + 2px);
    color: #666;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    text-decoration: none;
    padding: 0.15rem;
  }
  .stage-select-screen .stage-select-title {
    font-size: clamp(0.42rem, 2.8vh, 0.55rem);
    margin: 0;
    line-height: 1.35;
    text-align: left;
  }
  .stage-select-subtitle {
    display: block;
    font-size: clamp(0.3rem, 1.9vh, 0.38rem);
    color: var(--neon-cyan);
    opacity: 0.85;
    margin: 0.1rem 0 0;
    line-height: 1.4;
    text-align: left;
  }
  .stage-select-header {
    flex-shrink: 0;
    width: 100%;
    padding-left: 0.15rem;
  }
  .stage-select-screen .stage-grid {
    flex: 1 1 auto;
    min-height: 0;
    margin-top: 0;
    gap: 0.35rem;
    max-width: 100%;
    width: 100%;
    align-content: stretch;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
  .stage-select-screen .stage-card {
    aspect-ratio: 16 / 10;
    border-width: 2px;
    min-height: 0;
  }
  .stage-select-screen .stage-label {
    font-size: calc(clamp(0.3rem, 1.8vh, 0.38rem) + 2px);
    padding: 0.25rem 0.35rem;
  }
  .stage-select-screen .char-select-actions {
    display: none;
  }
  .fight-hud {
    height: 44px;
    font-size: 0.34rem;
    gap: 0.25rem;
    padding: 0.2rem max(0.45rem, env(safe-area-inset-left)) 0.2rem max(0.45rem, env(safe-area-inset-right));
    padding-top: max(0.2rem, env(safe-area-inset-top));
  }
  .hud-portrait {
    width: 22px;
    height: 22px;
  }
  .bar-wrap {
    height: 14px;
  }
  .pip {
    width: 9px;
    height: 9px;
  }
  .timer-value {
    font-size: clamp(14px, 3.5vw, 22px);
  }
  .round-label {
    font-size: 7px;
    margin-top: 2px;
  }
  .stage-label-hud {
    display: none;
  }
  .fight-hint {
    display: none;
  }
  .fight-stage {
    padding-bottom: 5.25rem;
  }
  .battle-msg {
    font-size: clamp(0.45rem, 2vw, 0.75rem);
    top: 38%;
  }
  .gameover-overlay {
    padding-top: max(1.25rem, calc(1rem + env(safe-area-inset-top, 0px)));
    padding-bottom: max(1.25rem, calc(1rem + env(safe-area-inset-bottom, 0px)));
  }
}
@media (orientation: landscape) and (max-height: 420px) {
  .gameover-overlay {
    padding-top: max(1rem, calc(0.85rem + env(safe-area-inset-top, 0px)));
    padding-bottom: max(1rem, calc(0.85rem + env(safe-area-inset-bottom, 0px)));
  }
}
@media (max-width: 768px) and (orientation: portrait) {
  .gameover-overlay {
    padding-top: max(1.25rem, calc(0.85rem + env(safe-area-inset-top, 0px)));
    padding-bottom: max(1.25rem, calc(0.85rem + env(safe-area-inset-bottom, 0px)));
  }
}
`

function hpBarClass(ratio) {
  if (ratio > 0.5) return 'high'
  if (ratio > 0.25) return 'mid'
  return 'low'
}

export default function App() {
  const [screen, setScreen] = useState('title')
  const [selectedEnemyId, setSelectedEnemyId] = useState(null)
  const [hoverEnemyId, setHoverEnemyId] = useState(null)
  const [selectedStageId, setSelectedStageId] = useState(null)
  const [hudTick, setHudTick] = useState(0)
  const [matchWinner, setMatchWinner] = useState(null)
  const [goScore, setGoScore] = useState(0)
  const [playerFighterState, setPlayerFighterState] = useState('IDLE')
  const [enemyFighterState, setEnemyFighterState] = useState('IDLE')
  const [playerFighterHeight, setPlayerFighterHeight] = useState(200)
  const [enemyFighterHeight, setEnemyFighterHeight] = useState(200)
  const [fateRolling, setFateRolling] = useState(false)
  const [fatePreviewId, setFatePreviewId] = useState(null)
  const [stageFateRolling, setStageFateRolling] = useState(false)
  const [stageFatePreviewId, setStageFatePreviewId] = useState(null)
  const [mobileAdvancing, setMobileAdvancing] = useState(false)

  const isMobileLandscape = useMobileLandscape()
  const fightRef = useRef(null)
  const fateTimerRef = useRef(null)
  const stageFateTimerRef = useRef(null)
  const mobileAdvanceRef = useRef(null)
  const selectedEnemyIdRef = useRef(selectedEnemyId)
  selectedEnemyIdRef.current = selectedEnemyId
  const keysRef = useRef(new Set())
  const pressRef = useRef(new Set())
  const arenaRef = useRef(null)
  const playerWrapRef = useRef(null)
  const enemyWrapRef = useRef(null)
  const arenaShakeRef = useRef(null)
  const flashRef = useRef(null)
  const rafRef = useRef(0)
  const timerRef = useRef(0)
  const animRef = useRef({
    player: { state: 'IDLE', until: 0, locked: false },
    enemy: { state: 'IDLE', until: 0, locked: false },
  })

  const bumpHud = useCallback(() => setHudTick((t) => t + 1), [])
  const screenRef = useRef(screen)
  screenRef.current = screen

  useEffect(() => {
    const fightKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyJ', 'KeyK', 'KeyL', 'KeyI']
    const kd = (e) => {
      if (fightKeys.includes(e.code) && screenRef.current === 'fight') {
        e.preventDefault()
      }
      keysRef.current.add(e.code)
      if (!e.repeat) pressRef.current.add(e.code)
    }
    const ku = (e) => {
      keysRef.current.delete(e.code)
    }
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    return () => {
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
    }
  }, [])

  useEffect(() => {
    preloadAllFighterAssets()
  }, [])

  useEffect(
    () => () => {
      if (fateTimerRef.current) clearTimeout(fateTimerRef.current)
      if (stageFateTimerRef.current) clearTimeout(stageFateTimerRef.current)
      if (mobileAdvanceRef.current) clearTimeout(mobileAdvanceRef.current)
    },
    [],
  )

  const clearMobileAdvance = useCallback(() => {
    if (mobileAdvanceRef.current) {
      clearTimeout(mobileAdvanceRef.current)
      mobileAdvanceRef.current = null
    }
    setMobileAdvancing(false)
  }, [])

  const clearFateRoll = useCallback(() => {
    if (fateTimerRef.current) {
      clearTimeout(fateTimerRef.current)
      fateTimerRef.current = null
    }
    setFateRolling(false)
    setFatePreviewId(null)
  }, [])

  const clearStageFateRoll = useCallback(() => {
    if (stageFateTimerRef.current) {
      clearTimeout(stageFateTimerRef.current)
      stageFateTimerRef.current = null
    }
    setStageFateRolling(false)
    setStageFatePreviewId(null)
  }, [])

  const startStageFateDecide = useCallback(() => {
    if (stageFateRolling || !selectedEnemyId) return
    const finalIndex = Math.floor(Math.random() * STAGES.length)
    const sequence = buildShuffleSequence(STAGES.length, finalIndex)
    const finalId = STAGES[finalIndex].id

    setStageFateRolling(true)
    setSelectedStageId(null)
    setStageFatePreviewId(STAGES[sequence[0]].id)

    let step = 0
    const runStep = () => {
      const idx = sequence[step]
      setStageFatePreviewId(STAGES[idx].id)

      if (step >= sequence.length - 1) {
        stageFateTimerRef.current = window.setTimeout(() => {
          setStageFatePreviewId(null)
          setStageFateRolling(false)
          stageFateTimerRef.current = null
          const enemyId = selectedEnemyIdRef.current
          if (!enemyId) return
          setSelectedStageId(finalId)
          fightRef.current = createFightState(enemyId, finalId)
          animRef.current.player = { state: 'IDLE', until: 0, locked: false }
          animRef.current.enemy = { state: 'IDLE', until: 0, locked: false }
          setPlayerFighterState('IDLE')
          setEnemyFighterState('IDLE')
          setScreen('fight')
          bumpHud()
        }, 200)
        return
      }

      step += 1
      const delay = getFateStepDelay(step, sequence.length)
      stageFateTimerRef.current = window.setTimeout(runStep, delay)
    }

    stageFateTimerRef.current = window.setTimeout(runStep, 40)
  }, [stageFateRolling, bumpHud])

  const startFateDecide = useCallback((options = {}) => {
    if (fateRolling || mobileAdvancing) return
    const finalIndex = Math.floor(Math.random() * ENEMIES.length)
    const sequence = buildFateShuffleSequence(finalIndex)
    const finalId = ENEMIES[finalIndex].id

    setFateRolling(true)
    setSelectedEnemyId(null)
    setHoverEnemyId(null)
    setFatePreviewId(ENEMIES[sequence[0]].id)

    let step = 0
    const runStep = () => {
      const idx = sequence[step]
      setFatePreviewId(ENEMIES[idx].id)

      if (step >= sequence.length - 1) {
        fateTimerRef.current = window.setTimeout(() => {
          setFatePreviewId(finalId)
          setSelectedEnemyId(finalId)
          setFateRolling(false)
          fateTimerRef.current = null
          if (options.advanceOnComplete) {
            setMobileAdvancing(true)
            if (mobileAdvanceRef.current) clearTimeout(mobileAdvanceRef.current)
            mobileAdvanceRef.current = window.setTimeout(() => {
              mobileAdvanceRef.current = null
              setMobileAdvancing(false)
              if (!selectedEnemyIdRef.current) return
              clearStageFateRoll()
              setScreen('stageSelect')
              setSelectedStageId(null)
            }, 2500)
          }
        }, 280)
        return
      }

      step += 1
      const delay = getFateStepDelay(step, sequence.length)
      fateTimerRef.current = window.setTimeout(runStep, delay)
    }

    fateTimerRef.current = window.setTimeout(runStep, 40)
  }, [fateRolling, mobileAdvancing, clearStageFateRoll])

  const scheduleMobileAdvanceToStage = useCallback(() => {
    setMobileAdvancing(true)
    if (mobileAdvanceRef.current) clearTimeout(mobileAdvanceRef.current)
    mobileAdvanceRef.current = window.setTimeout(() => {
      mobileAdvanceRef.current = null
      setMobileAdvancing(false)
      if (!selectedEnemyIdRef.current) return
      clearStageFateRoll()
      setScreen('stageSelect')
      setSelectedStageId(null)
    }, 2500)
  }, [clearStageFateRoll])

  const handleEnemyPick = (id) => {
    if (fateRolling || mobileAdvancing) return
    clearFateRoll()
    setSelectedEnemyId(id)
    if (isMobileLandscape) scheduleMobileAdvanceToStage()
  }

  const goTitle = () => {
    clearFateRoll()
    clearStageFateRoll()
    clearMobileAdvance()
    setScreen('title')
    setSelectedEnemyId(null)
    setSelectedStageId(null)
    setMatchWinner(null)
    animRef.current.player = { state: 'IDLE', until: 0, locked: false }
    animRef.current.enemy = { state: 'IDLE', until: 0, locked: false }
    setPlayerFighterState('IDLE')
    setEnemyFighterState('IDLE')
  }

  const goCharSelect = () => {
    clearFateRoll()
    clearMobileAdvance()
    setScreen('charSelect')
    setSelectedEnemyId(null)
  }

  const goStageSelect = () => {
    if (!selectedEnemyId) return
    clearStageFateRoll()
    setScreen('stageSelect')
    setSelectedStageId(null)
  }

  const startFight = (stageId) => {
    if (!selectedEnemyId || !stageId) return
    setSelectedStageId(stageId)
    fightRef.current = createFightState(selectedEnemyId, stageId)
    animRef.current.player = { state: 'IDLE', until: 0, locked: false }
    animRef.current.enemy = { state: 'IDLE', until: 0, locked: false }
    setPlayerFighterState('IDLE')
    setEnemyFighterState('IDLE')
    setScreen('fight')
    bumpHud()
  }


  useEffect(() => {
    if (screen !== 'fight' || !fightRef.current) return

    const fr = fightRef.current
    const playerDef = getFighterById(fr.playerId)
    const champDef = PLAYER

    const syncSize = () => {
      const el = arenaRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      fr.arenaW = r.width
      fr.arenaH = r.height
      fr.groundBottomPercent = STAGE_GROUND_BOTTOM[fr.stageId] || '18%'
      const sizes = computeFighterSizes(r.height, fr.groundBottomPercent, fr.playerId, fr.enemyId)
      Object.assign(fr, sizes)
      setPlayerFighterHeight(fr.playerFighterHeight)
      setEnemyFighterHeight(fr.enemyFighterHeight)
    }
    syncSize()
    const onViewportChange = () => syncSize()
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('orientationchange', onViewportChange)
    fr.px = fr.arenaW * 0.22
    fr.ex = fr.arenaW * 0.62

    timerRef.current = window.setInterval(() => {
      const f = fightRef.current
      if (!f || !f.roundActive || f.matchOver) return
      if (f.timeLeft > 0) {
        f.timeLeft -= 1
        if (f.timeLeft <= 0) {
          f.roundActive = false
          if (f.php >= f.ehp) {
            f.pw += 1
            f.score += 900
            setFighterState('player', 'WIN', true)
            setFighterState('enemy', 'KO', true)
          } else {
            f.ew += 1
            setFighterState('enemy', 'WIN', true)
            announceEnemyWin()
            setFighterState('player', 'KO', true)
          }
          f.roundEndAt = performance.now() + 2200
          if (f.pw >= 2) {
            f.matchOver = true
            f.matchWinner = 'player'
          } else if (f.ew >= 2) {
            f.matchOver = true
            f.matchWinner = 'enemy'
          }
        }
      }
      bumpHud()
    }, 1000)

    const keysDown = () => keysRef.current
    const pressedDown = () => pressRef.current
    const playSound = (name) => {
      void name
    }

    const canInterruptState = (meta, nowTs) => {
      if (meta.state === 'KO' || meta.state === 'WIN') return false
      if (meta.state === 'HURT' && nowTs < meta.until) return false
      if (ATTACK_STATES.includes(meta.state) && nowTs < meta.until) return false
      return true
    }

    const setFighterState = (side, nextState, force = false) => {
      const nowTs = performance.now()
      const meta = animRef.current[side]
      const characterId = side === 'player' ? fr.playerId : fr.enemyId
      const stateConfig = getStateConfig(characterId, nextState)
      if (meta.state === 'KO' && nextState !== 'KO') return false
      if (!force && !canInterruptState(meta, nowTs)) return false
      if (meta.state === nextState && stateConfig.loop) return true
      meta.state = nextState
      const dur = stateConfig.duration
      meta.until = dur ? nowTs + dur : 0
      meta.locked = nextState === 'KO'
      if (side === 'player') setPlayerFighterState(nextState)
      else setEnemyFighterState(nextState)
      return true
    }

    const tickFighterState = (side, nowTs) => {
      const meta = animRef.current[side]
      if (meta.state === 'KO' || meta.state === 'WIN') return
      if (meta.until && nowTs >= meta.until) {
        meta.state = 'IDLE'
        meta.until = 0
        if (side === 'player') setPlayerFighterState('IDLE')
        else setEnemyFighterState('IDLE')
      }
    }

    const addDamageNumber = (x, y, val, col) => {
      const id = fr.dnId++
      fr.damageNumbers.push({ id, x, y, val: Math.round(val), col, t: 0 })
      if (fr.damageNumbers.length > 12) fr.damageNumbers.shift()
      bumpHud()
    }

    const screenShake = () => {
      fr.shakeUntil = performance.now() + 320
      if (arenaShakeRef.current) arenaShakeRef.current.classList.add('shake')
    }
    const screenShakeLong = () => {
      fr.shakeUntil = performance.now() + 600
      if (arenaShakeRef.current) arenaShakeRef.current.classList.add('shake')
    }
    const flashHit = () => {
      fr.flashUntil = performance.now() + 100
      if (flashRef.current) {
        flashRef.current.classList.add('on')
        flashRef.current.classList.add('hit')
      }
    }
    const flashGold = () => {
      fr.flashUntil = performance.now() + 400
      if (flashRef.current) {
        flashRef.current.classList.add('on')
        flashRef.current.classList.add('gold')
      }
    }
    const flashCyan = () => {
      fr.flashUntil = performance.now() + 400
      if (flashRef.current) {
        flashRef.current.classList.add('on')
        flashRef.current.classList.add('cyan')
      }
    }
    const triggerBeerBellyBash = (nowTs) => {
      screenShakeLong()
      flashGold()
      fr.battleMsg = 'BEER BELLY BASH!! 🍺'
      fr.battleMsgUntil = nowTs + 900
    }
    const triggerRedPillRush = (nowTs, forPlayer = false) => {
      if (forPlayer) {
        fr.playerCharging = true
        fr.playerChargeUntil = nowTs + 550
      } else {
        fr.enemyCharging = true
        fr.enemyChargeUntil = nowTs + 550
      }
      flashCyan()
      fr.battleMsg = 'RED PILL RUSH! 📱'
      fr.battleMsgUntil = nowTs + 900
    }
    const triggerPlayerKoSequence = (nowTs) => {
      window.setTimeout(() => screenShake(), 400)
      if (fr.playerId === 'kyle') {
        window.setTimeout(() => {
          const f = fightRef.current
          if (!f) return
          const id = `phone-${f.dnId++}`
          f.damageNumbers.push({ id, x: f.px + 40, y: f.arenaH * 0.55, spark: true, val: '📱💔' })
          window.setTimeout(() => {
            const ff = fightRef.current
            if (!ff) return
            ff.damageNumbers = ff.damageNumbers.filter((d) => d.id !== id)
            bumpHud()
          }, 1200)
          bumpHud()
        }, 600)
      }
      window.setTimeout(() => {
        const f = fightRef.current
        if (!f) return
        f.battleMsg = 'K.O.!'
        f.battleMsgUntil = nowTs + 1800
        bumpHud()
      }, 800)
      window.setTimeout(() => announceEnemyWin(), 1200)
    }
    const announceEnemyWin = () => {
      fr.battleMsg = `${champDef.name.toUpperCase()} WINS! 💅`
      fr.battleMsgUntil = performance.now() + 2200
      bumpHud()
      window.setTimeout(() => {
        const f = fightRef.current
        if (!f) return
        f.battleMsg = champDef.taunt
        f.battleMsgUntil = performance.now() + 2800
        bumpHud()
      }, 900)
    }

    const addHitSpark = (x, y) => {
      const id = `spark-${fr.dnId++}`
      fr.damageNumbers.push({ id, x, y, spark: true, val: '✨💥' })
      setTimeout(() => {
        const f = fightRef.current
        if (!f) return
        f.damageNumbers = f.damageNumbers.filter((d) => d.id !== id)
        bumpHud()
      }, 200)
    }

    const playerSpriteW = () => fr.playerSpriteW || fr.spriteW || SPRITE_W
    const enemySpriteW = () => fr.enemySpriteW || fr.spriteW || SPRITE_W

    const horizontalDist = () => {
      const pc = fr.px + playerSpriteW() / 2
      const ec = fr.ex + enemySpriteW() / 2
      return Math.abs(pc - ec)
    }

    const flashFighter = (side) => {
      const until = performance.now() + 60
      if (side === 'player') fr.playerHitFlashUntil = until
      else fr.enemyHitFlashUntil = until
      bumpHud()
      window.setTimeout(() => bumpHud(), 65)
    }

    const tryDamageEnemy = (type, range, isSpecial) => {
      if (fr.enemyInvuln > performance.now()) return
      const dist = horizontalDist()
      if (dist > range + HITBOX_PAD) return
      const now = performance.now()
      if (now - fr.lastHitOnEnemy < COMBO_WINDOW_MS) {
        fr.playerCombo += 1
      } else {
        fr.playerCombo = 1
      }
      fr.lastHitOnEnemy = now
      let mult = 1
      if (fr.playerCombo >= COMBO_MIN_HITS) {
        mult = COMBO_MULT
        fr.comboBonusHits += 1
        fr.score += 200
        fr.battleMsg = `${fr.playerCombo}x COMBO!`
        fr.battleMsgUntil = now + 900
      }
      const raw = rollDamage(playerDef.atk, isSpecial)
      const dmg = raw * mult
      fr.ehp = Math.max(0, fr.ehp - dmg)
      if (isSpecial) {
        fr.battleMsg = playerDef.special
        fr.battleMsgUntil = now + 900
      }
      setFighterState('enemy', 'HURT', true)
      fr.hurtSpark = { x: fr.ex + 88, y: fr.arenaH * 0.38, until: performance.now() + 250 }
      fr.enemyInvuln = performance.now() + 220
      screenShake()
      flashHit()
      flashFighter('enemy')
      addDamageNumber(fr.ex + 30, fr.arenaH * 0.42, dmg, '#ff6')
      addHitSpark(fr.ex + 70, fr.arenaH * 0.45)
      playSound('hit')
      if (fr.ehp <= 0) {
        fr.roundActive = false
        fr.pw += 1
        fr.score += 900
        fr.roundEndAt = performance.now() + 2200
        setFighterState('player', 'WIN', true)
        setFighterState('enemy', 'KO', true)
        if (fr.pw >= 2) {
          fr.matchOver = true
          fr.matchWinner = 'player'
        }
      }
      bumpHud()
    }

    const tryDamagePlayer = (type, range, isSpecial, pushback = false) => {
      if (fr.playerInvuln > performance.now()) return
      const dist = horizontalDist()
      if (dist > range + HITBOX_PAD) return
      const now = performance.now()
      if (now - fr.lastHitOnPlayer < COMBO_WINDOW_MS) fr.enemyCombo += 1
      else fr.enemyCombo = 1
      fr.lastHitOnPlayer = now
      const mult = fr.enemyCombo >= COMBO_MIN_HITS ? COMBO_MULT : 1
      const raw = rollDamage(champDef.atk, isSpecial)
      let dmg = raw * mult
      if (fr.playerBlocking) dmg *= 0.4
      fr.php = Math.max(0, fr.php - dmg)
      if (pushback) {
        fr.pvx = (fr.ex < fr.px ? 1 : -1) * 8
      }
      setFighterState('player', 'HURT', true)
      fr.playerInvuln = performance.now() + 220
      screenShake()
      flashHit()
      flashFighter('player')
      addDamageNumber(fr.px + 20, fr.arenaH * 0.42, dmg, '#f88')
      addHitSpark(fr.px + 70, fr.arenaH * 0.45)
      playSound('hit')
      if (fr.php <= 0) {
        fr.roundActive = false
        fr.ew += 1
        fr.roundEndAt = performance.now() + 2200
        setFighterState('enemy', 'WIN', true)
        triggerPlayerKoSequence(performance.now())
        setFighterState('player', 'KO', true)
        if (fr.ew >= 2) {
          fr.matchOver = true
          fr.matchWinner = 'enemy'
        }
      }
      bumpHud()
    }

    let last = performance.now()

    const loop = (now) => {
      const f = fightRef.current
      if (!f || screen !== 'fight') return

      tickFighterState('player', now)
      tickFighterState('enemy', now)

      if (f.shakeUntil < now && arenaShakeRef.current) {
        arenaShakeRef.current.classList.remove('shake')
      }
      if (f.flashUntil < now && flashRef.current) {
        flashRef.current.classList.remove('on')
        flashRef.current.classList.remove('hit')
        flashRef.current.classList.remove('gold')
        flashRef.current.classList.remove('cyan')
      }
      if (f.battleMsgUntil < now) {
        f.battleMsg = ''
      }

      if (f.matchOver && f.matchWinner && now > f.roundEndAt) {
        setMatchWinner(f.matchWinner)
        setGoScore(f.score)
        setScreen('gameOver')
        return
      }

      if (!f.roundActive) {
        if (now > f.roundEndAt && !f.matchOver) {
          f.round += 1
          f.php = playerDef.hp
          f.pmax = playerDef.hp
          f.ehp = champDef.hp
          f.emax = champDef.hp
          f.timeLeft = ROUND_TIME
          f.roundActive = true
          f.px = f.arenaW * 0.22
          f.ex = f.arenaW * 0.62
          f.py = f.ey = 0
          f.pvx = f.pvy = f.evx = f.evy = 0
          f.playerCombo = f.enemyCombo = 0
          f.enemyCharging = false
          f.enemyChargeUntil = 0
          f.playerCharging = false
          f.playerChargeUntil = 0
          f.playerBlocking = false
          f.hurtSpark = null
          animRef.current.player = { state: 'IDLE', until: 0, locked: false }
          animRef.current.enemy = { state: 'IDLE', until: 0, locked: false }
          setPlayerFighterState('IDLE')
          setEnemyFighterState('IDLE')
        }
        bumpHud()
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      const dt = Math.min(32, now - last)
      last = now
      const k = keysDown()

      const onGroundP = f.py <= 0.5
      const onGroundE = f.ey <= 0.5

      const blocking = k.has('ArrowDown') && onGroundP && f.playerAttackLock < now
      f.playerBlocking = blocking
      if (blocking) {
        setFighterState('player', 'DODGE')
        f.pvx = 0
      }

      if (f.playerAttackLock < now && !blocking) {
        const pressed = pressedDown()
        if (pressed.has('KeyJ')) {
          if (setFighterState('player', 'PUNCH')) {
            scheduleAttack(f, 'player', fr.playerId, 'PUNCH', now)
          }
        }
        if (pressed.has('KeyK')) {
          if (setFighterState('player', 'KICK')) {
            scheduleAttack(f, 'player', fr.playerId, 'KICK', now)
          }
        }
        if (pressed.has('KeyL')) {
          if (setFighterState('player', 'SPECIAL')) {
            scheduleAttack(f, 'player', fr.playerId, 'SPECIAL', now)
            if (fr.playerId === 'dave') triggerBeerBellyBash(now)
            if (fr.playerId === 'kyle') triggerRedPillRush(now, true)
          }
        }
        if (pressed.has('KeyI')) {
          if (setFighterState('player', 'FLYKICK')) {
            scheduleAttack(f, 'player', fr.playerId, 'FLYKICK', now)
          }
        }
        if (pressed.has('ArrowUp') && onGroundP) {
          f.pvy = JUMP_VEL
          f.py = 1
          if (k.has('ArrowRight')) {
            f.pvx = 5.5
          } else if (k.has('ArrowLeft')) {
            f.pvx = -5.5
          }
        }
      }
      pressRef.current.clear()

      if (f.pendingPlayerHit && now >= f.pendingPlayerHit.t) {
        const h = f.pendingPlayerHit
        f.pendingPlayerHit = null
        tryDamageEnemy(h.type, h.range, h.sp)
      }

      if (f.pendingEnemyHit && now >= f.pendingEnemyHit.t) {
        const h = f.pendingEnemyHit
        f.pendingEnemyHit = null
        tryDamagePlayer(h.type, h.range, h.sp, false)
      }

      if (f.playerCharging && now < f.playerChargeUntil) {
        const dir = Math.sign(f.ex - f.px)
        if (dir !== 0) {
          const target = f.ex - dir * 60
          const diff = target - f.px
          f.px += Math.sign(diff) * Math.min(12, Math.abs(diff))
          f.px = Math.max(8, Math.min(f.arenaW - playerSpriteW() - 8, f.px))
        }
      } else if (f.playerCharging) {
        f.playerCharging = false
      }

      if (f.enemyCharging && now < f.enemyChargeUntil) {
        const dir = Math.sign(f.px - f.ex)
        if (dir !== 0) {
          const target = f.px - dir * 60
          const diff = target - f.ex
          f.ex += Math.sign(diff) * Math.min(12, Math.abs(diff))
          f.ex = Math.max(8, Math.min(f.arenaW - enemySpriteW() - 8, f.ex))
        }
      } else if (f.enemyCharging) {
        f.enemyCharging = false
      }

      if (f.hurtSpark && now >= f.hurtSpark.until) {
        f.hurtSpark = null
      }

      let walkP = false
      if (!blocking && !f.playerCharging) {
        if (k.has('ArrowLeft')) {
          f.pvx = -5
          walkP = onGroundP
        } else if (k.has('ArrowRight')) {
          f.pvx = 5
          walkP = onGroundP
        } else {
          f.pvx *= 0.34
          if (Math.abs(f.pvx) < 0.08) f.pvx = 0
        }
      }

      if (!blocking) {
        if (walkP && onGroundP) setFighterState('player', 'WALK')
        else if (onGroundP && f.playerAttackLock < now) setFighterState('player', 'IDLE')
      }

      f.pvy -= GRAVITY * (dt / 16)
      f.py += f.pvy * (dt / 16)
      f.px += f.pvx * (dt / 16)
      if (f.py < 0) {
        f.py = 0
        f.pvy = 0
      }
      f.px = Math.max(8, Math.min(f.arenaW - playerSpriteW() - 8, f.px))

      const pc = f.px + playerSpriteW() / 2
      const ec = f.ex + enemySpriteW() / 2
      f.playerFacing = ec >= pc ? 1 : -1
      f.enemyFacing = pc >= ec ? 1 : -1

      if (now >= f.aiNextThink) {
        f.aiNextThink = now + 120 + Math.random() * 100
      }
      if (now >= f.aiNextAttack && f.enemyAttackLock < now && f.roundActive) {
        const hpRatio = f.ehp / f.emax
        const aiTiming = getAiTiming(fr.enemyId, hpRatio)
        f.aiNextAttack = now + aiTiming.min + Math.random() * (aiTiming.max - aiTiming.min)
        const dist = horizontalDist()

        if (usesDaveAi(fr.enemyId)) {
          const roll = Math.random()
          if (dist < 80) {
            if (roll < 0.4 && setFighterState('enemy', 'PUNCH')) {
              scheduleAttack(f, 'enemy', fr.enemyId, 'PUNCH', now)
            } else if (roll < 0.65 && setFighterState('enemy', 'KICK')) {
              scheduleAttack(f, 'enemy', fr.enemyId, 'KICK', now)
            } else if (setFighterState('enemy', 'FLYKICK')) {
              scheduleAttack(f, 'enemy', fr.enemyId, 'FLYKICK', now)
            }
          } else if (dist <= 150) {
            if (roll < 0.2 && setFighterState('enemy', 'SPECIAL')) {
              scheduleAttack(f, 'enemy', fr.enemyId, 'SPECIAL', now)
              triggerBeerBellyBash(now)
            } else if (roll < 0.45 && setFighterState('enemy', 'FLYKICK')) {
              scheduleAttack(f, 'enemy', fr.enemyId, 'FLYKICK', now)
            } else if (roll < 0.65 && setFighterState('enemy', 'KICK')) {
              scheduleAttack(f, 'enemy', fr.enemyId, 'KICK', now)
            } else if (roll < 0.85 && setFighterState('enemy', 'PUNCH')) {
              scheduleAttack(f, 'enemy', fr.enemyId, 'PUNCH', now)
            }
          }
        } else if (usesKyleAi(fr.enemyId)) {
          const roll = Math.random()
          if (dist > 100) {
            if (roll < 0.45 && setFighterState('enemy', 'SPECIAL')) {
              scheduleAttack(f, 'enemy', fr.enemyId, 'SPECIAL', now)
              triggerRedPillRush(now)
            } else if (roll < 0.7 && setFighterState('enemy', 'KICK')) {
              scheduleAttack(f, 'enemy', fr.enemyId, 'KICK', now)
            }
          } else if (roll < 0.35 && setFighterState('enemy', 'PUNCH')) {
            scheduleAttack(f, 'enemy', fr.enemyId, 'PUNCH', now)
          } else if (roll < 0.55 && setFighterState('enemy', 'KICK')) {
            scheduleAttack(f, 'enemy', fr.enemyId, 'KICK', now)
          } else if (roll < 0.7 && setFighterState('enemy', 'SPECIAL')) {
            scheduleAttack(f, 'enemy', fr.enemyId, 'SPECIAL', now)
            triggerRedPillRush(now)
          } else {
            f.evx = f.ex < f.px ? -MOVE_SPEED * 0.9 : MOVE_SPEED * 0.9
          }
        } else if (dist < SPECIAL_RANGE + 20 && Math.random() < 0.35) {
          const r = Math.random()
          if (r < 0.33) {
            if (setFighterState('enemy', 'PUNCH')) {
              scheduleAttack(f, 'enemy', fr.enemyId, 'PUNCH', now)
            }
          } else if (r < 0.66) {
            if (setFighterState('enemy', 'KICK')) {
              scheduleAttack(f, 'enemy', fr.enemyId, 'KICK', now)
            }
          } else if (setFighterState('enemy', 'SPECIAL')) {
            scheduleAttack(f, 'enemy', fr.enemyId, 'SPECIAL', now)
          }
        }
      }

      const dist = Math.abs(f.px - f.ex)
      if (usesDaveAi(fr.enemyId)) {
        if (dist > 150) {
          f.evx = f.ex < f.px ? MOVE_SPEED * 0.85 : -MOVE_SPEED * 0.85
          if (onGroundE) setFighterState('enemy', 'WALK')
        } else {
          f.evx *= FRICTION
          if (Math.abs(f.evx) < 0.15) f.evx = 0
          if (onGroundE) {
            const enemyAnim = animRef.current.enemy.state
            if (!ATTACK_STATES.includes(enemyAnim) && enemyAnim !== 'WALK') {
              setFighterState('enemy', 'IDLE')
            }
          }
        }
      } else if (usesKyleAi(fr.enemyId)) {
        if (dist > 160) {
          f.evx = f.ex < f.px ? MOVE_SPEED * 1.1 : -MOVE_SPEED * 1.1
          if (onGroundE) setFighterState('enemy', 'WALK')
        } else if (!f.enemyCharging) {
          f.evx *= FRICTION
          if (Math.abs(f.evx) < 0.15) f.evx = 0
          if (onGroundE) {
            const enemyAnim = animRef.current.enemy.state
            if (!ATTACK_STATES.includes(enemyAnim) && enemyAnim !== 'WALK') {
              setFighterState('enemy', 'IDLE')
            }
          }
        }
      } else if (dist > 160) {
        f.evx = f.ex < f.px ? MOVE_SPEED * 0.85 : -MOVE_SPEED * 0.85
        if (onGroundE) setFighterState('enemy', 'WALK')
      } else if (dist < 70 && Math.random() < 0.02) {
        f.evx = f.ex < f.px ? -MOVE_SPEED * 0.9 : MOVE_SPEED * 0.9
      } else {
        f.evx *= FRICTION
        if (Math.abs(f.evx) < 0.15) f.evx = 0
        if (onGroundE) setFighterState('enemy', 'IDLE')
      }

      if (onGroundE && Math.random() < 0.003) {
        f.evy = JUMP_VEL * 0.92
        f.ey = 1
      }

      f.evy -= GRAVITY * (dt / 16)
      f.ey += f.evy * (dt / 16)
      f.ex += f.evx * (dt / 16)
      if (f.ey < 0) {
        f.ey = 0
        f.evy = 0
      }
      f.ex = Math.max(8, Math.min(f.arenaW - enemySpriteW() - 8, f.ex))

      const ground = f.groundBottomPercent || '18%'
      if (playerWrapRef.current) {
        playerWrapRef.current.style.left = `${Math.round(f.px)}px`
        playerWrapRef.current.style.bottom = `calc(${ground} + ${Math.round(f.py)}px)`
      }
      if (enemyWrapRef.current) {
        enemyWrapRef.current.style.left = `${Math.round(f.ex)}px`
        enemyWrapRef.current.style.bottom = `calc(${ground} + ${Math.round(f.ey)}px)`
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('orientationchange', onViewportChange)
      clearInterval(timerRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [screen, bumpHud])

  useEffect(() => {
    if (screen === 'fight' || screen === 'gameOver') {
      document.body.classList.add('fight-active')
      const onResize = () => bumpHud()
      window.addEventListener('resize', onResize)
      window.addEventListener('orientationchange', onResize)
      return () => {
        document.body.classList.remove('fight-active')
        window.removeEventListener('resize', onResize)
        window.removeEventListener('orientationchange', onResize)
      }
    }
    document.body.classList.remove('fight-active')
  }, [screen, bumpHud])

  const fr = fightRef.current
  const enemy = selectedEnemyId ? getEnemyById(selectedEnemyId) : null
  const stage =
    screen === 'fight' && fr
      ? STAGES.find((s) => s.id === fr.stageId)
      : selectedStageId
        ? STAGES.find((s) => s.id === selectedStageId)
        : null
  void hudTick
  const mobCharPreviewActive = Boolean(
    fateRolling || hoverEnemyId || selectedEnemyId || fatePreviewId,
  )

  return (
    <>
      <style>{css}</style>
      <MobileRotateOverlay />
      {screen !== 'title' && <div className="scanlines" aria-hidden />}

      {screen === 'title' && <TitleScreen onStart={goCharSelect} />}

      {screen === 'charSelect' && isMobileLandscape && (
        <div className="menu-dark mob-char-select">
          <div className="mob-char-top">
            <button type="button" className="mob-back-link" onClick={goTitle}>
              &lt; Back
            </button>
            <h1 className="neon-title stage-select-title">
              Pick a fighter to challenge Nong Nut
            </h1>
          </div>
          <div className="mob-vs">
            <div
              className={`mob-vs-slot mob-vs-enemy ${mobCharPreviewActive ? 'has-pick' : ''}`}
            >
              {mobCharPreviewActive ? (
                (() => {
                  const previewId = fateRolling
                    ? fatePreviewId
                    : hoverEnemyId || selectedEnemyId || fatePreviewId
                  const e = previewId ? getEnemyById(previewId) : null
                  if (!e) {
                    return (
                      <>
                        <div className="mob-vs-figure mob-vs-placeholder-figure">
                          <span className="mob-vs-placeholder-q">?</span>
                        </div>
                        <div className="mob-vs-meta">
                          <p className="mob-vs-placeholder">Pick a fighter</p>
                        </div>
                      </>
                    )
                  }
                  return (
                    <>
                      <div className="mob-vs-figure">
                        <img src={e.img} alt={e.name} />
                      </div>
                      <div className="mob-vs-meta">
                        <p className="mob-vs-name">{e.name}</p>
                        {fateRolling ? (
                          <p className="mob-vs-tagline">??? SELECTING ???</p>
                        ) : (
                          <>
                            <p className="mob-vs-tagline">{e.title}</p>
                            <p className="mob-vs-desc">&ldquo;{e.taunt}&rdquo;</p>
                          </>
                        )}
                      </div>
                    </>
                  )
                })()
              ) : (
                <>
                  <div className="mob-vs-figure mob-vs-placeholder-figure">
                    <span className="mob-vs-placeholder-q">?</span>
                  </div>
                  <div className="mob-vs-meta">
                    <p className="mob-vs-placeholder">Pick a fighter</p>
                  </div>
                </>
              )}
            </div>
            <div className="mob-vs-label">VS</div>
            <div className="mob-vs-slot mob-vs-champ">
              <div className="mob-vs-figure">
                <img src={PLAYER.img} alt={PLAYER.name} />
              </div>
              <div className="mob-vs-meta">
                <p className="mob-vs-name">{PLAYER.name}</p>
                <p className="mob-vs-tagline">{PLAYER.title}</p>
                <p className="mob-vs-desc">&ldquo;{PLAYER.tagline}&rdquo;</p>
              </div>
            </div>
          </div>
          <div className="mob-picker-section">
            <div className={`mob-picker ${fateRolling ? 'fate-shuffling' : ''}`}>
              {ENEMIES.map((e) => (
                <button
                  type="button"
                  key={e.id}
                  disabled={fateRolling || mobileAdvancing}
                  className={`mob-picker-cell ${selectedEnemyId === e.id ? 'selected fate-locked' : ''} ${fateRolling && fatePreviewId === e.id ? 'fate-active' : ''}`}
                  onClick={() => handleEnemyPick(e.id)}
                  aria-label={e.name}
                >
                  <span className="mob-picker-headshot">
                    <img src={e.mobHeadshot || e.img} alt="" />
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="mob-picker-cell mob-picker-random"
                disabled={fateRolling || mobileAdvancing}
                onClick={() => startFateDecide({ advanceOnComplete: true })}
                aria-label="Random fighter"
              >
                ?
              </button>
            </div>
            <p
              className={`mob-advance-banner ${mobileAdvancing ? '' : 'mob-advance-banner--hidden'}`}
              aria-hidden={!mobileAdvancing}
            >
              FIGHTER LOCKED IN — LOADING STAGE...
            </p>
          </div>
        </div>
      )}

      {screen === 'charSelect' && !isMobileLandscape && (
        <div className="menu-dark char-select-screen">
          <div className="char-select-header">
            <h1 className="neon-title char-select-title">LADYBOY KNOCKOUT</h1>
            <p className="char-select-subtitle">Pick a fighter to challenge Nong Nut</p>
          </div>
          <div className="char-select-body">
            <div className={`enemy-grid ${fateRolling ? 'fate-shuffling' : ''}`}>
              {ENEMIES.map((e) => (
                <button
                  type="button"
                  key={e.id}
                  disabled={fateRolling || mobileAdvancing}
                  className={`enemy-card ${selectedEnemyId === e.id ? 'selected' : ''} ${fateRolling && fatePreviewId === e.id ? 'fate-active' : ''} ${!fateRolling && selectedEnemyId === e.id ? 'fate-locked' : ''}`}
                  onMouseEnter={() => {
                    if (!fateRolling && !mobileAdvancing) setHoverEnemyId(e.id)
                  }}
                  onMouseLeave={() => {
                    if (!fateRolling && !mobileAdvancing) setHoverEnemyId(null)
                  }}
                  onClick={() => handleEnemyPick(e.id)}
                >
                  <img src={e.img} alt="" />
                  <p className="enemy-card-name">{e.name}</p>
                </button>
              ))}
              <button
                type="button"
                className="enemy-card enemy-card-random"
                disabled={fateRolling || mobileAdvancing}
                onClick={() => startFateDecide({ advanceOnComplete: isMobileLandscape })}
                aria-label="Random fighter"
              >
                ?
              </button>
            </div>
            <div className="vs-row">
              <div
                className={`char-side enemy-side ${selectedEnemyId || fatePreviewId ? 'selected' : ''} ${fateRolling ? 'fate-rolling' : ''} ${!fateRolling && selectedEnemyId ? 'fate-locked' : ''}`}
              >
                {fateRolling || hoverEnemyId || selectedEnemyId || fatePreviewId ? (
                  (() => {
                    const previewId = fateRolling
                      ? fatePreviewId
                      : hoverEnemyId || selectedEnemyId || fatePreviewId
                    const e = previewId ? getEnemyById(previewId) : null
                    if (!e) return <p className="char-placeholder">Pick a fighter</p>
                    return (
                      <>
                        <img src={e.img} alt={e.name} />
                        <p className="char-name">{e.name}</p>
                        <p className="char-title">{e.title}</p>
                        {fateRolling ? (
                          <p className="fate-status">??? SELECTING ???</p>
                        ) : (
                          <p className="char-taunt">“{e.taunt}”</p>
                        )}
                      </>
                    )
                  })()
                ) : (
                  <p className="char-placeholder">Pick a fighter</p>
                )}
              </div>
              <div className="vs-big">VS</div>
              <div className="char-side player-side">
                <img src={PLAYER.img} alt={PLAYER.name} />
                <p className="char-name">{PLAYER.name}</p>
                <p className="char-tagline">The Knockout Queen</p>
                <p className="char-tagline-secondary">"They always find out the hard way!"</p>
              </div>
            </div>
          </div>
          {mobileAdvancing && (
            <p className="mob-advance-banner">FIGHTER LOCKED IN — LOADING STAGE...</p>
          )}
          <div className="char-select-actions">
            <button
              type="button"
              className="btn"
              disabled={fateRolling || mobileAdvancing}
              onClick={() => startFateDecide()}
            >
              {fateRolling ? 'SELECTING...' : 'LET FATE DECIDE'}
            </button>
            {selectedEnemyId && !fateRolling && !mobileAdvancing && (
              <button type="button" className="btn btn-primary" onClick={goStageSelect}>
                LET&apos;S FIGHT
              </button>
            )}
            <button type="button" className="back-link" onClick={goTitle}>
              back to main menu
            </button>
          </div>
        </div>
      )}

      {screen === 'stageSelect' && enemy && isMobileLandscape && (
        <div className="menu-dark mob-stage-select">
          <div className="mob-stage-top">
            <div>
              <h1 className="neon-title stage-select-title">SELECT STAGE</h1>
            </div>
            <button
              type="button"
              className="mob-back-link"
              onClick={() => {
                clearStageFateRoll()
                setScreen('charSelect')
              }}
            >
              &lt; Back
            </button>
          </div>
          <div className={`mob-stage-grid ${stageFateRolling ? 'fate-shuffling' : ''}`}>
            {STAGES.map((s) => (
              <button
                type="button"
                key={s.id}
                disabled={stageFateRolling}
                className={`mob-stage-card stage-card ${selectedStageId === s.id ? 'selected' : ''} ${stageFateRolling && stageFatePreviewId === s.id ? 'fate-active' : ''}`}
                onClick={() => {
                  if (stageFateRolling) return
                  clearStageFateRoll()
                  startFight(s.id)
                }}
              >
                <img src={s.img} alt="" />
                <div className="stage-label">{s.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {screen === 'stageSelect' && enemy && !isMobileLandscape && (
        <div className="menu-dark stage-select-screen">
          <div className="stage-select-header">
            <h1 className="neon-title stage-select-title">SELECT STAGE</h1>
            <p className="stage-select-subtitle">
              {enemy.name} vs {PLAYER.name}
            </p>
          </div>
          <div className={`stage-grid ${stageFateRolling ? 'fate-shuffling' : ''}`}>
            {STAGES.map((s) => (
              <button
                type="button"
                key={s.id}
                disabled={stageFateRolling}
                className={`stage-card ${selectedStageId === s.id ? 'selected' : ''} ${stageFateRolling && stageFatePreviewId === s.id ? 'fate-active' : ''}`}
                onClick={() => {
                  if (stageFateRolling) return
                  clearStageFateRoll()
                  startFight(s.id)
                }}
              >
                <img src={s.img} alt="" />
                <div className="stage-label">{s.name}</div>
              </button>
            ))}
          </div>
          <div className="char-select-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={stageFateRolling}
              onClick={startStageFateDecide}
            >
              {stageFateRolling ? 'SELECTING...' : 'RANDOM STAGE'}
            </button>
            <button
              type="button"
              className="btn"
              disabled={stageFateRolling}
              onClick={() => {
                clearStageFateRoll()
                setScreen('charSelect')
              }}
            >
              BACK
            </button>
          </div>
          <button
            type="button"
            className="mob-back-link"
            onClick={() => {
              clearStageFateRoll()
              setScreen('charSelect')
            }}
          >
            &lt; Back to fighter select
          </button>
        </div>
      )}

      {screen === 'fight' && fr && stage && (() => {
        const playerDef = getFighterById(fr.playerId)
        const enemyDef = getEnemyById(fr.playerId)
        const now = performance.now()
        const playerHitFlash = fr.playerHitFlashUntil > now
        const enemyHitFlash = fr.enemyHitFlashUntil > now
        return (
        <div className="fight-arena">
          <div className="fight-hud">
            <div className="hud-side">
              <span style={{ color: varNeonPink() }}>{playerDef.name}</span>
              <div className="hud-bar-row">
                <img
                  className="hud-portrait"
                  src={enemyDef.img}
                  alt=""
                  style={{ borderColor: enemyDef.color || varNeonPink() }}
                />
                <div className="bar-wrap">
                  <div
                    className={`bar-fill ${hpBarClass(fr.php / fr.pmax)}`}
                    style={{ width: `${(fr.php / fr.pmax) * 100}%` }}
                  />
                </div>
              </div>
              <div className="pips">
                <div className={`pip ${fr.pw > 0 ? 'on' : ''}`} />
                <div className={`pip ${fr.pw > 1 ? 'on' : ''}`} />
              </div>
            </div>
            <div className="timer-box">
              <div className={`timer-value ${fr.timeLeft <= 10 ? 'urgent' : ''}`}>
                {String(Math.ceil(fr.timeLeft)).padStart(2, '0')}
              </div>
              <div className="round-label">ROUND {fr.round}</div>
              <div className="stage-label-hud">{stage.name.toUpperCase()}</div>
            </div>
            <div className="hud-side right">
              <span style={{ color: '#faa' }}>{PLAYER.name}</span>
              <div className="hud-bar-row">
                <div className="bar-wrap">
                  <div
                    className={`bar-fill ${hpBarClass(fr.ehp / fr.emax)}`}
                    style={{ width: `${(fr.ehp / fr.emax) * 100}%` }}
                  />
                </div>
                <img className="hud-portrait enemy" src={PLAYER.img} alt="" />
              </div>
              <div className="pips">
                <div className={`pip ${fr.ew > 0 ? 'on' : ''}`} />
                <div className={`pip ${fr.ew > 1 ? 'on' : ''}`} />
              </div>
            </div>
          </div>

          <div className="fight-stage" ref={arenaShakeRef}>
            <div className="fight-bg">
              <img src={stage.img} alt="" />
            </div>
            <div className="ground-tint" />
            <div className="hit-flash" ref={flashRef} />

            {fr.battleMsg && <div className="battle-msg">{fr.battleMsg}</div>}

            <div className="fighters" ref={arenaRef}>
              {fr.damageNumbers.map((d) =>
                d.spark ? (
                  <div key={d.id} className="hit-spark" style={{ left: d.x, top: d.y }}>
                    {d.val}
                  </div>
                ) : (
                  <div key={d.id} className="damage-num" style={{ left: d.x, top: d.y, color: d.col || '#ff4444' }}>
                    -{d.val}
                  </div>
                ),
              )}
              {fr.hurtSpark && fr.hurtSpark.until > now && (
                <HitSpark x={fr.hurtSpark.x} y={fr.hurtSpark.y} visible />
              )}
              <div className="fighter" ref={playerWrapRef}>
                <Fighter
                  character={fr.playerId}
                  state={playerFighterState}
                  flipped={fr.playerFacing < 0}
                  height={playerFighterHeight}
                  hitFlash={playerHitFlash}
                />
              </div>
              <div className="fighter" ref={enemyWrapRef}>
                <Fighter
                  character={PLAYER.id}
                  state={enemyFighterState}
                  flipped={fr.enemyFacing < 0}
                  height={enemyFighterHeight}
                  hitFlash={enemyHitFlash}
                />
              </div>
            </div>

            <div className="fight-hint">
              <div>◀▶ MOVE &nbsp; ▲ JUMP &nbsp; ▼ BLOCK</div>
              <div>J PUNCH &nbsp; K KICK &nbsp; L SPECIAL &nbsp; I FLY</div>
            </div>
          </div>

          <TouchControls keysRef={keysRef} pressRef={pressRef} />
        </div>
        )
      })()}

      {screen === 'gameOver' && stage && enemy && (
        <GameOverScreen
          result={matchWinner === 'player' ? 'win' : 'lose'}
          playerFighter={enemy}
          score={goScore}
          stageBg={stage.img}
          onRematch={() => {
            fightRef.current = createFightState(selectedEnemyId, selectedStageId)
            animRef.current.player = { state: 'IDLE', until: 0, locked: false }
            animRef.current.enemy = { state: 'IDLE', until: 0, locked: false }
            setPlayerFighterState('IDLE')
            setEnemyFighterState('IDLE')
            setMatchWinner(null)
            setScreen('fight')
            bumpHud()
          }}
          onNewFight={() => {
            setMatchWinner(null)
            fightRef.current = null
            animRef.current.player = { state: 'IDLE', until: 0, locked: false }
            animRef.current.enemy = { state: 'IDLE', until: 0, locked: false }
            setScreen('charSelect')
            setSelectedEnemyId(null)
            setSelectedStageId(null)
          }}
        />
      )}
    </>
  )
}

function varNeonPink() {
  return '#ff2ea6'
}
