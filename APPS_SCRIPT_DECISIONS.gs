/**
 * Axiom — push review decisions from the Sheet to the site.
 *
 * ADDITIVE. Paste this at the BOTTOM of the script already bound to the
 * "interns axioms" Sheet (Extensions → Apps Script). It does not touch
 * doPost, doGet, or the appendRow that the apply form depends on
 * (lib/apply-contract.ts is a frozen wire contract — see APPS_SCRIPT_WEBHOOK.gs).
 *
 * IF THE BOUND SCRIPT ALREADY HAS AN onOpen: do not paste a second one. Apps
 * Script keeps only the last definition, which would delete the existing Axiom
 * menu. Instead add this one line inside the existing onOpen:
 *
 *   menu.addItem("Push decisions to site", "pushDecisionsToAxiom");
 *
 * SETUP (once) — Project Settings → Script properties:
 *   AXIOM_PUSH_SECRET   same value as SHEET_PUSH_SECRET in the site's env
 *   AXIOM_SITE_URL      optional, defaults to https://axiomapply.com
 *
 * Nothing here sends email. It hands rows to the site, where the decisions
 * sit in a review queue until a human presses send.
 */

/**
 * Column positions in the `Applications` tab, 1-indexed.
 *
 * These are read from POSITION, not from the header row, and that is
 * deliberate: the header row has drifted out of sync with the data. Row 1
 * labels column J "Status", but J actually holds free text, and the real
 * decision chip lives in column Y, which has no header at all.
 *
 * So: do not "fix" the headers and do not insert or reorder columns. Adding
 * new columns to the RIGHT of AA is safe. Anything else moves these and the
 * push starts reading the wrong cells — the site's row counts are the
 * tripwire for that (see docs/email-program.md).
 */
var DECISION_SHEET_NAME = "Applications";
var COL_TIMESTAMP = 1;   // A
var COL_NAME      = 2;   // B
var COL_EMAIL     = 3;   // C
var COL_REVIEWER  = 24;  // X — "Matthew", "Frank", …
var COL_DECISION  = 25;  // Y — Accepted / Rejected / waitlist, blank = undecided
var COL_CATEGORY  = 26;  // Z — SWE / GTM / Data / Hardware / Other

/** Rows per request. Keeps each POST well inside Apps Script's limits. */
var PUSH_CHUNK = 300;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Axiom")
    .addItem("Push decisions to site", "pushDecisionsToAxiom")
    .addToUi();
}

function pushDecisionsToAxiom() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty("AXIOM_PUSH_SECRET");
  var siteUrl = props.getProperty("AXIOM_SITE_URL") || "https://axiomapply.com";

  if (!secret) {
    ui.alert(
      "Missing secret",
      "Set AXIOM_PUSH_SECRET in Project Settings → Script properties first. " +
        "It has to match SHEET_PUSH_SECRET on the site.",
      ui.ButtonSet.OK,
    );
    return;
  }

  var sheet = SpreadsheetApp.getActive().getSheetByName(DECISION_SHEET_NAME);
  if (!sheet) {
    ui.alert("No sheet named " + DECISION_SHEET_NAME);
    return;
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    ui.alert("Nothing to push — the sheet has no data rows.");
    return;
  }

  // One read for the whole range. Reading cell by cell over 700+ rows is the
  // classic way to blow the 6-minute execution limit.
  var values = sheet
    .getRange(2, 1, lastRow - 1, COL_CATEGORY)
    .getDisplayValues();

  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var v = values[i];
    var email = String(v[COL_EMAIL - 1] || "").trim();
    if (!email) continue; // blank spacer rows

    rows.push({
      row: i + 2, // real sheet row number, so skipped rows are findable by eye
      timestamp: String(v[COL_TIMESTAMP - 1] || "").trim(),
      name: String(v[COL_NAME - 1] || "").trim(),
      email: email,
      reviewer: String(v[COL_REVIEWER - 1] || "").trim(),
      decision: String(v[COL_DECISION - 1] || "").trim(),
      category: String(v[COL_CATEGORY - 1] || "").trim(),
    });
  }

  if (!rows.length) {
    ui.alert("Nothing to push — no rows with an email address.");
    return;
  }

  var endpoint = siteUrl.replace(/\/+$/, "") + "/api/sheet/decisions";
  var pushedAt = new Date().toISOString();
  var totals = { received: 0, upserted: 0, duplicates: 0 };
  var skippedRows = [];
  var errors = [];

  for (var start = 0; start < rows.length; start += PUSH_CHUNK) {
    var chunk = rows.slice(start, start + PUSH_CHUNK);
    var response = UrlFetchApp.fetch(endpoint, {
      method: "post",
      contentType: "application/json",
      headers: { "x-axiom-secret": secret },
      payload: JSON.stringify({
        pushed_at: pushedAt,
        chunk: Math.floor(start / PUSH_CHUNK) + 1,
        chunks: Math.ceil(rows.length / PUSH_CHUNK),
        rows: chunk,
      }),
      muteHttpExceptions: true,
    });

    var code = response.getResponseCode();
    if (code !== 200) {
      errors.push("rows " + (start + 2) + "+ → HTTP " + code + " " + response.getContentText().slice(0, 200));
      continue;
    }

    var body = JSON.parse(response.getContentText());
    totals.received += body.received || 0;
    totals.upserted += body.upserted || 0;
    totals.duplicates += body.duplicatesCollapsed || 0;
    skippedRows = skippedRows.concat(body.skipped || []);
  }

  var message =
    totals.received +
    " rows read, " +
    totals.upserted +
    " saved, " +
    totals.duplicates +
    " duplicate emails collapsed, " +
    skippedRows.length +
    " skipped.\n\n" +
    "Nothing has been emailed. Open " +
    siteUrl.replace(/\/+$/, "") +
    "/admin/applications to review and send.";

  // Skipped rows are the ones worth a human's attention: an unreadable
  // decision, or a row whose columns don't line up (rows 414-453 were written
  // by an older version of this script and keep the email in K, M or Z rather
  // than C, so neither the address nor the decision can be trusted there).
  // Those people get no email at all until the rows are fixed and re-pushed.
  if (skippedRows.length) {
    message += "\n\nSkipped rows — nobody here will be emailed:\n" + summariseSkipped(skippedRows);
  }

  ui.alert(
    errors.length ? "Pushed with errors" : "Pushed",
    errors.length ? message + "\n\nErrors:\n" + errors.join("\n") : message,
    ui.ButtonSet.OK,
  );
}

/**
 * "414-453 (columns don't line up), 344, 345 (unrecognised: POOL)" beats a
 * wall of 42 identical lines when the point is to go fix the Sheet.
 */
function summariseSkipped(skipped) {
  var groups = {};
  for (var i = 0; i < skipped.length; i++) {
    var item = skipped[i];
    var label = item.why + (item.value ? ": " + item.value : "");
    groups[label] = groups[label] || [];
    groups[label].push(item.row);
  }

  var lines = [];
  for (var label in groups) {
    var rows = groups[label].sort(function (a, b) {
      return a - b;
    });

    // Collapse runs of consecutive rows into ranges.
    var parts = [];
    var start = rows[0];
    var previous = rows[0];
    for (var k = 1; k <= rows.length; k++) {
      var current = rows[k];
      if (current !== previous + 1) {
        parts.push(start === previous ? String(start) : start + "-" + previous);
        start = current;
      }
      previous = current;
    }
    lines.push("  " + parts.join(", ") + " — " + label);
  }
  return lines.join("\n");
}
