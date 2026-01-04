/**
 * Telegram Notification Module
 * Sends live bot signals to Telegram channel/group
 */

const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Send message to Telegram
 */
async function sendMessage(text, parseMode = 'HTML') {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('[Telegram] Not configured - skipping notification');
        return { success: false, reason: 'Not configured' };
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        const response = await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text,
            parse_mode: parseMode,
            disable_web_page_preview: true
        }, {
            timeout: 10000
        });

        if (response.data.ok) {
            console.log('[Telegram] Message sent successfully');
            return { success: true, messageId: response.data.result.message_id };
        } else {
            console.error('[Telegram] API error:', response.data.description);
            return { success: false, error: response.data.description };
        }
    } catch (error) {
        console.error('[Telegram] Send error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Format and send live bot signal (momentum or dead match)
 */
async function sendLiveSignal(signal) {
    // Determine signal type
    const isDeadMatch = signal.isDeadMatch === true;
    const isFormBased = signal.isFormBased === true;

    if (isDeadMatch) {
        return await sendDeadMatchSignal(signal);
    } else if (isFormBased) {
        return await sendFormBasedSignal(signal);
    } else {
        return await sendMomentumSignal(signal);
    }
}

/**
 * Format form-based signal (potential analysis)
 */
async function sendFormBasedSignal(signal) {
    const strategyEmoji = signal.strategyCode === 'FIRST_HALF' ? '⚽' : '🎯';
    const confidenceBar = getConfidenceBar(signal.confidencePercent);

    const message = `
${strategyEmoji} <b>FORM SİNYALİ</b> ${strategyEmoji}

🏟 <b>${signal.home}</b> vs <b>${signal.away}</b>
📍 ${signal.league}

📊 <b>Market:</b> ${signal.strategy}
⏱ <b>Dakika:</b> ${signal.entryMinute}'
📈 <b>Skor:</b> ${signal.entryScore}

🎯 <b>Güven:</b> ${signal.confidencePercent}%
${confidenceBar}

📊 <b>Potansiyel Analizi:</b>
• Ev Kalan: ${signal.stats?.homeRemaining || '-'}
• Dep Kalan: ${signal.stats?.awayRemaining || '-'}
• Ev Ort: ${signal.stats?.homeExpected || '-'}
• Dep Ort: ${signal.stats?.awayExpected || '-'}

📝 <b>Sebep:</b> ${signal.reason}

⚠️ <i>Bu sinyal yatırım tavsiyesi değildir.</i>
━━━━━━━━━━━━━━━
📊 <b>GoalSniper Form Bot</b>
`.trim();

    return await sendMessage(message);
}

/**
 * Format momentum signal (Over/Goal)
 */
async function sendMomentumSignal(signal) {
    const strategyEmoji = signal.strategyCode === 'FIRST_HALF' ? '⚽' : '🎯';
    const confidenceBar = getConfidenceBar(signal.confidencePercent);

    const message = `
${strategyEmoji} <b>CANLI SİNYAL</b> ${strategyEmoji}

🏟 <b>${signal.home}</b> vs <b>${signal.away}</b>
📍 ${signal.league}

📊 <b>Strateji:</b> ${signal.strategy}
⏱ <b>Dakika:</b> ${signal.entryMinute}'
📈 <b>Skor:</b> ${signal.entryScore}

🎯 <b>Güven:</b> ${signal.confidencePercent}%
${confidenceBar}

📝 <b>Sebep:</b>
${signal.reason}

📊 <b>Stats:</b>
• Şut: ${signal.stats?.shots || '-'}
• İsabetli: ${signal.stats?.sot || '-'}
• Korner: ${signal.stats?.corners || '-'}
• xG: ${signal.stats?.xG || '-'}

⚠️ <i>Bu sinyal yatırım tavsiyesi değildir.</i>
━━━━━━━━━━━━━━━
🤖 <b>GoalSniper Live Bot</b>
`.trim();

    return await sendMessage(message);
}

/**
 * Format dead match signal (Under/No Goal)
 */
async function sendDeadMatchSignal(signal) {
    const confidenceBar = getConfidenceBar(signal.confidencePercent);

    const message = `
📉 <b>ÖLÜ MAÇ SİNYALİ</b> 📉

🏟 <b>${signal.home}</b> vs <b>${signal.away}</b>
📍 ${signal.league}

🎯 <b>Market:</b> ${signal.strategy}
⏱ <b>Dakika:</b> ${signal.entryMinute}'
📈 <b>Skor:</b> ${signal.entryScore}

💤 <b>Güven:</b> ${signal.confidencePercent}%
${confidenceBar}

📝 <b>Sebep:</b>
${signal.reason}

📊 <b>Maç Durumu:</b>
• Şut: ${signal.stats?.shots || '-'}
• İsabetli: ${signal.stats?.sot || '-'}
• Korner: ${signal.stats?.corners || '-'}
• xG: ${signal.stats?.xG || '-'}

⚠️ <i>Bu sinyal yatırım tavsiyesi değildir.</i>
━━━━━━━━━━━━━━━
💤 <b>GoalSniper Dead Match Bot</b>
`.trim();

    return await sendMessage(message);
}

/**
 * Generate confidence bar visualization
 */
function getConfidenceBar(percent) {
    const filled = Math.round(percent / 10);
    const empty = 10 - filled;
    return '🟩'.repeat(filled) + '⬜'.repeat(empty);
}

/**
 * Send bot status notification
 */
async function sendBotStatus(status, filterMode = 'filtered') {
    const emoji = status === 'started' ? '🟢' : '🔴';
    const text = status === 'started'
        ? `${emoji} <b>Canlı Bot Başlatıldı</b>\n\n📊 Mod: ${filterMode === 'filtered' ? 'Filtreli Ligler' : 'Tüm Ligler'}\n⏱ Tarama: Her 3 dakika`
        : `${emoji} <b>Canlı Bot Durduruldu</b>`;

    return await sendMessage(text);
}

/**
 * Send settlement result
 */
async function sendSettlementResult(signal, result) {
    const emoji = result === 'WON' ? '✅' : '❌';
    const message = `
${emoji} <b>SİNYAL SONUÇLANDI</b>

🏟 ${signal.home} vs ${signal.away}
📊 ${signal.strategy}
📈 Giriş: ${signal.entryScore} → Son: ${signal.finalScore}

<b>Sonuç: ${result}</b>
`.trim();

    return await sendMessage(message);
}

module.exports = {
    sendMessage,
    sendLiveSignal,
    sendBotStatus,
    sendSettlementResult
};
