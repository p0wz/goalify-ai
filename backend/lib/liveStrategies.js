/**
 * Live Bot - Strategies Module
 * First Half Goal (12'-38') and Late Game Goal (46'-82')
 */

/**
 * Analyze First Half Goal strategy
 * @param {object} match - Match data
 * @param {number} elapsed - Current minute
 * @param {object} stats - Match statistics
 * @param {object} momentum - Momentum detection result
 * @returns {object|null} Signal candidate or null
 */
function analyzeFirstHalf(match, elapsed, stats, momentum) {
    const homeScore = match.home_team?.score || 0;
    const awayScore = match.away_team?.score || 0;
    const scoreDiff = Math.abs(homeScore - awayScore);

    // Time: 12'-38', score diff <= 1
    if (elapsed < 12 || elapsed > 38 || scoreDiff > 1) {
        return null;
    }

    // Require momentum
    if (!momentum || !momentum.detected) {
        return null;
    }

    const odds = match.odds || {};
    const homeOdds = odds['1'] || 2.0;
    const awayOdds = odds['2'] || 2.0;
    const totalShots = (stats?.shots?.home || 0) + (stats?.shots?.away || 0);
    const totalSoT = (stats?.shotsOnTarget?.home || 0) + (stats?.shotsOnTarget?.away || 0);
    const totalCorners = (stats?.corners?.home || 0) + (stats?.corners?.away || 0);
    const totalxG = (stats?.xG?.home || 0) + (stats?.xG?.away || 0);

    // Build confidence
    let confidencePercent = 60;
    const reasons = [momentum.reason];

    // Shot stats bonuses
    if (totalSoT >= 3) { confidencePercent += 8; reasons.push(`${totalSoT} SoT`); }
    if (totalShots >= 5) { confidencePercent += 5; reasons.push(`${totalShots} shots`); }
    if (totalCorners >= 3) { confidencePercent += 5; reasons.push(`${totalCorners} corners`); }

    // xG bonuses
    if (totalxG > 0.8) { confidencePercent += 10; reasons.push(`xG: ${totalxG.toFixed(2)}`); }
    else if (totalxG > 0.5) { confidencePercent += 5; }

    // Shot efficiency penalty
    if (totalShots >= 8) {
        const accuracy = totalSoT / totalShots;
        if (accuracy < 0.30) {
            confidencePercent -= 5;
            reasons.push(`Low accuracy (${Math.round(accuracy * 100)}%)`);
        }
    }

    // xG underperformance bonus
    const homexG = stats?.xG?.home || 0;
    const awayxG = stats?.xG?.away || 0;
    if ((homexG - homeScore) >= 1.2 || (awayxG - awayScore) >= 1.2) {
        confidencePercent += 10;
        reasons.push('xG underperformance');
    }

    // Dominance check
    const shotDiff = (stats?.shots?.home || 0) - (stats?.shots?.away || 0);
    const sotDiff = (stats?.shotsOnTarget?.home || 0) - (stats?.shotsOnTarget?.away || 0);
    if (Math.abs(shotDiff) >= 4 || Math.abs(sotDiff) >= 2) {
        confidencePercent += 10;
        const domTeam = shotDiff >= 4 || sotDiff >= 2 ? 'Home' : 'Away';
        reasons.push(`${domTeam} dominating`);

        // Favorite pressure bonus
        const isHomeFav = homeOdds < 1.60;
        const isAwayFav = awayOdds < 1.60;
        if ((domTeam === 'Home' && isHomeFav) || (domTeam === 'Away' && isAwayFav)) {
            confidencePercent += 7;
            reasons.push('Favorite pushing');
        }
    } else if (totalSoT < 3) {
        confidencePercent -= 5;
    }

    // Momentum timeframe bonus
    if (momentum.timeframe <= 3) confidencePercent += 10;
    else if (momentum.timeframe <= 6) confidencePercent += 5;

    // Cap confidence
    if (confidencePercent > 95) confidencePercent = 95;
    if (confidencePercent < 30) confidencePercent = 30;

    return {
        matchId: match.match_id,
        home: match.home_team?.name || 'Home',
        away: match.away_team?.name || 'Away',
        score: `${homeScore}-${awayScore}`,
        elapsed,
        strategy: 'First Half Goal',
        strategyCode: 'FIRST_HALF',
        confidencePercent,
        reason: reasons.join(' | '),
        momentumTrigger: momentum.trigger,
        stats: {
            shots: totalShots,
            shotsOnTarget: totalSoT,
            corners: totalCorners,
            xG: totalxG.toFixed(2),
            possession: `${stats?.possession?.home || 50}%-${stats?.possession?.away || 50}%`
        },
        league: match.league_name || 'Unknown',
        country: match.country_name || ''
    };
}

/**
 * Analyze Late Game Goal strategy
 * @param {object} match - Match data
 * @param {number} elapsed - Current minute
 * @param {object} stats - Match statistics
 * @param {object} momentum - Momentum detection result
 * @returns {object|null} Signal candidate or null
 */
