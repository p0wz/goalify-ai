/**
 * Daily Match Analyzer
 * Implements all 13 market filter criteria
 */

const flashscore = require('./flashscore');
const ALLOWED_LEAGUES = require('../data/leagues');

/**
 * Calculate advanced stats from match history
 */
function calculateStats(history, teamName) {
    if (!history || !Array.isArray(history) || history.length === 0) return null;

    let totalMatches = 0;
    let totalGoals = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    let over15Count = 0;
    let over25Count = 0;
    let under25Count = 0;
    let under35Count = 0;
    let bttsCount = 0;
    let cleanSheetCount = 0;
    let failedToScoreCount = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let htGoalCount = 0;
    let firstHalfWins = 0;
    let secondHalfWins = 0;
    let eitherHalfWins = 0;

    for (const m of history) {
        const s1 = parseInt(m.home_team?.score) || 0;
        const s2 = parseInt(m.away_team?.score) || 0;
        if (isNaN(s1) || isNaN(s2)) continue;

        totalMatches++;
        const total = s1 + s2;
        totalGoals += total;

        const isHome = m.home_team?.name === teamName;
        const myScore = isHome ? s1 : s2;
        const oppScore = isHome ? s2 : s1;

        goalsScored += myScore;
        goalsConceded += oppScore;

        if (total > 1.5) over15Count++;
        if (total > 2.5) over25Count++;
        if (total <= 2.5) under25Count++;
        if (total <= 3.5) under35Count++;
        if (s1 > 0 && s2 > 0) bttsCount++;
        if (oppScore === 0) cleanSheetCount++;
        if (myScore === 0) failedToScoreCount++;

        if (myScore > oppScore) wins++;
        else if (myScore === oppScore) draws++;
        else losses++;

        // HT scores
        const htHome = parseInt(m.home_team?.score_1st_half) || 0;
        const htAway = parseInt(m.away_team?.score_1st_half) || 0;
        if (htHome + htAway >= 1) htGoalCount++;

        const h2Home = s1 - htHome;
        const h2Away = s2 - htAway;

        const myHT = isHome ? htHome : htAway;
        const oppHT = isHome ? htAway : htHome;
        const myH2 = isHome ? h2Home : h2Away;
        const oppH2 = isHome ? h2Away : h2Home;

        if (myHT > oppHT) firstHalfWins++;
        if (myH2 > oppH2) secondHalfWins++;
        if (myHT > oppHT || myH2 > oppH2) eitherHalfWins++;
    }

    if (totalMatches === 0) return null;

    return {
        matches: totalMatches,
        avgTotalGoals: totalGoals / totalMatches,
        avgScored: goalsScored / totalMatches,
        avgConceded: goalsConceded / totalMatches,
        over15Rate: (over15Count / totalMatches) * 100,
        over25Rate: (over25Count / totalMatches) * 100,
        under25Rate: (under25Count / totalMatches) * 100,
        under35Rate: (under35Count / totalMatches) * 100,
        bttsRate: (bttsCount / totalMatches) * 100,
        scoringRate: ((totalMatches - failedToScoreCount) / totalMatches) * 100,
        winRate: (wins / totalMatches) * 100,
        lossCount: losses,
        cleanSheetRate: (cleanSheetCount / totalMatches) * 100,
        htGoalRate: (htGoalCount / totalMatches) * 100,
        firstHalfWinRate: (firstHalfWins / totalMatches) * 100,
        secondHalfWinRate: (secondHalfWins / totalMatches) * 100,
        eitherHalfWinRate: (eitherHalfWins / totalMatches) * 100
    };
}

/**
 * Analyze First Half potential
 */
function analyzeFirstHalf(homeHistory, awayHistory, h2hHistory, homeTeam, awayTeam) {
    const calculatePotential = (matches) => {
        if (!matches || matches.length === 0) return 0;
        let totalWeight = 0;
        matches.forEach(m => {
            const total = (parseInt(m.home_team?.score) || 0) + (parseInt(m.away_team?.score) || 0);
            if (total >= 3) totalWeight += 1.0;
            else if (total === 2) totalWeight += 0.65;
            else if (total === 1) totalWeight += 0.30;
        });
        return (totalWeight / matches.length) * 100;
    };

    const homeLastHome = homeHistory.filter(m => m.home_team?.name === homeTeam).slice(0, 8);
    const awayLastAway = awayHistory.filter(m => m.away_team?.name === awayTeam).slice(0, 8);

    const homePot = calculatePotential(homeLastHome);
    const awayPot = calculatePotential(awayLastAway);
    const h2hPot = calculatePotential(h2hHistory.slice(0, 5));

    let homeScore = homePot >= 80 ? 40 : homePot >= 60 ? 30 : homePot >= 40 ? 20 : 10;
    let awayScore = awayPot >= 80 ? 40 : awayPot >= 60 ? 30 : awayPot >= 40 ? 20 : 10;
    let h2hScore = h2hPot >= 80 ? 20 : h2hPot >= 60 ? 15 : h2hPot >= 40 ? 10 : 0;

    let totalScore = homeScore + awayScore + h2hScore;
    if (totalScore > 100) totalScore = 100;
    if (totalScore < 0) totalScore = 0;

    return {
        signal: totalScore >= 75,
        score: totalScore,
        homePot,
        awayPot,
        h2hPot
    };
}

