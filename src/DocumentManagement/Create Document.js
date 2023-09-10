function createDocumentFromTemplate(incidentFolderId, templateId, templateType, lastName, firstName, vesselName) {
    try {
        var tz = Session.getScriptTimeZone();
        var date = Utilities.formatDate(new Date(), tz, "MMMM dd, yyyy");
        var templateName = DriveApp.getFileById(templateId).getName();
        var fileId = SharedFunctions.copyDriveFile(templateId, incidentFolderId);
        var file = DriveApp.getFileById(fileId);
        var fileType = file.getMimeType();
        console.log(fileType);
        var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
        var sheet = ss.getSheetByName("IMS Incident Log");
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
        var sheetDataLen = sheetData.length;
        for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "INCIDENT_FOLDER_ID") {
                var colIncidentFolderId = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "INCIDENT_NAME") {
                var colIncidentName = hrow;
                continue
            }
            if (sheetHeaders[0][hrow] == "INCIDENT_NUMBER") {
                var colIncidentNumber = hrow;
                continue;
            }
        }
        for (var row = 0; row < sheetDataLen; row++) {
            var incidentName;
            var incidentNumber;
            if (sheetData[row][colIncidentFolderId] == incidentFolderId) {
                incidentName = sheetData[row][colIncidentName];
                incidentNumber = sheetData[row][colIncidentNumber];
                break;
            }
        }
        if (fileType == "application/vnd.google-apps.document") {
            var doc = DocumentApp.openById(fileId);
        }
        if (incidentNumber == "") {
            incidentNumber = "Not Assigned";
        }
        if (templateType == "PERSON") {
            file.setName(templateName + " - " + lastName + ", " + firstName);
            var subjectName = lastName + ", " + firstName;
            if (fileType == "application/vnd.google-apps.document") {
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NAME%", incidentName);
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", incidentNumber);
                SharedFunctions.fillDocsTemplate(doc, "%SUBJECT_NAME%", subjectName);
            }
        } else if (templateType == "VESSEL") {
            file.setName(templateName + " - " + vesselName);
            if (fileType == "application/vnd.google-apps.document") {
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NAME%", incidentName);
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", incidentNumber);
                SharedFunctions.fillDocsTemplate(doc, "%VESSEL_NAME%", vesselName);
            }
        } else {
            file.setName(templateName + " - " + date);
        }
        var fileName = file.getName();
        var fileUrl = file.getUrl();
        fileName = fileName.toString();
        var msg = [true, fileName, fileUrl];
        return msg;
    } catch (error) {
        console.log("createDocumentFromTemplate Error: " + error);
        var msg = [false, error.toString()];
        return msg;
    }
}