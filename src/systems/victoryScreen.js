/** Match stats and victory screen data */

export function createMatchStats() {
  return {
    playerDamageDealt: 0,
    enemyDamageDealt: 0,
    playerDamageTaken: 0,
    enemyDamageTaken: 0,
    longestCombo: 0,
    playerRoundsWon: 0,
    enemyRoundsWon: 0,
    playerSupersLanded: 0,
    enemySupersLanded: 0,
    playerTimeSurvived: 0,
    enemyTimeSurvived: 0,
    flawless: false,
    startTime: performance.now(),
  }
}

export class VictoryScreen {
  constructor() {
    this.stats = createMatchStats()
    this.ready = false
    this.showStatsAt = 0
  }

  reset() {
    this.stats = createMatchStats()
    this.ready = false
    this.showStatsAt = 0
  }

  trackDamage(attacker, amount) {
    if (attacker === 'player') {
      this.stats.playerDamageDealt += amount
      this.stats.enemyDamageTaken += amount
    } else {
      this.stats.enemyDamageDealt += amount
      this.stats.playerDamageTaken += amount
    }
  }

  trackCombo(length) {
    if (length > this.stats.longestCombo) this.stats.longestCombo = length
  }

  trackSuper(side) {
    if (side === 'player') this.stats.playerSupersLanded += 1
    else this.stats.enemySupersLanded += 1
  }

  trackRoundWin(winner) {
    if (winner === 'player') this.stats.playerRoundsWon += 1
    else if (winner === 'enemy') this.stats.enemyRoundsWon += 1
  }

  tick(dt, fightActive) {
    if (fightActive) {
      this.stats.playerTimeSurvived += dt
      this.stats.enemyTimeSurvived += dt
    }
  }

  onMatchEnd(winner, flawless = false) {
    this.stats.flawless = flawless
    this.ready = true
    this.showStatsAt = performance.now() + 2000
  }

  shouldShowStats(now) {
    return this.ready && now >= this.showStatsAt
  }

  getDisplayData(winner, playerName, enemyName) {
    const playerWon = winner === 'player'
    return {
      winner,
      winnerName: playerWon ? playerName : enemyName,
      loserName: playerWon ? enemyName : playerName,
      headline: playerWon ? 'YOU WIN THE FIGHT!' : `${enemyName} defeated you!`,
      subline: `${playerWon ? playerName : enemyName} is victorious`,
      flawless: this.stats.flawless,
      stats: {
        damageDealt: playerWon ? this.stats.playerDamageDealt : this.stats.enemyDamageDealt,
        longestCombo: this.stats.longestCombo,
        roundsWon: playerWon ? this.stats.playerRoundsWon : this.stats.enemyRoundsWon,
        supersLanded: playerWon ? this.stats.playerSupersLanded : this.stats.enemySupersLanded,
        timeSurvived: Math.round(
          (playerWon ? this.stats.playerTimeSurvived : this.stats.enemyTimeSurvived) / 1000,
        ),
      },
      fullStats: this.stats,
    }
  }
}
