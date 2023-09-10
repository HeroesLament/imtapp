function archiveIncident(incidentFolderId) {
  try {
    var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
    var sheet = ss.getSheetByName("IMS Incident Log");
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    var colIncidentStatus
    var colIncidentFolderId
    var colSystemLog
    var colIncidentExpense
    var colIncidentSpot
    var colIncidentAssignment
    var colIncidentSitu
    var colIncidentArchived
    var colMemberLog
    var rowIncident
    var colIncidentName
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
      if (sheetHeaders[0][hrow] == "INCIDENT_FOLDER_ID") {
        colIncidentFolderId = hrow
      } else if (sheetHeaders[0][hrow] == "ARCHIVED") {
        colIncidentArchived = hrow
      } else if (sheetHeaders[0][hrow] == "ENABLE_SITU") {
        colIncidentSitu = hrow
      } else if (sheetHeaders[0][hrow] == "ENABLE_ASSIGNMENT") {
        colIncidentAssignment = hrow
      } else if (sheetHeaders[0][hrow] == "ENABLE_SPOT") {
        colIncidentSpot = hrow
      } else if (sheetHeaders[0][hrow] == "ENABLE_EXPENSE") {
        colIncidentExpense = hrow
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
      console.log(memberLogId)
      var mbrData = MemberAssignment.getCheckedInMembers(memberLogId);
      console.log(mbrData)
    }
    finally {

      if (mbrData === true) throw "Error: Unable to close incident because to one or more members are still checked in to the incident."
      var user = SharedFunctions.getUser()
      var dtg = new Date().toString();
      var log = sheet.getRange((rowIncident + 2), (colSystemLog + 1)).getValue();

      log += "\n" + dtg + ": Moved to archive by " + user + ".";
      if (rowIncident > 1) {
        sheet.getRange((rowIncident + 2), (colIncidentArchived + 1)).setValue(true);
        sheet.getRange((rowIncident + 2), (colIncidentAssignment + 1)).setValue(false);
        sheet.getRange((rowIncident + 2), (colIncidentSitu + 1)).setValue(false);
        sheet.getRange((rowIncident + 2), (colIncidentSpot + 1)).setValue(false);
        sheet.getRange((rowIncident + 2), (colIncidentExpense + 1)).setValue(false);
        sheet.getRange((rowIncident + 2), (colSystemLog + 1)).setValue(log);
        console.log("Incident Sucessfully Archived");
      }
      var msg = [true, incidentFolderId.toString(), incidentName];
      console.log(msg)
      return msg;
    }
  }
  catch (error) {
    console.log("Error: " + error.toString())
    var msg = [false, incidentFolderId.toString(), incidentName, error];
  }
}

function reactivateIncident(incidentFolderId) {
  try {
    console.log("Reactivating Incindent: " + incidentFolderId);
    var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
    var sheet = ss.getSheetByName("IMS Incident Log");
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    var colIncidentStatus
    var colIncidentFolderId
    var colSystemLog
    var colIncidentExpense
    var colIncidentSpot
    var colIncidentAssignment
    var colIncidentSitu
    var colIncidentArchived
    var colMemberLog
    var colIncidentName
    var rowIncident
    console.log("1")
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
      if (sheetHeaders[0][hrow] == "INCIDENT_FOLDER_ID") {
        colIncidentFolderId = hrow
      } else if (sheetHeaders[0][hrow] == "ARCHIVED") {
        colIncidentArchived = hrow
      } else if (sheetHeaders[0][hrow] == "ENABLE_SITU") {
        colIncidentSitu = hrow
      } else if (sheetHeaders[0][hrow] == "ENABLE_ASSIGNMENT") {
        colIncidentAssignment = hrow
      } else if (sheetHeaders[0][hrow] == "ENABLE_SPOT") {
        colIncidentSpot = hrow
      } else if (sheetHeaders[0][hrow] == "ENABLE_EXPENSE") {
        colIncidentExpense = hrow
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
    console.log("2")

    for (var drow = 0; drow < sheetDataLen; drow++) {
      if (sheetData[drow][colIncidentFolderId].toString() == incidentFolderId.toString()) {
        var rowIncident = drow;
        break;
      }
    }
    var incidentName = sheet.getRange((rowIncident + 2), (colIncidentName + 1)).getValue();

    console.log("3")
    var user = SharedFunctions.getUser()
    var dtg = new Date().toString();
    var log = sheet.getRange((rowIncident + 2), (colSystemLog + 1)).getValue();
    log += "\n" + dtg + ": Removed from archive by " + user + ".";
    console.log("4")
    if (rowIncident > 1) {
      sheet.getRange((rowIncident + 2), (colIncidentArchived + 1)).setValue(false);
      sheet.getRange((rowIncident + 2), (colIncidentAssignment + 1)).setValue(false);
      sheet.getRange((rowIncident + 2), (colIncidentSitu + 1)).setValue(true);
      sheet.getRange((rowIncident + 2), (colIncidentSpot + 1)).setValue(true);
      sheet.getRange((rowIncident + 2), (colIncidentExpense + 1)).setValue(false);
      sheet.getRange((rowIncident + 2), (colSystemLog + 1)).setValue(log);
      console.log("Incident Sucessfully removed from archive");
    }
    console.log("5")
    SystemTools.forceUpdate();
    var msg = [true, incidentFolderId.toString(), incidentName];
    return msg;
  } catch (error) {
    console.log("Error: " + error)
    var msg = [false, error.toString()];
    return msg
  }
}
