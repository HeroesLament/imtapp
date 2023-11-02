function verifyTripPlanLogElectronic(tp, beacon, timezoneOffset) {
    try {
        var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_DRAFT_SHEET_ID);
        var draftSheet = ss.getSheetByName("Data");
        var draftEndRow = draftSheet.getLastRow();
        var draftEndCol = draftSheet.getLastColumn();
        var draftHeaders = draftSheet.getRange(1, 1, 1, draftEndCol).getValues();
        var draftIdList = draftSheet.getRange(2, 1, draftEndRow, 4).getValues();
        for (var i = 0; i < (draftEndRow - 1); i++) {
            if (draftIdList[i][0] === tp) {
                var draftDataRow = i + 2;
            }
        }
        var draftData = draftSheet.getRange(draftDataRow, 1, 1, draftEndCol).getValues();
        for (var i = 0; i < (draftEndCol); i++) {
            if (draftHeaders[0][i].indexOf("draft_timezone") != -1) {
                var draftTimeZoneCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("party_leaderlastname") != -1) {
                var draftLastNameCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("party_leaderfirstname") != -1) {
                var draftFirstNameCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("trip_startdate") != -1) {
                var draftStartDateCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("trip_starttime") != -1) {
                var draftStartTimeCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("trip_enddate") != -1) {
                var draftEndDateCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("trip_endtime") != -1) {
                var draftEndTimeCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("trip_overduedate") != -1) {
                var draftOverdueDateCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("trip_overduetime") != -1) {
                var draftOverdueTimeCol = i;
                continue;
            }
        }
        if (timezoneOffset == "" || timezoneOffset == "undefined") {
            tz = Session.getScriptTimeZone();
        } else {
            var tz = setUserTimezoneFromOffset(timezoneOffset);
        }
        var name = draftData[0][draftLastNameCol] + ", " + draftData[0][draftFirstNameCol];
        var localOffset = draftData[0][draftTimeZoneCol] * 60000;
        var startDateLocal = new Date(draftData[0][draftStartDateCol] + " " + draftData[0][draftStartTimeCol]);
        var startDateUTC = startDateLocal.getTime() + localOffset;
        var sd = new Date(startDateUTC);
        var endDateLocal = new Date(draftData[0][draftEndDateCol] + " " + draftData[0][draftEndTimeCol]);
        var endDateUTC = endDateLocal.getTime() + localOffset;
        var ed = new Date(endDateUTC);
        var overdueDateLocal = new Date(draftData[0][draftOverdueDateCol] + " " + draftData[0][draftOverdueTimeCol]);
        var overdueDateUTC = overdueDateLocal.getTime() + localOffset;
        var od = new Date(overdueDateUTC);
        var startDate = Utilities.formatDate(new Date(sd), tz, "MMM dd, yyyy HH:mm (z)").toString()
        var endDate = Utilities.formatDate(new Date(ed), tz, "MMM dd, yyyy HH:mm (z)").toString()
        var overdueDate = Utilities.formatDate(new Date(od), tz, "MMM dd, yyyy HH:mm (z)").toString()
        var data = [beacon, name, startDate, endDate, overdueDate];
        return data;
    } catch (f) {
        return f.toString();
    }
}

