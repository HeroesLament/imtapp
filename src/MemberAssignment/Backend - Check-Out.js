function modalCheckOut(logSheetId, memberName, time, date) {
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
            if (sheetHeaders[0][hrow] == "Entered By") {
                var colUser = hrow
            };
        }
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
            throw "Checkout Time Cannot Be In The Future."
        }
        var user = SharedFunctions.getUser();
        var nameArray = memberName.split(", ");
        if (nameArray[1] == undefined) {
            nameArray[1] = "";
        }
        sheet.getRange((sheetLastRow + 1), (colLastName + 1)).setValue(nameArray[0]);
        sheet.getRange((sheetLastRow + 1), (colFirstName + 1)).setValue(nameArray[1]);
        sheet.getRange((sheetLastRow + 1), (colStartTime + 1)).setValue(dtg);
        sheet.getRange((sheetLastRow + 1), (colEndTime + 1)).setValue(dtg);
        sheet.getRange((sheetLastRow + 1), (colNotes + 1)).setValue("Member Checked Out at " + dtg + " by " + user + ".");
        sheet.getRange((sheetLastRow + 1), (colUser + 1)).setValue(user);
        var msg = [true, memberName];
        return msg;
    } catch (error) {
        console.log("Check Out Error: " + error);
        var msg = [false, error.toString()];
        return msg;
    }
}

function cardCheckOut(logSheetId, memberNames, time, date) {
    try {
        console.log("Members To Checkout:" + memberNames)
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
            if (sheetHeaders[0][hrow] == "Entered By") {
                var colUser = hrow
            };
        }
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
            throw "Checkout Time Cannot Be In The Future."
        }
        var memberNamesLen = memberNames.length;
        var user = SharedFunctions.getUser();
        for (var row = 0; row < memberNamesLen; row++) {
            sheetLastRow = sheet.getLastRow();
            console.log("Check Out Mbr:" + memberNames[row])
            var currentName = memberNames[row].toString();
            //console.log("Check Out Name; "+currentName)
            var nameArray = currentName.split(", ");
            if (nameArray[1] == undefined) {
                nameArray[1] = "";
            }
            sheet.getRange((sheetLastRow + 1), (colLastName + 1)).setValue(nameArray[0]);
            sheet.getRange((sheetLastRow + 1), (colFirstName + 1)).setValue(nameArray[1]);
            sheet.getRange((sheetLastRow + 1), (colStartTime + 1)).setValue(dtg);
            sheet.getRange((sheetLastRow + 1), (colEndTime + 1)).setValue(dtg);
            sheet.getRange((sheetLastRow + 1), (colNotes + 1)).setValue("Member Checked Out at " + dtg + " by " + user + ".");
            sheet.getRange((sheetLastRow + 1), (colUser + 1)).setValue(user);
        }
        var msg = [true, memberNames];
        return msg;
    } catch (error) {
        console.log("ERROR - Group Checkout: " + error);
        var msg = [false, error.toString()];
        return msg;
    }
}