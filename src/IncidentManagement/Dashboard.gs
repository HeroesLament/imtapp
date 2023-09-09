function getIncidentDashboardList() {
  var span = OpenTelemetryGASExporter.createSpan('getIncidentDashboardList');
  try {
    var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
    span.addEvent('Spreadsheet opened');
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
  } catch (error) {
    span.setAttribute('error', true);
    span.setAttribute('errorMessage', error.message);
    span.setAttribute('errorStack', error.stack);

    // Also log error to Google Logging
    console.error(error);
  } finally {
    OpenTelemetryGASExporter.endSpan(span);
    OpenTelemetryGASExporter.export(span);
  }
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