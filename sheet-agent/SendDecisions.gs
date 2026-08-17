/**
 * Axiom decision mailer — read the Sheet, send through Resend, mark the row.
 *
 * Two menu items, in this order, always:
 *
 *   Axiom → Preview decision emails   builds a tab showing exactly who would
 *                                     be mailed and the full text each person
 *                                     receives. Sends nothing.
 *   Axiom → Send next batch           sends BATCH_SIZE emails and writes
 *                                     Emailed + Emailed At back to the row.
 *
 * Preview first, every time. Decision mail cannot be recalled.
 *
 * This file defines no onOpen — SortApplicants.gs owns the Axiom menu, and
 * Apps Script keeps only the LAST onOpen defined across the project, so a
 * second one here would silently delete Sort Applicants, Dashboard and the
 * rest. Add these two lines to the chain in that file instead:
 *
 *     .addItem('👁 Preview decision emails', 'previewDecisionEmails')
 *     .addItem('✉️ Send next batch', 'sendNextDecisionBatch')
 *
 * Setup, once: Project Settings → Script properties → RESEND_API_KEY.
 */

/* ------------------------------------------------------------------ */
/* menu handlers                                                       */
/* ------------------------------------------------------------------ */

function previewDecisionEmails() {
  var ui = SpreadsheetApp.getUi();
  var plan = buildPlan_();
  if (plan.error) {
    ui.alert(plan.error);
    return;
  }

  writePreviewTab_(plan);

  ui.alert(
    "Preview built — nothing sent",
    describePlan_(plan) +
      '\n\nOpen the "' +
      PREVIEW_TAB +
      '" tab and read the copy. When it is right, run Send next batch.',
    ui.ButtonSet.OK,
  );
}

function sendNextDecisionBatch() {
  var ui = SpreadsheetApp.getUi();

  var apiKey = PropertiesService.getScriptProperties().getProperty("RESEND_API_KEY");
  if (!apiKey) {
    ui.alert("Set RESEND_API_KEY in Project Settings → Script properties first.");
    return;
  }

  var plan = buildPlan_();
  if (plan.error) {
    ui.alert(plan.error);
    return;
  }
  if (!plan.pending.length) {
    ui.alert("Nothing pending. Everyone who should be mailed already has been.");
    return;
  }

  var batch = plan.pending.slice(0, BATCH_SIZE);

  // Last gate before anything leaves. Names the count and the first recipient
  // so a misconfigured run is visible in the confirmation itself.
  var go = ui.alert(
    "Send " + batch.length + " emails?",
    describePlan_(plan) +
      "\n\nThis sends " +
      batch.length +
      " now, starting with " +
      batch[0].email +
      ".\nFrom: " +
      FROM +
      "\n\nThis cannot be undone.",
    ui.ButtonSet.OK_CANCEL,
  );
  if (go !== ui.Button.OK) return;

  var sheet = SpreadsheetApp.getActive().getSheetByName(TAB);
  var markColumn = ensureColumn_(sheet, MARK_HEADER);
  var markAtColumn = ensureColumn_(sheet, MARK_AT_HEADER);

  var sent = 0;
  var failures = [];

  for (var i = 0; i < batch.length; i++) {
    var person = batch[i];
    var email = renderEmail_(person.template, person.firstName);
    var result = sendViaResend_(apiKey, person.email, email.subject, email.text);

    if (!result.ok) {
      failures.push(person.email + ": " + result.error);
      // Stop on the first authentication or quota failure rather than
      // grinding through 90 identical errors — those fail for everyone, not
      // for this recipient, and the unmarked rows simply wait for the retry.
      if (result.fatal) break;
      continue;
    }

    // Marked immediately, one row at a time. A batch-marked-at-the-end design
    // loses the whole record if the script times out mid-run, and the next
    // run would then mail everyone again.
    sheet.getRange(person.row, markColumn).setValue(person.template);
    sheet.getRange(person.row, markAtColumn).setValue(new Date());
    SpreadsheetApp.flush();
    sent++;
  }

  var remaining = plan.pending.length - sent;
  ui.alert(
    failures.length ? "Sent, with failures" : "Sent",
    sent +
      " emails sent. " +
      remaining +
      " still pending" +
      (remaining ? " — run this again tomorrow." : ".") +
      (failures.length
        ? "\n\nFailed (" + failures.length + "), these rows stay unmarked and will retry:\n" +
          failures.slice(0, 10).join("\n")
        : ""),
    ui.ButtonSet.OK,
  );
}

