function getSpotData() {
  var activeIncidents = SharedFunctions.getIncidentList("ENABLE_SPOT", true, "INCIDENT_MEMBER_DATA_ID");
  var mapperData = [];
  console.log("START: createIncidentPositionLog for" + incidentSheet)
  for (var d = 0; d < activeIncidents.length; d++) {
    console.log("Starting syncSituationMapper For Incident:" + activeIncidents[d][0])
    var incidentSheet = activeIncidents[d][1];
    var incidentName = activeIncidents[d][0];

    var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
    var sheet = ss.getSheetByName("IMS Incident Log");
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    var incidents = [];
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
      if (sheetHeaders[0][hrow] == "INCIDENT_MEMBER_DATA_ID") {
        var colIncidentFolderId = hrow;
        continue;
      };

      if (sheetHeaders[0][hrow] == "INCIDENT_END_DATE") {
        var colIncidentEndDate = hrow;
        continue;
      };
    }
    for (var row = 0; row < sheetDataLen; row++) {
      var incidentEndDate;
      if (sheetData[row][colIncidentFolderId] == incidentSheet) {
        incidentEndDate = sheetData[row][colIncidentEndDate];
        break;
      }
    }
    if (incidentEndDate == "") {
      console.log("Incident is ongoing, checking for  new SPOT Data ")

      var filterEnd = new Date();
      // var activeBeacons = getIncidentBeaconList(incidentSheet);
      var activeBeacons = getIncdentAssignmentList(incidentSheet, true);
      console.log("activeBeacons: " + activeBeacons)
      //console.log("exportPositionLogToFusionTables ActiveBeacons: "+activeBeacons)
      var activeBeaconsLen = activeBeacons.length;
      var teamList = [];
      // This still can't handle beacon # changes!


      for (var row = 0; row < activeBeaconsLen; row++) {
        if (activeBeacons[row][5] == "" || activeBeacons[row][5] == undefined) {
          teamList.push([activeBeacons[row][0], activeBeacons[row][2], activeBeacons[row][4], new Date(), activeBeacons[row][1]]);
        }
        else {
          teamList.push([activeBeacons[row][0], activeBeacons[row][2], activeBeacons[row][4], activeBeacons[row][5], activeBeacons[row][1]]);


        }
      }
      console.log()


      /*  for (var row = 0; row < activeBeaconsLen; row++) {
            if (activeBeacons[row][2] == "" || activeBeacons[row][2] == "undefined" || activeBeacons[row][2] == "null") continue;
            //This needs to be fixed to check for acutal endtimes to enable multi day searches....
            var filterStart = getBeaconStartTime(incidentSheet, activeBeacons[row][0], activeBeacons[row][2])
            teamList.push([activeBeacons[row][0], activeBeacons[row][2], filterStart, new Date(), activeBeacons[row][1]]);
            //name || beacon filter || filter start || filter end
            //  console.log("exportPositionLogToFusionTables Team List: "+teamList)
        }*/

      var logSs = SpreadsheetApp.openById(SystemSettings.SPOT_SPREADSHEET_ID);
      var logSheet = logSs.getSheets()[1];
      var logLastRow = logSheet.getLastRow();
      var logLastColumn = logSheet.getLastColumn();
      var exportSs = SpreadsheetApp.openById(incidentSheet);
      var exportSheet = exportSs.getSheets()[1];
      var exportLastRow = exportSheet.getLastRow();
      var exportLastColumn = exportSheet.getLastColumn();
      var exportData = [];
      if (logLastRow != 1) {
        var logData = logSheet.getRange(1, 1, logLastRow, logLastColumn).getValues();
        var logDataLen = logData.length;
        //console.log("exportPositionLogToFusionTables logLastData: "+logDataLen)
        var teamListLen = teamList.length;
        //console.log("Point 1")
        for (var trow = 0; trow < teamListLen; trow++) {
          var beaconFilter = teamList[trow][1];
          var filterStart = teamList[trow][2];
          var filterEnd = teamList[trow][3];
          console.log("filterEnd: " + filterEnd)
          //  console.log("exportPositionLogToFusionTables Beacon Filter from team list" + beaconFilter);
          for (var row = 1; row < logDataLen; row++) {
            var exportDataRow = [];
            var canidateBeacon = logData[row][2].toString();
            if ((beaconFilter != "") && (row != 0) && (beaconFilter.indexOf(canidateBeacon) === -1)) continue;
            if ((filterStart != "") && (row != 0) && (new Date(filterStart) > new Date(logData[row][15]))) {
              // console.log("exportPositionLogToFusionTables Row "+row+" Data Is Older That Start Filter");
              continue;
            }
            //console.log("point 2")
            if ((filterEnd != "") && (row != 0) && (new Date(filterEnd) < new Date(logData[row][15]))) continue;
            // console.log("exportPositionLogToFusionTables"+ logData[row]);
            for (var i = 0; i < logData[row].length; i++) {
              exportDataRow.push(logData[row][i]);
              //console.log(logData[row][i].toString());
            }
            exportDataRow.push(teamList[trow][4], teamList[trow][0])
            //console.log("exportPositionLogToFusionTables Export Data Row"+exportDataRow);
            exportData.push(exportDataRow);
          }
        }
        // console.log("point 3")
        //  console.log("Export Data Row"+exportData);
        var exportDataLen = exportData.length;
        // console.log("Export Data Length: " + exportDataLen)
        //console.log("point 4")
        if (exportDataLen > 0) {
          var exportLastRow = exportSheet.getLastRow();
          var exportLastColumn = exportSheet.getLastColumn();
          //console.log("point 4a"+exportLastRow)
          if (exportLastRow > 1) {
            //console.log("point 5")
            exportSheet.getRange(2, 1, (exportLastRow - 1), exportLastColumn).clearContent();
          }
          var exportDataWidth = exportData[0].length;
          // console.log("data found for incident width: "+exportDataWidth)
          exportSheet.getRange(2, 1, exportDataLen, exportDataWidth).setValues(exportData);
        }
      }
    }
    console.log("START: Export To SPOT Incident Mapper")
    var ss = SpreadsheetApp.openById(incidentSheet);
    Logger.log(incidentSheet);
    var logSheet = ss.getSheets()[1];
    var logLastRow = logSheet.getLastRow();
    var logLastColumn = logSheet.getLastColumn();
    var mapperData = [];
    var mapperMetaData = [];
    var availableIcons = SharedFunctions.getAvailableIcons("SPOT_ICON");
    var lastIcon = 0;
    var beaconIcons = [];
    //console.log("availableIcons.length: " + availableIcons.length)
    // Get a script lock, because we're about to modify a shared resource.
    //var lock = LockService.getScriptLock();
    // Wait for up to 30 seconds for other processes to finish.
    //lock.waitLock(30000);
    var tz = Session.getScriptTimeZone();
    if (logLastRow != 1) {
      var logData = logSheet.getRange(2, 1, (logLastRow - 1), logLastColumn).getValues();
      var logDataLen = logData.length;
      //console.log("logDataLen.length: " + logDataLen);
      //console.log("beaconFilter: "+beaconFilter);
      for (var row = 0; row < logDataLen; row++) {
        var dataRow = [];
        var canidateBeacon = logData[row][2].toString();
        //console.log("Checking Row "+ row+" Beacon "+canidateBeacon)
        //console.log("Row "+ row+" Passed Beacon # Filter")
        //console.log("Row "+ row+" Passed Start Date Filter")
        //console.log("Row "+ row+" Passed End Date Filter")
        var cols = [2, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19];
        for (var i = 0; i < logData[row].length; i++) {
          if (cols.indexOf(i) === -1) continue;
          if (i == 15 || i == 16) {
            //converts date format to local
            var sheetsDateFormat = Utilities.formatDate(new Date(logData[row][i]), tz, "YYYY MMM dd HH:mm:ss").toString();
            dataRow.push(sheetsDateFormat);
          } else if (i == 14) {
            //converts date format to GMT
            var sheetsDateFormat = Utilities.formatDate(new Date(logData[row][i]), "GMT", "YYYY MMM dd HH:mm:ss").toString();
            dataRow.push(sheetsDateFormat);
          } else {
            dataRow.push(logData[row][i]);
          }
        }
        var dtg = Utilities.formatDate(new Date(dataRow[10]), tz, "dd MMM YYYY - HH:mm").toString();
        var td = dataRow[12];
        //console.log(td)
        var position = dataRow[2] + " | " + dataRow[3];
        mapperData.push([
          incidentName,
          dataRow[0] + " - " + dtg,
          dataRow[2],
          dataRow[3],
          "",
          "Template1",
          dataRow[0],
          position,
          dataRow[4],
          dataRow[6],
          dataRow[1],
          dataRow[7],
          dataRow[8],
          dataRow[9],
          dataRow[10],
          dataRow[11],
          td,
          dataRow[13],
          dataRow[14],
        ]);
        var timestamp = dataRow[5];
        if (timestamp === undefined) {
          timestamp = new Date()
        }
        var icon = "";
        if (beaconIcons.length != 0) {
          //console.log("Beacon Icon Length Not 0")                  
          for (var i = 0; i < beaconIcons.length; i++) {
            //console.log("Compare beaconIcons[i][1] "+ beaconIcons[i][1] +" to dataRow[0] "+dataRow[0])
            if (beaconIcons[i][1].toString() == dataRow[0].toString()) {
              icon = beaconIcons[i][0];
              break
            }
          }
          if (icon === "") {
            //console.log("No Beacon Match ")
            icon = availableIcons[lastIcon][0];
            beaconIcons.push([
              [icon],
              [dataRow[0]]
            ])
            lastIcon++
            if (lastIcon === availableIcons.length) lastIcon = 0;
          }
        } else {
          //console.log("Assigning Beacon Number 1")
          icon = availableIcons[lastIcon][0];
          beaconIcons.push([
            [icon],
            [dataRow[0]]
          ])
          lastIcon++
        }
        var isoTimestamp = Utilities.formatDate(new Date(timestamp), tz, "yyyy-MM-dd'T'HH:mm:ssXXX");
        //
        //
        //BLANKS TIMESTAP TO ELIMATE SIDER UNTIL ISSUE CAN BE SOLVED
        //
        var isoTimestamp = "";
        //
        //REMOVE ONCE FIXED
        //
        mapperMetaData.push([
          [isoTimestamp],
          [""],
          [""],
          [icon]
        ]);
      }
      var mapperDataLen = mapperData.length;
      //console.log("mapperData.length: " + mapperDataLen);
    }
    console.log("COMPLETED: Export To SPOT Incident Mapper")
  }
  Logger.log(mapperData);
  return mapperData;
}





