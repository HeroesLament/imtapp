/*Report Cover Sheet
Incident Synopsis
Event Log
Financial Report
Team Assignments
Roster
Incident Map (this should include SPOT data)
*/
function generatePackage(incidentFolderId) {
    try {
        var packageOrder = [];
        packageOrder.push(SystemSettings.IMS_TEMPLATES_COVER_REPORT_ID, SystemSettings.IMS_TEMPLATES_SYNOPSIS_REPORT_ID, SystemSettings.IMS_TEMPLATES_EVENT_LOG_REPORT_ID, SystemSettings.IMS_TEMPLATES_FINANCE_REPORT_ID, SystemSettings.IMS_TEMPLATES_ROSTER_REPORT_ID, SystemSettings.IMS_TEMPLATES_ASSIGNMENT_REPORT_ID, SystemSettings.IMS_TEMPLATES_MAP_REPORT_ID);
        var reportBlob =[];
        var reportId;
        var reportFileId;
        for (var i = 0; i < packageOrder.length; i++) {
            reportId = checkIfExisitngReport(incidentFolderId, packageOrder[i]);
            if (reportId != false) {
                reportBlob.push(DocumentApp.openById(reportId));
            }
        }
        var templateFileId = SystemSettings.IMS_TEMPLATES_PACKAGE_ID;
        var oldReportFileId = checkIfExisitngReport(incidentFolderId, templateFileId);
        if (oldReportFileId == false) {
            reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        } else {
            DriveApp.getFileById(oldReportFileId).setTrashed(true);
            reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        }
        var incidentFolder = DriveApp.getFolderById(incidentFolderId);
        var newFile = incidentFolder.createFile(reportFileId.getAs('application/pdf'));
        console.log("TPURL: " + newFileUrl);
        var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
        var sheet = ss.getSheetByName("IMS Incident Log");
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var incidentHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var incidentHeadersLen = incidentHeaders[0].length;
        var incidentData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
        var incidentDataLen = financeData.length;
        for (var hrow = 0; hrow < incidentHeadersLen; hrow++) {
            if (incidentHeaders[0][hrow] == "INCIDENT_FOLDER_ID") {
                var colIncidentFolderId = hrow;
                continue;
            }
            if (incidentHeaders[0][hrow] == "INCIDENT_NAME") {
                var colIncidentName = hrow;
                continue;
            }
            if (incidentHeaders[0][hrow] == "INCIDENT_NUMBER") {
                var colIncidentNumber = hrow;
                continue;
            }
        }
        for (var row = 0; row < incidentDataLen; row++) {
            var incidentName;
            var incidentNumber;
            if (incidentData[row][colIncidentFolderId] == incidentFolderId) {
                incidentName = incidentata[row][colIncidentName];
                incidentNumber = incidentData[row][colIncidentNumber];
                break;
            }
        }
        newFile.setName("KVRS Incident Report - " + incidentName + " (" + incidentNumber + ")");
        var newFileUrl = newFile.getUrl();
        var msg = [true, newFileUrl];
        return msg;
    } catch (error) {
        var msg = [false, error];
        return msg;
    }
}