/**
 * Dental Zone Mianwali — Appointment Booking Backend
 * Google Apps Script (no PHP / no MySQL)
 *
 * SETUP:
 * 1. Create a Google Sheet. Name the first tab "Appointments".
 * 2. In row 1, add these column headers exactly:
 *    Timestamp | Name | Phone Number | Which Checkup | Preferred Date | Status
 * 3. Open Extensions > Apps Script in that Sheet, paste this whole file in as Code.gs.
 * 4. Update the CONFIG values below (owner email, sheet name).
 * 5. Deploy > New deployment > Type: Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 6. Copy the deployment /exec URL and paste it into APPS_SCRIPT_URL in script.js.
 *
 * See DEPLOYMENT_GUIDE.md for the full step-by-step walkthrough with screenshots' worth of detail.
 */

/* ============================= CONFIG ============================= */
var CONFIG = {
  SHEET_NAME: 'Appointments',
  OWNER_EMAIL: 'REPLACE_WITH_CLINIC_OWNER_EMAIL@example.com',
  CLINIC_NAME: 'Dental Zone Mianwali',
  // Minimum seconds required between two submissions with the same phone number
  DUPLICATE_WINDOW_SECONDS: 120
};

/* ============================= ENTRY POINT ============================= */
function doPost(e) {
  var response = { result: 'error', message: 'Something went wrong. Please call us directly.' };

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No data received.');
    }

    var data = JSON.parse(e.postData.contents);

    // ---- Honeypot spam trap (should already be filtered client-side, but double-check) ----
    if (data.honeypot) {
      // Silently accept without writing anything — looks like success to the bot.
      return jsonOutput({ result: 'success' });
    }

    var name = sanitize(data.name);
    var phone = sanitize(data.phone);
    var service = sanitize(data.service) || 'General checkup';
    var date = sanitize(data.date);

    // ---- Validation ----
    if (!name) throw new Error('Name is required.');
    if (!phone || !isValidPhone(phone)) throw new Error('A valid phone number is required.');

    var sheet = getSheet();

    // ---- Duplicate submission protection ----
    if (isDuplicate(sheet, phone)) {
      throw new Error('We already received a request from this number a moment ago. We will call you shortly.');
    }

    // ---- Store the appointment ----
    var timestamp = new Date();
    sheet.appendRow([timestamp, name, phone, service, date, 'New']);

    // ---- Email the clinic owner ----
    sendOwnerNotification(name, phone, service, date);

    response = { result: 'success', message: 'Appointment request submitted successfully.' };
  } catch (err) {
    response = { result: 'error', message: err.message || 'Please try again or call us directly.' };
  }

  return jsonOutput(response);
}

// Simple health check so you can confirm the deployment URL works from a browser (GET request).
function doGet(e) {
  return jsonOutput({ result: 'success', message: 'Dental Zone Mianwali booking endpoint is live.' });
}

/* ============================= HELPERS ============================= */

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Name', 'Phone Number', 'Which Checkup', 'Preferred Date', 'Status']);
  }
  return sheet;
}

function sanitize(value) {
  if (value === undefined || value === null) return '';
  // Strip angle brackets and trim to prevent basic HTML/script injection into the sheet or email.
  return String(value).replace(/[<>]/g, '').trim().substring(0, 200);
}

function isValidPhone(phone) {
  return /^[0-9+\-\s()]{7,16}$/.test(phone);
}

function isDuplicate(sheet, phone) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  // Only check the last few rows for performance — recent duplicates are the concern.
  var rowsToCheck = Math.min(20, lastRow - 1);
  var range = sheet.getRange(lastRow - rowsToCheck + 1, 1, rowsToCheck, 3); // Timestamp, Name, Phone
  var values = range.getValues();
  var now = new Date().getTime();

  for (var i = 0; i < values.length; i++) {
    var rowTimestamp = new Date(values[i][0]).getTime();
    var rowPhone = String(values[i][2]);
    if (rowPhone === phone && (now - rowTimestamp) / 1000 < CONFIG.DUPLICATE_WINDOW_SECONDS) {
      return true;
    }
  }
  return false;
}

function sendOwnerNotification(name, phone, service, date) {
  var subject = 'New Appointment Booking';
  var body =
    'You have a new appointment request on the ' + CONFIG.CLINIC_NAME + ' website.\n\n' +
    'Name: ' + name + '\n' +
    'Phone Number: ' + phone + '\n' +
    'Checkup: ' + service + '\n' +
    'Preferred Date: ' + (date || 'Not specified') + '\n\n' +
    'Please call the patient back to confirm.';

  MailApp.sendEmail(CONFIG.OWNER_EMAIL, subject, body);
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
