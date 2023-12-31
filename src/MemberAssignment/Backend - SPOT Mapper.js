function syncSpotData() {
  const span = OpenTelemetryGASExporter.createSpan('syncSpotData');
  span.setAttribute('Mapper Sheet ID', SystemSettings.SPOT_INCIDENT_MAPPER_ID);
  try {
  var ss = SpreadsheetApp.openById(SystemSettings.SPOT_INCIDENT_MAPPER_ID);
  var mapper = ss.getSheets()[1];
  var mapperOldDataColumn = mapper.getLastColumn();
  var mapperOldDataLastRow = mapper.getLastRow();
  if (mapperOldDataLastRow > 10) {
    var mapperOldData = mapper.getRange(11, 3, (mapperOldDataLastRow - 10), mapperOldDataColumn);
    mapperOldData.clearContent();
  }
  var mapperSS = SpreadsheetApp.openById(SystemSettings.SPOT_INCIDENT_MAPPER_ID);
  var mapperSettings = mapperSS.getSheets()[0];
  var mapperUpdateInfo = mapperSettings.getRange('C32')
  var updateDtg = new Date().toString();
  mapperUpdateInfo.setValue("KVRS SPOT position data as of  " + updateDtg+".");
  var mapperUpdateDescrip = mapperSettings.getRange('C33')
  var descripText = "<p><em>KVRS SPOT position data as of  " +updateDtg + ".</em></p>"
  mapperUpdateDescrip.setValue(descripText);

  var activeIncidents = SharedFunctions.getIncidentList("ENABLE_SPOT", true, "INCIDENT_MEMBER_DATA_ID");
  for (var i = 0; i < activeIncidents.length; i++) {
    var incidentLog = activeIncidents[i][1]
    var incidentName = activeIncidents[i][0]
    console.log("Starting createIncidentPositionLog For Incident:" + incidentName)
    span.addEvent('Starting createIncidentPositionLog for incident' + incidentName)
    createIncidentPositionLog(incidentLog, incidentName)
    console.log("Completed createIncidentPositionLog For Incident:" + incidentName)
    span.addEvent('Completed createIncidentPositionLog for incident' + incidentName)
  }
  span.addEvent('SPOT Incident Mapper updated successfully');
  OpenTelemetryGASExporter.endSpan(span);
  OpenTelemetryGASExporter.export(span);
  } catch (error) {
    span.addEvent('SPOT Incident Mapper failed to update');
    OpenTelemetryGASExporter.endSpan(span);
    OpenTelemetryGASExporter.export(span);
  }

}

