/**
 * Axiom Pathways — CHAPTER application webhook.
 *
 * Separate script, separate spreadsheet, separate deployment from BOTH the
 * intern webhook (APPS_SCRIPT_WEBHOOK.gs) and the startup webhook
 * (APPS_SCRIPT_STARTUPS.gs). Nothing here touches either of those, and neither
 * of their Sheets is ever written by this file.
 *
 * One row per chapter application, on the "Chapters" tab. No file uploads —
 * the chapter form has none — so this script needs no Drive permission.
 *
 * ── SETUP ──────────────────────────────────────────────────────────
 * 1. Create a NEW Google Sheet for chapters. Name it something like
 *    "Axiom — Chapters". Copy its ID out of the URL:
 *      https://docs.google.com/spreadsheets/d/<THIS PART>/edit
 * 2. Paste that ID into SHEET_ID below, replacing the empty string.
 * 3. In that Sheet: Extensions → Apps Script. Delete the stub Code.gs
 *    contents, paste this whole file, Save.
 * 4. Deploy → New deployment → type "Web app".
 *      - Execute as:      Me
 *      - Who has access:  Anyone
 *    Deploy, then Authorize/Allow.
 * 5. Copy the Web app URL (ends in /exec).
 * 6. Put it in the site's environment as:
 *      CHAPTER_APPS_SCRIPT_WEBHOOK=https://script.google.com/.../exec
 *    (.env.local locally, Vercel → Environment Variables for deploys.)
 * 7. Open the /exec URL in a browser — it should print
 *    {"ok":true,"service":"axiom-chapters-webhook"}.
 *
 * Re-deploy note: after editing this script, Deploy → Manage deployments
 * → edit (pencil) → Version: New version → Deploy. The URL stays valid.
 * Creating a NEW deployment instead would mint a new /exec URL and silently
 * strand every submission until the env var is updated.
 *
 * This endpoint is public by necessity (Apps Script web apps have no auth for
 * anonymous callers), so it only ever appends rows and never reads anything
 * back out. A junk POST costs one throwaway row, nothing more.
 */

// The chapters spreadsheet — NOT the intern tracker, NOT the startups sheet.
// Fill this in during step 2 above.
var SHEET_ID = "";

// Tab this script writes to. Created automatically if missing.
var CHAPTERS_TAB = "Chapters";

// Column order. Keep in step with FIELDS below — they are index-matched.
var HEADERS = [
  "Timestamp",
  "Status",
  "Name",
  "Email",
  "Phone",
  "Year",
  "Based in",
  "LinkedIn",
  "Other link",
  "School",
  "School type",
  "School size",
  "Club approval process",
  "Advisor status",
  "Advisor name",
  "Existing clubs",
  "What makes them qualified",
  "What they have built",
  "Why Axiom",
  "Something that did not work",
  "First 30 days",
  "First 10 members",
  "Meeting cadence",
  "Member value at 3 months",
  "Local startups / mentors",
  "Biggest risk",
  "Hours per week",
  "How long",
  "Co-founders",
  "Co-founder names",
  "Monthly call",
  "Also interested in",
  "Anything else",
];

// Form field names, in the same order as HEADERS after Timestamp + Status.
// These match the question ids in lib/apply-sections.ts (CHAPTER_SECTIONS).
var FIELDS = [
  "name",
  "email",
  "phone",
  "grade",
  "city",
  "linkedin",
  "other_link",
  "school",
  "school_type",
  "school_size",
  "club_process",
  "advisor_status",
  "advisor_name",
  "existing_clubs",
  "qualified",
  "built",
  "why_axiom",
  "hardest",
  "first_30",
  "first_members",
  "cadence",
  "member_value",
  "startups_local",
  "biggest_risk",
  "hours",
  "how_long",
  "cofounders",
  "cofounder_names",
  "monthly_call",
  "also_interested",
  "anything_else",
];

function doPost(e) {
  try {
    var data = readPayload_(e);
    if (!data.name && !data.email) {
      return json_({ ok: false, error: "empty submission" });
    }

    var sheet = getOrCreateTab_();

    var row = [new Date(), "New"];
    for (var i = 0; i < FIELDS.length; i++) {
      row.push(data[FIELDS[i]] || "");
    }
    sheet.appendRow(row);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Lets you open the /exec URL in a browser to confirm it's live.
function doGet() {
  return json_({ ok: true, service: "axiom-chapters-webhook" });
}

/** Accepts form-encoded fields or a JSON body — same as the other webhooks. */
function readPayload_(e) {
  var params = (e && e.parameter) || {};
  if (params.name || params.email) return params;
  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }
  return {};
}

function getOrCreateTab_() {
  if (!SHEET_ID) {
    throw new Error("SHEET_ID is empty — see step 2 in the setup notes above.");
  }
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(CHAPTERS_TAB);
  if (!sheet) {
    sheet = ss.insertSheet(CHAPTERS_TAB);
  }
  if (sheet.getLastRow() === 0) {
    var header = sheet.getRange(1, 1, 1, HEADERS.length);
    header.setValues([HEADERS]);
    header.setFontWeight("bold").setFontColor("#ffffff").setBackground("#0e2417");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 150);
  }
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