/* ------------------------------------------------------------------ */
/* planning                                                            */
/* ------------------------------------------------------------------ */

/**
 * Work out who gets what, without sending or writing anything.
 *
 * Both menu items run this, so what the preview shows is what the send does.
 */
function buildPlan_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(TAB);
  if (!sheet) return { error: 'No tab named "' + TAB + '".' };

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { error: "No data rows." };

  var width = Math.max(sheet.getLastColumn(), COL.category);
  var values = sheet.getRange(2, 1, lastRow - 1, width).getDisplayValues();

  var markColumn = findColumn_(sheet, MARK_HEADER);
  var alreadyContacted = collectSentOutEmails_();

  var plan = {
    pending: [],
    counts: { rejected: 0, waitlist: 0, undecided: 0 },
    heldBack: { accepted: 0, sentOut: 0, alreadyEmailed: 0, unknown: 0, noEmail: 0 },
    skipped: [],
    duplicates: 0,
    sentOutTabs: alreadyContacted.tabs,
  };

  var seen = {};

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var rowNumber = i + 2;

    var email = String(row[COL.email - 1] || "").trim().toLowerCase();
    if (email.indexOf("@") === -1) {
      // Rows 418-457 are written in an older column layout that put the email
      // in K, M or Z. Their decision cell cannot be trusted either, so they
      // are counted and named rather than guessed at.
      if (String(row[COL.email - 1] || "").trim()) plan.heldBack.noEmail++;
      continue;
    }

    // Already mailed, on any of this person's rows.
    if (markColumn > 0 && String(row[markColumn - 1] || "").trim()) {
      seen[email] = true;
      plan.heldBack.alreadyEmailed++;
      continue;
    }

    if (alreadyContacted.keys[email]) {
      plan.heldBack.sentOut++;
      seen[email] = true;
      continue;
    }

    var raw = String(row[COL.decision - 1] || "").trim();
    var status;
    if (!raw) {
      status = "undecided";
    } else {
      var mapped = DECISIONS[raw.toLowerCase()];
      if (!mapped) {
        plan.skipped.push({ row: rowNumber, value: raw });
        plan.heldBack.unknown++;
        seen[email] = true; // an ambiguous row disqualifies the whole person
        continue;
      }
      status = mapped;
    }

    if (status === "accepted") {
      plan.heldBack.accepted++;
      seen[email] = true;
      continue;
    }

    var template = TEMPLATE_FOR[status];
    if (!template) continue; // withdrawn, and anything else never mailed

    if (seen[email]) {
      plan.duplicates++;
      continue;
    }
    seen[email] = true;

    plan.counts[status === "undecided" ? "undecided" : status]++;
    plan.pending.push({
      row: rowNumber,
      email: email,
      firstName: String(row[COL.name - 1] || "").trim(),
      template: template,
      status: status,
    });
  }

  return plan;
}

function describePlan_(plan) {
  return (
    plan.pending.length +
    " people pending: " +
    plan.counts.rejected +
    " rejection, " +
    (plan.counts.waitlist + plan.counts.undecided) +
    " waitlist.\n\n" +
    "Held back — nobody here is mailed:\n" +
    "  " + plan.heldBack.accepted + " accepted (you write those yourself)\n" +
    "  " + plan.heldBack.sentOut + ' on a "' + SENT_MARKER + '" tab\n' +
    "  " + plan.heldBack.alreadyEmailed + " already emailed\n" +
    "  " + plan.heldBack.unknown + " unreadable decision\n" +
    "  " + plan.heldBack.noEmail + " no email in column C\n" +
    "  " + plan.duplicates + " duplicate rows collapsed"
  );
}

/* ------------------------------------------------------------------ */
/* preview                                                             */
/* ------------------------------------------------------------------ */

