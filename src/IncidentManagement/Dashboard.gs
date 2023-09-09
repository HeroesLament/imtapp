function getIncidentDashboardList() {
  const span = OpenTelemetryGASExporter.createSpan('getIncidentDashboardList');

  try {
      const ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
      span.addEvent('Spreadsheet opened');

      // Get sheet and related data
      const sheet = ss.getSheetByName("IMS Incident Log");
      const sheetLastRow = sheet.getLastRow();
      const sheetLastColumn = sheet.getLastColumn();
      const sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
      
      // Create header map
      const sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues()[0];
      let headerMap = {};
      sheetHeaders.forEach((header, index) => headerMap[header] = index);

      let incidents = [];
      const tz = Session.getScriptTimeZone();

      // Process each row for incidents
      for (let drow = 0; drow < sheetData.length; drow++) {
          const rowData = sheetData[drow];
          
          let incidentEndDate = rowData[headerMap["INCIDENT_END_DATE"]];
          const incidentStartDate = Utilities.formatDate(new Date(rowData[headerMap["INCIDENT_START_DATE"]]), tz, "MMMM dd, yyyy");
          const incidentLogId = rowData[headerMap["INCIDENT_LOG_ID"]];

          let incidentLogUrl = (rowData[headerMap["ARCHIVED"]] !== "true") ? getFileUrlById(incidentLogId) : "";

          incidentEndDate = incidentEndDate ? Utilities.formatDate(new Date(incidentEndDate), tz, "MMMM dd, yyyy") : "";

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
      console.error(error);
  } finally {
      OpenTelemetryGASExporter.endSpan(span);
      OpenTelemetryGASExporter.export(span);
  }
}

function getFileUrlById(id) {
  try {
      return DriveApp.getFileById(id).getUrl();
  } catch (e) {
      return "";
  }
}
