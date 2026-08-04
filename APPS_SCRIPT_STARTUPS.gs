/**
 * Axiom Pathways — STARTUP application webhook.
 *
 * Separate script, separate spreadsheet, separate deployment from the intern
 * webhook (APPS_SCRIPT_WEBHOOK.gs). Nothing here touches that one, and the
 * intern Sheet is never written by this file.
 *
 * One row per startup application, on the "Startups" tab. No file uploads —
 * the startup form has none — so this script needs no Drive permission.
 *
 * ── SETUP ──────────────────────────────────────────────────────────
 * 1. Open the startups Google Sheet:
 *      https://docs.google.com/spreadsheets/d/1qFIBASDSyp8zjXo0PyQtpydzxbl7qUkhhkkyF2FjuZI/edit
 * 2. Extensions → Apps Script. Delete the stub Code.gs contents.
 * 3. Paste this whole file. Save.
 * 4. Deploy → New deployment → type "Web app".
 *      - Execute as:      Me
 *      - Who has access:  Anyone
 *    Deploy, then Authorize/Allow.
 * 5. Copy the Web app URL (ends in /exec).
 * 6. Put it in the site's environment as:
 *      STARTUP_APPS_SCRIPT_WEBHOOK=https://script.google.com/.../exec
 *    (.env.local locally, Vercel → Environment Variables for deploys.)
 * 7. Open the /exec URL in a browser — it should print
 *    {"ok":true,"service":"axiom-startups-webhook"}.
 *
 * Re-deploy note: after editing this script, Deploy → Manage deployments
 * → edit (pencil) → Version: New version → Deploy. The URL stays valid.
 *
 * This endpoint is public by necessity (Apps Script web apps have no auth for
 * anonymous callers), so it only ever appends rows and never reads anything
 * back out. A junk POST costs one throwaway row, nothing more.
 */

// The startups spreadsheet — NOT the intern tracker.
var SHEET_ID = "1qFIBASDSyp8zjXo0PyQtpydzxbl7qUkhhkkyF2FjuZI";

// Tab this script writes to. Created automatically if missing.
var STARTUPS_TAB = "Startups";

// Column order. Keep in step with FIELDS below — they are index-matched.
var HEADERS = [
  "Timestamp",
  "Status",
  "Startup",
  "Website",
  "One liner",
  "Stage",
  "Team size",
  "Location",
  "Contact name",
  "Contact role",
  "Contact email",
  "LinkedIn",
  "Socials",
  "Fields needed",
  "Role need",
  "Week one",
  "Hours/week",
  "Remote or in person",
  "Paid",
  "Comp",
  "Start window",
  "Works with minors",
  "Mentor",
  "Anything else",
];

// Form field names, in the same order as HEADERS after Timestamp + Status.
// These match the question ids in lib/apply-sections.ts (STARTUP_SECTIONS).
var FIELDS = [
  "company",
  "website",
  "one_liner",
  "stage",
  "team_size",
  "location",
  "contact_name",
  "contact_role",
  "contact_email",
  "linkedin",
  "socials",
  "fields_needed",
  "role_need",
  "week_one",
  "hours",
  "location_mode",
  "paid",
  "comp",
  "start_window",
  "minors_ok",
  "mentor",
  "anything_else",
];

function doPost(e) {
  try {
    var data = readPayload_(e);
    if (!data.company && !data.contact_email) {
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
  return json_({ ok: true, service: "axiom-startups-webhook" });
}

/** Accepts form-encoded fields or a JSON body — same as the intern webhook. */
function readPayload_(e) {
  var params = (e && e.parameter) || {};
  if (params.company || params.contact_email) return params;
  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }
  return {};
}

function getOrCreateTab_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(STARTUPS_TAB);
  if (!sheet) {
    sheet = ss.insertSheet(STARTUPS_TAB);
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
