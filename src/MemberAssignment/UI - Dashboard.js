function getSpotData(beacon, startTime, endTime) {
    startTime = new Date(startTime);
    endTime = new Date(endTime);
    var ss = SpreadsheetApp.openById(SystemSettings.SPOT_SPREADSHEET_ID);
    var spotSheet = ss.getSheets()[1];
    var spotEndRow = spotSheet.getLastRow();
    var spotEndCol = spotSheet.getLastColumn();
    var spotHeaders = spotSheet.getRange(1, 1, 1, spotEndCol).getValues();
    var spotData = spotSheet.getRange(2, 1, spotEndRow, spotEndCol).getValues();
    var beaconData = [];
    //console.log("Looking For Beacon" + beacon)
    //console.log("Looking For Start" + startTime)
    //console.log("Looking For End" + endTime)
    for (var i = 0; i < (spotEndRow - 1); i++) {
        if (spotData[i][2] == beacon) {
            //console.log("Matched Beacon ID @ Row"+ i+2)
            var messageTime = new Date(spotData[i][15])
            if (messageTime > startTime && messageTime < endTime) {
                //console.log("Beacon Between Start and End Dates");
                beaconData.push([spotData[i][5], spotData[i][6], messageTime]);
            }
        }
    }
    //console.log("BeaconData Found:" + beaconData)
    return beaconData;
}

function createSpotMap(beacon, startTime, endTime) {
    //console.log("Starting createSpotMap")
    startTime = new Date(startTime);
    if (!endTime || endTime.length === 0) {
        endTime = new Date();
        //console.log("No End Date Found, Using Now");
    }
    var spotData = getSpotData(beacon, startTime, endTime);
    //console.log("spotData.length: " + spotData.length)
    if (spotData.length == 0) {
        //console.log("Ending Create Map No Data");
        return;
    }
    var lastMessageTime;
    var lastMessageLat;
    var lastMessageLong;
    var key = "AIzaSyBnJcrgTgMym9jWIhelOD6er5xXBaIfsR8";
    var clientID = "251169602314-7ek9nhu9k192loeb923mdhpkd6uts2t7.apps.googleusercontent.com";
    Maps.setAuthentication(clientID, key);
    var map = Maps.newStaticMap().setMapType(Maps.StaticMap.Type.TERRAIN);
    //console.log("SPOT Data Length" + spotData.length)
    for (var i = 0; i < spotData.length; i++) {
        //console.log(spotData[i][0])
        if (i == 0) {
            lastMessageTime = spotData[i][2];
            lastMessageLat = spotData[i][0];
            lastMessageLong = spotData[i][1];
        }
        map.addMarker(spotData[i][0], spotData[i][1]);
    }
    var mapUrl = map.getMapUrl();
    lastMessageTime.toString();
    var mapData = [beacon, mapUrl, lastMessageTime.toString(), lastMessageLat, lastMessageLong];
    //console.log("Created Map URL: " + mapData);
    return mapData;
}

function getMemberSpotData(logSheetId, member, beacon) {
    var startTime = getBeaconStartTime(logSheetId, member, beacon);
    var data = [];
    data = createSpotMap(beacon, startTime);
    //console.log("Returning Array: " + data);
    return data;
}