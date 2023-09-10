function getOpenIncidents() {
    var incidents = SharedFunctions.getIncidentList("ENABLE_EXPENSE",true,"INCIDENT_EXPENSE_DATA_ID")
    return incidents;
}

function createMemberRoster() {
    var roster = SharedFunctions.createMemberList()
    return roster;
}

function getExpenseList(logSheetId) {
    try {
        console.log("START addExpense. Writng To: " + logSheetId);
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
            if (sheetHeaders[0][hrow] == "Reimbursement") {
                var colReimbursement = hrow
            };
            if (sheetHeaders[0][hrow] == "Notes") {
                var colNotes = hrow
            };
            if (sheetHeaders[0][hrow] == "File") {
                var colFile = hrow
            };
            if (sheetHeaders[0][hrow] == "Entered By") {
                var coluser = hrow
            };
        }
        var list = [];
        //break if only header row
        if (sheetLastRow == 1) return list;
        var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
        var tz = Session.getScriptTimeZone();
        var sheetDataLen = sheetData.length;
        //console.log("Data Sheet Len:" + sheetDataLen)
        for (var row = 0; row < sheetDataLen; row++) {
            var date = sheetData[row][colDate];
            var vendor = sheetData[row][colVendor];
            var expense = sheetData[row][colDescription];
            var amount = sheetData[row][colAmount].toFixed(2);
            var purchaser = sheetData[row][colPurchaser];
            var reimbursement = sheetData[row][colReimbursement];
            var notes = sheetData[row][colNotes];
            var file = sheetData[row][colFile];
            var dtg = Utilities.formatDate(date, tz, "ddMMMyy")
            if(file != "") file = DriveApp.getFileById(file).getUrl();

            list.push([
                [dtg.toString()],
                [vendor.toString()],
                [expense.toString()],
                [amount.toString()],
                [purchaser.toString()],
                [reimbursement.toString()],
                [notes.toString()],
                [file.toString()],
                [(row + 2).toString()],
                [date.toString()]
            ]);
        }
        list.sort(function(a, b) {
            a = a[9].toString();
            b = b[9].toString();
            var key1 = new Date(a);
            var key2 = new Date(b);
            console.log(key1)
            if (key1 < key2) {
                return -1;
            } else if (key1 == key2) {
                return 0;
            } else {
                return 1;
            }
        });
        return list;
    } catch (error) {
        console.log("Get Expense List Error: " + error);
        var msg = ["Error", error];
        return msg;
    }
}
function getDonationList(logSheetId) {
    try {
        console.log("START addExpense. Writng To: " + logSheetId);
        var ss = SpreadsheetApp.openById(logSheetId);
        var sheet = ss.getSheets()[1];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "Date") {
                var colDate = hrow
            };
            if (sheetHeaders[0][hrow] == "Donor") {
                var colDonor = hrow
            };
            if (sheetHeaders[0][hrow] == "Description") {
                var colDescription = hrow
            };
            if (sheetHeaders[0][hrow] == "Value") {
                var colValue = hrow
            };
            if (sheetHeaders[0][hrow] == "Accepted By") {
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
        var list = [];
        //break if only header row
        if (sheetLastRow == 1) return list;
        var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
        console.log("sheetData: "+sheetData)
        var tz = Session.getScriptTimeZone();
        var sheetDataLen = sheetData.length;
        //console.log("Data Sheet Len:" + sheetDataLen)
        for (var row = 0; row < sheetDataLen; row++) {
            var date = sheetData[row][colDate];
            var donor = sheetData[row][colDonor];
            var description = sheetData[row][colDescription];
            var value = sheetData[row][colValue].toFixed(2);
            var purchaser = sheetData[row][colPurchaser];
            var notes = sheetData[row][colNotes];
            var file = sheetData[row][colFile];
            var dtg = Utilities.formatDate(date, tz, "ddMMMyy")
            if(file != "") file = DriveApp.getFileById(file).getUrl();
console.log("alve")
            list.push([
                [dtg].toString(),
                [donor].toString(),
                [description].toString(),
                [value].toString(),
                [purchaser].toString(),
                [notes].toString(),
                [file].toString(),
                [(row + 2)].toString(),
                [date].toString()
            ]);
        }
        console.log("a"+list);
        list.sort(function(a, b) {
            a = a[8].toString();
            b = b[8].toString();
            var key1 = new Date(a);
            var key2 = new Date(b);
            console.log(key1)
            if (key1 < key2) {
                return -1;
            } else if (key1 == key2) {
                return 0;
            } else {
                return 1;
            }
        });
        console.log("b"+list)
        return list;
    } catch (error) {
        console.log("Get Expense List Error: " + error);
        var msg = ["Error", error];
        return msg;
    }
}