function getLastMemberStatus(logSheetId, member) {
    try {
        console.log("START: getMemberStatus for incident " + logSheetId + " member " + member)
        var ss = SpreadsheetApp.openById(logSheetId);
        var sheet = ss.getSheets()[0];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        var statusList = [];
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
            if (sheetHeaders[0][hrow] == "Team") {
                var colTeam = hrow
            };
            if (sheetHeaders[0][hrow] == "SPOT") {
                var colSpot = hrow
            };
        }
        //break if only header row
        if (sheetLastRow == 1) return statusList;
        var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
        //NOT SURE WHY THE SORT ISNT WORKING NEEDS TO BE FIXED
        // sheetData.sort(sortFunctionAssignByDate);
        function sortFunctionAssignByDate(a, b) {
            var o1 = a[5];
            var o2 = b[5];
            var p1 = a[0];
            var p2 = b[0];
            if (o1 < o2) return -1;
            if (o1 > o2) return 1;
            if (p1 < p2) return -1;
            if (p1 > p2) return 1;
            return 0;
        }
        console.log("memberStatus sort after: " + sheetData[0][5]);
        //TEMPORARY DUE TO SORT ISSUES
        var sheetData = sheetData.reverse()
        console.log("memberStatus Data: " + sheetData)
        var sheetDataLen = sheetData.length;
        for (var drow = 0; drow < sheetDataLen; drow++) {
            var dataName = (sheetData[drow][colLastName] + ", " + sheetData[drow][colFirstName])
            console.log(sheetData[drow][colStartTime] + " | " + sheetData[drow][colEndTime])
            var lastRow;
            console.log("memberStatus Start Date: " + sheetData[drow][colStartTime] + " End Date " + sheetData[drow][colEndTime])
            if (dataName == member && sheetData[drow][colStartTime] == "" && sheetData[drow][colEndTime] == "") {
                lastRow = [
                    [dataName],
                    ["Member On Standby List"],
                    ["Member On Standby List"],
                    [sheetData[drow][colNotes]],
                    [sheetData[drow][colStartTime]],
                    [sheetData[drow][colEndTime]]
                ]
                console.log("memberStatus: Last action Is Standby")
                break;
            } else if (dataName == member && sheetData[drow][colEndTime] != "") {
                lastRow = [
                    [dataName],
                    ["Member Checked Out"],
                    ["Member Checked Out"],
                    [sheetData[drow][colNotes]],
                    [sheetData[drow][colStartTime]],
                    [sheetData[drow][colEndTime]]
                ]
                console.log("memberStatus: Last action Is Checkout")
                break;
            } else if (dataName == member && sheetData[drow][colEndTime] == "") {
                lastRow = [
                    [dataName],
                    [sheetData[drow][colTeam]],
                    [sheetData[drow][colSpot]],
                    [sheetData[drow][colNotes]],
                    [sheetData[drow][colStartTime]],
                    [sheetData[drow][colEndTime]]
                ]
                break;
            } else {
                continue;
            }
        }
        console.log("COMPLETE getlastMemberStatus for member: " + member + " Result: " + lastRow)
        return lastRow;
    } catch (error) {
        console.log("ERROR: getlastMemberStatus: " + error);
    }
}

function getDateFromTime(time, date) {
    console.log("time: " + time)
    console.log("date: " + date)
    if (date == undefined || date == null || date == "") {
        console.log("No Valid Date, Using Today");
        date = new Date();
    } else {
        date = new Date(date);
        console.log("custom date found, date set as " + date);
    }
    if (time != undefined || time != null || time != "") {
        console.log("custom time found" + time);
        time = time.split(":");
        date.setHours(time[0]);
        date.setMinutes(time[1]);
    }
    console.log("final dtg set as " + date);
    return date
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

function batchUpdate(spreadsheetId, requests) {
    var url = 'https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + ':batchUpdate';
    var payload = {
      requests: requests
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
      },
      // Convert the JavaScript object to a JSON string.
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText());
  }