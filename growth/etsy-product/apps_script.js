/**
 * SENTIO PICKS - AUTO UPDATER
 * ===========================
 * This script fetches daily match analysis from Sentio Picks API
 * and updates the sheet automatically.
 * 
 * SETUP:
 * 1. Extensions > Apps Script
 * 2. Paste this code
 * 3. Save and Run 'onOpen'
 */

const API_URL = "https://goalify-ai.onrender.com/api/public/stats?key=sentio_secure_etsy_2026_x99";

function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('⚽ Sentio Picks')
        .addItem('🔄 Update Matches', 'fetchMatches')
        .addToUi();
}

function fetchMatches() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Show loading toast
    SpreadsheetApp.getActiveSpreadsheet().toast('Fetching latest analysis...', 'Sentio AI');

    try {
        const response = UrlFetchApp.fetch(API_URL);
        const data = JSON.parse(response.getContentText());

        if (!data.success) {
            Browser.msgBox('Error', data.message || 'Failed to fetch data', Browser.Buttons.OK);
            return;
        }

        if (data.matches.length === 0) {
            Browser.msgBox('Info', 'No matches published for today yet. Check back later!', Browser.Buttons.OK);
            return;
        }

        // Clear old content (keep header)
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
            sheet.getRange(2, 1, lastRow - 1, 5).clearContent();
        }

        // Prepare data rows
        const rows = [];
        data.matches.forEach(match => {
            // Parse timestamp
            const date = new Date(match.kickoff);
            const timeStr = Utilities.formatDate(date, Session.getScriptTimeZone(), "HH:mm");

            rows.push([
                timeStr,                  // Col A: Time
                match.league,             // Col B: League
                match.homeTeam,           // Col C: Home
                match.awayTeam,           // Col D: Away
                match.stats               // Col E: AI Analysis (Full Text)
            ]);
        });

        // Write new data
        sheet.getRange(2, 1, rows.length, 5).setValues(rows);

        // Format "Analysis" column (wrap text, alignment)
        const analysisRange = sheet.getRange(2, 5, rows.length, 1);
        analysisRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
        analysisRange.setVerticalAlignment("top");

        // Auto resize columns A-D
        sheet.autoResizeColumns(1, 4);

        // Set column E width for readability
        sheet.setColumnWidth(5, 500);

        // Update timestamp
        const updatedTime = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
        SpreadsheetApp.getActiveSpreadsheet().toast(`Updated ${rows.length} matches!`, 'Success');

    } catch (error) {
        Browser.msgBox('Error', 'Failed to connect to Sentio API: ' + error.toString(), Browser.Buttons.OK);
    }
}
