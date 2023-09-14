function generateEventLogReport(incidentFolderId) {
    try {
        var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
        var sheet = ss.getSheetByName("IMS Incident Log");
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
        var sheetDataLen = sheetData.length;
        var incidents = [];
        for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "INCIDENT_FOLDER_ID") {
                var colIncidentFolderId = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "INCIDENT_NAME") {
                var colIncidentName = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "INCIDENT_NUMBER") {
                var colIncidentNumber = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "INCIDENT_START_DATE") {
                var colIncidentStartDate = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "INCIDENT_END_DATE") {
                var colIncidentEndDate = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "INCIDENT_LOG_ID") {
                var colLogId = hrow;
                continue;
            }
        }
        for (var row = 0; row < sheetDataLen; row++) {
            var incidentName;
            var incidentLog;
            var incidentNumber;
            var incidentStartDate;
            var incidentEndDate;
            if (sheetData[row][colIncidentFolderId] == incidentFolderId) {
                incidentName = sheetData[row][colIncidentName];
                incidentLog = sheetData[row][colLogId];
                incidentNumber = sheetData[row][colIncidentNumber];
                incidentStartDate = sheetData[row][colIncidentStartDate];
                incidentEndDate = sheetData[row][colIncidentEndDate];
                break;
            }
        }
        var templateFileId = SystemSettings.IMS_TEMPLATES_EVENT_LOG_REPORT_ID;
        var oldReportFileId = checkIfExisitngReport(incidentFolderId, templateFileId);
        if (oldReportFileId == false) {
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        } else {
            DriveApp.getFileById(oldReportFileId).setTrashed(true);
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId); // SLOW
        }
        var report = createEventLogReport(incidentLog, reportFileId, incidentName, incidentNumber, incidentStartDate, incidentEndDate);
        if (typeof report[1] === 'string' && report[1].startsWith('1')) {
            console.log("File ID Returned: " + report[1]);
        } else {
            console.log("Message Returned: " + report[1]);
        }
        if (report[0] === false) throw report;
        return report;
    } catch (error) {
        var msg = [false, error];
        return msg;
    }
}

function createEventLogReport(logId, reportId, incidentName, incidentNumber, incidentStartDate, incidentEndDate) {
    try {
        var tz = Session.getScriptTimeZone();
        var ss = SpreadsheetApp.openById(logId);
        var sheet = ss.getSheets()[0];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "Type") {
                var colType = hrow;
            }
            if (sheetHeaders[0][hrow] == "Description") {
                var colDescription = hrow;
            }
            if (sheetHeaders[0][hrow] == "Time") {
                var colTime = hrow;
            }
            if (sheetHeaders[0][hrow] == "Date") {
                var colDate = hrow;
            }
        }
        var doc = DocumentApp.openById(reportId);
        if (sheetLastRow == 1) {
            var currentDay = new Date(incidentStartDate);
            var iDay = 0;
            var currentDate = Utilities.formatDate(new Date(currentDay), tz, "MMMM dd, yyyy");
            SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NAME%", incidentName);
            if (incidentNumber != null && incidentNumber != "") {
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", incidentNumber);
            } else {
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", "N/A");
            }
            SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_START_DATE%", incidentStartDate);
            SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_END_DATE%", incidentEndDate);
            while (currentDate !== Utilities.formatDate(new Date(incidentEndDate), tz, "MMMM dd, yyyy")) {
                SharedFunctions.fillDocsTemplate(doc, "%DATE%" + iDay + "%", currentDate);
                SharedFunctions.fillDocsTemplate(doc, "%LOG%" + iDay + "%", "N/A");
                currentDay.setDate(currentDay.getDate() + 1);
                currentDate = Utilities.formatDate(new Date(currentDay), tz, "MMMM dd, yyyy");
                iDay++;
            }
            SharedFunctions.fillDocsTemplate(doc, "%DATE%" + iDay + "%", currentDate);
            SharedFunctions.fillDocsTemplate(doc, "%LOG%" + iDay + "%", "N/A");
        } else {
            var currentDay = new Date(incidentStartDate);
            var iDay = 0;
            var currentDate = Utilities.formatDate(new Date(currentDay), tz, "MMMM dd, yyyy");
            SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NAME%", incidentName);
            if (incidentNumber != null && incidentNumber != "") {
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", incidentNumber);
            } else {
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", "N/A");
            }
            SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_START_DATE%", incidentStartDate);
            SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_END_DATE%", incidentEndDate);
            var row = 2;
            while (currentDate !== Utilities.formatDate(new Date(incidentEndDate), tz, "MMMM dd, yyyy")) {
                SharedFunctions.fillDocsTemplate(doc, "%DATE%" + iDay + "%", currentDate);
                if (sheet.getRange(row, colDate).getDisplayValue() == currentDate) {
                    var log = sheet.getRange(row, colTime).getDisplayValue() + " - " + sheet.getRange(row, colType).getDisplayValue() + " - " + sheet.getRange(row, colDescription).getDisplayValue();
                    SharedFunctions.fillDocsTemplate(doc, "%LOG%" + iDay + "%", log);
                    row++;
                } else {
                    SharedFunctions.fillDocsTemplate(doc, "%LOG%" + iDay + "%", "N/A");
                }
                currentDay.setDate(currentDay.getDate() + 1);
                currentDate = Utilities.formatDate(new Date(currentDay), tz, "MMMM dd, yyyy");
                iDay++;
            }
            SharedFunctions.fillDocsTemplate(doc, "%DATE%" + iDay + "%", currentDate);
            if (sheet.getRange(row, colDate).getDisplayValue() == currentDate) {
                var log = sheet.getRange(row, colTime).getDisplayValue() + " - " + sheet.getRange(row, colType).getDisplayValue() + " - " + sheet.getRange(row, colDescription).getDisplayValue();
                SharedFunctions.fillDocsTemplate(doc, "%LOG%" + iDay + "%", log);
            } else {
                SharedFunctions.fillDocsTemplate(doc, "%LOG%" + iDay + "%", "N/A");
            }
        }
        return [true, reportId];
    } catch (error) {
        return [false, error];
    }
}
