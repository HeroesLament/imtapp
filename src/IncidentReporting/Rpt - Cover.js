function generateCoverReport(incidentFolderId) {
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
            };
            if (sheetHeaders[0][hrow] == "INCIDENT_NAME") {
                var colIncidentName = hrow;
                continue
            };
            if (sheetHeaders[0][hrow] == "INCIDENT_NUMBER") {
                var colIncidentNumber = hrow;
                continue;
            };
            if (sheetHeaders[0][hrow] == "INCIDENT_START_DATE") {
                var colIncidentStartDate = hrow;
                continue;
            };
            if (sheetHeaders[0][hrow] == "INCIDENT_END_DATE") {
                var colIncidentEndDate = hrow;
                continue;
            };
        }
        for (var row = 0; row < sheetDataLen; row++) {
            var incidentName;
            var incidentAssignmentLog;
            var incidentNumber;
            var incidentStartDate;
            var incidentEndDate;
            if (sheetData[row][colIncidentFolderId] == incidentFolderId) {
                incidentName = sheetData[row][colIncidentName];
                incidentNumber = sheetData[row][colIncidentNumber];
                incidentStartDate = sheetData[row][colIncidentStartDate];
                incidentEndDate = sheetData[row][colIncidentEndDate];
                break;
            }
        }
        var templatereportId = SystemSettings.IMS_TEMPLATES_COVER_REPORT_ID;
        var oldReportreportId = checkIfExisitngReport(incidentFolderId, templatereportId);
        if (oldReportreportId == false) {
            var reportreportId = SharedFunctions.copyDriveFile(templatereportId, incidentFolderId);
        } else {
            DriveApp.getFileById(oldReportreportId).setTrashed(true);
            var reportreportId = SharedFunctions.copyDriveFile(templatereportId, incidentFolderId);
        }
        var report = createCoverReport(reportreportId, incidentName, incidentNumber, incidentStartDate, incidentEndDate);
        if (report[0] === false) throw report[1];
        return report;
    } catch (error) {
        var msg = [false, error[1]];
        return msg;
    }
}

function createCoverReport(reportId, incidentName, incidentNumber, incidentStartDate, incidentEndDate) {
    try {
        var tz = Session.getScriptTimeZone();
        incidentStartDate = Utilities.formatDate(new Date(incidentStartDate), tz, "MMMM dd, yyyy");
        if (incidentEndDate != "Present" && incidentEndDate != undefined && incidentEndDate != "") {
            incidentEndDate = Utilities.formatDate(new Date(incidentEndDate), tz, "MMMM dd, yyyy");
        } else {
            incidentEndDate = "Present";
        }
        if (incidentNumber == undefined || incidentNumber == "" || incidentNumber == null) {
            incidentNumber = "Not Assigned";
        }
        var doc = DocumentApp.openById(reportId);
        SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NAME%", incidentName);
        SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", incidentNumber);
        var incidentDates;
        if (incidentStartDate === incidentEndDate) {
            incidentDates = incidentStartDate;
        } else {
            incidentDates = incidentStartDate + " - " + incidentEndDate;
        }
        SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_DATES%", incidentDates);
        var url = DriveApp.getFileById(reportId).getUrl();
        var msg = [true, url];
        return msg;
    } catch (error) {
        var msg = [false, error];
        return msg;
    }
}