function createIncidentPositionLog(incidentSheet, incidentName) {
  const span = OpenTelemetryGASExporter.createSpan('createIncidentPositionLog');
  try {
    console.log("START: createIncidentPositionLog for" + incidentSheet)

    var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
    var sheet = ss.getSheetByName("IMS Incident Log");
    span.addEvent('Start reading data', {
      'sheetName': 'IMS Incident Log',
      'operation': 'getDataRange().getValues()'
    });
    var sheetData = sheet.getDataRange().getValues();
    var sheetHeaders = sheetData[0];
    var sheetData = sheet.getRange(2, 1, (sheet.getLastRow() - 1), sheet.getLastColumn()).getValues();
    var incidents = [];
    var colIncidentFolderId, colIncidentEndDate;
    
    for (var i = 0; i < sheetHeaders.length; i++) {
      if (sheetHeaders[i] == "INCIDENT_MEMBER_DATA_ID") {
        colIncidentFolderId = i;
      } else if (sheetHeaders[i] == "INCIDENT_END_DATE") {
        colIncidentEndDate = i;
      }
    }

    span.addEvent('Checking row for incidentSheet match', {
      'incidentSheet': incidentSheet
    });
    var incidentEndDate;
    for (var row = 0; row < sheetData.length; row++) {
      if (sheetData[row][colIncidentFolderId] == incidentSheet) {
        incidentEndDate = sheetData[row][colIncidentEndDate];
    
        span.addEvent('Match found', {
          'rowIndex': row,
          'incidentEndDate': incidentEndDate,
          'incidentSheet': incidentSheet
        });
    
        break;
      }
    }

    if (!incidentEndDate) {
      console.log("Incident is ongoing, checking for new SPOT Data");

      var filterEnd = new Date();
      var activeBeacons = getIncdentAssignmentList(incidentSheet, true);
      if (!Array.isArray(activeBeacons)) {
        span.addEvent('Error: activeBeacons is not an array', { 'activeBeacons': activeBeacons });
        return;
      }
      span.addEvent('Retrieved active beacons', { 'activeBeaconsCount': activeBeacons.length });
      var teamList = [];
      console.log("activeBeacons: " + activeBeacons)
      span.addEvent('Start filtering and processing data', {
        'activeBeaconsCount': activeBeacons.length
      });
      span.addEvent('Starting team list construction', { 'activeBeaconsCount': activeBeacons.length });
      for (var row = 0; row < activeBeacons.length; row++) {
        if (activeBeacons[row][5] == "" || activeBeacons[row][5] == undefined) {
          var newData = [activeBeacons[row][0], activeBeacons[row][2], activeBeacons[row][4], new Date(), activeBeacons[row][1]];
          teamList.push(newData);
          //span.addEvent('Adding to team list (new date)', { 'row': row, 'newData': newData });
        } else {
          var existingData = [activeBeacons[row][0], activeBeacons[row][2], activeBeacons[row][4], activeBeacons[row][5], activeBeacons[row][1]];
          teamList.push(existingData);
          //span.addEvent('Adding to team list (existing date)', { 'row': row, 'existingData': existingData });
        }
      }
      

      var logSs = SpreadsheetApp.openById(SystemSettings.SPOT_SPREADSHEET_ID);
      var logSheet = logSs.getSheets()[1];
      var logLastRow = logSheet.getLastRow();
      var logLastColumn = logSheet.getLastColumn();
      var exportSs = SpreadsheetApp.openById(incidentSheet);
      let exportSsId = exportSs.getId();
      var exportSheet = exportSs.getSheets()[1];
      var exportData = [];
      // This if statement doesn't really make sense here. There's no else, implying this is just checking for the
      // value 0. What SHOULD happen if the last row is 0? This logic needs to be revisited.
      if (logLastRow > 1) {
        var logData = logSheet.getRange(1, 1, logLastRow, logLastColumn).getValues();
        span.addEvent('Fetched log data', { 'rowCount': logLastRow, 'columnCount': logLastColumn });
      
        for (var trow = 0; trow < teamList.length; trow++) {
          var beaconFilter = teamList[trow][1];
          var filterStart = new Date(teamList[trow][2]);
          var filterEnd = new Date(teamList[trow][3]);
          
          //span.addEvent('Processing team', {
          //  'teamIndex': trow,
          //  'beaconFilter': beaconFilter,
          //  'filterStart': filterStart.toISOString(),
          //  'filterEnd': filterEnd.toISOString()
          //});
      
          for (var row = 1; row < logData.length; row++) {
            var candidateBeacon = logData[row][2].toString();
            var logDate = new Date(logData[row][15]);
            
            if ((beaconFilter !== "") && !beaconFilter.includes(candidateBeacon)) {
              continue;
            }
      
            if (isNaN(filterStart.getTime()) || isNaN(filterEnd.getTime()) || isNaN(logDate.getTime())) {
              console.log("Invalid date detected");
              span.addEvent('Invalid date detected', {
                'rowIndex': row,
                'filterStart': filterStart.toISOString(),
                'filterEnd': filterEnd.toISOString(),
                'logDate': logData[row][15]
              });
              continue;
            }

            console.log('Comparing dates', {
              logDate: logDate.toString(),
              filterStart: filterStart.toString(),
              filterEnd: filterEnd.toString()
            });

            // Check to see if the log entries in the "SPOT Beacon Data" GSheet occured within
            if (filterStart > logDate || filterEnd < logDate) {
              console.log('Skipping row ' + row + ': logDate is outside the filter range.');
              continue;
            }

            console.log('Including row ' + row + ': logDate is within the filter range.');
      
            var exportDataRow = [...logData[row], teamList[trow][4], teamList[trow][0]];
            exportData.push(exportDataRow);
          }
        }
        console.log("Finished processing log data");
        span.addEvent('Finished processing log data', { 'exportedRowCount': exportData.length });
      }
      

      var exportDataLen = exportData.length;
if (exportDataLen > 0) {
    console.log("Data ready for export");
    span.addEvent('Data ready for export', { 'exportDataLength': exportDataLen });
    var exportLastRow = exportSheet.getLastRow();
    var exportLastColumn = exportSheet.getLastColumn();
    var exportDataWidth = exportData[0].length;
    var rangesToClear = [];
    var rangesToSet = [];
    var valuesToSet = [];

    if (exportLastRow > 1) {
        rangesToClear.push({
            sheetId: exportSheet.getSheetId(),
            startRowIndex: 1,
            endRowIndex: exportLastRow - 1,
            startColumnIndex: 0,
            endColumnIndex: exportLastColumn
        });
    }

    rangesToSet.push({
        sheetId: exportSheet.getSheetId(),
        startRowIndex: 1,
        startColumnIndex: 0,
        endRowIndex: exportDataLen + 1,
        endColumnIndex: exportDataWidth
    });
    Array.prototype.push.apply(valuesToSet, exportData);

    console.log("Start writing data to sheet");
    span.addEvent('Start writing data to sheet', {
        'sheetName': exportSheet.getName(),
        'range': 'A2:' + exportSheet.getRange(2, 1, exportDataLen, exportDataWidth).getA1Notation(),
        'dataSize': exportData.length
    });

    var requests = [];
    if (rangesToClear.length > 0) {
        requests.push({
            deleteRange: {
                range: rangesToClear[0],
                shiftDimension: "ROWS"
            }
        });
    }

    if (rangesToSet.length > 0) {
        var rows = valuesToSet.map(row => ({
            values: row.map(cell => {
                if (typeof cell === 'number') {
                    return { userEnteredValue: { numberValue: cell } };
                } else if (cell instanceof Date) {
                    return { userEnteredValue: { stringValue: cell.toISOString() } };
                } else {
                    return { userEnteredValue: { stringValue: cell.toString() } };
                }
            })
        }));
        requests.push({
            updateCells: {
                rows: rows,
                fields: "userEnteredValue",
                start: {
                    sheetId: rangesToSet[0].sheetId,
                    rowIndex: rangesToSet[0].startRowIndex,
                    columnIndex: rangesToSet[0].startColumnIndex
                }
            }
        });
    }

    if (requests.length > 0) {
        batchUpdate(exportSs.getId(), requests);
    }
} else {
    span.addEvent('No data to write to export sheet');
}
    } else {
      console.log("Incident has ended or the end date is set");
      span.addEvent('Incident position log update skipped', {
        'reason': 'Incident has ended or the end date is set',
        'incidentEndDate': incidentEndDate
      });
    }
    span.addEvent('Start synchronizing data', {
      'incidentSheetId': incidentSheet
    });
    syncIncidentMapper(incidentSheet, incidentName)
    span.addEvent('Incident position log creation completed');
    console.log("COMPLETE: createIncidentPositionLog for" + incidentSheet);
    OpenTelemetryGASExporter.endSpan(span);
    OpenTelemetryGASExporter.export(span);
  } catch (error) {
    span.setAttribute('error', true);
    console.log("ERROR: createIncidentPositionLog:" + error);
    span.addEvent('ERROR: createIncidentPositionLog', {error: error.toString()});
    OpenTelemetryGASExporter.endSpan(span);
    OpenTelemetryGASExporter.export(span);
  }
}


