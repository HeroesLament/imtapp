function getDefaultIcon() {
    var ss = SpreadsheetApp.openById(SystemSettings.IMS_DROPDOWN_VALUES_SHEET_ID);
    var sheet = ss.getSheetByName("MAP_ICONS");
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    var icons = [];
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
        if (sheetHeaders[0][hrow] == "MAP_ICON_URL") {
            var iconRow = hrow
        };
        if (sheetHeaders[0][hrow] == "MAP_ICON_DESCRIPTION") {
            var textRow = hrow
        };
           if (sheetHeaders[0][hrow] == "SIT_ICON") {
            var sitRow = hrow
        };
        if (sheetHeaders[0][hrow] == "SIT_ICON_DEFAULT") {
            var defaultRow = hrow
        };
    }
    var backupIcon
    //if no default icon is found return first viable row
    for (var row = 0; row < sheetDataLen; row++) {
        if (sheetData[row][iconRow] != "" && backupIcon === undefined) {
            backupIcon = sheetData[row][iconRow]
        }
        if (sheetData[row][iconRow] != "" && sheetData[row][defaultRow] === true && sheetData[row][sitRow] === true) {
            return sheetData[row][iconRow];
        }
    }
    return backupIcon
}

function removePoi(logSheetId, poiRow, justify) {
    console.log("Hide POI Row: " + poiRow);
    try {
        poiRow = Number(poiRow);
        var ss = SpreadsheetApp.openById(logSheetId);
        var sheet = ss.getSheets()[0];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "Hidden") {
                var colHidden = hrow
            };
            if (sheetHeaders[0][hrow] == "Title") {
                var colTitle = hrow
            };
            if (sheetHeaders[0][hrow] == "Notes") {
                var colNotes = hrow
            };
        }
        sheet.getRange((poiRow), (colHidden + 1)).setValue(true);
        var notes = sheet.getRange((poiRow), (colNotes + 1)).getValue();
        var user = SharedFunctions.getUser();
        var date = new Date();
        notes += " ** Hidden by " +user+" at "+date+".  Justification: "+justify+" **";
        sheet.getRange((poiRow), (colNotes + 1)).setValue(notes);

        var title = sheet.getRange((poiRow), (colTitle + 1)).getValue();
        var msg = [true, title];
        //REFRESH SITUATION DISPLAY
        syncSituationData();
        return msg;
    } catch (error) {
        console.log("Remove Error: " + error);
        var msg = [false, error.toString()];
        return msg;
    }
}