/**
 * Validate First Half with real HT scores
 */
function validateHTScores(homeDetails, awayDetails, homeTeam, awayTeam) {
    const extractHTGoals = (details) => {
        if (!details) return null;
        if (details.home_team?.score_1st_half !== undefined) {
            return (parseInt(details.home_team.score_1st_half) || 0) +
                (parseInt(details.away_team.score_1st_half) || 0);
        }
        if (details.scoreboard?.period_1) {
            return (parseInt(details.scoreboard.period_1.home) || 0) +
                (parseInt(details.scoreboard.period_1.away) || 0);
        }
        return null;
    };

    let homeHTGoalCount = 0, homeValid = 0;
    let awayHTGoalCount = 0, awayValid = 0;

    homeDetails.forEach(d => {
        const htGoals = extractHTGoals(d);
        if (htGoals !== null) {
            homeValid++;
            if (htGoals >= 1) homeHTGoalCount++;
        }
    });

    awayDetails.forEach(d => {
        const htGoals = extractHTGoals(d);
        if (htGoals !== null) {
            awayValid++;
            if (htGoals >= 1) awayHTGoalCount++;
        }
    });

    const homeHTRate = homeValid > 0 ? (homeHTGoalCount / homeValid) * 100 : 0;
    const awayHTRate = awayValid > 0 ? (awayHTGoalCount / awayValid) * 100 : 0;
    const combinedRate = (homeHTRate + awayHTRate) / 2;

    return {
        passed: homeValid >= 2 && awayValid >= 2 && combinedRate >= 60,
        homeHTRate,
        awayHTRate,
        combinedRate
    };
}

/**
 * Run full analysis on a single match
 */
