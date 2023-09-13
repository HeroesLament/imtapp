function createMemberList() {

    var ss = SpreadsheetApp.openById(SystemSettings.MEMBER_ROSTER_SHEET_ID);
    var sheet = ss.getSheetByName("Sheet1");
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var rowFirstName;
    var rowLastName;
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
        if (sheetHeaders[0][hrow] == "Last Name") {
            rowLastName = hrow
        };
        if (sheetHeaders[0][hrow] == "First Name") {
            rowFirstName = hrow
        };
    }

    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    var roster = [];
    for (var row = 0; row < sheetDataLen; row++) {
        var volLastName = "No Last Name On File";
        var volFirstName = "No First Name On File";
        volLastName = sheetData[row][rowLastName];
        volFirstName = sheetData[row][rowFirstName];
        roster.push([volLastName + ', ' + volFirstName]);
    }
    return roster;
}


function getIncidentList(filterRowHeader, criteria, logRowHeader) {
    var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
    var sheet = ss.getSheets()[0];
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    var incidents = [];
    if (logRowHeader === undefined) logRowHeader = "INCIDENT_FOLDER_ID";
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
        if (sheetHeaders[0][hrow].toString() == "INCIDENT_NAME") {
            var nameRow = hrow
        };
        if (sheetHeaders[0][hrow].toString() == filterRowHeader) {
            var filterRow = hrow
        };
        if (sheetHeaders[0][hrow].toString() == logRowHeader) {
            var logRow = hrow
        };
        if (sheetHeaders[0][hrow].toString() == "INCIDENT_START_DATE") {
            var startDateRow = hrow;
        };
    }

    for (var row = 0; row < sheetDataLen; row++) {
        var incidentName;
        var logId;
        var incidentNameWithDate = formatDate(new Date(sheetData[row][startDateRow])) + ", " + sheetData[row][nameRow];
        if (criteria === undefined || filterRowHeader === undefined) {
            incidents.push([
                incidentNameWithDate, // Use the modified incident name
                sheetData[row][logRow]
            ]);
        } else {
            if (sheetData[row][filterRow] === criteria) {
                incidents.push([
                    incidentNameWithDate, // Use the modified incident name
                    sheetData[row][logRow]
                ]);
            }
        }
    }
    incidents.reverse()
    return incidents;
}

function getUser() {
    var useremail = Session.getActiveUser().getEmail();
    useremail = useremail.split("@");
    var username = useremail[0];
    var user = username.toString();
    return user
}

function uploadFileToDrive(logSheetId,folderName,fileName,base64Data){
try{
        var file = DriveApp.getFileById(logSheetId);
        var folders = file.getParents();
        while (folders.hasNext()) {
            var incidentFolder = folders.next();
        }
            var folders = incidentFolder.getFoldersByName(folderName)
            if (folders.hasNext() === false) {
                var folder = incidentFolder.createFolder(folderName);
            } else {
                var folder = folders.next();
            }
            var splitBase = base64Data.split(','),
                type = splitBase[0].split(';')[0].replace('data:', '');
            var byteCharacters = Utilities.base64Decode(splitBase[1]);
            var blob = Utilities.newBlob(byteCharacters, type);
            if(fileName!= undefined && fileName != "")
{            blob.setName(fileName);
}            file = folder.createFile(blob);
            console.log("Created File")
            var fileId = file.getId();
            return fileId
    } catch (error) {
        console.log("File Upload Error: " + error);
    }

}

function formatDate(dateObj) {
    var months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];
    var day = dateObj.getDate();
    var month = months[dateObj.getMonth()];
    var year = dateObj.getFullYear();
    return month + ' ' + (day < 10 ? '0' + day : day) + ', ' + year;
}