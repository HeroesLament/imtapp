function cleanupSPOTDataLog() {
    console.log("START: cleanupSPOTDataLog")
    try {
        // Get a script lock, because we're about to modify a shared resource.
        var lock = LockService.getScriptLock();
        // Wait for up to 30 seconds for other processes to finish.
        lock.waitLock(30000);
        var ss = SpreadsheetApp.openById(SystemSettings.SPOT_DATA_SHEET_ID);
        var logSheet = ss.getSheetByName("IMS SPOT Data");
        var logLastRow = logSheet.getLastRow();
        var logLastColumn = logSheet.getLastColumn();
        if (logLastRow > 1) {
            var logData = logSheet.getRange(2, 1, (logLastRow - 1), logLastColumn).getValues();
            var logDataLen = logData.length;
            var updatedData = []
            var d = new Date();
            //Saves all entries that are less than x Months old
            d.setMonth(d.getMonth() - 3);
            for (var row = 0; row < logDataLen; row++) {
                if (new Date(logData[row][15]) > d) {
                    updatedData.push(logData[row]);
                }
            }
            var updatedDataLen = updatedData.length;
            //clear the log
            logSheet.getRange(2, 1, (logLastRow - 1), logLastColumn).clearContent();
            //copy over in saved entries
            logSheet.getRange(2, 1, updatedDataLen, logLastColumn).setValues(updatedData);
        }
        //release the lock
        lock.releaseLock();
        console.log("COMPLETE: cleanupSPOTDataLog. IMS SPOT Data started with " + logDataLen + " rows and ended with " + updatedDataLen + " rows. Cleanup deleted " + (logDataLen - updatedDataLen) + " position reports.")
    } catch (f) {
        console.log("ERROR in cleanupSPOTDataLog: " + f);
    }
}