async function analyzeMatch(match, h2hData) {
    const sections = h2hData;

    // Filter history
    const homeRawHistory = sections.filter(x =>
        x.home_team?.name === match.homeTeam || x.away_team?.name === match.homeTeam
    );
    const awayRawHistory = sections.filter(x =>
        x.home_team?.name === match.awayTeam || x.away_team?.name === match.awayTeam
    );

    const homeAllHistory = homeRawHistory.slice(0, 5);
    const awayAllHistory = awayRawHistory.slice(0, 5);
    const homeAtHomeHistory = sections.filter(x => x.home_team?.name === match.homeTeam).slice(0, 8);
    const awayAtAwayHistory = sections.filter(x => x.away_team?.name === match.awayTeam).slice(0, 8);
    const mutualH2H = sections.filter(x =>
        (x.home_team?.name === match.homeTeam && x.away_team?.name === match.awayTeam) ||
        (x.home_team?.name === match.awayTeam && x.away_team?.name === match.homeTeam)
    ).slice(0, 3);

    const homeForm = calculateStats(homeAllHistory, match.homeTeam);
    const awayForm = calculateStats(awayAllHistory, match.awayTeam);
    const homeHomeStats = calculateStats(homeAtHomeHistory, match.homeTeam);
    const awayAwayStats = calculateStats(awayAtAwayHistory, match.awayTeam);

    if (!homeForm || !awayForm || !homeHomeStats || !awayAwayStats) {
        return null;
    }

    const proxyLeagueAvg = (homeForm.avgTotalGoals + awayForm.avgTotalGoals) / 2;
    const passedMarkets = [];

    // === MARKET FILTERS ===

    // 1. Over 2.5
    if (proxyLeagueAvg >= 3.0 &&
        homeForm.over25Rate >= 70 && awayForm.over25Rate >= 70 &&
        homeHomeStats.avgScored >= 1.5) {
        passedMarkets.push({ market: 'Over 2.5 Goals', key: 'over25' });
    }

    // 2. BTTS
    const h2hBttsCount = mutualH2H.filter(g =>
        (parseInt(g.home_team?.score) || 0) > 0 && (parseInt(g.away_team?.score) || 0) > 0
    ).length;
    const h2hBttsRate = mutualH2H.length > 0 ? (h2hBttsCount / mutualH2H.length) * 100 : 0;

    if (homeHomeStats.scoringRate >= 85 && awayAwayStats.scoringRate >= 80 &&
        homeForm.bttsRate >= 70 && awayForm.bttsRate >= 70 &&
        (h2hBttsRate >= 50 || mutualH2H.length === 0)) {
        passedMarkets.push({ market: 'BTTS', key: 'btts' });
    }

    // 3. 1X Double Chance
    if (homeHomeStats.lossCount <= 1 && awayAwayStats.winRate < 30 &&
        homeHomeStats.winRate >= 50 && homeHomeStats.scoringRate >= 75) {
        passedMarkets.push({ market: '1X Double Chance', key: 'doubleChance' });
    }

    // 4. Home Over 1.5
    if (homeHomeStats.avgScored >= 2.2 && awayAwayStats.avgConceded >= 1.6 &&
        homeHomeStats.scoringRate >= 90 && homeForm.over15Rate >= 85) {
        passedMarkets.push({ market: 'Home Over 1.5', key: 'homeOver15' });
    }

    // 5. Under 3.5
    const h2hSafe35 = mutualH2H.every(g =>
        ((parseInt(g.home_team?.score) || 0) + (parseInt(g.away_team?.score) || 0)) <= 4
    );
    if (proxyLeagueAvg < 2.4 && homeForm.under35Rate >= 80 && awayForm.under35Rate >= 80 && h2hSafe35) {
        passedMarkets.push({ market: 'Under 3.5 Goals', key: 'under35' });
    }

    // 6. Under 2.5
    const mutualOver35 = mutualH2H.some(g =>
        ((parseInt(g.home_team?.score) || 0) + (parseInt(g.away_team?.score) || 0)) > 3
    );
    if (proxyLeagueAvg < 2.5 && homeForm.under25Rate >= 75 && awayForm.under25Rate >= 75 && !mutualOver35) {
        passedMarkets.push({ market: 'Under 2.5 Goals', key: 'under25' });
    }

    // 7. First Half Over 0.5 (basic heuristic)
    const fhAnalysis = analyzeFirstHalf(homeRawHistory, awayRawHistory, mutualH2H, match.homeTeam, match.awayTeam);
    if (fhAnalysis.signal) {
        passedMarkets.push({ market: 'First Half Over 0.5', key: 'firstHalfOver05', fhStats: fhAnalysis });
    }

    // 8. MS1 & 1.5 Üst
    if (homeHomeStats.winRate >= 60 && homeHomeStats.avgScored >= 1.9 &&
        awayAwayStats.avgConceded >= 1.2 && homeForm.over15Rate >= 75) {
        passedMarkets.push({ market: 'MS1 & 1.5 Üst', key: 'ms1AndOver15' });
    }

    // 9. Dep 0.5 Üst
    if (awayAwayStats.scoringRate >= 80 && awayAwayStats.avgScored >= 1.2 &&
        (100 - (homeHomeStats.cleanSheetRate || 0)) >= 80) {
        passedMarkets.push({ market: 'Dep 0.5 Üst', key: 'awayOver05' });
    }

    // 10. Handicap MS1 (-1.5)
    const homeGoalDiff = homeHomeStats.avgScored - homeHomeStats.avgConceded;
    const awayGoalDiff = awayAwayStats.avgScored - awayAwayStats.avgConceded;

    if (homeHomeStats.winRate >= 70 && homeGoalDiff >= 1.8) {
        passedMarkets.push({ market: 'Hnd. MS1 (-1.5)', key: 'handicapHome' });
    } else if (awayAwayStats.winRate >= 70 && awayGoalDiff >= 1.8) {
        passedMarkets.push({ market: 'Hnd. MS2 (-1.5)', key: 'handicapAway' });
    }

    // 11. 1X + 1.5 Üst
    if (homeHomeStats.lossCount <= 1 && awayAwayStats.winRate < 35 &&
        homeHomeStats.winRate >= 45 && homeHomeStats.scoringRate >= 80 &&
        proxyLeagueAvg >= 2.3 && homeForm.over15Rate >= 70) {
        passedMarkets.push({ market: '1X + 1.5 Üst', key: 'dc15' });
    }

    // 12. Ev Herhangi Yarı
    if ((homeHomeStats.eitherHalfWinRate || 0) >= 70 &&
        (homeHomeStats.firstHalfWinRate || 0) >= 45 &&
        (homeHomeStats.secondHalfWinRate || 0) >= 45 &&
        homeHomeStats.winRate >= 55 && homeHomeStats.scoringRate >= 85 &&
        (awayAwayStats.eitherHalfWinRate || 0) < 45) {
        passedMarkets.push({ market: 'Ev Herhangi Yarı', key: 'homeWinsHalf' });
    }

    // 13. Dep DNB
    if (awayAwayStats.winRate >= 45 && awayAwayStats.lossCount <= 1 &&
        homeHomeStats.winRate < 45 && awayAwayStats.scoringRate >= 80 &&
        awayForm.avgScored >= 1.5 && homeHomeStats.lossCount >= 2) {
        passedMarkets.push({ market: 'Dep DNB', key: 'awayDNB' });
    }

    return {
        match,
        stats: {
            homeForm,
            awayForm,
            homeHomeStats,
            awayAwayStats,
            mutual: mutualH2H,
            leagueAvg: proxyLeagueAvg
        },
        passedMarkets
    };
}

