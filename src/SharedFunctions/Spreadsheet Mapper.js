function lastValue(sheeetId, sheet, column) {
    var ss = SpreadsheetApp.openById(sheeetId);
    var sheet = ss.getSheets()[sheet];
    var lastRow = sheet.getMaxRows();
    var values = sheet.getRange(column + "1:" + column + lastRow).getValues();
    for (; values[lastRow - 1] == "" && lastRow > 0; lastRow--) {}
    return lastRow;
}

function getAvailableIcons(iconHeader) {
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
            var iconUrl = hrow
        };
        if (sheetHeaders[0][hrow] == "MAP_ICON_DESCRIPTION") {
            var textRow = hrow
        };
        if (sheetHeaders[0][hrow] == iconHeader) {
            var iconRow = hrow
        };
    }
    for (var row = 0; row < sheetDataLen; row++) {
        if (sheetData[row][iconUrl] != "" && sheetData[row][iconRow] === true) {
            icons.push([sheetData[row][iconUrl], sheetData[row][textRow]]);
        }
    }
    return icons;
}