// function syncIncidentMapper(incidentSheet, incidentName) {
//   try {
//     console.log("START: Export To SPOT Incident Mapper")
//     var ss = SpreadsheetApp.openById(incidentSheet);
//     var logSheet = ss.getSheets()[1];
//     var logLastRow = logSheet.getLastRow();
//     var logLastColumn = logSheet.getLastColumn();
//     var mapperData = [];
//     var mapperMetaData = [];
//     var availableIcons = SharedFunctions.getAvailableIcons("SPOT_ICON");
//     var lastIcon = 0;
//     var beaconIcons = [];
//     //console.log("availableIcons.length: " + availableIcons.length)
//     // Get a script lock, because we're about to modify a shared resource.
//     //var lock = LockService.getScriptLock();
//     // Wait for up to 30 seconds for other processes to finish.
//     //lock.waitLock(30000);
//     var tz = Session.getScriptTimeZone();
//     if (logLastRow != 1) {
//       var logData = logSheet.getRange(2, 1, (logLastRow - 1), logLastColumn).getValues();
//       var logDataLen = logData.length;
//       //console.log("logDataLen.length: " + logDataLen);
//       //console.log("beaconFilter: "+beaconFilter);
//       for (var row = 0; row < logDataLen; row++) {
//         var dataRow = [];
//         var canidateBeacon = logData[row][2].toString();
//         //console.log("Checking Row "+ row+" Beacon "+canidateBeacon)
//         //console.log("Row "+ row+" Passed Beacon # Filter")
//         //console.log("Row "+ row+" Passed Start Date Filter")
//         //console.log("Row "+ row+" Passed End Date Filter")
//         var cols = [2, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19];
//         for (var i = 0; i < logData[row].length; i++) {
//           if (cols.indexOf(i) === -1) continue;
//           if (i == 15 || i == 16) {
//             //converts date format to local
//             var sheetsDateFormat = Utilities.formatDate(new Date(logData[row][i]), tz, "YYYY MMM dd HH:mm:ss").toString();
//             dataRow.push(sheetsDateFormat);
//           } else if (i == 14) {
//             //converts date format to GMT
//             var sheetsDateFormat = Utilities.formatDate(new Date(logData[row][i]), "GMT", "YYYY MMM dd HH:mm:ss").toString();
//             dataRow.push(sheetsDateFormat);
//           } else {
//             dataRow.push(logData[row][i]);
//           }
//         }
//         var dtg = Utilities.formatDate(new Date(dataRow[10]), tz, "dd MMM YYYY - HH:mm").toString();
//         var td = dataRow[12];
//         //console.log(td)
//         var position = dataRow[2] + " | " + dataRow[3];
//         mapperData.push([
//           [incidentName],
//           [dataRow[0] + " - " + dtg], dataRow[2], dataRow[3], "", "Template1", [dataRow[0]],
//           [position],
//           [dataRow[4]],
//           [dataRow[6]],
//           [dataRow[1]],
//           [dataRow[7]],
//           [dataRow[8]],
//           [dataRow[9]],
//           [dataRow[10]],
//           [dataRow[11]],
//           [td],
//           [dataRow[13]],
//           [dataRow[14]]
//         ]);
//         var timestamp = dataRow[5];
//         if (timestamp === undefined) {
//           timestamp = new Date()
//         }
//         var icon = "";
//         if (beaconIcons.length != 0) {
//           //console.log("Beacon Icon Length Not 0")                  
//           for (var i = 0; i < beaconIcons.length; i++) {
//             //console.log("Compare beaconIcons[i][1] "+ beaconIcons[i][1] +" to dataRow[0] "+dataRow[0])
//             if (beaconIcons[i][1].toString() == dataRow[0].toString()) {
//               icon = beaconIcons[i][0];
//               break
//             }
//           }
//           if (icon === "") {
//             //console.log("No Beacon Match ")
//             icon = availableIcons[lastIcon][0];
//             beaconIcons.push([
//               [icon],
//               [dataRow[0]]
//             ])
//             lastIcon++
//             if (lastIcon === availableIcons.length) lastIcon = 0;
//           }
//         } else {
//           //console.log("Assigning Beacon Number 1")
//           icon = availableIcons[lastIcon][0];
//           beaconIcons.push([
//             [icon],
//             [dataRow[0]]
//           ])
//           lastIcon++
//         }
//         var isoTimestamp = Utilities.formatDate(new Date(timestamp), tz, "yyyy-MM-dd'T'HH:mm:ssXXX");
//         //
//         //
//         //BLANKS TIMESTAP TO ELIMATE SIDER UNTIL ISSUE CAN BE SOLVED
//         //
//         var isoTimestamp = "";
//         //
//         //REMOVE ONCE FIXED
//         //
//         mapperMetaData.push([
//           [isoTimestamp],
//           [""],
//           [""],
//           [icon]
//         ]);
//       }
//       var mapperDataLen = mapperData.length;
//       //console.log("mapperData.length: " + mapperDataLen);
//       if (mapperDataLen > 1499) {
//         throw "Maximum map capacity of 1500 position reports exceeded. Increase the specificity of the filter and try again.";
//       }
//       if (mapperDataLen > 0) {
//         var mapperSS = SpreadsheetApp.openById(SystemSettings.SPOT_INCIDENT_MAPPER_ID);
//         var mapper = mapperSS.getSheets()[1];
//         var mapperDataLastRow = SharedFunctions.lastValue(SystemSettings.SPOT_INCIDENT_MAPPER_ID, 1, "C");
//         var mapperDataWidth = mapperData[0].length;
//         var mapperNewData = mapper.getRange((mapperDataLastRow + 1), 3, mapperDataLen, mapperDataWidth);
//         mapperNewData.setValues(mapperData);
//         var mapperMetaDataLen = mapperData.length;
//         var mapperMetaDataWidth = mapperMetaData[0].length;
//         var mapperNewMetaData = mapper.getRange((mapperDataLastRow + 1), 48, mapperMetaDataLen, mapperMetaDataWidth);
//         mapperNewMetaData.setValues(mapperMetaData);
//         mapper.sort(3);
//         console.log("Updated Mapper with " + mapperMetaDataLen + " entries.")
//         var mapperSettings = mapperSS.getSheets()[0];
//         var mapperUpdateDescrip = mapperSettings.getRange('C33')
//         var descripText = mapperUpdateDescrip.getValue();
//         descripText += "<p class ='black-text'><Strong><span class = 'purple-text'>" + incidentName + ":</strong></span> There are " + mapperMetaDataLen + " position reports in the system.";
//         mapperUpdateDescrip.setValue(descripText);
//       }
//     }
//     console.log("COMPLETED: Export To SPOT Incident Mapper")
//   } catch (f) {
//     console.log("ERROR in syncIncidentMapper: " + f);
//     return ["Error", f.toString()];
//   }
// }