function addToTripPlanLogElectronic(tp, partner, beacon, notes) {
    try {
        var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_DRAFT_SHEET_ID);
        var draftSheet = ss.getSheetByName("Data");
        var draftEndRow = draftSheet.getLastRow();
        var draftEndCol = draftSheet.getLastColumn();
        var draftHeaders = draftSheet.getRange(1, 1, 1, draftEndCol).getValues();
        var draftIdList = draftSheet.getRange(2, 1, draftEndRow, 4).getValues();
        for (var i = 0; i < (draftEndRow - 1); i++) {
            if (draftIdList[i][0] === tp) {
                var draftDataRow = i + 2;
            }
        }
        var draftData = draftSheet.getRange(draftDataRow, 1, 1, draftEndCol).getValues();
        for (var i = 0; i < (draftEndCol); i++) {
            if (draftHeaders[0][i].indexOf("draft_timezone") != -1) {
                var draftTimeZoneCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("party_leaderlastname") != -1) {
                var draftLastNameCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("party_leaderfirstname") != -1) {
                var draftFirstNameCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("trip_startdate") != -1) {
                var draftStartDateCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("trip_starttime") != -1) {
                var draftStartTimeCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("trip_enddate") != -1) {
                var draftEndDateCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("trip_endtime") != -1) {
                var draftEndTimeCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("trip_overduedate") != -1) {
                var draftOverdueDateCol = i;
                continue;
            }
            if (draftHeaders[0][i].indexOf("trip_overduetime") != -1) {
                var draftOverdueTimeCol = i;
                continue;
            }
        }
        var name = draftData[0][draftLastNameCol] + ", " + draftData[0][draftFirstNameCol];
        var localOffset = draftData[0][draftTimeZoneCol] * 60000;
        var startDateLocal = new Date(draftData[0][draftStartDateCol] + " " + draftData[0][draftStartTimeCol]);
        var startDateUTC = startDateLocal.getTime() + localOffset;
        var startDate = new Date();
        startDate.setTime(startDateUTC);
        var endDateLocal = new Date(draftData[0][draftEndDateCol] + " " + draftData[0][draftEndTimeCol]);
        var endDateUTC = endDateLocal.getTime() + localOffset;
        var endDate = new Date(endDateUTC);
        var overdueDateLocal = new Date(draftData[0][draftOverdueDateCol] + " " + draftData[0][draftOverdueTimeCol]);
        var overdueDateUTC = overdueDateLocal.getTime() + localOffset;
        var overdueDate = new Date(overdueDateUTC);
        var baseFolder = DriveApp.getFolderById(SystemSettings.TRIPPLAN_FILES_BASE_FOLDER);
        var tz = Session.getScriptTimeZone();
        var currentYear = Utilities.formatDate(startDate, tz, "yyyy");
        var currentMonth = Utilities.formatDate(startDate, tz, "MMMM");
        var folderDate = Utilities.formatDate(startDate, tz, "MM-dd-yy")
        var yearFolders = baseFolder.getFoldersByName(currentYear)
        if (yearFolders.hasNext() == false) {
            var yearFolder = baseFolder.createFolder(currentYear);
        } else {
            var yearFolder = yearFolders.next();
        }
        var monthFolders = yearFolder.getFoldersByName(currentMonth)
        if (monthFolders.hasNext() == false) {
            var monthFolder = yearFolder.createFolder(currentMonth);
        } else {
            var monthFolder = monthFolders.next();
        }
        var user = getUser()
        var fileUrl = "Generating PDF Please Wait...";
        var tp_number = addLogEntry(partner, beacon, name, startDate, endDate, overdueDate, fileUrl, notes);
        //mark as activated
        fileUrl = createTripPlanPdf(tp_number, draftDataRow);
        //update URL
        var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
        var sheet = ss.getSheetByName("Tracker");
        var endRow = sheet.getLastRow();
        var data = sheet.getRange(2, 1, endRow, 12).getValues();
        for (var i = 0; i < (endRow - 1); i++) {
            if (data[i][11] === tp_number) {
                sheet.getRange(i + 2, 10, 1, 1).setValue(fileUrl);
            }
        }
        draftSheet.getRange(draftDataRow, 2, 1, 1).setValue(false);
        var msg = ["OK", tp];
        return msg;
    } catch (f) {
        var msg = ["ERROR", tp, f.toString()];
        return msg
    }
}

function addToTripPlanLogPaper(data, partner, beacon, name, startDate, endDate, overdueDate, notes) {
    try {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        overdueDate = new Date(overdueDate);
        var baseFolder = DriveApp.getFolderById(SystemSettings.TRIPPLAN_FILES_BASE_FOLDER);
        var tz = Session.getScriptTimeZone();
        var currentYear = Utilities.formatDate(startDate, tz, "yyyy");
        var currentMonth = Utilities.formatDate(startDate, tz, "MMMM");
        var folderDate = Utilities.formatDate(startDate, tz, "MM-dd-yy")
        var yearFolders = baseFolder.getFoldersByName(currentYear)
        if (yearFolders.hasNext() == false) {
            var yearFolder = baseFolder.createFolder(currentYear);
        } else {
            var yearFolder = yearFolders.next();
        }
        var monthFolders = yearFolder.getFoldersByName(currentMonth)
        if (monthFolders.hasNext() == false) {
            var monthFolder = yearFolder.createFolder(currentMonth);
        } else {
            var monthFolder = monthFolders.next();
        }
        var contentType = data.substring(5, data.indexOf(';')),
            bytes = Utilities.base64Decode(data.substr(data.indexOf('base64,') + 7)),
            blob = Utilities.newBlob(bytes, contentType, "TempPlan"),
            file = monthFolder.createFile(blob).setName("TempFile " + Math.floor((Math.random() * 100)));
        var fileUrl = file.getUrl();
        var tp = addLogEntry(partner, beacon, name, startDate, endDate, overdueDate, fileUrl, notes);
        file.setName(tp)
        var msg = ["OK", tp];
        return msg;
    } catch (f) {
        var msg = ["ERROR", name, f.toString()];
        return msg
    }
}

function addLogEntry(partner, beacon, name, startDate, endDate, overdueDate, fileUrl, notes) {
    var user = getUser()
    var tz = Session.getScriptTimeZone();
    var submittedDate = Utilities.formatDate(new Date(), tz, "MM/dd/yy HH:mm");
    startDate = Utilities.formatDate(new Date(startDate), tz, "MM/dd/yy HH:mm");
    endDate = Utilities.formatDate(new Date(endDate), tz, "MM/dd/yy HH:mm");
    overdueDate = Utilities.formatDate(new Date(overdueDate), tz, "MM/dd/yy HH:mm");
    var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
    var sheet = ss.getSheetByName("Tracker");
    var endRow = sheet.getLastRow();
    if (notes.length != 0) notes = "PARTNER CHECK OUT NOTE: " + notes;
    if (partner.length > 6) {
        var locCode = partner.slice(-6, -4).toUpperCase()
    } else {
        var locCode = "ZZ"
    };
    var planNumber = "KTP" + Utilities.formatDate(new Date(submittedDate), tz, "YYDDDHH") + locCode + Math.floor((Math.random() * 100) + 1);
    sheet.getRange((endRow + 1), 1, 1, 14).setValues([
        [submittedDate, name, startDate, endDate, overdueDate, partner, beacon, "", "Open", fileUrl, notes, planNumber, "", user]
    ]);
    return planNumber
};