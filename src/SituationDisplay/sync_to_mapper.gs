function syncSituationData() {
    try {
        console.log("START - syncSituationData");
        var ss = SpreadsheetApp.openById(SystemSettings.SITUATION_MAPPER_ID);
        var mapper = ss.getSheets()[1];
        var mapperOldDataColumn = mapper.getLastColumn();
        var mapperOldDataLastRow = mapper.getLastRow();
        if (mapperOldDataLastRow > 10) {
            var mapperOldData = mapper.getRange(11, 3, (mapperOldDataLastRow - 10), mapperOldDataColumn);
            mapperOldData.clearContent();
        }
        var mapperSS = SpreadsheetApp.openById(SystemSettings.SITUATION_MAPPER_ID);
        var mapperSettings = mapperSS.getSheets()[0];
        var mapperUpdateDescrip = mapperSettings.getRange('C33')
        var descripText="<p><em>Data last updated from IMS at " + new Date() + "</em></p>"
        mapperUpdateDescrip.setValue(descripText);
        
        var activeIncidents = SharedFunctions.getIncidentList("ENABLE_SITU", true, "INCIDENT_SITUATION_DATA_ID");
        for (var i = 0; i < activeIncidents.length; i++) {
            console.log("Starting syncSituationMapper For Incident:" + activeIncidents[i][0])
            syncSituationMapper(activeIncidents[i][1], activeIncidents[i][0]);
            console.log("Completed syncSituationMapper For Incident:" + activeIncidents[i][0])
        }
        console.log("COMPLETE - syncSituationData");
    } catch (error) {
        console.log("ERROR - syncSituationData: " + error);
    }
}

function syncSituationMapper(incidentSheet, incidentName) {
    console.log("START - syncSituationMapper");
    try {
        var ss = SpreadsheetApp.openById(incidentSheet);
        var log = ss.getSheets()[0];
        var logLastRow = log.getLastRow();
        if (logLastRow === 1) throw "No Situation Data Found in log for Incident " + incidentName
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
        var mapperData = [];
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
                var template = "Template3";
                var imgURL = 'http://drive.google.com/uc?export=view&id=' + logData[i][colFileID];
                var fileURL = DriveApp.getFileById(logData[i][colFileID]).getUrl();
                mapperData.push([
                    [incidentName],
                    [logData[i][colPlacemarkName]],
                    [logData[i][colLatitude]],
                    [logData[i][colLongitude]], "",
                    [template],
                    [logData[i][colPlacemarkName]],
                    [position],
                    [logData[i][colNotes]],
                    [footer],
                    [fileURL],
                    ["View File on Google Drive"],
                    [imgURL]
                ]);
            } else {
                var template = "Template2";
                mapperData.push([
                    [incidentName],
                    [logData[i][colPlacemarkName]],
                    [logData[i][colLatitude]],
                    [logData[i][colLongitude]], "",
                    [template],
                    [logData[i][colPlacemarkName]],
                    [position],
                    [logData[i][colNotes]],
                    [footer],
                    [""],
                    [""],
                    [""]
                ]);
            }
        }
        var mapperDataLen = mapperData.length;
        if (mapperDataLen > 999) {
            throw "Maximum map capacity of 1000 position reports exceeded. Increase the specificity of the filter and try again.";
        }
        if (mapperDataLen > 0) {
            var mapperSS = SpreadsheetApp.openById(SystemSettings.SITUATION_MAPPER_ID);
            var mapper = mapperSS.getSheets()[1];
            var mapperDataLastRow = SharedFunctions.lastValue(SystemSettings.SITUATION_MAPPER_ID, 1, "C");
            var mapperDataWidth = mapperData[0].length;
            var mapperNewData = mapper.getRange((mapperDataLastRow + 1), 3, mapperDataLen, mapperDataWidth);
            mapperNewData.setValues(mapperData);
            var mapperMetaDataLen = mapperData.length;
            var mapperMetaDataWidth = mapperMetaData[0].length;
            var mapperNewMetaData = mapper.getRange((mapperDataLastRow + 1), 48, mapperMetaDataLen, mapperMetaDataWidth);
            mapperNewMetaData.setValues(mapperMetaData);
            mapper.sort(3);
            console.log("Updated Mapper with " + mapperMetaDataLen + " entries.")
            var mapperSettings = mapperSS.getSheets()[0];
            var mapperUpdateInfo = mapperSettings.getRange('C32');
            var updateDtg = new Date().toString();
            mapperUpdateInfo.setValue("Data as of " + updateDtg);
            
            var mapperUpdateDescrip = mapperSettings.getRange('C33')
            var descripText = mapperUpdateDescrip.getValue();
            descripText += "<p class ='black-text'><Strong><span class = 'purple-text'>"+incidentName+":</strong></span> There are " + mapperMetaDataLen + " position of interest in the system.";
            mapperUpdateDescrip.setValue(descripText);
  
        }
        console.log("COMPLETE - syncSituationMapper");
    } catch (error) {
        console.error("ERROR - syncSituationMapper: " + error);
    }
}