function analyzeLateGame(match, elapsed, stats, momentum) {
    const homeScore = match.home_team?.score || 0;
    const awayScore = match.away_team?.score || 0;
    const goalDiff = Math.abs(homeScore - awayScore);

    // Time: 46'-82', score diff <= 2
    if (elapsed < 46 || elapsed > 82 || goalDiff > 2) {
        return null;
    }

    // Require momentum
    if (!momentum || !momentum.detected) {
        return null;
    }

    const odds = match.odds || {};
    const homeOdds = odds['1'] || 2.0;
    const awayOdds = odds['2'] || 2.0;
    const totalShots = (stats?.shots?.home || 0) + (stats?.shots?.away || 0);
    const totalSoT = (stats?.shotsOnTarget?.home || 0) + (stats?.shotsOnTarget?.away || 0);
    const totalCorners = (stats?.corners?.home || 0) + (stats?.corners?.away || 0);
    const totalxG = (stats?.xG?.home || 0) + (stats?.xG?.away || 0);

    // Build confidence
    let confidencePercent = 50;
    const reasons = [momentum.reason];

    // Shot stats bonuses
    if (totalSoT >= 5) { confidencePercent += 10; reasons.push(`${totalSoT} SoT`); }
    if (totalShots >= 10) { confidencePercent += 8; reasons.push(`${totalShots} shots`); }
    if (totalCorners >= 5) { confidencePercent += 5; reasons.push(`${totalCorners} corners`); }
    if (totalxG > 1.0) { confidencePercent += 7; reasons.push(`xG: ${totalxG.toFixed(2)}`); }

    // Shot efficiency penalty
    if (totalShots >= 10) {
        const accuracy = totalSoT / totalShots;
        if (accuracy < 0.30) {
            confidencePercent -= 5;
            reasons.push(`Low accuracy (${Math.round(accuracy * 100)}%)`);
        }
    }

    // xG underperformance bonus
    const homexG = stats?.xG?.home || 0;
    const awayxG = stats?.xG?.away || 0;
    if ((homexG - homeScore) >= 1.2 || (awayxG - awayScore) >= 1.2) {
        confidencePercent += 10;
        reasons.push('xG underperformance');
    }

    // Dominance check
    const shotDiff = (stats?.shots?.home || 0) - (stats?.shots?.away || 0);
    const sotDiff = (stats?.shotsOnTarget?.home || 0) - (stats?.shotsOnTarget?.away || 0);
    if (Math.abs(shotDiff) >= 4 || Math.abs(sotDiff) >= 2) {
        confidencePercent += 10;
        const domTeam = shotDiff >= 4 || sotDiff >= 2 ? 'Home' : 'Away';
        reasons.push(`${domTeam} dominating`);

        const isHomeFav = homeOdds < 1.60;
        const isAwayFav = awayOdds < 1.60;
        if ((domTeam === 'Home' && isHomeFav) || (domTeam === 'Away' && isAwayFav)) {
            confidencePercent += 7;
            reasons.push('Favorite pushing');
        }
    } else if (totalSoT < 4) {
        confidencePercent -= 5;
    }

    // Close game bonus
    if (goalDiff <= 1) { confidencePercent += 8; reasons.push(`Close: ${homeScore}-${awayScore}`); }

    // Peak timing bonus (65-78 mins)
    if (elapsed >= 65 && elapsed <= 78) { confidencePercent += 7; reasons.push(`Peak: ${elapsed}'`); }

    // Trailing team bonus
    if (goalDiff >= 1 && goalDiff <= 2) {
        confidencePercent += 6;
        const trailing = homeScore < awayScore ? 'Home' : 'Away';
        reasons.push(`${trailing} chasing`);
    }

    // Momentum timeframe bonus
    if (momentum.timeframe <= 3) confidencePercent += 10;
    else if (momentum.timeframe <= 6) confidencePercent += 5;

    // Cap confidence
    if (confidencePercent > 95) confidencePercent = 95;
    if (confidencePercent < 30) confidencePercent = 30;

    return {
        matchId: match.match_id,
        home: match.home_team?.name || 'Home',
        away: match.away_team?.name || 'Away',
        score: `${homeScore}-${awayScore}`,
        elapsed,
        strategy: 'Late Game Goal',
        strategyCode: 'LATE_GAME',
        confidencePercent,
        reason: reasons.join(' | '),
        momentumTrigger: momentum.trigger,
        stats: {
            shots: totalShots,
            shotsOnTarget: totalSoT,
            corners: totalCorners,
            xG: totalxG.toFixed(2),
            possession: `${stats?.possession?.home || 50}%-${stats?.possession?.away || 50}%`
        },
        league: match.league_name || 'Unknown',
        country: match.country_name || ''
    };
}

module.exports = {
    analyzeFirstHalf,
    analyzeLateGame
};
