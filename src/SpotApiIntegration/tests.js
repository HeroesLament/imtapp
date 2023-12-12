function debugGetSPOTApiData() {
  console.log("START: getSPOTApiData")
  try {
    var ss = SpreadsheetApp.openById(SystemSettings.SPOT_SPREADSHEET_ID);
    var sheet = ss.getSheetByName("SPOT API Feed");
    //Cache Defeat Ramdom Number String
    var queryString = Math.random();
    var tz = Session.getScriptTimeZone();
    //set variables for the first and last msg id.
    var previousMsgIdStart = sheet.getRange(2, 1, 1, 1).getValue();
    var previousLastRow = sheet.getLastRow();
    var previousMsgIdEnd = sheet.getRange(previousLastRow, 1, 1, 1).getValue();
    //Clear The Existing Sheet and Import The SPOT Feed
    sheet.getRange(2, 1, 1, 1).clearContent();
    sheet.getRange(2, 1, 1, 1).setValue("Update In Progress - Refreshing SPOT Data");
    clearCalculatedDate(sheet);
    //Set The IMPORT XML Function
    var cellFunction = '=IMPORTXML("https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/' + SystemSettings.SPOT_API_ID + '/message.xml?feedPassword=' + SystemSettings.SPOT_API_KEY + '&' + queryString + '","//messages/*")';
    sheet.getRange(2, 1, 1, 1).setValue(cellFunction);
    //check to see if there is any data for processing
    var lastRow = sheet.getLastRow();
    if (lastRow == 2) {
      var rowOneData = sheet.getRange(2, 1, 1, 2).getValues()[0];
      if (rowOneData[1] == "") {
        var currentTime = Utilities.formatDate(new Date(), tz, "EEE MMM dd yyyy HH:mm:ss 'GMT'Z '('z')'");
        sheet.getRange(2, 1, 1, 1).setValue("There Has Been No SPOT Activity Within The Last 7 Days as of " + currentTime);
        console.log("COMPLETED: getSPOTApiData: Terminating Import - Only One Row Found");
        return;
      }
    }
    //if there is data, process

    var currentMsgIdStart = sheet.getRange(2, 1, 1, 1).getValue();
    var currentLastRow = sheet.getLastRow();
    var currentMsgIdEnd = sheet.getRange(currentLastRow, 1, 1, 1).getValue();
    var scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('lastApiCall', new Date());
    if (1 != 1) {
      console.log("No New SPOT Data Received.")
    }
    else {
      console.log("New SPOT Data Received Running logSPOTApiData.")
      scriptProperties.setProperty('lastApiData', new Date());
      logSPOTApiData(sheet);
    }
    console.log("COMPLETED: getSPOTApiData. New SPOT Data Recieved " + lastRow + " Rows Imported.")
  } catch (f) {
    console.error("ERROR in getSPOTApiData: " + f);
  }
}