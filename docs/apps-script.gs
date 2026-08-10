/**
 * Axiom Pathways — application intake (Google Apps Script)
 *
 * Paste this whole file into the Apps Script project bound to the applications
 * Sheet (Extensions → Apps Script), replacing what is there, then:
 *
 *   1. Deploy → Manage deployments → edit the existing Web app deployment
 *   2. Execute as: Me.  Who has access: Anyone.
 *   3. Deploy — KEEP THE SAME DEPLOYMENT so the URL does not change. The URL is
 *      baked into the site (lib/apply-contract.ts), and a new one breaks intake.
 *
 * What changed from the previous version:
 *   · `startup_picks` is now recorded. It used to be received and dropped,
 *     which is why the "which startups" column was always empty. The site now
 *     sends a comma-joined list from a real pick-list instead of free text.
 *   · `fields_interest` is recorded for the same reason.
 *   · Columns are addressed BY HEADER NAME, not by position. Reordering or
 *     inserting a column in the Sheet can no longer shift every answer into
 *     the wrong cell.
 *   · Missing headers are appended automatically on first submission.
 *
 * The request shape is fixed by the site and must not change:
 *   POST, mode "no-cors", body = URLSearchParams
 *   files arrive as <name>_name, <name>_type, <name>_base64
 */

/** Tab that receives intern submissions. */
var SHEET_NAME = 'Applications';

/** Tab that receives startup submissions. Created automatically if missing. */
var STARTUP_SHEET_NAME = 'Startups';

/** Drive folder for resumes/attachments. Leave '' to skip file saving. */
var UPLOAD_FOLDER_ID = '';

/**
 * Column order. Add new fields to the END so existing columns never shift.
 * The left value is the header text in the Sheet; the right is the form field
 * name the site posts.
 */
var STARTUP_COLUMNS = [
  { header: 'Timestamp',      field: null },
  { header: 'Company',        field: 'company' },
  { header: 'Website',        field: 'website' },
  { header: 'One-liner',      field: 'one_liner' },
  { header: 'Stage',          field: 'stage' },
  { header: 'Team size',      field: 'team_size' },
  { header: 'Location',       field: 'location' },
  { header: 'Contact name',   field: 'contact_name' },
  { header: 'Contact role',   field: 'contact_role' },
  { header: 'Contact email',  field: 'contact_email' },
  { header: 'LinkedIn',       field: 'linkedin' },
  { header: 'Socials',        field: 'socials' },
  { header: 'Fields needed',  field: 'fields_needed' },
  { header: 'Role need',      field: 'role_need' },
  { header: 'Week one',       field: 'week_one' },
  { header: 'Hours',          field: 'hours' },
  { header: 'Location mode',  field: 'location_mode' },
  { header: 'Paid',           field: 'paid' },
  { header: 'Comp',           field: 'comp' },
  { header: 'Start window',   field: 'start_window' },
  { header: 'Minors OK',      field: 'minors_ok' },
  { header: 'Mentor',         field: 'mentor' },
  { header: 'Anything else',  field: 'anything_else' },
  { header: 'Status',         field: null },
];

var COLUMNS = [
  { header: 'Timestamp',        field: null },
  { header: 'Name',             field: 'name' },
  { header: 'Email',            field: 'email' },
  { header: 'Phone',            field: 'phone' },
  { header: 'School',           field: 'school' },
  { header: 'Grade',            field: 'grade' },
  { header: 'Interest',         field: 'interest' },
  { header: 'City/Chapter',     field: 'chapter' },
  { header: 'Internship Sought', field: 'startup_role' },
  { header: 'Background',       field: 'background' },
  { header: 'Fields Interested', field: 'fields_interest' },
  { header: 'Startup Picks',    field: 'startup_picks' },
  { header: 'Letter',           field: 'letter' },
  { header: 'Instagram',        field: 'instagram' },
  { header: 'LinkedIn',         field: 'linkedin' },
  { header: 'GitHub',           field: 'github' },
  { header: 'Other Link',       field: 'other_link' },
  { header: 'Comments',         field: 'comments' },
  { header: 'Resume',           field: null },
  { header: 'Extra File',       field: null },
  { header: 'Status',           field: null },
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var params = (e && e.parameter) || {};

    // The startup application tags itself; the intern payload is unchanged and
    // has no form_type at all, so it keeps falling through to the same tab it
    // always used.
    var isStartup = params.form_type === 'startup';
    var columns = isStartup ? STARTUP_COLUMNS : COLUMNS;
    var sheet = getSheet_(isStartup ? STARTUP_SHEET_NAME : SHEET_NAME);
    var headers = ensureHeaders_(sheet, columns);

    var row = new Array(headers.length).fill('');

    columns.forEach(function (column) {
      if (!column.field) return;
      var index = headers.indexOf(column.header);
      if (index === -1) return;
      row[index] = params[column.field] || '';
    });

    var timestampIndex = headers.indexOf('Timestamp');
    if (timestampIndex !== -1) row[timestampIndex] = new Date();

    // Files arrive base64-encoded alongside their name and mime type.
    setFileCell_(row, headers, 'Resume', params, 'resume');
    setFileCell_(row, headers, 'Extra File', params, 'extra_file');

    sheet.appendRow(row);
    return json_({ ok: true });
  } catch (error) {
    // Never throw: the browser sends this no-cors and cannot read the response,
    // so a thrown error would be an invisible dropped application. Log instead.
    console.error('Application intake failed: ' + error);
    return json_({ ok: false });
  } finally {
    lock.releaseLock();
  }
}

/** Sanity check in a browser — visiting the deployment URL should say ok. */
function doGet() {
  return json_({ ok: true, service: 'axiom-application-intake' });
}

function getSheet_(name) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  return sheet;
}

/**
 * Return the header row, appending any column this script knows about that the
 * sheet does not have yet. Existing columns keep their position.
 */
function ensureHeaders_(sheet, columns) {
  var lastColumn = sheet.getLastColumn();
  var headers =
    lastColumn > 0
      ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String)
      : [];

  var missing = columns
    .map(function (column) { return column.header; })
    .filter(function (header) { return headers.indexOf(header) === -1; });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing])
      .setFontWeight('bold');
    headers = headers.concat(missing);
    sheet.setFrozenRows(1);
  }

  return headers;
}

/**
 * Decode an uploaded file into Drive and write its link into the row.
 * With no UPLOAD_FOLDER_ID configured, the file name is recorded instead so
 * the submission is never silently lost.
 */
function setFileCell_(row, headers, header, params, field) {
  var index = headers.indexOf(header);
  if (index === -1) return;

  var base64 = params[field + '_base64'];
  var name = params[field + '_name'];
  if (!base64 || !name) return;

  if (!UPLOAD_FOLDER_ID) {
    row[index] = name + ' (not saved — set UPLOAD_FOLDER_ID)';
    return;
  }

  try {
    var blob = Utilities.newBlob(
      Utilities.base64Decode(base64),
      params[field + '_type'] || 'application/octet-stream',
      name
    );
    var file = DriveApp.getFolderById(UPLOAD_FOLDER_ID).createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    row[index] = file.getUrl();
  } catch (error) {
    console.error('File save failed for ' + field + ': ' + error);
    row[index] = name + ' (upload failed)';
  }
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
