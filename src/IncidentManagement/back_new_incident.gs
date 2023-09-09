function newIncident(newIncidentLocation, newIncidentType, incidentDate) {
  console.log("START: newIncident")
  try {
    var incidentLogData = []
    if (!newIncidentType || newIncidentType.length === 0 || newIncidentType == ", ") {
      newIncidentType = "Untitled Incident"
    }
    if (!newIncidentLocation || newIncidentLocation.length === 0 || newIncidentLocation == ", ") {
      newIncidentLocation = "Unspecified Location"
    }
    //Set New Folder Name
    if (incidentDate == "" || incidentDate == null || incidentDate == "undefined") {
      var tz = Session.getScriptTimeZone();
      var incidentDate = Utilities.formatDate(new Date(), tz, "MMMM dd, yyyy");
    }
    //CREATE INCIDENT NNAME FROM FORM FIELDS
    var newIncidentTitle = newIncidentLocation + ", " + newIncidentType;
    var newIncidentName = newIncidentTitle + " - " + incidentDate;
    incidentLogData.push(["INCIDENT_START_DATE", incidentDate.toString()]);
    incidentLogData.push(["INCIDENT_NAME", newIncidentTitle]);
    // Settings for IMS Modules and Mappers
    incidentLogData.push(["ARCHIVED", false]);
    incidentLogData.push(["ENABLE_ASSIGNMENT", true]);
    incidentLogData.push(["ENABLE_SITU", true]);
    incidentLogData.push(["ENABLE_SPOT", true]);
    incidentLogData.push(["ENABLE_EXPENSE", true]);
    //Get Folders From Settings  
    var rootFolder = DriveApp.getFolderById(SystemSettings.IMS_ROOT_FOLDER);
    var templateFolder = DriveApp.getFolderById(SystemSettings.IMS_TEMPLATES_FOLDER);
    var currentYear = Utilities.formatDate(new Date(), tz, "yyyy");
    var yearFolders = rootFolder.getFoldersByName(currentYear)
    if (yearFolders.hasNext() == false) {
      var yearFolder = rootFolder.createFolder(currentYear);
    } else {
      var yearFolder = yearFolders.next();
    }
    //Execute Copy Of Template Folder
    var newIncidentFolder = yearFolder.createFolder(newIncidentName);
    var newIncidentFolderId = newIncidentFolder.getId();
    incidentLogData.push(["INCIDENT_FOLDER_ID", newIncidentFolderId]);
    var newIncidentDataFolder = newIncidentFolder.createFolder("Data Files");
    var newIncidentDataFolderId = newIncidentDataFolder.getId();
    var templateFiles = templateFolder.getFiles();
    while (templateFiles.hasNext()) {
      var templateFile = templateFiles.next();
      var templateFileId = templateFile.getId();
      var newSheetId = SharedFunctions.copyDriveFile(templateFileId, newIncidentDataFolderId);
      //Log File IDs   
      if (templateFileId == SystemSettings.IMS_TEMPLATES_INCIDENT_LOG_ID) {
        incidentLogData.push(["INCIDENT_LOG_ID", newSheetId]);
      }
      // DATA Sheet IDs
      if (templateFileId == SystemSettings.IMS_TEMPLATES_MEMBER_DATA_ID) {
        incidentLogData.push(["INCIDENT_MEMBER_DATA_ID", newSheetId]);
      }
      if (templateFileId == SystemSettings.IMS_TEMPLATES_ASSET_DATA_ID) {
        incidentLogData.push(["INCIDENT_ASSET_DATA_ID", newSheetId]);
      }
      if (templateFileId == SystemSettings.IMS_TEMPLATES_SITUATION_DATA_ID) {
        incidentLogData.push(["INCIDENT_SITUATION_DATA_ID", newSheetId]);
      }
      if (templateFileId == SystemSettings.IMS_TEMPLATES_EXPENSE_DATA_ID) {
        incidentLogData.push(["INCIDENT_EXPENSE_DATA_ID", newSheetId]);
      }
    };
    //CREATE THE INCIDENT LOG ENTRY
    var user = SharedFunctions.getUser();
    var dtg = new Date().toString();
    var log = dtg + ": Incident created by " + user + ".";
    incidentLogData.push(["SYSTEM_LOG", log]);
    var newLogRow = []
    var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
    var sheet = ss.getSheetByName("IMS Incident Log");
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
      var foundData = 0
      for (var i = 0; i < incidentLogData.length; i++) {
        if (sheetHeaders[0][hrow].toString() == incidentLogData[i][0].toString()) {
          newLogRow.push([incidentLogData[i][1]])
          foundData = 1
          break;
          continue;
        }
        if (i == (incidentLogData.length - 1)) newLogRow.push([""]);
      }
    }
    console.log("newLogRow: " + newLogRow);
    // Get a script lock, because we're about to modify a shared resource.
    var lock = LockService.getScriptLock();
    // Wait for up to 30 seconds for other processes to finish.
    lock.waitLock(30000);
    var sheetLastRow = sheet.getLastRow();
    sheet.getRange((sheetLastRow + 1), 1, 1, newLogRow.length).setValues([newLogRow]);
    //release the lock
    lock.releaseLock();
    //Fill In templates        
    //var placeholder = "%INCIDENT_NAME%";
    //fillTemplates(newIncidentFolderId, placeholder, newIncidentTitle);
    //var placeholder = "%INCIDENT_START_DATE%";
    ///fillTemplates(newIncidentFolderId, placeholder, incidentDate);
    //Send Resukts to UI
    var msg = [true, newIncidentFolderId, newIncidentName];
    console.log("COMPLETE newIncident: " + msg)
    return msg;
  } catch (error) {
    console.log("ERROR: newIncident - " + error)
    var msg = [false, error.toString()];
    return msg;
  }
}

function fillTemplates(folderId, placeholder, text) {
  console.log("Start fillTemplates Function with placeholder text: " + placeholder)
  //Update Forms W/ Name and Date
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  while (files.hasNext()) {
    try {
      var file = files.next();
      var fileId = file.getId()
      var fileName = file.getName();
      var fileNameMatch = fileName.match(/Data File/i);
      if (fileNameMatch != null) continue;
      var fileType = file.getMimeType();
      console.log("filetype:" + fileType);
      if (fileType === "application/vnd.google-apps.spreadsheet") {
        console.log("File Type Is Sheet, Starting Fill")
        SharedFunctions.fillSpreadSheetTemplate(fileId, 0, placeholder, text);
      }
      if (fileType === "application/vnd.google-apps.document") {
        console.log("File Type Is Doc, Starting Fill")
        var doc = DocumentApp.openById(fileId);
        SharedFunctions.fillDocsTemplate(doc, placeholder, text);
      }
      console.log("File Sucessful:" + fileId)
    } catch (error) {
      console.log("Error: " + error)
      return error.toString();
    }
  }
}