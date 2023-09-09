function addPoi(logSheetId, title, lat, long, icon, notes, reportedUser, base64Data, existingRow, existingId) {
console.log("START addPoi: "+title);
    try {
        var ss = SpreadsheetApp.openById(logSheetId);
        var sheet = ss.getSheets()[0];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        //Set Defaut Icon  
        if (icon === undefined || icon === "") {
        console.log("No Icon Found, setting default icon")
            icon = getDefaultIcon();
        }
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
                var colFileId = hrow
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
            if (sheetHeaders[0][hrow] == "Update of POI ID") {
                var colUpdateId = hrow
            };
            if (sheetHeaders[0][hrow] == "Hidden") {
                var colHidden = hrow
            };
        }
        var date = new Date();
        var user = SharedFunctions.getUser();

        if (sheetLastRow != 1) {
            var id = sheet.getRange(sheetLastRow, (colId + 1)).getValue();
            id++
        } else {
            var id = 1;
        };
        console.log(user)
        sheet.getRange((sheetLastRow + 1), (colId + 1)).setValue(id);
        sheet.getRange((sheetLastRow + 1), (colTitle + 1)).setValue(title);
        sheet.getRange((sheetLastRow + 1), (colLatitude + 1)).setValue(lat);
        sheet.getRange((sheetLastRow + 1), (colLongitude + 1)).setValue(long);
        sheet.getRange((sheetLastRow + 1), (colNotes + 1)).setValue(notes);
        sheet.getRange((sheetLastRow + 1), (colReportedUser + 1)).setValue(reportedUser);
        sheet.getRange((sheetLastRow + 1), (colTimestamp + 1)).setValue(date);
        sheet.getRange((sheetLastRow + 1), (colAddedUser + 1)).setValue(user);
        sheet.getRange((sheetLastRow + 1), (colIcon + 1)).setValue(icon);
        sheet.getRange((sheetLastRow + 1), (colHidden + 1)).setValue(false)
       
       if (existingRow != undefined) {
            console.log("Update of POI: " + existingRow);
            var justify = "Superseded by POI ID: "+ id
            removePoi(logSheetId, existingRow, justify);
            sheet.getRange((sheetLastRow + 1), (colUpdateId + 1)).setValue(existingId)
            
        }
        

        if (base64Data != undefined && base64Data != "") {
        console.log("File Attached Attempting Upload");
            var tz = Session.getScriptTimeZone();
            var folderDate = Utilities.formatDate(date, tz, "dd-MMM-yy")
            var folderName = "POI Photos"
            var fileName = title + " (" + folderDate + ")"
            var fileId = SharedFunctions.uploadFileToDrive(logSheetId,folderName,fileName,base64Data)
            sheet.getRange((sheetLastRow + 1), (colFileId + 1)).setValue(fileId);
        }
        console.log("COMPLETE: addPoi");
        //REFRESH SITUATION DISPLAY
        syncSituationData();
        var msg = [true, title];
        return msg;
        
    } catch (error) {
        console.log("Add Error: " + error);
        var msg = [false, error.toString()];
        return msg;
    }
}