/**
 * Axiom Pathways — startup application intake (ADD-ON, not a replacement)
 *
 * The existing script already handles intern applications, the Decision
 * column, the resume folder and the onOpen menu. Do not replace it. This file
 * only adds a second destination: startup applications, which the site now
 * posts with form_type=startup.
 *
 * ── INSTALL ───────────────────────────────────────────────────────────────
 * 1. In the Apps Script editor, Files → + → Script. Name it `Startups`.
 * 2. Paste this whole file into it.
 * 3. Open the file that already has doPost (Untitled.gs) and add these two
 *    lines as the FIRST thing inside doPost, before anything else runs:
 *
 *        var p = (e && e.parameter) || {};
 *        if (p.form_type === 'startup') return handleStartupSubmission_(p);
 *
 *    That is the only edit to the existing file — everything already in
 *    doPost stays below it, untouched. Intern submissions carry no form_type,
 *    so they fall straight through to the code that already works.
 *
 *    Pasting this file WITHOUT that edit does nothing: it defines the handler
 *    but nothing calls it.
 * 4. Deploy → Manage deployments → pencil on the EXISTING deployment →
 *    Version: New version → Deploy.
 *
 *    Do NOT create a new deployment. A new one gets a new /exec URL, and the
 *    current URL is baked into the site — changing it silently kills intake.
 *
 * The Startups tab is created on the first submission; you do not need to
 * make it yourself.
 */

/** Tab that receives startup applications. */
var STARTUP_TAB = 'Startups';

/**
 * Header text → the field name the site posts.
 * Add new questions to the END so existing columns never shift.
 */
var STARTUP_FIELDS = [
  ['Timestamp', null],
  ['Company', 'company'],
  ['Website', 'website'],
  ['One-liner', 'one_liner'],
  ['Stage', 'stage'],
  ['Team size', 'team_size'],
  ['Location', 'location'],
  ['Contact name', 'contact_name'],
  ['Contact role', 'contact_role'],
  ['Contact email', 'contact_email'],
  ['LinkedIn', 'linkedin'],
  ['Socials', 'socials'],
  ['Fields needed', 'fields_needed'],
  ['What they need', 'role_need'],
  ['Week one', 'week_one'],
  ['Hours/week', 'hours'],
  ['Remote or in person', 'location_mode'],
  ['Paid', 'paid'],
  ['Comp', 'comp'],
  ['Start window', 'start_window'],
  ['Can work with minors', 'minors_ok'],
  ['Reports to', 'mentor'],
  ['Anything else', 'anything_else'],
  ['Status', null],
];

/**
 * Append one startup application. Called from doPost when form_type=startup.
 *
 * Columns are addressed by header name, not position, so reordering the tab by
 * hand cannot shift answers into the wrong cells. Missing headers are added.
 */
function handleStartupSubmission_(params) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(STARTUP_TAB);
    if (!sheet) sheet = spreadsheet.insertSheet(STARTUP_TAB);

    var lastColumn = sheet.getLastColumn();
    var headers =
      lastColumn > 0
        ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String)
        : [];

    var missing = STARTUP_FIELDS.map(function (pair) {
      return pair[0];
    }).filter(function (header) {
      return headers.indexOf(header) === -1;
    });

    if (missing.length) {
      sheet
        .getRange(1, headers.length + 1, 1, missing.length)
        .setValues([missing])
        .setFontWeight('bold');
      headers = headers.concat(missing);
      sheet.setFrozenRows(1);
    }

    var row = new Array(headers.length).fill('');

    STARTUP_FIELDS.forEach(function (pair) {
      var header = pair[0];
      var field = pair[1];
      if (!field) return;
      var index = headers.indexOf(header);
      if (index !== -1) row[index] = params[field] || '';
    });

    var timestampIndex = headers.indexOf('Timestamp');
    if (timestampIndex !== -1) row[timestampIndex] = new Date();

    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, form: 'startup' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Never throw. The browser posts this no-cors and cannot read the
    // response, so an exception would be an invisibly dropped application.
    console.error('Startup intake failed: ' + error);
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
