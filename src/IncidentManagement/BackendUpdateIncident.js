function updateIncident(incidentFolderId, incidentLocation, incidentType, incidentNumber, incidentStartDate, incidentEndDate, description) {
  console.log("Starting updateIncidentFunction");
  try {
    var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
    var sheet = ss.getSheetByName("IMS Incident Log");
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var colIncidentName
    var colIncidentFolderId
    var colIncidentStartDate
    var colIncidentEndDate
    var colIncidentNumber
    var colIncidentDescription
    var colSystemLog
    var tz = Session.getScriptTimeZone();
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
      if (sheetHeaders[0][hrow] == "INCIDENT_NAME") {
        colIncidentName = hrow
      } else if (sheetHeaders[0][hrow] == "INCIDENT_FOLDER_ID") {
        colIncidentFolderId = hrow
      } else if (sheetHeaders[0][hrow] == "INCIDENT_START_DATE") {
        colIncidentStartDate = hrow
      } else if (sheetHeaders[0][hrow] == "INCIDENT_END_DATE") {
        colIncidentEndDate = hrow
      } else if (sheetHeaders[0][hrow] == "INCIDENT_NUMBER") {
        colIncidentNumber = hrow
      } else if (sheetHeaders[0][hrow] == "SYSTEM_LOG") {
        colSystemLog = hrow
      } else if (sheetHeaders[0][hrow] == "INCIDENT_DESCRIPTION") {
        colIncidentDescription = hrow
      } else {
        continue;
      }
    }
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    for (var drow = 0; drow < sheetDataLen; drow++) {
      if (sheetData[drow][colIncidentFolderId].toString() == incidentFolderId.toString()) {
        var rowIncident = drow;
        break;
      }
    }
    var oldDetails = getIncidentDetails(incidentFolderId)
    var oldIncidentName = oldDetails[1];
    var oldIncidentStartDate = new Date(oldDetails[3]);
    var oldIncidentEndDate = new Date(oldDetails[4]);
    var oldIncidentNumber = oldDetails[2];
    var oldDescription = oldDetails[5];
    var user = SharedFunctions.getUser()
    var dtg = new Date().toString();
    var log = sheet.getRange((rowIncident + 2), (colSystemLog + 1)).getValue();
    var changeFolderName = false;
    var changeFolderDate = false;
    if (incidentEndDate != "") {
      incidentEndDate = new Date(incidentEndDate);
    }
    if (incidentStartDate != "") {
      incidentStartDate = new Date(incidentStartDate);
    }
    //CREATE INCIDNET NNAME FROM FORM FIELDS
    var incidentName = incidentLocation + ", " + incidentType;
    if (incidentName.toString() != oldIncidentName.toString() && incidentName.toString() != "" && oldIncidentName.toString() != "") {
      sheet.getRange((rowIncident + 2), (colIncidentName + 1)).setValue(incidentName);
      fillTemplates(incidentFolderId, oldIncidentName.toString(), incidentName.toString());
      changeFolderName = true;
      log += "\n" + dtg + ":  Incident name changed from " + oldIncidentName + " to " + incidentName + " by " + user + ".";
    }
    if (incidentNumber != oldIncidentNumber && incidentNumber != "" && oldIncidentNumber != "") {
      console.log("oldIncidentNumber")
      console.log(oldIncidentNumber)
      sheet.getRange((rowIncident + 2), (colIncidentNumber + 1)).setValue(incidentNumber);
      fillTemplates(incidentFolderId, oldIncidentNumber.toString(), incidentNumber.toString());
      log += "\n" + dtg + ": Incident number changed from " + oldIncidentNumber + " to " + incidentNumber + " by " + user + ".";
    }
    if (incidentNumber != oldIncidentNumber && incidentNumber != "" && oldIncidentNumber == "") {
      sheet.getRange((rowIncident + 2), (colIncidentNumber + 1)).setValue(incidentNumber);
      fillTemplates(incidentFolderId, "%INCIDENT_NUMBER%", incidentNumber.toString());
      log += "\n" + dtg + ": Incident number " + incidentName + " added by " + user + ".";
    }
    if (description != oldDescription && description != "" && oldDescription == "") {
      sheet.getRange((rowIncident + 2), (colIncidentDescription + 1)).setValue(description);
      log += "\n" + dtg + ": Incident description " + description + " added by " + user + ".";
    }
    if (description != oldDescription && description != "" && oldDescription != "") {
      sheet.getRange((rowIncident + 2), (colIncidentDescription + 1)).setValue(description);
      log += "\n" + dtg + ": Incident description changed from " + oldDescription + " to " + description + " by " + user + ".";
    }
    var minDate
    if (incidentStartDate > oldIncidentStartDate) {
      minDate = incidentStartDate;
    } else {
      minDate = oldIncidentStartDate;
    }
    //STILL NEEDS TO BE FIXED to get the right date
    //       console.log("loc 6")
    console.log("incidentEndDate " + incidentEndDate + " | " + oldIncidentEndDate + " minDate: " + minDate)
    if (incidentEndDate.toString() != oldIncidentEndDate.toString() && incidentEndDate != "" && oldIncidentEndDate != "" && incidentEndDate >= minDate && incidentEndDate <= new Date()) {
      var displayEndDate = Utilities.formatDate(incidentEndDate, tz, "MMMM dd, yyyy");
      var displayOldEndDate = Utilities.formatDate(oldIncidentEndDate, tz, "MMMM dd, yyyy");
      sheet.getRange((rowIncident + 2), (colIncidentEndDate + 1)).setValue(displayEndDate);
      fillTemplates(incidentFolderId, displayOldEndDate.toString(), displayEndDate.toString());
      log += "\n" + dtg + ":  Incident end date from " + displayOldEndDate + " to " + displayEndDate + " by " + user + ".";
    }
    var maxDate
    if (incidentEndDate != "") {
      if (incidentEndDate > oldIncidentEndDate) {
        maxDate = incidentEndDate;
      } else {
        maxDate = oldIncidentStartDate;
      }
    } else {
      maxDate = new Date();
    }
    if (incidentStartDate.toString() != oldIncidentStartDate.toString() && incidentStartDate <= new Date() && incidentStartDate <= maxDate) {
      var displayStartDate = Utilities.formatDate(incidentStartDate, tz, "MMMM dd, yyyy");
      var displayOldStartDate = Utilities.formatDate(oldIncidentStartDate, tz, "MMMM dd, yyyy");
      sheet.getRange((rowIncident + 2), (colIncidentStartDate + 1)).setValue(displayStartDate);
      fillTemplates(incidentFolderId, displayOldStartDate.toString(), displayStartDate.toString());
      changeFolderName = true;
      changeFolderDate = true;
      log += "\n" + dtg + ": Incident start date from " + displayOldStartDate + " to " + displayStartDate + " by " + user + ".";
    }
    sheet.getRange((rowIncident + 2), (colSystemLog + 1)).setValue(log);
    if (changeFolderName == true) {
      if (changeFolderDate == true) {
        var incidentDate = Utilities.formatDate(incidentStartDate, tz, "MMMM dd, yyyy");
      } else {
        var incidentDate = Utilities.formatDate(oldIncidentStartDate, tz, "MMMM dd, yyyy");
      }
      var newIncidentName = incidentName + " - " + incidentDate;
      var folder = DriveApp.getFolderById(incidentFolderId);
      folder.setName(newIncidentName);
    }
    console.log("Complete: updateIncidentFunction");
    var msg = [true, incidentFolderId.toString(), incidentName];
    return msg;
  } catch (error) {
    console.log("Error: " + error.toString())
    var msg = [false, error];
    return msg
  }
}
function deleteIncident(incidentFolderId) {
  console.log("Starting deleteIncidentFunction");
  try {
    var lock = LockService.getScriptLock();
    // Wait for up to 45 seconds for other processes to finish.
    lock.waitLock(45000);
    var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
    var sheet = ss.getSheetByName("IMS Incident Log");
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var colIncidentName
    var colIncidentFolderId
    var tz = Session.getScriptTimeZone();
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
      if (sheetHeaders[0][hrow] == "INCIDENT_NAME") {
        colIncidentName = hrow
      } else if (sheetHeaders[0][hrow] == "INCIDENT_FOLDER_ID") {
        colIncidentFolderId = hrow
      } else {
        continue;
      }
    }
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    for (var drow = 0; drow < sheetDataLen; drow++) {
      if (sheetData[drow][colIncidentFolderId].toString() == incidentFolderId.toString()) {
        var rowIncident = drow;
        break;
      }
    }
    //get IncidentName
    var incidentName = sheetData[drow][colIncidentName].toString()
    //delete row, +2 adjustment to offset header + zero base array
    sheet.deleteRow(drow + 2)
    lock.releaseLock();
    //delete folder
    var folder = DriveApp.getFolderById(incidentFolderId);
    folder.setTrashed(true);
    SystemTools.forceUpdate();

    console.log("Complete: deleteIncidentFunction");
    var msg = [true, incidentFolderId.toString(), incidentName];
    return msg;
  } catch (error) {
    console.log("Error: " + error.toString())
    var msg = [false, error];
    return msg
  }
}