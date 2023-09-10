
function getSituationData() {
  console.log("START - syncSituationMapper");
  var activeIncidents = SharedFunctions.getIncidentList("ENABLE_SITU", true, "INCIDENT_SITUATION_DATA_ID");
  var mapperData = [];
  for (var d = 0; d < activeIncidents.length; d++) {
    console.log("Starting syncSituationMapper For Incident:" + activeIncidents[d][0])
    var incidentSheet = activeIncidents[d][1];
    var incidentName = activeIncidents[d][0];

    var ss = SpreadsheetApp.openById(incidentSheet);
    var log = ss.getSheets()[0];
    var logLastRow = log.getLastRow();
    if (logLastRow === 1) continue;
    var logLastColumn = log.getLastColumn();
    var logHeaders = log.getRange(1, 1, 1, logLastColumn).getValues();
    var logData = log.getRange(2, 1, (logLastRow - 1), logLastColumn).getValues();
    var tz = Session.getScriptTimeZone();

    //Colum Mapping 0 based columps from POI Sheet
    for (var hrow = 0; hrow < logHeaders[0].length; hrow++) {
      if (logHeaders[0][hrow] == "POI ID") {
        var colId = hrow
      };
      if (logHeaders[0][hrow] == "Title") {
        var colPlacemarkName = hrow
      };
      if (logHeaders[0][hrow] == "Latitude") {
        var colLatitude = hrow
      };
      if (logHeaders[0][hrow] == "Longitude") {
        var colLongitude = hrow
      };
      if (logHeaders[0][hrow] == "Icon") {
        var colIcon = hrow
      };
      if (logHeaders[0][hrow] == "Notes") {
        var colNotes = hrow
      };
      if (logHeaders[0][hrow] == "Drive File ID") {
        var colFileID = hrow
      };
      if (logHeaders[0][hrow] == "Reported By") {
        var colReportedUser = hrow
      };
      if (logHeaders[0][hrow] == "Timestamp") {
        var colTimestamp = hrow
      };
      if (logHeaders[0][hrow] == "Added By") {
        var colAddedUser = hrow
      };
      if (logHeaders[0][hrow] == "Update of POI ID") {
        var colUpdateId = hrow
      };
      if (logHeaders[0][hrow] == "Hidden") {
        var colHidden = hrow
      };
    }
    var mapperMetaData = [];
    for (var i = 0; i < logData.length; i++) {
      if (logData[i][colHidden] === true) continue;
      if (logData[i][colLatitude] === undefined || logData[i][colLatitude] === "") continue;
      if (logData[i][colLongitude] === undefined || logData[i][colLongitude] === "") continue;
      if (logData[i][colPlacemarkName] === undefined || logData[i][colPlacemarkName] === "") continue;
      var position = "(" + logData[i][colLatitude] + " | " + logData[i][colLongitude] + ")";
      var tsData = logData[i][colTimestamp]
      if (tsData === undefined || tsData === "") {
        tsData = new Date()
      }
      var isoTimestamp = Utilities.formatDate(new Date(tsData), tz, "yyyy-MM-dd'T'HH:mm:ssXXX");
      //
      //
      //BLANKS TIMESTAP TO ELIMATE SIDER UNTIL ISSUE CAN BE SOLVED
      //
      var isoTimestamp = "";
      //
      //REMOVE ONCE FIXED
      // 


      mapperMetaData.push([
        [isoTimestamp], "", "",
        [logData[i][colIcon]]
      ]);
      if (logData[i][6] != "") {
        var footer = "POI " + logData[i][colId] + " reported by " + logData[i][colReportedUser] + " at " + tsData
      } else {
        {
          var footer = "POI " + logData[i][colId] + " added by " + logData[i][colAddedUser] + " at " + tsData
        }
      }
      if (logData[i][colFileID] != "") {
        var imgURL = 'http://drive.google.com/uc?export=view&id=' + logData[i][colFileID];
        var fileURL = DriveApp.getFileById(logData[i][colFileID]).getUrl();
        mapperData.push([
          incidentName,
          logData[i][colPlacemarkName],
          logData[i][colLatitude],
          logData[i][colLongitude], "",
          logData[i][colPlacemarkName],
          position,
          logData[i][colNotes],
          footer,
          fileURL,
          "View File on Google Drive",
          imgURL,
          logData[i][colIcon],
        ]);
      } else {
        mapperData.push([
          incidentName.toString(),
          logData[i][colPlacemarkName].toString(),
          logData[i][colLatitude].toString(),
          logData[i][colLongitude].toString(),
          "",
          logData[i][colPlacemarkName].toString(),
          position.toString(),
          logData[i][colNotes].toString(),
          footer.toString(),
          "",
          "",
          "",
          logData[i][colIcon],
        ]);
      }
      console.log("Completed syncSituationMapper For Incident:" + activeIncidents[d][0])

    }
    console.log(mapperData);
  }
  return mapperData;
  console.log("COMPLETE - syncSituationMapper");

}