function completeIncident(incidentFolderId, endDate) {
  try {
    console.log("Closing Incindent: " + incidentFolderId);
    if (endDate == "" || endDate == null || endDate == "undefined") {
      var tz = Session.getScriptTimeZone();
      var endDate = Utilities.formatDate(new Date(), tz, "MMMM dd, yyyy");
    }
    var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
    var sheet = ss.getSheetByName("IMS Incident Log");
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    var colIncidentFolderId
    var colIncidentEndDate
    var colIncidentAssignment
    var colSystemLog
    var colMemberLog
    var colIncidentName;
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
      if (sheetHeaders[0][hrow] == "INCIDENT_FOLDER_ID") {
        colIncidentFolderId = hrow
      } else if (sheetHeaders[0][hrow] == "INCIDENT_END_DATE") {
        colIncidentEndDate = hrow
      } else if (sheetHeaders[0][hrow] == "ENABLE_ASSIGNMENT") {
        colIncidentAssignment = hrow
      } else if (sheetHeaders[0][hrow] == "SYSTEM_LOG") {
        colSystemLog = hrow
      } else if (sheetHeaders[0][hrow] == "INCIDENT_MEMBER_DATA_ID") {
        colMemberLog = hrow
      } else if (sheetHeaders[0][hrow] == "INCIDENT_NAME") {
        colIncidentName = hrow
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
    var memberLogId = sheet.getRange((rowIncident + 2), (colMemberLog + 1)).getValue();
    var incidentName = sheet.getRange((rowIncident + 2), (colIncidentName + 1)).getValue();
    try {
      var mbrData = MemberAssignment.getCheckedInMembers(memberLogId);
    }
    finally {
      if (mbrData === true) throw "Error: Unable to close incident because to one or more members are still checked in to the incident."
      var user = SharedFunctions.getUser()
      var dtg = new Date().toString();
      var log = sheet.getRange((rowIncident + 2), (colSystemLog + 1)).getValue();
      log += "\n" + dtg + ": Incident closed by " + user + ".";

      if (rowIncident > 1) {
        sheet.getRange((rowIncident + 2), (colIncidentEndDate + 1)).setValue(endDate);
        sheet.getRange((rowIncident + 2), (colIncidentAssignment + 1)).setValue(false);
        sheet.getRange((rowIncident + 2), (colSystemLog + 1)).setValue(log);
        console.log("Incident Sucessfully Closed");

      }
      SystemTools.forceUpdate(); // Update the Filter Mapper
      // Remove Incident Waypoints from Incident Mapper Spreadsheet 
      const rowIndexes = findRowsForIncident(incidentName);
      const deletionRequests = createDeletionRequests(rowIndexes);
      const response = batchUpdate(SystemSettings.SPOT_INCIDENT_MAPPER_ID, deletionRequests);
      
      var msg = [true, incidentFolderId, incidentName];
      return msg;
    }
  } catch (error) {
    console.log("Error: " + incidentName + error)
    var msg = [false, error.toString()];
    return msg
  }
}

function findRowsForIncident(incidentName) {
  const sheet = SpreadsheetApp.openById(SystemSettings.SPOT_INCIDENT_MAPPER_ID).getSheets()[1]; // Open Incident Mapper Spreadsheet
  const dataRange = sheet.getRange('C11:C1000').getValues(); // Creates an array of RowData enumerating the Folder/Incident name
  let rowIndexes = [];

  for (let i = 0; i < dataRange.length; i++) {
    if (dataRange[i][0].includes(incidentName)) {
      rowIndexes.push(i + 10); // Adjust the index to match sheet rows
    }
  }

  return rowIndexes;
}

function createDeletionRequests(rowIndexes) {
  var requests = [];
  rowIndexes.forEach(rowId => {
    requests.push(createUpdateCellsRequest(rowId));
  });
  return requests;
}

function batchUpdate(spreadsheetId, requests) {
  var url = 'https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + ':batchUpdate';
  var payload = {
    requests: requests
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
    },
    // Convert the JavaScript object to a JSON string.
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getContentText());
}

function createUpdateCellsRequest(rowId) {
  const sheetId = 2; // Hardcoded to always target sheet 2
  const startColumn = 2; // Hardcoded to always start from column C (index 2)
  const endColumn = 51; // Hardcoded to always end at column AY (index 51)

  return {
    "updateCells": {
      "range": {
        "sheetId": sheetId,
        "startRowIndex": rowId,
        "endRowIndex": rowId + 1, // endRowIndex is exclusive
        // Exclusive endRowIndex: This means that the endRowIndex is not included in the range.
        // For example, if startRowIndex is 10 and endRowIndex is 11, the operation will affect only the row at index 10.
        // (which corresponds to the 11th row in the sheet, as the index is 0-based).
        // The row at index 11 (the 12th row in the sheet) is not included in this range.
        "startColumnIndex": startColumn,
        "endColumnIndex": endColumn
      },
      "rows": [
        {
          "values": new Array(endColumn - startColumn).fill({
            "userEnteredValue": null // Set each cell's value to null
          })
        }
      ],
      "fields": "userEnteredValue" // Only the userEnteredValue will be updated
    }
  };
}