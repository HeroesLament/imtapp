function getAvailableBeacons(cv) {
    var usedBeacons = [];
    /*
   This Removes Trip plan Beacons
       var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SPREADSHEET_ID);
    var sheet = ss.getSheetByName("Tracker");
    var endRow = sheet.getLastRow();
    var data = sheet.getRange(2, 1, endRow, 12).getValues();
   
   for (var i = 0; i < (endRow - 1); i++) {
        if (data[i][8].indexOf("Closed") === -1 && data[i][8].indexOf("Canceled") === -1) {
            var beacon = data[i][6].toString();
            usedBeacons.push([beacon]);
        }

    }
*/
    console.log("Used Beacons:" + usedBeacons);
    console.log("Used Beacons Length:" + usedBeacons.length);
    var ss = SpreadsheetApp.openById(SystemSettings.INVENTORY_SHEET_ID);
    var sheet = ss.getSheetByName("SPOT Inventory");
    var endRow = sheet.getLastRow();
    var endCol = sheet.getLastColumn();
    var data = sheet.getRange(2, 1, endRow, endCol).getValues();
    var availableBeacons = [];
    var locationblacklist = ["Spare (Station 6)", "Out Of Service (Station 6)"]
    for (var i = 0; i < (endRow - 1); i++) {
        //console.log("Inventory Reported:" + data[i][(SystemSettings.INVENTORY_REPORTED_LOC_COL - 1)]);
        //console.log("Inventory Reported Length:" + data[i][(SystemSettings.INVENTORY_REPORTED_LOC_COL - 1)].length);
        //console.log("Assigned Location:" + data[i][(SystemSettings.INVENTORY_ASSIGNED_LOC_COL - 1)]);
        if (locationblacklist.indexOf(data[i][(SystemSettings.INVENTORY_ASSIGNED_LOC_COL - 1)]) > -1) {
            continue;
        }
        if (cv == true) {
            var partner = "KVRS Comm Van";
            if (data[i][(SystemSettings.INVENTORY_REPORTED_LOC_COL - 1)] === partner || data[i][(SystemSettings.INVENTORY_REPORTED_LOC_COL - 1)].length === 0 && data[i][(SystemSettings.INVENTORY_ASSIGNED_LOC_COL - 1)] === partner) {
                var n = 0
                for (var ii = 0; ii < usedBeacons.length; ii++) {
                    if (usedBeacons[ii] != data[i][SystemSettings.INVENTORY_BEACON_COL - 1]) n++;
                    if (usedBeacons.length == n) {
                        availableBeacons.push(data[i][SystemSettings.INVENTORY_BEACON_COL - 1]);
                    }
                }
                if (usedBeacons.length === 0) {
                    availableBeacons.push(data[i][SystemSettings.INVENTORY_BEACON_COL - 1])
                }
            }
        } else {
            //if (data[i][(SystemSettings.INVENTORY_REPORTED_LOC_COL - 1)] === partner || data[i][(SystemSettings.INVENTORY_REPORTED_LOC_COL - 1)].length === 0) {
            var n = 0
            for (var ii = 0; ii < usedBeacons.length; ii++) {
                if (usedBeacons[ii] != data[i][SystemSettings.INVENTORY_BEACON_COL - 1]) n++;
                if (usedBeacons.length == n) {
                    availableBeacons.push(data[i][SystemSettings.INVENTORY_BEACON_COL - 1]);
                }
            }
            if (usedBeacons.length === 0) {
                availableBeacons.push(data[i][SystemSettings.INVENTORY_BEACON_COL - 1])
                //}
            }
        }
    }
    availableBeacons = availableBeacons.sort(SharedFunctions.sortNumber)
    console.log(availableBeacons);
    return availableBeacons
}