/**
 * Generate AI prompt for a match
 */
function generateAIPrompt(match, stats, market, odds = null) {
    const { homeForm, awayForm, homeHomeStats, awayAwayStats, mutual, leagueAvg } = stats;

    let prompt = `Match: ${match.homeTeam} vs ${match.awayTeam}
League: ${match.league}
Market: ${market}${odds ? `\nOdds: ${odds}` : ''}

══════════════════════════════════════════════════
1. LEAGUE CONTEXT
   - League Avg Goals: ${leagueAvg.toFixed(2)}

2. HOME TEAM (${match.homeTeam})
   - Form (Last 5): Scored ${homeForm.avgScored.toFixed(2)}/game, Conceded ${homeForm.avgConceded.toFixed(2)}/game
   - Over 2.5 Rate: ${homeForm.over25Rate.toFixed(0)}%, Under 2.5: ${homeForm.under25Rate.toFixed(0)}%, BTTS: ${homeForm.bttsRate.toFixed(0)}%
   - AT HOME (Last 8): Scoring ${homeHomeStats.scoringRate.toFixed(0)}%, Win ${homeHomeStats.winRate.toFixed(0)}%, Avg ${homeHomeStats.avgScored.toFixed(2)}

3. AWAY TEAM (${match.awayTeam})
   - Form (Last 5): Scored ${awayForm.avgScored.toFixed(2)}/game, Conceded ${awayForm.avgConceded.toFixed(2)}/game
   - Over 2.5 Rate: ${awayForm.over25Rate.toFixed(0)}%, Under 2.5: ${awayForm.under25Rate.toFixed(0)}%, BTTS: ${awayForm.bttsRate.toFixed(0)}%
   - AWAY (Last 8): Concede ${(100 - awayAwayStats.cleanSheetRate).toFixed(0)}%, Avg Conceded ${awayAwayStats.avgConceded.toFixed(2)}

4. H2H (Last ${mutual.length})`;

    mutual.forEach(g => {
        const date = new Date(g.timestamp * 1000).toLocaleDateString('tr-TR');
        prompt += `\n   - ${g.home_team?.name} ${g.home_team?.score}-${g.away_team?.score} ${g.away_team?.name} (${date})`;
    });

    prompt += '\n══════════════════════════════════════════════════';

    return prompt;
}

/**
 * Generate raw stats (no market info)
 */
