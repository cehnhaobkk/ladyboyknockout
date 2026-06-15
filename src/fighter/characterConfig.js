import { publicUrl } from '../utils/publicUrl.js'

export const CHARACTER_POSES = {
  dave: {
    standby: '/characters/dave/1_DV_standby.png',
    punch: '/characters/dave/2_DV_punch.png',
    kick: '/characters/dave/3_DV_kick.png',
    flykick: '/characters/dave/4_DV_flykick.png',
    underattack: '/characters/dave/5_DV_underattack.png',
    win: '/characters/dave/6_DV_Win.png',
    lose: '/characters/dave/7_DV_lose.png',
  },
  nong_nut: {
    standby: '/characters/nong_nut/1_standby.png',
    punch: '/characters/nong_nut/2_punch.png',
    kick: '/characters/nong_nut/3_kick.png',
    flykick: '/characters/nong_nut/4_attack.png',
    attack: '/characters/nong_nut/4_attack.png',
    dodge: '/characters/nong_nut/5_hide.png',
    underattack: '/characters/nong_nut/6_lost.png',
    win: '/characters/nong_nut/5_NN_win.png',
    lose: '/characters/nong_nut/6_NN_lose.png',
  },
  kyle: {
    standby: '/characters/kyle/1_KY_standby.png',
    punch: '/characters/kyle/2_KY_punch.png',
    kick: '/characters/kyle/3_KY_kick.png',
    flykick: '/characters/kyle/3_KY_kick.png',
    under_attack: '/characters/kyle/4_KY_under_attack.png',
    charge: '/characters/kyle/5_KY_charge.png',
    win: '/characters/kyle/6__KY_win.png',
    lose: '/characters/kyle/7_KY_lose.png',
  },
  xiaoming: {
    standby: '/characters/xiaoming/1_standby.png',
    punch: '/characters/xiaoming/2_punch.png',
    kick: '/characters/xiaoming/3_kick.png',
    flykick: '/characters/xiaoming/4_attack.png',
    attack: '/characters/xiaoming/4_attack.png',
    dodge: '/characters/xiaoming/5_hide.png',
    underattack: '/characters/xiaoming/6_lost.png',
    win: '/characters/xiaoming/1_standby.png',
    lose: '/characters/xiaoming/6_lost.png',
  },
  rajesh: {
    standby: '/characters/rajesh/1_RJ_standby.png',
    punch: '/characters/rajesh/1_RJ_standby.png',
    kick: '/characters/rajesh/2_RJ_kick.png',
    flykick: '/characters/rajesh/2_RJ_kick.png',
    attack: '/characters/rajesh/3_RJ_attack.png',
    underattack: '/characters/rajesh/4_RJ_attacked.png',
    win: '/characters/rajesh/6_RJ_win.png',
    lose: '/characters/rajesh/5_RJ_lose.png',
  },
  dmitri: {
    standby: '/characters/dmitri/1_DM_standby.png',
    punch: '/characters/dmitri/2_DM_punch.png',
    kick: '/characters/dmitri/3_DM_kick.png',
    flykick: '/characters/dmitri/4_DM_attack.png',
    attack: '/characters/dmitri/4_DM_attack.png',
    special: '/characters/dmitri/5_DM_special.png',
    win: '/characters/dmitri/6_DM_win.png',
    lose: '/characters/dmitri/7_DM_lose.png',
  },
}

for (const poses of Object.values(CHARACTER_POSES)) {
  for (const [key, path] of Object.entries(poses)) {
    poses[key] = publicUrl(path)
  }
}

