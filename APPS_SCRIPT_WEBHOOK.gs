/**
 * Axiom Pathways — website application webhook.
 *
 * Receives POSTs from the apply form on the website and appends one row
 * per application to the linked Google Sheet (the "Applications" tab).
 * Optional uploaded resume is saved to Google Drive; the row gets a link.
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
 *
 * NOTE: this version saves resumes to Drive, so the first run will ask for
 * an extra Drive permission. Click Allow.
 */

// ── PASTE YOUR SHEET ID HERE ────────────────────────────────────────
// Open your "Axiom Interns" sheet. The ID is the long string in the URL:
//   https://docs.google.com/spreadsheets/d/THIS_PART_IS_THE_ID/edit
// Copy it between /d/ and /edit and paste it below.
var SHEET_ID = "1h1r0gAI2itYXFOiyqVrzKr_iGP9q3BbV0gq78ImFeiM";

// Tab the website writes to. Created automatically if missing.
var APPLICATIONS_TAB = "Applications";

// Drive folder name where resumes get saved. Created automatically if missing.
var RESUME_FOLDER = "Axiom Pathways — Resumes";

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
  "Resume",
  "Comments",
  "Extra File",
];

function doPost(e) {
  try {
    // Read data from either FormData fields (e.parameter) or JSON body
    var data;
    var params = e.parameter || {};
    if (params.name || params.email) {
      // FormData submission (from browser)
      data = params;
    } else {
      // JSON body (from curl / programmatic)
      data = JSON.parse(e.postData.contents);
    }
    var sheet = getOrCreateTab_();

    var resumeUrl = "";
    if (data.resume_base64) {
      resumeUrl = saveFile_(data, "resume_base64", "resume_type", "resume_name");
    }

    var extraFileUrl = "";
    if (data.extra_file_base64) {
      extraFileUrl = saveFile_(data, "extra_file_base64", "extra_file_type", "extra_file_name");
    }

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
      resumeUrl,
      data.comments   || "",
      extraFileUrl,
    ]);

    return json_({ ok: true, resume: resumeUrl });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Lets you open the /exec URL in a browser to confirm it's live.
function doGet() {
  return json_({ ok: true, service: "axiom-pathways-webhook" });
}

function saveFile_(data, base64Key, typeKey, nameKey) {
  var folder = getOrCreateFolder_(RESUME_FOLDER);
  var bytes = Utilities.base64Decode(data[base64Key]);
  var type = data[typeKey] || "application/octet-stream";
  var safeName = (data.name || "applicant").replace(/[^\w \-]/g, "").trim() || "applicant";
  var fileName = data[nameKey]
    ? safeName + " — " + data[nameKey]
    : safeName + " — file";
  var blob = Utilities.newBlob(bytes, type, fileName);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function getOrCreateFolder_(name) {
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

function getOrCreateTab_() {
  var ss = SHEET_ID && SHEET_ID !== "PASTE_YOUR_SHEET_ID_HERE"
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
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
