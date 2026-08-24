/**
 * AXIOM PATHWAYS — CAREERS WEBHOOK
 *
 * Receives applications to work AT Axiom Pathways (the /careers pages) and
 * appends one row per submission.
 *
 * Its own script, its own deployment, its own spreadsheet — the intern,
 * startup, and chapter scripts are untouched by this one.
 *
 * Deploy:
 *   1. Create a spreadsheet, Extensions → Apps Script, paste this in.
 *   2. Deploy → New deployment → Web app.
 *        Execute as: Me.  Who has access: Anyone.
 *   3. Copy the /exec URL into CAREERS_APPS_SCRIPT_WEBHOOK in the site's env.
 *
 * Posted by lib/careers-submit.ts as a server-side form POST, so the JSON
 * reply below is actually read — return { ok: false } and the site logs it.
 */

var SHEET_NAME = 'Careers';

var COLUMNS = [
  'Timestamp',
  'Role',
  'Role slug',
  'Name',
  'Email',
  'Phone',
  'Location',
  'Links',
  'Why Axiom',
  'What they shipped',
  'Availability',
  'Status',
];

function doPost(e) {
  try {
    var params = (e && e.parameter) || {};
    var sheet = getSheet_();

    sheet.appendRow([
      new Date(),
      params.role_title || '',
      params.role_slug || '',
      params.name || '',
      params.email || '',
      params.phone || '',
      params.location || '',
      params.links || '',
      params.why || '',
      params.shipped || '',
      params.availability || '',
      'New',
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** Health check — opening the /exec URL in a browser should say ok. */
function doGet() {
  return json_({ ok: true, service: 'axiom-careers' });
}

function getSheet_() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  }

  return sheet;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
