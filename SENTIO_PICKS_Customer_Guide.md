# SENTIO PICKS — Customer Setup Guide
## Daily AI Football Analysis via Google Sheets

---

## What You Get

Your purchase includes:
- ✅ **Google Sheets template** — auto-refreshes with today's match data
- ✅ **Personal API key** — your unique access code (check your Etsy messages)
- ✅ **17 statistical columns** per match with color-coded confidence
- ✅ **AI Analysis Prompt** — copy & paste into ChatGPT/Claude for instant deep analysis

---

## Quick Start (5 Minutes)

### Step 1: Open the Template
Click the Google Sheets link from your Etsy purchase confirmation.

### Step 2: Make Your Own Copy
> ⚠️ **IMPORTANT:** You must make a copy first!

1. Click **File** → **Make a copy**
2. Choose a location in your Google Drive
3. Click **Make a copy**

You now have your own editable spreadsheet.

### Step 3: Install the Script

1. In your copied spreadsheet, go to **Extensions** → **Apps Script**
2. A new tab opens (the script editor)
3. You'll see some default code — **delete all of it**
4. **Paste** the script code provided in your Etsy purchase
5. Click the **💾 Save** button (or press Ctrl+S)
6. Close the Apps Script tab
7. **Go back to your spreadsheet and refresh the page** (press F5)
8. Wait 3-5 seconds — you'll see a **🔄 SENTIO** menu appear in the top menu bar

### Step 4: Fetch Today's Data

1. Click **🔄 SENTIO** → **Fetch Today's Data**
2. **First time only:** Google will ask for permission
   - Click **Continue**
   - Select your Google account
   - Click **Advanced** → **Go to SENTIO (unsafe)**
   - Click **Allow**
3. A dialog box will appear asking for your API key
4. Enter your SENTIO API key (from your Etsy message, starts with `SENTIO_`)
5. Click **OK**
6. ✅ Data loads! You'll see a success alert confirming how many matches were loaded

---

## What's Inside Your Spreadsheet

### 📊 Sheet 1: Overview
The main data table with 17 columns of match statistics:

| Column | Meaning |
|--------|---------|
| **Match** | Home team vs Away team |
| **League** | Competition name |
| **Time** | Kickoff time |
| **League Avg** | Average total goals per match (both teams combined) |
| **H Win%** | Home team win rate |
| **A Win%** | Away team win rate |
| **H O2.5%** | Home team's Over 2.5 goals rate |
| **A O2.5%** | Away team's Over 2.5 goals rate |
| **BTTS%** | Both Teams To Score rate |
| **H Avg Scored** | Home avg goals scored (home games) |
| **A Avg Scored** | Away avg goals scored (away games) |
| **H Avg Conceded** | Home avg goals conceded (home games) |
| **A Avg Conceded** | Away avg goals conceded (away games) |
| **H CS%** | Home clean sheet rate |
| **A CS%** | Away clean sheet rate |
| **H FH Win%** | Home first-half win rate |
| **A FH Win%** | Away first-half win rate |

**Color coding:**
- 🟢 **Green (70%+)** = Strong indicator
- 🟡 **Yellow (40-70%)** = Medium confidence
- 🔴 **Red (under 40%)** = Weak indicator

### 📄 Sheet 2: AI Prompt
Contains detailed statistical text for every match. To use:

1. **Copy** all the text from the AI Prompt sheet
2. **Paste** it into ChatGPT, Claude, Gemini, or any AI chatbot
3. Ask: *"Analyze these matches and give me your top picks for Over 2.5, BTTS, and match winner"*
4. Get instant AI-powered analysis! 🎯

---

## Daily Usage

Come back every day and just:

1. Open your spreadsheet
2. Click **🔄 SENTIO** → **Fetch Today's Data**
3. Enter your API key → done!

New matches are published daily. Your spreadsheet always shows the latest data.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **🔄 SENTIO menu doesn't appear** | Refresh the page (F5). If still missing: Extensions → Apps Script → select `onOpen` function → click ▶ Run |
| **"Authorization required" error** | Click Continue → Select account → Advanced → Go to SENTIO → Allow |
| **"Invalid API key" error** | Check your Etsy messages for the correct key. It starts with `SENTIO_` |
| **"Error 500"** | Server is temporarily down. Try again in a few minutes |
| **Data looks old** | Make sure you clicked "Fetch Today's Data" today. Data refreshes at ~12:00 UTC daily |
| **AI Prompt sheet is empty** | Data was recently updated — re-fetch and it will appear |

---

## Need Help?

Contact us through Etsy messages and we'll respond within 24 hours.

---

*© SENTIO PICKS — AI Football Analysis*
*Data refreshed daily • Powered by advanced statistical algorithms*
