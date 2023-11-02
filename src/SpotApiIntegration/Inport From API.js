function getSPOTApiData() {
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
    if (previousMsgIdStart == currentMsgIdStart && previousMsgIdEnd == currentMsgIdEnd) {
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

function logSPOTApiData(inportSheet) {
  console.log("START: logSPOTApiData")
  try {
    // Get a script lock, because we're about to modify a shared resource.
    //  var lock = LockService.getScriptLock();
    // Wait for up to 30 seconds for other processes to finish.
    // lock.waitLock(30000);
    var inportLastRow = inportSheet.getLastRow();
    var inportLastColumn = inportSheet.getLastColumn();
    var inportData = inportSheet.getRange(2, 1, (inportLastRow - 1), inportLastColumn).getValues();
    var inportDataLen = inportData.length;
    var ss = SpreadsheetApp.openById(SystemSettings.SPOT_SPREADSHEET_ID);
    var logSheet = ss.getSheetByName("IMS SPOT Data");
    var logLastRow = logSheet.getLastRow();
    var logLastColumn = logSheet.getLastColumn();
    var logNewData = [];
    var logNewDataTimestamp = [];
    var logNewDataTime = []
    var tz = Session.getScriptTimeZone();
    if (logLastRow == 1) {
      console.log("logSPOTApiData: No Data in The Log Found, logging all entries from InportData")
      for (var row = 0; row < inportDataLen; row++) {
        logNewData.push(inportData[row]);
        //Logger.log("New Row Found: " + inportData[row]);
        var timestamp = Utilities.formatDate(new Date(), tz, "EEE MMM dd yyyy HH:mm:ss 'GMT'Z '('z')'");
        var messageDate = new Date((inportData[row][3] * 1000));
        var loggedDate = new Date(timestamp);
        var td = loggedDate.getTime() - messageDate.getTime();
        td = millisToMinutesAndSeconds(td);
        //Logger.log("Message Date: " + messageDate + " Logged Date: " + loggedDate + " Time Differential: " + td);
        var datesConverted = convertSpotTime(inportData[row][3]);
        logNewDataTimestamp.push([timestamp, td]);
        logNewDataTime.push([datesConverted[0], datesConverted[1]]);
      }
    } else {
      var logData = logSheet.getRange(2, 1, (logLastRow - 1), logLastColumn).getValues();
      var logDataLen = logData.length;
      for (var row = 0; row < inportDataLen; row++) {
        var cadidateStatus = 0;
        for (var row1 = 0; row1 < logDataLen; row1++) {
          //Logger.log("Inport Data Row: " +inportData[row][0])
          //Logger.log("Log Data Row: " +logData[row1][0])
          if (inportData[row][0] == logData[row1][0]) {
            cadidateStatus = 1;
            //Logger.log("Canidate Matches, Skipping Row");
            break;
          }
        }
        if (cadidateStatus == 0) {
          logNewData.push(inportData[row]);
          //Logger.log("New Row Found: " + inportData[row]);
          var timestamp = Utilities.formatDate(new Date(), tz, "EEE MMM dd yyyy HH:mm:ss 'GMT'Z '('z')'");
          var messageDate = new Date((inportData[row][3] * 1000));
          var loggedDate = new Date(timestamp);
          var td = loggedDate.getTime() - messageDate.getTime();
          td = millisToMinutesAndSeconds(td);
          //Logger.log("Message Date: " + messageDate + " Logged Date: " + loggedDate + " Time Differential: " + td);
          var datesConverted = convertSpotTime(inportData[row][3]);
          logNewDataTimestamp.push([timestamp, td]);
          logNewDataTime.push([datesConverted[0], datesConverted[1]]);
        }
      }
    }
    //determine if there is any new data in the array and if so push to the log sheet
    var logNewDataLen = logNewData.length;
    //Logger.log("Final New Data Array Length: "+logNewDataLen);
    //Logger.log("Final New Data Array: "+logNewData)
    //Logger.log("Final New TS Data Array Length: "+logNewDataTimestamp.length);
    //Logger.log("Final New TS Data Array: "+logNewDataTimestamp);
    if (logNewDataLen > 0) {
      //Push To Log Sheet
      //This could be optiomized by figuring out how to use only one push  to set it during the looging process.    
      logSheet.getRange((logLastRow + 1), 1, logNewDataLen, inportLastColumn).setValues(logNewData);
      logSheet.getRange((logLastRow + 1), (logLastColumn - 1), logNewDataLen, 2).setValues(logNewDataTimestamp);
      logSheet.getRange((logLastRow + 1), (logLastColumn - 3), logNewDataLen, 2).setValues(logNewDataTime);
      //Sort Sheet
      //Update Log Lenght
      var logLastRow = logSheet.getLastRow();
      var logLastColumn = logSheet.getLastColumn();
      //Sort By Zulu Time Column
      var logSheetData = logSheet.getRange(2, 1, (logLastRow - 1), logLastColumn).getValues();
      logSheetData = sortByDates(logSheetData, 15);
      logSheetData.reverse();
      logSheet.getRange(2, 1, (logLastRow - 1), logLastColumn).setValues(logSheetData);
      //release the lock
      //  lock.releaseLock();
      var scriptProperties = PropertiesService.getScriptProperties();
      scriptProperties.setProperty('lastLoggedData', new Date());
      updateSPOTDataUsers();
    }
    console.log("COMPLETE: logSPOTApiData")
  } catch (f) {
    console.error("ERROR in logSPOTApiData: " + f);
  }
}

function clearCalculatedDate(sheet) {
  var lastRow = sheet.getLastRow();
  sheet.getRange(2, 15, (lastRow - 1), 4).clearContent();
}

function convertSpotTime(unixTime) {
  var timeData = []
  var jsTime = unixTime * 1000;
  var date = new Date(jsTime);
  var zuluDate = Utilities.formatDate(date, "GMT", "EEE MMM dd yyyy HH:mm:ss 'GMT'Z '('z')'");
  //Sets TZ to the Project's TZ - should be AK time
  var tz = Session.getScriptTimeZone();
  var tzDate = Utilities.formatDate(date, tz, "EEE MMM dd yyyy HH:mm:ss 'GMT'Z '('z')'");
  return [zuluDate, tzDate];
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return (seconds == 60 ? (minutes + 1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
}

function sortByDates(array, col) {
  Logger.log(col);

  function propComparator(col) {
    return

    function sort(a, b) {
      var dateA = new Date(a[col]),
        dateB = new Date(b[col]);
      Logger.log("Date a: " + dateA);
      return dateA - dateB;
    };
  };
  var sortedarray = propComparator(array)
  array.sort(sortedarray);
  return array;
}