export const DAVE_STATES = {
  IDLE: {
    pose: 'standby',
    duration: null,
    loop: true,
    interruptible: true,
    cssAnimation: 'daveBob 1.1s ease-in-out infinite',
  },
  WALK: {
    pose: 'standby',
    duration: null,
    loop: true,
    interruptible: true,
    cssAnimation: 'daveWalk 0.4s ease-in-out infinite',
  },
  PUNCH: {
    pose: 'punch',
    duration: 380,
    loop: false,
    interruptible: false,
    cssAnimation: 'davePunch 0.38s ease-out',
    hitFrame: 120,
    damage: 16,
    range: 130,
  },
  KICK: {
    pose: 'kick',
    duration: 420,
    loop: false,
    interruptible: false,
    cssAnimation: 'daveKick 0.42s ease-out',
    hitFrame: 150,
    damage: 20,
    range: 145,
  },
  FLYKICK: {
    pose: 'flykick',
    duration: 600,
    loop: false,
    interruptible: false,
    cssAnimation: 'daveFlyKick 0.6s ease-out',
    hitFrame: 200,
    damage: 28,
    range: 160,
    isAerial: true,
  },
  SPECIAL: {
    pose: 'flykick',
    duration: 600,
    loop: false,
    interruptible: false,
    cssAnimation: 'daveFlyKick 0.6s ease-out',
    hitFrame: 250,
    damage: 32,
    range: 160,
    isAerial: true,
    isSpecial: true,
  },
  DODGE: {
    pose: 'standby',
    duration: 500,
    loop: false,
    interruptible: false,
    cssAnimation: 'daveHurt 0.5s ease-out',
  },
  HURT: {
    pose: 'underattack',
    duration: 450,
    loop: false,
    interruptible: false,
    cssAnimation: 'daveHurt 0.45s ease-out',
  },
  WIN: {
    pose: 'win',
    duration: null,
    loop: true,
    interruptible: false,
    cssAnimation: 'daveWin 0.8s ease-in-out infinite',
  },
  KO: {
    pose: 'lose',
    duration: null,
    loop: true,
    interruptible: false,
    cssAnimation: 'none',
    koClass: 'dave-ko',
  },
}

export const KYLE_STATES = {
  IDLE: {
    pose: 'standby',
    duration: null,
    loop: true,
    interruptible: true,
    cssAnimation: 'kyleBob 0.85s ease-in-out infinite',
  },
  WALK: {
    pose: 'standby',
    duration: null,
    loop: true,
    interruptible: true,
    cssAnimation: 'kyleWalk 0.28s ease-in-out infinite',
  },
  PUNCH: {
    pose: 'punch',
    duration: 320,
    loop: false,
    interruptible: false,
    cssAnimation: 'kylePunch 0.32s ease-out',
    hitFrame: 100,
    damage: 19,
    range: 125,
  },
  KICK: {
    pose: 'kick',
    duration: 380,
    loop: false,
    interruptible: false,
    cssAnimation: 'kyleKick 0.38s ease-out',
    hitFrame: 130,
    damage: 23,
    range: 150,
  },
  FLYKICK: {
    pose: 'flykick',
    duration: 520,
    loop: false,
    interruptible: false,
    cssAnimation: 'kyleFlyKick 0.52s ease-out',
    hitFrame: 170,
    damage: 26,
    range: 160,
    isAerial: true,
  },
  SPECIAL: {
    pose: 'charge',
    duration: 550,
    loop: false,
    interruptible: false,
    cssAnimation: 'kyleCharge 0.55s ease-out',
    hitFrame: 280,
    damage: 30,
    range: 170,
    isCharge: true,
    chargeDistance: 80,
    isSpecial: true,
  },
  DODGE: {
    pose: 'standby',
    duration: 500,
    loop: false,
    interruptible: false,
    cssAnimation: 'kyleHurt 0.5s ease-out',
  },
  HURT: {
    pose: 'under_attack',
    duration: 420,
    loop: false,
    interruptible: false,
    cssAnimation: 'kyleHurt 0.42s ease-out',
    showHitSpark: true,
  },
  WIN: {
    pose: 'win',
    duration: null,
    loop: true,
    interruptible: false,
    cssAnimation: 'kyleWin 1.0s ease-in-out infinite',
  },
  KO: {
    pose: 'lose',
    duration: null,
    loop: false,
    interruptible: false,
    cssAnimation: 'kyleFall 0.5s ease forwards',
    koClass: 'kyle-ko',
  },
}

