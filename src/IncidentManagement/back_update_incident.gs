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
      SystemTools.forceUpdate();
      var msg = [true, incidentFolderId, incidentName];
      return msg;
    }
  } catch (error) {
    console.log("Error: " + incidentName + error)
    var msg = [false, error.toString()];
    return msg
  }
}