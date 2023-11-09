function memberCheckIn(logSheetId, memberName, time, date) {
    try {
        if (memberName == "" || memberName == null || memberName == undefined) {
            throw "Check-In Name Field Was Left Blank"
        }
        var memberStatus = getLastMemberStatus(logSheetId, memberName);
        var memberElegable = false;
        console.log("memberStatus: " + memberStatus)
        if (memberStatus == "" || memberStatus === undefined) {
            memberElegable = true;
        } else if (memberStatus[1] == "Member Checked Out" || memberStatus[1] == "Member On Standby List") {
            memberElegable = true;
            console.log("memberStatus[1]: " + memberStatus[1])
        }
        console.log("memberElegable: " + memberElegable)
        if (memberElegable === false) {
            throw "Member Is Already Checked-In"
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
            if (sheetHeaders[0][hrow] == "Start") {
                var colStartTime = hrow
            };
            if (sheetHeaders[0][hrow] == "Notes") {
                var colNotes = hrow
            };
            if (sheetHeaders[0][hrow] == "Entered By") {
                var colUser = hrow
            };
        }
        var user = SharedFunctions.getUser();
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
        if (dtg > new Date()) {
            throw "Check-In Time Cannot Be In The Future."
        }
        var nameArray = memberName.split(", ");
        if (nameArray[1] == undefined) {
            nameArray[1] = "";
        }
        sheet.getRange((sheetLastRow + 1), (colLastName + 1)).setValue(nameArray[0]);
        sheet.getRange((sheetLastRow + 1), (colFirstName + 1)).setValue(nameArray[1]);
        sheet.getRange((sheetLastRow + 1), (colStartTime + 1)).setValue(dtg);
        sheet.getRange((sheetLastRow + 1), (colNotes + 1)).setValue("Member Checked In at " + dtg + " by " + user + ".");
        sheet.getRange((sheetLastRow + 1), (colUser + 1)).setValue(user);
        var msg = [true, memberName];
        return msg;
    } catch (error) {
        console.log("Checkin Error: " + error);
        var msg = [false, error.toString()];
        return msg;
    }
}