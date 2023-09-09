function createMemberRoster() {
    var roster = SharedFunctions.createMemberList()
    return roster;
}

function getOpenIncidents() {
    var incidents = SharedFunctions.getIncidentList("ENABLE_SITU",true,"INCIDENT_SITUATION_DATA_ID")
    return incidents;
}

function getAvailableIcons() {
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
    }
    for (var row = 0; row < sheetDataLen; row++) {
        if (sheetData[row][iconRow] != "" && sheetData[row][sitRow] === true) {
            icons.push([sheetData[row][iconRow], sheetData[row][textRow]]);
        }
    }
    return icons;
}