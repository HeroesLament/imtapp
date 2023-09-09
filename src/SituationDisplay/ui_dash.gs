function getPoiList(logSheetId) {
//console.log("START: getPoiList")
    var ss = SpreadsheetApp.openById(logSheetId);
    var sheet = ss.getSheets()[0];
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var poiList = [];
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
        if (sheetHeaders[0][hrow] == "POI ID") {
            var colId = hrow
        };
        if (sheetHeaders[0][hrow] == "Title") {
            var colTitle = hrow
        };
        if (sheetHeaders[0][hrow] == "Latitude") {
            var colLatitude = hrow
        };
        if (sheetHeaders[0][hrow] == "Longitude") {
            var colLongitude = hrow
        };
        if (sheetHeaders[0][hrow] == "Icon") {
            var colIcon = hrow
        };
        if (sheetHeaders[0][hrow] == "Notes") {
            var colNotes = hrow
        };
        if (sheetHeaders[0][hrow] == "Drive File ID") {
            var colFile = hrow
        };
        if (sheetHeaders[0][hrow] == "Reported By") {
            var colReportedUser = hrow
        };
        if (sheetHeaders[0][hrow] == "Timestamp") {
            var colTimestamp = hrow
        };
        if (sheetHeaders[0][hrow] == "Added By") {
            var colAddedUser = hrow
        };
        if (sheetHeaders[0][hrow] == "Hidden") {
            var colHidden = hrow
        };
    }
    if (sheetLastRow == 1) return poiList;
    var sheetData = sheet.getRange(2, 1, sheetLastRow - 1, sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    for (var drow = 0; drow < sheetDataLen; drow++) {
    var fileURL =""
    if(sheetData[drow][colFile] !="" && sheetData[drow][colFile] != undefined){
    fileURL = DriveApp.getFileById(sheetData[drow][colFile]).getUrl();   
    }
        if (sheetData[drow][colHidden] != true) {
            poiList.push([(drow + 2), sheetData[drow][colId], sheetData[drow][colIcon], sheetData[drow][colTitle], sheetData[drow][colLatitude], sheetData[drow][colLongitude], sheetData[drow][colNotes], fileURL, sheetData[drow][colReportedUser], sheetData[drow][colTimestamp].toString(), sheetData[drow][colAddedUser]]);
        }
    }
    //console.log("COMPLETE: getPoiList")
    return poiList;
}

function getPoiData(logSheetId, poiRow) {
  //  console.log("START: getPoiData for POI Row: " + poiRow);
    poiRow = Number(poiRow);
    var ss = SpreadsheetApp.openById(logSheetId);
    var sheet = ss.getSheets()[0];
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var colId;
    var colTitle;
    var colLatitude;
    var colLongitude;
    var colIcon;
    var colNotes;
    var colTimestamp;
    var colAddedUser;
    var colHidden;
    var colFile;
    var colReportedUser;
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
        if (sheetHeaders[0][hrow] == "POI ID") {
            colId = (hrow + 1)
        };
        if (sheetHeaders[0][hrow] == "Title") {
            colTitle = (hrow + 1)
        };
        if (sheetHeaders[0][hrow] == "Latitude") {
            colLatitude = (hrow + 1)
        };
        if (sheetHeaders[0][hrow] == "Longitude") {
            colLongitude = (hrow + 1)
        };
        if (sheetHeaders[0][hrow] == "Icon") {
            colIcon = (hrow + 1)
        };
        if (sheetHeaders[0][hrow] == "Notes") {
            colNotes = (hrow + 1)
        };
        if (sheetHeaders[0][hrow] == "Timestamp") {
            colTimestamp = (hrow + 1)
        };
        if (sheetHeaders[0][hrow] == "Added By") {
            colAddedUser = (hrow + 1)
        };
        if (sheetHeaders[0][hrow] == "Hidden") {
            colHidden = (hrow + 1)
        };
        if (sheetHeaders[0][hrow] == "Drive File ID") {
            colFile = (hrow + 1)
        };
        if (sheetHeaders[0][hrow] == "Reported By") {
            colReportedUser = (hrow + 1)
        };
    }
    var id = sheet.getRange(poiRow, colId).getValue();
    var title = sheet.getRange(poiRow, colTitle).getValue();
    var lat = sheet.getRange(poiRow, colLatitude).getValue();
    var long = sheet.getRange(poiRow, colLongitude).getValue();
    var icon = sheet.getRange(poiRow, colIcon).getValue();
    var notes = sheet.getRange(poiRow, colNotes).getValue();
    var timestamp = sheet.getRange(poiRow, colTimestamp).getValue();
    var user = sheet.getRange(poiRow, colAddedUser).getValue();
    var reporting = sheet.getRange(poiRow, colReportedUser).getValue();
    var fileId = sheet.getRange(poiRow, colFile).getValue();
    var hidden = sheet.getRange(poiRow, colHidden).getValue();
    var data = [];
    if (fileId !=""){
    var file = DriveApp.getFileById(fileId);
    var imgURL = 'http://drive.google.com/uc?export=view&id='+fileId;
}    
    data.push([id, title, lat, long, icon, notes, timestamp.toString(), user, reporting, hidden, imgURL]);
//    console.log("COMPLETE: getPoiData for POI Row: " + poiRow);
    return data;
}
