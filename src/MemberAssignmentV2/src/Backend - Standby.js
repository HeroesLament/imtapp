function memberStandby(logSheetId, memberName, time, date, notes) {
    try {
        if (memberName == "" || memberName == null || memberName == undefined) {
            throw "Standby Name Field Was Left Blank"
        }
        var ss = SpreadsheetApp.openById(logSheetId);
        var sheet = ss.getSheets()[0];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "Last Name") {
                var colLastName = hrow;
            };
            if (sheetHeaders[0][hrow] == "First Name") {
                var colFirstName = hrow
            };
            if (sheetHeaders[0][hrow] == "Notes") {
                var colNotes = hrow
            };
            if (sheetHeaders[0][hrow] == "Entered By") {
                var colUser = hrow
            };
        }
        var now = new Date();
        if ((time == undefined || time == null || time == "") && (date != "")) {
            throw "You must enter a time if you enter a date. Please fill in the time field and retry action."
        }
        if ((time == undefined || time == null || time == "") && (date == undefined || date == null || date == "")) {
            var dtg = new Date();
        } else {
            var dtg = getDateFromTime(time, date);
            if (isValidDate(dtg) == false) {
                throw "Unable to complete action due to an invalid time. Please check time data format (HH:MM) and retry action."
            }
        }
        var nameArray = memberName.split(", ");
        if (nameArray[1] == undefined) {
            nameArray[1] = "";
        }
        var user = SharedFunctions.getUser();
        sheet.getRange((sheetLastRow + 1), (colLastName + 1)).setValue(nameArray[0]);
        sheet.getRange((sheetLastRow + 1), (colFirstName + 1)).setValue(nameArray[1]);
        sheet.getRange((sheetLastRow + 1), (colUser + 1)).setValue(user);
        var noteText = "Member Added To Standby List " + now + " with an available time of " + dtg + " by " + user + "."
        if (notes != undefined && notes != null && notes != "") {
            noteText += " Notes: " + notes;
        }
        sheet.getRange((sheetLastRow + 1), (colNotes + 1)).setValue(noteText);
        var msg = [true, memberName];
        return msg;
    } catch (error) {
        console.log("Checkin Error: " + error);
        var msg = [false, error.toString()];
        return msg;
    }
}

function standbyRemove(logSheetId, memberName) {
    try {
        var ss = SpreadsheetApp.openById(logSheetId);
        var sheet = ss.getSheets()[0];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "Last Name") {
                var colLastName = hrow
            };
            if (sheetHeaders[0][hrow] == "First Name") {
                var colFirstName = hrow
            };
            if (sheetHeaders[0][hrow] == "Start") {
                var colStartTime = hrow
            };
            if (sheetHeaders[0][hrow] == "End") {
                var colEndTime = hrow
            };
            if (sheetHeaders[0][hrow] == "Notes") {
                var colNotes = hrow
            };
        }
        var date = new Date();
        var nameArray = memberName.split(", ");
        if (nameArray[1] == undefined) {
            nameArray[1] = "";
        }
        sheet.getRange((sheetLastRow + 1), (colLastName + 1)).setValue(nameArray[0]);
        sheet.getRange((sheetLastRow + 1), (colFirstName + 1)).setValue(nameArray[1]);
        sheet.getRange((sheetLastRow + 1), (colStartTime + 1)).setValue(date);
        sheet.getRange((sheetLastRow + 1), (colEndTime + 1)).setValue(date);
        sheet.getRange((sheetLastRow + 1), (colNotes + 1)).setValue("Member Removed From Standby List at " + date);
        var msg = [true, memberName];
        return msg;
    } catch (error) {
        console.log("standbyRemove Error: " + error);
        var msg = [false, error.toString()];
        return msg;
    }
}