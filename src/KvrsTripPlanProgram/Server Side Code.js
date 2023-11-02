function doGet(request) {
    return HtmlService.createTemplateFromFile('Page')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle("KVRS Trip Plan System");
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function setUserTimezoneFromOffset(timezoneOffset) {
    var timezoneOffsetMillis = Number(timezoneOffset) * 60 * 1000;
    var timezoneOffsetFormatted = Utilities.formatDate(new Date(Math.abs(timezoneOffsetMillis)), 'GMT', 'hh:mm');
    var timezoneOffsetSign = timezoneOffset > 0 ? '-' : '+';
    var timezone = 'GMT' + timezoneOffsetSign + timezoneOffsetFormatted;
    return timezone;
}

function getOpenBeacons(timezoneOffset) {
    var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
    var sheet = ss.getSheetByName("Tracker");
    var endRow = sheet.getLastRow();
    var data = sheet.getRange(2, 1, endRow, 12).getValues();
    var beacons = [];
    if (timezoneOffset == "" || timezoneOffset == "undefined") {
        tz = Session.getScriptTimeZone();
    } else {
        var tz = setUserTimezoneFromOffset(timezoneOffset);
    }
    for (var i = 0; i < (endRow - 1); i++) {
        if (data[i][8].indexOf("Closed") === -1 && data[i][8].indexOf("Canceled") === -1) {
            var tpKey = data[i][11].toString();
            var beacon = data[i][6].toString();
            var name = data[i][1].toString()
            var submittedDate = Utilities.formatDate(new Date(data[i][0]), tz, "MMM dd, yyyy HH:mm (z)").toString()
            var startDate = Utilities.formatDate(new Date(data[i][2]), tz, "MMM dd, yyyy HH:mm (z)").toString()
            var endDate = Utilities.formatDate(new Date(data[i][3]), tz, "MMM dd, yyyy HH:mm (z)").toString()
            var overdueDate = Utilities.formatDate(new Date(data[i][4]), tz, "MMM dd, yyyy HH:mm (z)").toString()
            var partner = data[i][5].toString()
            var URL = data[i][9].toString()
            beacons.push([tpKey, beacon, name, partner, submittedDate, startDate, endDate, overdueDate, URL]);
        }
    }
    return beacons
}

function getAvailablePartners() {
    var ss = SpreadsheetApp.openById(SystemSettings.INVENTORY_SHEET_ID);
    var sheet = ss.getSheetByName("SPOT Inventory");
    var sheet2 = ss.getSheetByName("Settings");
    var user = getUser();
    var endRow = sheet.getLastRow();
    var endCol = sheet.getLastColumn();
    var endRow2 = sheet2.getLastRow();
    var endCol2 = sheet2.getLastColumn();
    var data = sheet.getRange(2, 1, endRow, endCol).getValues();
    var settings = sheet2.getRange(2, 1, endRow2, endCol2).getValues();
    var partners = [];
    var locations = [];
    for (var i = 0; i < (endRow - 1); i++) {
        if (locations.indexOf(data[i][(SystemSettings.INVENTORY_ASSIGNED_LOC_COL - 1)]) === -1) {
            locations.push(data[i][SystemSettings.INVENTORY_ASSIGNED_LOC_COL - 1]);
        }
    }
    locations.sort()
    for (var i = 0; i < (endRow2 - 1); i++) {
        if (locations.indexOf(settings[i][0]) > -1) {
            if (settings[i][2].toString() === user.toString() && settings[i][3] === true) {
                partners.push([settings[i][0], true]);
            } else if (settings[i][3] === true) {
                partners.push([settings[i][0], false]);
            }
        }
    }
    return partners
}

function getAvailableBeacons(partner) {
    var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
    var sheet = ss.getSheetByName("Tracker");
    var endRow = sheet.getLastRow();
    var data = sheet.getRange(2, 1, endRow, 12).getValues();
    var usedBeacons = [];
    for (var i = 0; i < (endRow - 1); i++) {
        if (data[i][8].indexOf("Closed") === -1 && data[i][8].indexOf("Canceled") === -1) {
            var beacon = data[i][6].toString();
            usedBeacons.push([beacon]);
        }
    }
    var ss = SpreadsheetApp.openById(SystemSettings.INVENTORY_SHEET_ID);
    var sheet = ss.getSheetByName("SPOT Inventory");
    var endRow = sheet.getLastRow();
    var endCol = sheet.getLastColumn();
    var data = sheet.getRange(2, 1, endRow, endCol).getValues();
    var availableBeacons = [];
    for (var i = 0; i < (endRow - 1); i++) {
        if (data[i][(SystemSettings.INVENTORY_REPORTED_LOC_COL - 1)] === partner || data[i][(SystemSettings.INVENTORY_REPORTED_LOC_COL - 1)].length === 0 && data[i][(SystemSettings.INVENTORY_ASSIGNED_LOC_COL - 1)] === partner) {
            var n = 0
            for (var ii = 0; ii < usedBeacons.length; ii++) {
                if (usedBeacons[ii] != data[i][SystemSettings.INVENTORY_BEACON_COL - 1]) n++;
                if (usedBeacons.length == n) {
                    availableBeacons.push(data[i][SystemSettings.INVENTORY_BEACON_COL - 1]);
                }
            }
            if (usedBeacons.length === 0) {
                availableBeacons.push(data[i][SystemSettings.INVENTORY_BEACON_COL - 1])
            }
        }
    }
    availableBeacons = availableBeacons.sort(function sortNumber(a,b) {
    return a - b;
})
    return availableBeacons
}

function getAvalableDraftTripPlans() {
    var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_DRAFT_SHEET_ID);
    var sheet = ss.getSheetByName("Data");
    var endRow = sheet.getLastRow();
    var endCol = sheet.getLastColumn();
    var data = sheet.getRange(2, 1, endRow, 5).getValues();
    var tripplans = [];
    for (var i = 0; i < (endRow - 1); i++) {
        if (data[i][1] === true) {
            tripplans.push([data[i][0], data[i][3] + ", " + data[i][4] + " (" + data[i][0] + ")"])
        }
    }
    tripplans.sort()
    return tripplans
}