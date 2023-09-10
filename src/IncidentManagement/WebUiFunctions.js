function getIncidentTypeList() {
    var ss = SpreadsheetApp.openById(SystemSettings.IMS_DROPDOWN_VALUES_SHEET_ID);
    var sheet = ss.getSheetByName("INCIDENT_TYPES");
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetData = sheet.getRange(2, 1, sheetLastRow, sheetLastColumn).getValues();
    var typeList = [];
    for (var row = 0; row < sheetLastRow; row++) {
        typeList.push(sheetData[row][0])
    }
    return typeList
}

function getIncidentDetails(incidentFolderId) {
    var incidentData = []
    var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
    var sheet = ss.getSheetByName("IMS Incident Log");
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    var colIncidentFolderId
    var colIncidentName
    var colIncidentStartDate
    var colIncidentEndDate
    var colIncidentNumber
    var colIncidentDescription
    var colSystemLog
    var colArchive
    var colAssignment
    var colSituation
    var colSpot
    var colExpense
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
        if (sheetHeaders[0][hrow] == "INCIDENT_FOLDER_ID") {
            colIncidentFolderId = hrow
        } else if (sheetHeaders[0][hrow] == "INCIDENT_NAME") {
            colIncidentName = hrow
        } else if (sheetHeaders[0][hrow] == "INCIDENT_START_DATE") {
            colIncidentStartDate = hrow
        } else if (sheetHeaders[0][hrow] == "INCIDENT_END_DATE") {
            colIncidentEndDate = hrow
        } else if (sheetHeaders[0][hrow] == "INCIDENT_NUMBER") {
            colIncidentNumber = hrow
        } else if (sheetHeaders[0][hrow] == "INCIDENT_DESCRIPTION") {
            colIncidentDescription = hrow
        } else if (sheetHeaders[0][hrow] == "ARCHIVED") {
            colArchive = hrow
        } else if (sheetHeaders[0][hrow] == "ENABLE_ASSIGNMENT") {
            colAssignment = hrow
        } else if (sheetHeaders[0][hrow] == "ENABLE_SITU") {
            colSituation = hrow
        } else if (sheetHeaders[0][hrow] == "ENABLE_SPOT") {
            colSpot = hrow
        } else if (sheetHeaders[0][hrow] == "ENABLE_EXPENSE") {
            colExpense = hrow
        } else if (sheetHeaders[0][hrow] == "SYSTEM_LOG") {
            colSystemLog = hrow
        } else {
            continue;
        };
    }
    for (var drow = 0; drow < sheetDataLen; drow++) {
        if (sheetData[drow][colIncidentFolderId].toString() == incidentFolderId.toString()) {
            var rowIncident = drow;
            break;
        }
    }
    incidentData.push(sheetData[rowIncident][colIncidentFolderId])
    incidentData.push(sheetData[rowIncident][colIncidentName])
    incidentData.push(sheetData[rowIncident][colIncidentNumber])
    incidentData.push(sheetData[rowIncident][colIncidentStartDate].toString())
    incidentData.push(sheetData[rowIncident][colIncidentEndDate].toString())
    incidentData.push(sheetData[rowIncident][colIncidentDescription])
    incidentData.push(sheetData[rowIncident][colSystemLog])
    incidentData.push(sheetData[rowIncident][colArchive])
    incidentData.push(sheetData[rowIncident][colAssignment])
    incidentData.push(sheetData[rowIncident][colSituation])
    incidentData.push(sheetData[rowIncident][colSpot])
    incidentData.push(sheetData[rowIncident][colExpense])
    
    return incidentData
}