function getIncdentAssignmentList(logSheetId, spotOnly) {
  //incudes checkout times
  console.log("START: getIncdentAssignmentList")
  var ss = SpreadsheetApp.openById(logSheetId);
  var sheet = ss.getSheets()[0];
  var sheetLastRow = sheet.getLastRow();
  if (sheetLastRow == 1) return false
  var sheetLastColumn = sheet.getLastColumn();
  var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
  var sheetHeadersLen = sheetHeaders[0].length;
  var statusList = [];
  for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
    if (sheetHeaders[0][hrow] == "Last Name") {
      var colLastName = hrow
    };
    if (sheetHeaders[0][hrow] == "First Name") {
      var colFirstName = hrow
    };
    if (sheetHeaders[0][hrow] == "Start") {
      var colStartTime = hrow
    };
    if (sheetHeaders[0][hrow] == "End") {
      var colEndTime = hrow
    };
    if (sheetHeaders[0][hrow] == "Notes") {
      var colNotes = hrow
    };
    if (sheetHeaders[0][hrow] == "Team") {
      var colTeam = hrow
    };
    if (sheetHeaders[0][hrow] == "SPOT") {
      var colSpot = hrow
    };
  }
  //break if only header row
  if (sheetLastRow == 1) return statusList;
  var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
  sheetData.sort(sortFunctionAssignByDate);

  function sortFunctionAssignByDate(a, b) {
    var o1 = a[5];
    var o2 = b[5];
    var p1 = a[0];
    var p2 = b[0];
    if (o1 < o2) return -1;
    if (o1 > o2) return 1;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
    return 0;
  }
  var checkedIn = [];
  var checkedOut = [];
  var dashboardList = [];
  for (var row = 0; row < sheetData.length; row++) {
    //skip if mbr is in stby status
    //  if (sheetData[row][colStartTime] == "") continue;
    if (sheetData[row][colEndTime] != "") {
      checkedOut.push([sheetData[row][colLastName], sheetData[row][colFirstName], sheetData[row][colEndTime]]);
    } else if (sheetData[row][colSpot] != "") {
      checkedIn.push([sheetData[row][colLastName], sheetData[row][colFirstName], sheetData[row][colStartTime]]);
      var dataName = (sheetData[row][colLastName] + ", " + sheetData[row][colFirstName])
      dashboardList.push([dataName, sheetData[row][colTeam], sheetData[row][colSpot], sheetData[row][colNotes], sheetData[row][colStartTime].toString()]);
    } else if (spotOnly === undefined || spotOnly === false) {
      checkedIn.push([sheetData[row][colLastName], sheetData[row][colFirstName], sheetData[row][colStartTime]]);
      var dataName = (sheetData[row][colLastName] + ", " + sheetData[row][colFirstName])
      dashboardList.push([dataName, sheetData[row][colTeam], sheetData[row][colSpot], sheetData[row][colNotes], sheetData[row][colStartTime].toString()]);

    }
  }
  console.log("dashboardList: " + dashboardList)
  //    console.log("checkedIn: " + checkedIn)
  //   console.log("checkedOut: " + checkedOut)
  var activeMembers = []
  for (var i = 0; i < checkedIn.length; i++) {
    //       console.log("checking checkedIn row:" + checkedIn[i])
    var mbrOut = false;
    for (var d = 0; d < checkedOut.length; d++) {
      //    console.log("starting cmparison for"+ d)
      //console.log("checking checkedOut row:" + checkedOut[d])
      if (checkedIn[i][0] != checkedOut[d][0] || checkedIn[i][1] != checkedOut[d][1]) continue;
      //     console.log("Matching User found " + checkedIn[i][0])
      //     console.log("Checked In Date: " + new Date(checkedIn[i][2]))
      //     console.log("Checked Out Date: " + new Date(checkedOut[d][2]))
      if (new Date(checkedIn[i][2]) <= new Date(checkedOut[d][2])) {
        dashboardList[i].push(checkedOut[d][2].toString())
        mbrOut = true;
        //console.log("Dates are Valid")
        break;
        continue;
      }
      //console.log("No match for d: " + d)
    }
  }
  if (dashboardList.length > 0) {
    dashboardList = dashboardList.sort(function (a, b) {
      if (a === b || (a[0] === b[0] && a[4] === b[4])) return 0;
      if (a[0] > b[0]) return 1;
      if (a[0] < b[0]) return -1;
      if (a[4] > b[4]) return 1;
      if (a[4] < b[4]) return -1;
    })
    //console.log(activeMembers)
    console.log(dashboardList)
    //console.log("currentlyIn: " + activeMembers)
    console.log("COMPLETE: getIncdentAssignmentList")
    return dashboardList
  } else {
    return false
  }
}

function getSpotScriptStatus() {
  var spotStatusMsg = [];
  spotStatusMsg = SPOTAPIIntegration.getSpotScriptStatus();
  return spotStatusMsg;
}