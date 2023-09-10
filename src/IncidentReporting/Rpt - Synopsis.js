function generateSynopsisReport(incidentFolderId) {
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
        var templateFileId = SystemSettings.IMS_TEMPLATES_SYNOPSIS_REPORT_ID;
        var oldReportFileId = checkIfExisitngReport(incidentFolderId, templateFileId);
        if (oldReportFileId == false) {
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        } else {
            DriveApp.getFileById(oldReportFileId).setTrashed(true);
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        }
        var report = createBlankPageReport(reportFileId, incidentName, incidentNumber, incidentStartDate, incidentEndDate);
 if (report[0] === false) throw report[1];
        return report;
    } catch (error) {
        var msg = [false, error];
        return msg;
    }
}