export const DMITRI_STATES = {
  IDLE: {
    pose: 'standby',
    duration: null,
    loop: true,
    interruptible: true,
    cssAnimation: 'dmitriBob 1.0s ease-in-out infinite',
  },
  WALK: {
    pose: 'standby',
    duration: null,
    loop: true,
    interruptible: true,
    cssAnimation: 'dmitriWalk 0.38s ease-in-out infinite',
  },
  PUNCH: {
    pose: 'punch',
    duration: 400,
    loop: false,
    interruptible: false,
    cssAnimation: 'dmitriPunch 0.4s ease-out',
    hitFrame: 130,
    damage: 23,
    range: 125,
  },
  KICK: {
    pose: 'kick',
    duration: 440,
    loop: false,
    interruptible: false,
    cssAnimation: 'dmitriKick 0.44s ease-out',
    hitFrame: 160,
    damage: 25,
    range: 140,
  },
  FLYKICK: {
    pose: 'flykick',
    duration: 650,
    loop: false,
    interruptible: false,
    cssAnimation: 'dmitriLunge 0.65s ease-out',
    hitFrame: 220,
    damage: 30,
    range: 165,
    isAerial: true,
  },
  SPECIAL: {
    pose: 'special',
    duration: 700,
    loop: false,
    interruptible: false,
    cssAnimation: 'dmitriSlam 0.7s ease-out',
    hitFrame: 280,
    damage: 35,
    range: 150,
    isSpecial: true,
  },
  DODGE: {
    pose: 'standby',
    duration: 500,
    loop: false,
    interruptible: false,
    cssAnimation: 'dmitriHurt 0.5s ease-out',
  },
  HURT: {
    pose: 'standby',
    duration: 450,
    loop: false,
    interruptible: false,
    cssAnimation: 'dmitriHurt 0.45s ease-out',
  },
  WIN: {
    pose: 'win',
    duration: null,
    loop: true,
    interruptible: false,
    cssAnimation: 'dmitriWin 0.85s ease-in-out infinite',
  },
  KO: {
    pose: 'lose',
    duration: null,
    loop: true,
    interruptible: false,
    cssAnimation: 'none',
    koClass: 'dmitri-ko',
  },
}

export const RAJESH_STATES = {
  IDLE: {
    pose: 'standby',
    duration: null,
    loop: true,
    interruptible: true,
    cssAnimation: 'rajeshBob 0.95s ease-in-out infinite',
  },
  WALK: {
    pose: 'standby',
    duration: null,
    loop: true,
    interruptible: true,
    cssAnimation: 'rajeshWalk 0.32s ease-in-out infinite',
  },
  PUNCH: {
    pose: 'punch',
    duration: 320,
    loop: false,
    interruptible: false,
    cssAnimation: 'rajeshPunch 0.32s ease-out',
    hitFrame: 110,
    damage: 17,
    range: 115,
  },
  KICK: {
    pose: 'kick',
    duration: 420,
    loop: false,
    interruptible: false,
    cssAnimation: 'rajeshKick 0.42s ease-out',
    hitFrame: 150,
    damage: 20,
    range: 145,
  },
  FLYKICK: {
    pose: 'flykick',
    duration: 520,
    loop: false,
    interruptible: false,
    cssAnimation: 'rajeshFlyKick 0.52s ease-out',
    hitFrame: 180,
    damage: 24,
    range: 155,
    isAerial: true,
  },
  SPECIAL: {
    pose: 'attack',
    duration: 750,
    loop: false,
    interruptible: false,
    cssAnimation: 'rajeshSpecialForward 0.75s ease-out',
    hitFrame: 210,
    damage: 32,
    range: 160,
    isSpecial: true,
  },
  DODGE: {
    pose: 'standby',
    duration: 480,
    loop: false,
    interruptible: false,
    cssAnimation: 'rajeshHurt 0.48s ease-out',
  },
  HURT: {
    pose: 'underattack',
    duration: 450,
    loop: false,
    interruptible: false,
    cssAnimation: 'rajeshHurt 0.45s ease-out',
    showHitSpark: true,
  },
  WIN: {
    pose: 'win',
    duration: null,
    loop: true,
    interruptible: false,
    cssAnimation: 'rajeshWin 0.7s ease-in-out infinite',
  },
  KO: {
    pose: 'lose',
    duration: null,
    loop: true,
    interruptible: false,
    cssAnimation: 'none',
    koClass: 'rajesh-ko',
  },
}

