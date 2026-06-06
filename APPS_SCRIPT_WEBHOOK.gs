/**
 * Axiom Pathways — website application webhook.
 *
 * Receives POSTs from the apply form on the website and appends one row
 * per application to the linked Google Sheet (the "Form Responses" /
 * applications tab).
 *
 * ── SETUP ──────────────────────────────────────────────────────────
 * 1. Open your Intern Tracker Google Sheet.
 * 2. Extensions → Apps Script.
 * 3. Paste this whole file (new file, or below your setupTracker code).
 * 4. Click Save.
 * 5. Deploy → New deployment → type "Web app".
 *      - Execute as:   Me
 *      - Who has access: Anyone
 *    Click Deploy, Authorize/Allow.
 * 6. Copy the Web app URL it gives you (ends in /exec).
 * 7. Paste that URL into the website:
 *      src/pages/index.astro  →  const WEBHOOK_URL = "...";
 * 8. Re-deploy the site. Done — submissions land in the sheet.
 *
 * Re-deploy note: after editing this script, Deploy → Manage deployments
 * → edit (pencil) → Version: New version → Deploy. Same URL stays valid.
 */

// Tab the website writes to. It is created automatically if missing.
var APPLICATIONS_TAB = "Applications";

var HEADERS = [
  "Timestamp",
  "Name",
  "Email",
  "Phone",
  "School",
  "Grade/Year",
  "Track",
  "Interest",
  "City/Chapter",
  "Status",
  "Letter",
  "Instagram",
  "LinkedIn",
  "GitHub",
  "Other Link",
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateTab_();

    sheet.appendRow([
      new Date(),
      data.name       || "",
      data.email      || "",
      data.phone      || "",
      data.school     || "",
      data.grade      || "",
      data.track      || "",
      data.interest   || "",
      data.chapter    || "",
      "Applied",                 // default status for new applicants
      data.letter     || "",
      data.instagram  || "",
      data.linkedin   || "",
      data.github     || "",
      data.other_link || "",
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Lets you open the /exec URL in a browser to confirm it's live.
function doGet() {
  return json_({ ok: true, service: "axiom-pathways-webhook" });
}

function getOrCreateTab_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(APPLICATIONS_TAB);
  if (!sheet) {
    sheet = ss.insertSheet(APPLICATIONS_TAB);
  }
  if (sheet.getLastRow() === 0) {
    var header = sheet.getRange(1, 1, 1, HEADERS.length);
    header.setValues([HEADERS]);
    header.setFontWeight("bold").setFontColor("#ffffff").setBackground("#0e2417");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