function writePreviewTab_(plan) {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(PREVIEW_TAB);
  if (!sheet) sheet = ss.insertSheet(PREVIEW_TAB);
  else sheet.clear();

  var rows = [["Sheet row", "Email", "Name", "Template", "Subject", "Body"]];

  for (var i = 0; i < plan.pending.length; i++) {
    var person = plan.pending[i];
    var email = renderEmail_(person.template, person.firstName);
    rows.push([
      person.row,
      person.email,
      person.firstName,
      person.template + (i < BATCH_SIZE ? " (next batch)" : ""),
      email.subject,
      email.text,
    ]);
  }

  if (plan.skipped.length) {
    rows.push(["", "", "", "", "", ""]);
    rows.push(["SKIPPED — unreadable decision, nobody here is mailed", "", "", "", "", ""]);
    for (var s = 0; s < plan.skipped.length; s++) {
      rows.push([plan.skipped[s].row, "", "", plan.skipped[s].value, "", ""]);
    }
  }

  sheet.getRange(1, 1, rows.length, 6).setValues(rows);
  sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#0e2417").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(6, 520);
  sheet.getRange(2, 6, Math.max(rows.length - 1, 1), 1).setWrap(true);
}

/* ------------------------------------------------------------------ */
/* Resend                                                              */
/* ------------------------------------------------------------------ */

/**
 * One email. Never throws — a failure returns and the row stays unmarked, so
 * the next run picks that person up again.
 *
 * `fatal` marks the failures that are about the account rather than the
 * recipient: a bad key, an unverified domain, a daily cap. Those fail
 * identically for everyone, and continuing would burn the rest of the batch
 * on the same error.
 */
function sendViaResend_(apiKey, to, subject, text) {
  var response = UrlFetchApp.fetch("https://api.resend.com/emails", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + apiKey },
    payload: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: REPLY_TO,
      subject: subject,
      text: text,
    }),
    muteHttpExceptions: true,
  });

  var code = response.getResponseCode();
  var body = response.getContentText();

  if (code === 200 || code === 201) return { ok: true };

  console.error("Resend " + code + " for " + to + ": " + body);
  return {
    ok: false,
    error: "HTTP " + code + " " + body.slice(0, 160),
    fatal: code === 401 || code === 403 || code === 429,
  };
}

/* ------------------------------------------------------------------ */
/* sheet helpers                                                       */
/* ------------------------------------------------------------------ */

/** Column number for a header, or 0. Searches the whole first row. */
function findColumn_(sheet, header) {
  var lastColumn = sheet.getLastColumn();
  if (lastColumn < 1) return 0;
  var headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i] || "").trim() === header) return i + 1;
  }
  return 0;
}

/**
 * Same, but creates the column to the RIGHT of everything when missing.
 * Appending is the only safe direction — inserting would shift COL.decision
 * and friends, and the mailer would start reading the wrong cells.
 */
function ensureColumn_(sheet, header) {
  var found = findColumn_(sheet, header);
  if (found) return found;

  var column = sheet.getLastColumn() + 1;
  sheet.getRange(1, column).setValue(header).setFontWeight("bold");
  return column;
}

/**
 * Every address on a "(sent out)" tab — people already written to by hand.
 *
 * Email only, never name: two people share a name far more often than an
 * address, and a false match here silently denies someone their only email.
 * A tab that cannot be read is NAMED rather than passed over, because a
 * sent-out list we failed to parse is the dangerous case, not a harmless one.
 */
function collectSentOutEmails_() {
  var keys = {};
  var tabs = [];

  SpreadsheetApp.getActive()
    .getSheets()
    .forEach(function (sheet) {
      var name = sheet.getName();
      if (name === TAB || name === PREVIEW_TAB) return;
      if (name.toLowerCase().indexOf(SENT_MARKER) === -1) return;

      var lastRow = sheet.getLastRow();
      var lastColumn = sheet.getLastColumn();
      if (lastRow < 2 || lastColumn < 1) return;

      var values = sheet.getRange(1, 1, lastRow, lastColumn).getDisplayValues();
      var emailColumn = -1;
      for (var c = 0; c < values[0].length; c++) {
        if (String(values[0][c] || "").toLowerCase().indexOf("email") > -1) {
          emailColumn = c;
          break;
        }
      }
      if (emailColumn === -1) {
        tabs.push(name + " — NO EMAIL COLUMN, nobody excluded from it");
        return;
      }

      var added = 0;
      for (var r = 1; r < values.length; r++) {
        var email = String(values[r][emailColumn] || "").trim().toLowerCase();
        if (email.indexOf("@") === -1) continue;
        if (!keys[email]) added++;
        keys[email] = true;
      }
      tabs.push(name + ": " + added);
    });

  return { keys: keys, tabs: tabs };
}