const GENERIC_STATES = {
  IDLE: {
    pose: 'standby',
    duration: null,
    loop: true,
    interruptible: true,
    cssClass: '',
  },
  WALK: {
    pose: 'standby',
    duration: null,
    loop: true,
    interruptible: true,
    cssClass: 'walk-bob',
  },
  PUNCH: {
    pose: 'punch',
    duration: 350,
    loop: false,
    interruptible: false,
    cssClass: 'generic-punch',
    hitFrame: 120,
    range: 120,
  },
  KICK: {
    pose: 'kick',
    duration: 400,
    loop: false,
    interruptible: false,
    cssClass: 'generic-kick',
    hitFrame: 130,
    range: 135,
  },
  FLYKICK: {
    pose: 'flykick',
    duration: 600,
    loop: false,
    interruptible: false,
    cssClass: 'fly-fx',
    hitFrame: 200,
    range: 145,
  },
  SPECIAL: {
    pose: 'attack',
    duration: 600,
    loop: false,
    interruptible: false,
    cssClass: 'special-fx',
    hitFrame: 200,
    range: 145,
    isSpecial: true,
  },
  DODGE: {
    pose: 'dodge',
    duration: 500,
    loop: false,
    interruptible: false,
    cssClass: '',
  },
  HURT: {
    pose: 'underattack',
    duration: 450,
    loop: false,
    interruptible: false,
    cssClass: 'hurt-fx',
  },
  WIN: {
    pose: 'win',
    duration: null,
    loop: true,
    interruptible: false,
    cssClass: 'win-fx',
  },
  KO: {
    pose: 'lose',
    duration: null,
    loop: true,
    interruptible: false,
    cssClass: 'ko-fx',
  },
}

const CHARACTER_OVERRIDES = {
  xiaoming: {
    KICK: { range: 140 },
    SPECIAL: { hitFrame: 190 },
    KO: { koClass: 'xiaoming-ko' },
  },
  nong_nut: {
    PUNCH: { damage: 20, range: 130 },
    KICK: { damage: 22, range: 140 },
    SPECIAL: { damage: 30, range: 150, hitFrame: 200 },
  },
}

export const CHARACTER_STATES = {
  dave: DAVE_STATES,
  kyle: KYLE_STATES,
  dmitri: DMITRI_STATES,
  rajesh: RAJESH_STATES,
}

for (const charId of ['nong_nut', 'xiaoming']) {
  CHARACTER_STATES[charId] = { ...GENERIC_STATES }
  const overrides = CHARACTER_OVERRIDES[charId]
  if (overrides) {
    for (const [state, patch] of Object.entries(overrides)) {
      CHARACTER_STATES[charId][state] = {
        ...GENERIC_STATES[state],
        ...patch,
      }
    }
  }
}

export const FIGHT_CHARACTERS = Object.keys(CHARACTER_POSES)

export function getStateConfig(characterId, state) {
  const states = CHARACTER_STATES[characterId] || GENERIC_STATES
  return states[state] || GENERIC_STATES[state] || GENERIC_STATES.IDLE
}

export function getAiTiming(characterId, hpRatio = 1) {
  if (characterId === 'dave') {
    return { min: 700, max: 1200 }
  }
  if (characterId === 'kyle') {
    const aggression = hpRatio < 0.4 ? 300 : 0
    return { min: Math.max(400, 500 - aggression), max: Math.max(600, 900 - aggression) }
  }
  if (characterId === 'nong_nut') {
    const aggression = hpRatio < 0.35 ? 200 : 0
    return { min: Math.max(420, 480 - aggression), max: Math.max(650, 880 - aggression) }
  }
  if (characterId === 'dmitri') {
    const aggression = hpRatio < 0.5 ? 250 : 0
    return { min: Math.max(500, 650 - aggression), max: Math.max(750, 1100 - aggression) }
  }
  if (characterId === 'rajesh') {
    const aggression = hpRatio < 0.4 ? 180 : 0
    return { min: Math.max(450, 520 - aggression), max: Math.max(680, 950 - aggression) }
  }
  return { min: 600, max: 1000 }
}

export function usesDaveAi(characterId) {
  return characterId === 'dave'
}

export function usesKyleAi(characterId) {
  return characterId === 'kyle'
}

export function usesCustomAi(characterId) {
  return characterId === 'dave' || characterId === 'kyle'
}
