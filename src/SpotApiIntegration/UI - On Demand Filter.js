function setFilterSettings(dateStart, timeStart, dateEnd, timeEnd, beacons) {
    try {
        console.log("START setFilterSettings");
        if (dateStart != "") var filterStart = new Date(dateStart + " " + timeStart);
        if (dateEnd != "") var filterEnd = new Date(dateEnd + " " + timeEnd);
        var beaconList = "";
        if (dateStart == "") var filterStart = "";
        if (dateEnd == "") var filterEnd = "";
        for (var i = 0; i < beacons.length; i++) {
            if (beacons[i] != "" && beacons[i] != undefined && beacons[i] != null) {
                beaconList = beaconList + "," + beacons[i];
            }
        }
        console.log("Filter Start Date: " + filterStart + " End Date: " + filterEnd + " Selected Beacons: " + beacons);
        // Get a script lock, because we're about to modify a shared resource.
        var lock = LockService.getScriptLock();
        // Wait for up to 30 seconds for other processes to finish.
        lock.waitLock(30000);
        var scriptProperties = PropertiesService.getScriptProperties();
        scriptProperties.setProperty('filterStart', filterStart);
        scriptProperties.setProperty('filterEnd', filterEnd);
        scriptProperties.setProperty('filterBeacons', beaconList);
        //release the lock
        lock.releaseLock();
        syncFilterMapper();
        console.log("END setFilterSettings");
        return getAvailableBeacons();
    } catch (f) {
        console.error("ERROR in setFilterSettings: " + f);
        return ["Error", f.toString()];
    }
}

function getCurrentStats() {
  //  console.log("START getCurrentStats");
    var ss = SpreadsheetApp.openById(SystemSettings.SPOT_DATA_SHEET_ID);
    var logSheet = ss.getSheetByName("IMS SPOT Data");
    var logLastRow = logSheet.getLastRow();
    var logLastColumn = logSheet.getLastColumn();
    var logData = logSheet.getRange(2, 1, (logLastRow - 1), logLastColumn).getValues();
    var logDataLen = logData.length;
    var dates = []
    for (var row = 0; row < logDataLen; row++) {
        Logger.log(logData[row][14])
        dates.push(new Date(logData[row][14]));
    }
    var maxDate = new Date(Math.max.apply(null, dates));
    var minDate = new Date(Math.min.apply(null, dates));
    //console.log(maxDate+minDate)
   // console.log("END getCurrentStats");
}

function getAvailableBeacons() {
    try {
        console.log("START getAvailableBeacons");
        var scriptProperties = PropertiesService.getScriptProperties();
        var dateStart = scriptProperties.getProperty('filterStart');
        var dateEnd = scriptProperties.getProperty('filterEnd');
        var beacons = scriptProperties.getProperty('filterBeacons');
        var tz = Session.getScriptTimeZone();
        var ss = SpreadsheetApp.openById(SystemSettings.SPOT_DATA_SHEET_ID);
        var logSheet = ss.getSheetByName("IMS SPOT Data");
        var logLastRow = logSheet.getLastRow();
        if (logLastRow > 1) {
            var logLastColumn = logSheet.getLastColumn();
            var logData = logSheet.getRange(2, 1, (logLastRow - 1), logLastColumn).getValues();
            var logDataLen = logData.length;
            var data = []
            var dates = []
            for (var row = 0; row < logDataLen; row++) {
                dates.push(new Date(logData[row][14]));
                var exportDataRow = [];
                var canidateBeacon = logData[row][2].toString();
                if ((dateStart != "") && (new Date(dateStart) > new Date(logData[row][15]))) {
                    //Logger.log("Row "+row+" Data Is Older That Start Filter");
                    continue;
                }
                if ((dateEnd != "") && (new Date(dateEnd) < new Date(logData[row][15]))) continue;
                var cols = [2, 4, 5, 6, 10, 12, 13, 14, 15, 16, 17];
                for (var i = 0; i < logData[row].length; i++) {
                    if (cols.indexOf(i) === -1) continue;
                    if (row != 0 && i == 15 || row != 0 && i == 16) {
                        //converts date format to local
                        var sheetsDateFormat = Utilities.formatDate(new Date(logData[row][i]), tz, "YYYY MMM dd HH:mm:ss").toString();
                        exportDataRow.push(sheetsDateFormat);
                    } else if (row != 0 && i == 14) {
                        //converts date format to GMT
                        var sheetsDateFormat = Utilities.formatDate(new Date(logData[row][i]), "GMT", "YYYY MMM dd HH:mm:ss").toString();
                        exportDataRow.push(sheetsDateFormat);
                    } else {
                        exportDataRow.push(logData[row][i]);
                    }
                }
                //Logger.log("Export Data Row"+exportDataRow);
                data.push(exportDataRow[0]);
            }
            var maxDate = new Date(Math.max.apply(null, dates)).toString();
            var minDate = new Date(Math.min.apply(null, dates)).toString();
            var beaconsAvailable = multiDimensionalUnique(data)
        }
        var mapperSS = SpreadsheetApp.openById(SystemSettings.SPOT_FILTER_MAPPER_ID);
        var filterSheet = mapperSS.getSheets()[1];
        var filterLastRow = filterSheet.getLastRow();
        var filterLastCol = filterSheet.getLastColumn();
        var filterBeaconData = filterSheet.getRange("C11:C").getValues();
        var filterLen = filterBeaconData.filter(String).length;
        if (filterLastRow > 1) {
            var filterData = filterSheet.getRange(11, 3, filterLen, 1).getValues();
            var filterBeacons = multiDimensionalUnique(filterData)
        }
        //console.log("filterData: "+filterData)
        if (beaconsAvailable != undefined) {
            console.log("COMPLETED getAvailableBeacons: SPOT System has data. Backend filter check completed.");
            return ["OK", beaconsAvailable, filterBeacons, data.length, filterLen, logLastRow - 1, dateStart, dateEnd, beacons, minDate, maxDate];
        } else {
            console.log("COMPLETED getAvailableBeacons: No SPOT System data found!");
            return ["NO", undefined, filterBeacons, undefined, filterLen, undefined, dateStart, dateEnd, beacons, undefined, undefined];
        }
    } catch (f) {
        console.log("ERROR getAvailableBeacons: " + f.toString());
        return "Error: " + f;
    }
}

function multiDimensionalUnique(arr) {
    var uniques = [];
    var itemsFound = {};
    for (var i = 0, l = arr.length; i < l; i++) {
        var stringified = JSON.stringify(arr[i]);
        if (itemsFound[stringified]) {
            continue;
        }
        uniques.push(arr[i]);
        itemsFound[stringified] = true;
    }
    return uniques;
}