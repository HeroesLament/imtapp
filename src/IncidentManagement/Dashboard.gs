function getIncidentDashboardList() {
  var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
  var sheet = ss.getSheetByName("IMS Incident Log");
  var sheetLastRow = sheet.getLastRow();
  var sheetLastColumn = sheet.getLastColumn();
  var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
  var sheetHeadersLen = sheetHeaders[0].length;
  var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
  var sheetDataLen = sheetData.length;
  var incidents = [];
  var colArchived
  var colIncidentName
  var colIncidentFolder
  var colIncidentStartDate
  var colIncidentEndDate
  var colIncidentNumber
  var colIncidentDescription
  var colIncidentLog
  for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
    if (sheetHeaders[0][hrow] == "ARCHIVED") {
      colArchived = hrow
    } else if (sheetHeaders[0][hrow] == "INCIDENT_NAME") {
      colIncidentName = hrow
    } else if (sheetHeaders[0][hrow] == "INCIDENT_FOLDER_ID") {
      colIncidentFolder = hrow
    } else if (sheetHeaders[0][hrow] == "INCIDENT_START_DATE") {
      colIncidentStartDate = hrow
    } else if (sheetHeaders[0][hrow] == "INCIDENT_END_DATE") {
      colIncidentEndDate = hrow
    } else if (sheetHeaders[0][hrow] == "INCIDENT_NUMBER") {
      colIncidentNumber = hrow
    } else if (sheetHeaders[0][hrow] == "INCIDENT_DESCRIPTION") {
      colIncidentDescription = hrow
    } else if (sheetHeaders[0][hrow] == "INCIDENT_LOG_ID") {
      colIncidentLog = hrow
    } else {
      continue;
    }
  }
  var tz = Session.getScriptTimeZone();
  for (var drow = 0; drow < sheetDataLen; drow++) {
    var incindentStatus = "";
    var incidentName = "";
    var incidentFolder = "";
    var incidentNumber = ""
    var incidentEndDate = "";
    var incidentStartDate = "";
    var incidentLogUrl = "";
    incidentEndDate = sheetData[drow][colIncidentEndDate];
    incidentStartDate = sheetData[drow][colIncidentStartDate];
    var inicentLogId = sheetData[drow][colIncidentLog];
    if (sheetData[drow][colArchived] != "true") {
      incidentLogUrl = getFileUrlById(inicentLogId);
    }
    if (incidentEndDate === "" || incidentEndDate === null || incidentEndDate === "undefined") {
      incidentEndDate = "";
    } else {
      incidentEndDate = Utilities.formatDate(new Date(incidentEndDate), tz, "MMMM dd, yyyy");
    }
    incidentStartDate = Utilities.formatDate(new Date(incidentStartDate), tz, "MMMM dd, yyyy");
    incidents.push([sheetData[drow][colIncidentName], incidentStartDate.toString(), incidentEndDate.toString(), sheetData[drow][colIncidentFolder], sheetData[drow][colIncidentNumber], sheetData[drow][colIncidentDescription], sheetData[drow][colArchived], incidentLogUrl])
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