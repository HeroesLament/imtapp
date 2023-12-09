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
      const result = incidentMapperUpdate(incidentName);
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

function findRowsForIncident(incidentName, sheet) {
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

function shiftRowsUp(sheet, startRow, endRow, numRowsShifted) {
  // Read data into a JavaScript array (in-memory)
  var range = sheet.getRange(startRow + 1, 1, endRow - startRow, sheet.getLastColumn());
  var data = range.getValues();

  // Manipulate the array to remove specific rows (if needed)
  // For example, if rows 11, 14, 19 are removed, adjust the data array accordingly

  // Write the data back to the sheet, shifted up
  sheet.getRange(startRow - numRowsShifted + 1, 1, data.length, data[0].length).setValues(data);

  // Optionally, clear any remaining rows that are now empty due to the shift
  var rowsToClear = endRow - (startRow - numRowsShifted + 1 + data.length);
  if (rowsToClear > 0) {
    sheet.getRange(endRow - rowsToClear + 1, 1, rowsToClear, sheet.getLastColumn()).clearContent();
  }
}

function incidentMapperUpdate(incidentName) {
  try {
    const sheet = SpreadsheetApp.openById(SystemSettings.SPOT_INCIDENT_MAPPER_ID).getSheets()[1];
    const rowIndexes = findRowsForIncident(incidentName, sheet);
    let requests = createDeletionRequests(rowIndexes);

    // Calculate the number of rows to be shifted and add shift requests
    const numRowsShifted = rowIndexes.length;
    const shiftRequests = createShiftRequests(sheet, numRowsShifted, rowIndexes);
    requests = requests.concat(shiftRequests);

    // Perform the batch update
    const response = batchUpdate(SystemSettings.SPOT_INCIDENT_MAPPER_ID, requests);

    var msg = [true, incidentName];
    return msg;
  } catch (error) {
    console.log("Error in incidentMapperUpdate for " + incidentName + ": " + error);
    var msg = [false, error.toString()];
    return msg;
  }
}