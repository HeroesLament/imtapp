function getIncidentDashboardList() {
  var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
  var sheet = ss.getSheetByName("IMS Incident Log");
  var sheetLastRow = sheet.getLastRow();
  var sheetLastColumn = sheet.getLastColumn();
  
  var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues()[0];
  var headerMap = {};
  sheetHeaders.forEach(function(header, index) {
    headerMap[header] = index;
  });

  var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
  var incidents = [];

  var tz = Session.getScriptTimeZone();

  for (var drow = 0; drow < sheetData.length; drow++) {
    var rowData = sheetData[drow];
    
    var incidentEndDate = rowData[headerMap["INCIDENT_END_DATE"]];
    var incidentStartDate = rowData[headerMap["INCIDENT_START_DATE"]];
    var incidentLogId = rowData[headerMap["INCIDENT_LOG_ID"]];
    
    var incidentLogUrl = "";
    if (rowData[headerMap["ARCHIVED"]] != "true") {
      incidentLogUrl = getFileUrlById(incidentLogId);
    }

    if (!incidentEndDate) {
      incidentEndDate = "";
    } else {
      incidentEndDate = Utilities.formatDate(new Date(incidentEndDate), tz, "MMMM dd, yyyy");
    }

    incidentStartDate = Utilities.formatDate(new Date(incidentStartDate), tz, "MMMM dd, yyyy");
    
    incidents.push([
      rowData[headerMap["INCIDENT_NAME"]], 
      incidentStartDate.toString(), 
      incidentEndDate.toString(), 
      rowData[headerMap["INCIDENT_FOLDER_ID"]], 
      rowData[headerMap["INCIDENT_NUMBER"]], 
      rowData[headerMap["INCIDENT_DESCRIPTION"]], 
      rowData[headerMap["ARCHIVED"]], 
      incidentLogUrl
    ]);
  }

  return incidents; 
}


  function sortFunctionAssignByDate(a, b) {
    var o1 = new Date(a[2]);
    var o2 = new Date(b[2]);
    var p1 = new Date(a[1]);
    var p2 = new Date(b[1]);
    var t1 = a[0]
    var t2 = b[0]
    if (o1 == "Invalid Date") return -1;
    if (o1 > o2) return -1;
    if (o1 < o2) return 1;
    if (p1 > p2) return -1;
    if (p1 < p2) return 1;
    var t = t1.localeCompare(t2);
    return t;
    return 0;
  }
  incidents.sort(sortFunctionAssignByDate)
  // console.log("Incident List: " + incidents)
  return incidents;
}
function getFileUrlById(id) {
  try {
    var incidentLogUrl = DriveApp.getFileById(id).getUrl();;
    return incidentLogUrl
  }
  catch (e) {
    var incidentLogUrl = ""
    return incidentLogUrl

  }
}