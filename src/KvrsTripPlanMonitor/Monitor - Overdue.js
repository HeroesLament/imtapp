function overdueMonitor() {
    console.log("START OVERDUE Monitor")
    var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
    var sheet = ss.getSheetByName("Tracker");
    var endRow = sheet.getLastRow();
    console.log("End Row: " + endRow);
    if (endRow === 1) {
        console.log("No Data Found");
        return;
    }
    var d = new Date();
    console.log("Current Time: " + d);
    for (var row = 2; row <= endRow; row++) {
        var tpStatus = sheet.getRange(row, 9).getValue().toString();
        console.log(tpStatus);
        if (tpStatus != "Closed" && "Canceled") {
            console.log("Trip Plan Still Open");
            var overdueDate = new Date(sheet.getRange(row, 5).getValue());
            if (overdueDate <= d) {
                console.log("Trip Plan Overdue");
                var alertSent = sheet.getRange(row, 16).getValue();
                if (alertSent != true) {
                  console.log("sending email" + alertSent);
                    emailOverdueAlert(row);
                    sheet.getRange(row, 16).setValue(true);
                }
                if (tpStatus != "OVERDUE") {
                    sheet.getRange(row, 9).setValue("OVERDUE");
                }
            }
        }
    }
}