function generateRawStats(match, stats, odds = null) {
    const { homeForm, awayForm, homeHomeStats, awayAwayStats, mutual, leagueAvg } = stats;
    const kickoff = new Date(match.timestamp * 1000).toLocaleString('tr-TR');

    let text = `══════════════════════════════════════════════════
MATCH: ${match.homeTeam} vs ${match.awayTeam}
LEAGUE: ${match.league}
KICKOFF: ${kickoff}

─────────── HOME TEAM: ${match.homeTeam} ───────────
GENERAL FORM (Last 5 Matches):
  • Matches Played: ${homeForm.matches}
  • Avg Goals Scored: ${homeForm.avgScored.toFixed(2)}
  • Avg Goals Conceded: ${homeForm.avgConceded.toFixed(2)}
  • Over 1.5 Rate: ${homeForm.over15Rate.toFixed(0)}%
  • Over 2.5 Rate: ${homeForm.over25Rate.toFixed(0)}%
  • Under 2.5 Rate: ${homeForm.under25Rate.toFixed(0)}%
  • Under 3.5 Rate: ${homeForm.under35Rate.toFixed(0)}%
  • BTTS Rate: ${homeForm.bttsRate.toFixed(0)}%
  • Win Rate: ${homeForm.winRate.toFixed(0)}%
  • Clean Sheet Rate: ${homeForm.cleanSheetRate.toFixed(0)}%
  • Scoring Rate: ${homeForm.scoringRate.toFixed(0)}%

HOME PERFORMANCE (Last 8 Home Matches):
  • Win Rate: ${homeHomeStats.winRate.toFixed(1)}%
  • Scoring Rate: ${homeHomeStats.scoringRate.toFixed(0)}%
  • Avg Goals Scored: ${homeHomeStats.avgScored.toFixed(2)}
  • Avg Goals Conceded: ${homeHomeStats.avgConceded.toFixed(2)}
  • Clean Sheet Rate: ${homeHomeStats.cleanSheetRate.toFixed(0)}%
  • 1st Half Win Rate: ${(homeHomeStats.firstHalfWinRate || 0).toFixed(1)}%
  • 2nd Half Win Rate: ${(homeHomeStats.secondHalfWinRate || 0).toFixed(1)}%
  • Either Half Win Rate: ${(homeHomeStats.eitherHalfWinRate || 0).toFixed(1)}%

─────────── AWAY TEAM: ${match.awayTeam} ───────────
GENERAL FORM (Last 5 Matches):
  • Matches Played: ${awayForm.matches}
  • Avg Goals Scored: ${awayForm.avgScored.toFixed(2)}
  • Avg Goals Conceded: ${awayForm.avgConceded.toFixed(2)}
  • Over 1.5 Rate: ${awayForm.over15Rate.toFixed(0)}%
  • Over 2.5 Rate: ${awayForm.over25Rate.toFixed(0)}%
  • Under 2.5 Rate: ${awayForm.under25Rate.toFixed(0)}%
  • Under 3.5 Rate: ${awayForm.under35Rate.toFixed(0)}%
  • BTTS Rate: ${awayForm.bttsRate.toFixed(0)}%
  • Win Rate: ${awayForm.winRate.toFixed(0)}%
  • Clean Sheet Rate: ${awayForm.cleanSheetRate.toFixed(0)}%
  • Scoring Rate: ${awayForm.scoringRate.toFixed(0)}%

AWAY PERFORMANCE (Last 8 Away Matches):
  • Win Rate: ${awayAwayStats.winRate.toFixed(1)}%
  • Scoring Rate: ${awayAwayStats.scoringRate.toFixed(0)}%
  • Avg Goals Scored: ${awayAwayStats.avgScored.toFixed(2)}
  • Avg Goals Conceded: ${awayAwayStats.avgConceded.toFixed(2)}
  • Clean Sheet Rate: ${awayAwayStats.cleanSheetRate.toFixed(0)}%
  • 1st Half Win Rate: ${(awayAwayStats.firstHalfWinRate || 0).toFixed(1)}%
  • 2nd Half Win Rate: ${(awayAwayStats.secondHalfWinRate || 0).toFixed(1)}%
  • Either Half Win Rate: ${(awayAwayStats.eitherHalfWinRate || 0).toFixed(1)}%

─────────── HEAD TO HEAD ───────────
Last ${mutual.length} Meetings:`;

    mutual.forEach(g => {
        const date = new Date(g.timestamp * 1000).toLocaleDateString('tr-TR');
        text += `\n  • ${g.home_team?.name} ${g.home_team?.score}-${g.away_team?.score} ${g.away_team?.name} (${date})`;
    });

    // H2H stats
    let h2hOver25 = 0, h2hBtts = 0, h2hTotalGoals = 0;
    mutual.forEach(g => {
        const total = (parseInt(g.home_team?.score) || 0) + (parseInt(g.away_team?.score) || 0);
        h2hTotalGoals += total;
        if (total > 2.5) h2hOver25++;
        if ((parseInt(g.home_team?.score) || 0) > 0 && (parseInt(g.away_team?.score) || 0) > 0) h2hBtts++;
    });

    if (mutual.length > 0) {
        text += `\nH2H Stats:
  • Total Goals Avg: ${(h2hTotalGoals / mutual.length).toFixed(1)}
  • BTTS Rate: ${((h2hBtts / mutual.length) * 100).toFixed(0)}%
  • Over 2.5 Rate: ${((h2hOver25 / mutual.length) * 100).toFixed(0)}%`;
    }

    if (odds) {
        text += `\n\n─────────── BETTING ODDS ───────────\n${odds}`;
    }

    text += '\n══════════════════════════════════════════════════';

    return text;
}

module.exports = {
    calculateStats,
    analyzeMatch,
    analyzeFirstHalf,
    validateHTScores,
    generateAIPrompt,
    generateRawStats,
    ALLOWED_LEAGUES
};
