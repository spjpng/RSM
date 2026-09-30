/**
 * Google Apps Script web app that appends RSM signups to a Google Sheet.
 *
 * Paste this into Extensions → Apps Script in the sheet, then deploy it as a web app
 * (Execute as: Me, Who has access: Anyone). See README.md > "Google Sheet webhook".
 *
 * Each POST is a flat JSON object: { "timestamp": "...", "<fieldKey>": "...", ... }.
 * Row 1 holds the column headers. Any key without a column gets one added at the end,
 * and each value is written under the header that matches its key, so adding, removing,
 * or reordering form fields never shifts existing columns.
 */

// Name of the tab to write to. Leave empty to use the first tab.
const SHEET_NAME = "";

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // One signup at a time, so two new columns can't be added over each other.
    lock.waitLock(20000);

    const data = JSON.parse(e.postData.contents);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Expected a JSON object");

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
    if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME);

    const lastCol = sheet.getLastColumn();
    const headers = lastCol > 0
      ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h).trim(); })
      : [];

    const missing = Object.keys(data).filter(function (key) { return headers.indexOf(key) === -1; });
    if (missing.length > 0) {
      sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
      Array.prototype.push.apply(headers, missing);
    }

    const row = headers.map(function (h) {
      return Object.prototype.hasOwnProperty.call(data, h) ? safeCell(data[h]) : "";
    });
    sheet.appendRow(row);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

// Stops answers like "=IMPORTXML(...)" from running as formulas, and keeps phone
// numbers like "+1 555..." as text. Sheets hides the leading apostrophe.
function safeCell(value) {
  const text = value == null ? "" : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
