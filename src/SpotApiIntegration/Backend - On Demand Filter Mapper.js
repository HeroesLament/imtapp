function syncFilterMapper() {
    try {
        console.log("START: Export To SPOT Filter Mapper")
        var ss = SpreadsheetApp.openById(SystemSettings.SPOT_DATA_SHEET_ID);
        var logSheet = ss.getSheetByName("IMS SPOT Data");
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
        var settings = PropertiesService.getScriptProperties();
        var filterStart = new Date(settings.getProperty('filterStart'));
        var filterEnd = new Date(settings.getProperty('filterEnd'));
        var filterBeacons = settings.getProperty('filterBeacons');
        var tz = Session.getScriptTimeZone();
        if (logLastRow != 1) {
            var logData = logSheet.getRange(2, 1, (logLastRow - 1), logLastColumn).getValues();
            var logDataLen = logData.length;
            //console.log("logDataLen.length: " + logDataLen);
            var beaconFilter = filterBeacons.split(',');
            //console.log("beaconFilter: "+beaconFilter);
            for (var row = 0; row < logDataLen; row++) {
                var dataRow = [];
                var canidateBeacon = logData[row][2].toString();
                //console.log("Checking Row "+ row+" Beacon "+canidateBeacon)
                if (beaconFilter != "" && beaconFilter.indexOf(canidateBeacon) === -1) continue;
                //console.log("Row "+ row+" Passed Beacon # Filter")
                if (filterStart != "" && (filterStart > new Date(logData[row][15]))) continue;
                //console.log("Row "+ row+" Passed Start Date Filter")
                if (filterEnd != "" && (filterEnd < new Date(logData[row][15]))) continue;
                //console.log("Row "+ row+" Passed End Date Filter")
                var cols = [2, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15, 16, 17];
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
                mapperData.push([dataRow[0],
                    [dataRow[0] + " - " + dtg], dataRow[2], dataRow[3], "", "Template1", [dataRow[0]],
                    [position],
                    [dataRow[4]],
                    [dataRow[6]],
                    [dataRow[1]],
                    [dataRow[7]],
                    [dataRow[8]],
                    [dataRow[9]],
                    [dataRow[10]],
                    [dataRow[11]],
                    [td]
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
                mapperMetaData.push([
                    [isoTimestamp],
                    [""],
                    [""],
                    [icon]
                ]);
            }
            var mapperDataLen = mapperData.length;
            //console.log("mapperData.length: " + mapperDataLen);
            if (mapperDataLen > 1499) {
                throw "Maximum map capacity of 1000 position reports exceeded. Increase the specificity of the filter and try again.";
            }
            if (mapperDataLen > 0) {
                var mapperSS = SpreadsheetApp.openById(SystemSettings.SPOT_FILTER_MAPPER_ID);
                var mapper = mapperSS.getSheets()[1];
                var mapperOldDataColumn = mapper.getLastColumn();
                var mapperOldDataLastRow = mapper.getLastRow();
                if (mapperOldDataLastRow > 10) {
                    var mapperOldData = mapper.getRange(11, 3, (mapperOldDataLastRow - 10), mapperOldDataColumn);
                    mapperOldData.clearContent();
                }
                var mapperDataWidth = mapperData[0].length;
                var mapperNewData = mapper.getRange(11, 3, mapperDataLen, mapperDataWidth);
                mapperNewData.setValues(mapperData);
                var mapperMetaDataLen = mapperData.length;
                var mapperMetaDataWidth = mapperMetaData[0].length;
                var mapperNewMetaData = mapper.getRange(11, 48, mapperMetaDataLen, mapperMetaDataWidth);
                mapperNewMetaData.setValues(mapperMetaData);
                mapper.sort(3);
                console.log("Updated Mapper with "+mapperMetaDataLen+" entries.")
                var mapperSettings = mapperSS.getSheets()[0];
                var mapperUpdateInfo = mapperSettings.getRange('C32');
                var updateDtg = new Date().toString();
                mapperUpdateInfo.setValue("Data as of "+updateDtg);
                
        var beaconFilter = filterBeacons.split(',');
        var beaconFilter = beaconFilter.filter(function(el) {
            return el;
        });
var descripText = "<p><em>As of " + new Date() + "</em></p>";
        descripText += "<p class ='black-text'><Strong><span class = 'purple-text'>Filter Results:</strong></span> There are " + mapperMetaDataLen + " position reports in the system.<p> Filter Start Date: " + filterStart + " <br> Filter End Date: " + filterEnd;
        
               var beaconFilter = filterBeacons.split(',');
        var beaconFilter = beaconFilter.filter(function(el) {
            return el;
        });
        if (beaconFilter.length > 0) {
        
       descripText += "<p>Showing only data for SPOT Beacon(s): " + beaconFilter + ".</p>";
       }
                var mapperUpdateDescrip = mapperSettings.getRange('C33');
                mapperUpdateDescrip.setValue(descripText);
}
}
        
        console.log("COMPLETED: Export To SPOT Filter Mapper")
    } catch (f) {
        console.error("ERROR in syncFilterMapper: " + f);
        return ["Error", f.toString()];
    }
}