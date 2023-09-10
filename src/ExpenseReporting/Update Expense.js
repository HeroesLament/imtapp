//THIS STILL NEEDS TO BE FINISHED

function updateExpense(logSheetId, date, vendor, expense, amount, purchaser, reimbursement, notes, documentation) {
    try {
        var ss = SpreadsheetApp.openById(logSheetId);
        var sheet = ss.getSheets()[0];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "Date") {
                var colDate = hrow
            };
            if (sheetHeaders[0][hrow] == "Vendor") {
                var colVendor = hrow
            };
            if (sheetHeaders[0][hrow] == "Description") {
                var colDescription = hrow
            };
            if (sheetHeaders[0][hrow] == "Amount") {
                var colAmount = hrow
            };
            if (sheetHeaders[0][hrow] == "Purchaser") {
                var colPurchaser = hrow
            };
            if (sheetHeaders[0][hrow] == "Notes") {
                var colNotes = hrow
            };
            if (sheetHeaders[0][hrow] == "File") {
                var colFile = hrow
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
            if (SharedFunctions.isValidDate(dtg) == false) {
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
        var msg = ["Ok", memberName];
        return msg;
    } catch (error) {
        console.log("Check Out Error: " + error);
        var msg = ["Error", error];
        return msg;
    }
}