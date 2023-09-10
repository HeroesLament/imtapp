//*
//*** OLD SS Version
//*
function generateVolRoster(incidentFolderId) {
    try {
        var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
        var sheet = ss.getSheetByName("IMS Incident Log");
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
        var sheetDataLen = sheetData.length;
        var incidents = [];
        for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "INCIDENT_FOLDER_ID") {
                var colIncidentFolderId = hrow;
                continue;
            };
            if (sheetHeaders[0][hrow] == "INCIDENT_NAME") {
                var colIncidentName = hrow;
                continue
            };
            if (sheetHeaders[0][hrow] == "INCIDENT_NUMBER") {
                var colIncidentNumber = hrow;
                continue;
            };
            if (sheetHeaders[0][hrow] == "INCIDENT_START_DATE") {
                var colIncidentStartDate = hrow;
                continue;
            };
            if (sheetHeaders[0][hrow] == "INCIDENT_END_DATE") {
                var colIncidentEndDate = hrow;
                continue;
            };
            if (sheetHeaders[0][hrow] == "INCIDENT_MEMBER_DATA_ID") {
                var colAssignmentId = hrow;
                continue;
            };
        }
        for (var row = 0; row < sheetDataLen; row++) {
            var incidentName;
            var incidentAssignmentLog;
            var incidentNumber;
            var incidentStartDate;
            var incidentEndDate;
            if (sheetData[row][colIncidentFolderId] == incidentFolderId) {
                incidentName = sheetData[row][colIncidentName];
                incidentAssignmentLog = sheetData[row][colAssignmentId];
                incidentNumber = sheetData[row][colIncidentNumber];
                incidentStartDate = sheetData[row][colIncidentStartDate];
                incidentEndDate = sheetData[row][colIncidentEndDate];
                break;
            }
        }
        var templateFileId = "1zdRB62e0VDKPiyNNwb6F9gwKyrO1V6ixDZBC2xjBryk";
        var oldReportFileId = checkIfExisitngReport(incidentFolderId, templateFileId);
        if (oldReportFileId == false) {
            var reportFileId = SystemSettings.copyDriveFile(templateFileId, incidentFolderId);
        } else {
            DriveApp.getFileById(oldReportFileId).setTrashed(true);
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        }
        createVolRoster(incidentAssignmentLog, reportFileId, incidentName, incidentNumber, incidentStartDate, incidentEndDate);
        var url = "https://docs.google.com/document/d/" + reportFileId;
        var msg = [true, url];
        console.log("Success Gen Vol report: " + msg)
        return msg;
    } catch (error) {
        console.log("Error Gen Vol Report:" + error)
        var msg = [false, "Error: " + error.toString()]
        return msg;
    }
}

function createVolRoster(incidentAssignmentLog, volRoster, incidentName, incidentNumber, incidentStartDate, incidentEndDate) {
    var tz = Session.getScriptTimeZone();
    var volSs = SpreadsheetApp.openById(SystemSettings.MEMBER_ROSTER_SHEET_ID);
    var volSheet = volSs.getSheetByName("Sheet1");
    var volSheetLastRow = volSheet.getLastRow();
    var volSheetLastColumn = volSheet.getLastColumn();
    var volSheetHeaders = volSheet.getRange(1, 1, 1, volSheetLastColumn).getValues();
    var volSheetHeadersLen = volSheetHeaders[0].length;
    var volSheetData = volSheet.getRange(2, 1, (volSheetLastRow - 1), volSheetLastColumn).getValues();
    var volSheetDataLen = volSheetData.length;
    var assignLastName;
    var assignFirstName;
    for (var hrow = 0; hrow < volSheetHeadersLen; hrow++) {
        if (volSheetHeaders[0][hrow] == "Last Name") {
            var volLastNameCol = [hrow]
        };
        if (volSheetHeaders[0][hrow] == "First Name") {
            var volFirstNameCol = [hrow]
        };
        if (volSheetHeaders[0][hrow] == "Address") {
            var volStreetCol = [hrow]
        };
        if (volSheetHeaders[0][hrow] == "City") {
            var volCityCol = [hrow]
        };
        if (volSheetHeaders[0][hrow] == "State") {
            var volStateCol = [hrow]
        };
        if (volSheetHeaders[0][hrow] == "Zip") {
            var volZipCol = [hrow]
        };
        if (volSheetHeaders[0][hrow] == "Mobile Phone") {
            var volMobilePhoneCol = [hrow]
        };
        if (volSheetHeaders[0][hrow] == "Home Phone") {
            var volHomePhoneCol = [hrow]
        };
        if (volSheetHeaders[0][hrow] == "Work Phone") {
            var volWorkPhoneCol = [hrow]
        };
    }
    //console.log("Last Name Col: "+ volLastNameCol)
    var ss = SpreadsheetApp.openById(incidentAssignmentLog);
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
            var colStart = hrow
        };
        if (sheetHeaders[0][hrow] == "End") {
            var colEnd = hrow
        };
    }
    //calculate incident days
    if (incidentEndDate === undefined || incidentEndDate === "") {
        incidentEndDate = new Date();
    }
    var incidentLength = datesDiff(incidentStartDate, incidentEndDate)
    console.log("incidentLength:" + incidentLength);
    //investigate why this is needs to be 1 waht happenes to diff days if there is one day diff? is this a oversight in my iday numebrs? 
    if (incidentLength == 0) {
        incidentLength = 1;
    }
    //Start Processing for each day
    var rosterSs = SpreadsheetApp.openById(volRoster);
    var rosterSheet = rosterSs.getSheets()[0];
    for (var iDay = 0; iDay < (incidentLength - 1); iDay++) {
        rosterSheet.copyTo(rosterSs);
    }
    for (var iDay = 0; iDay < incidentLength; iDay++) {
        var totalMinutes = 0;
        console.log("STARING Day: " + iDay)
        var rosterSheet = rosterSs.getSheets()[iDay];
        rosterSheet.setName("Day " + (iDay + 1))
        var currentDay = new Date(incidentStartDate);
        currentDay.setDate(currentDay.getDate() + iDay);
        var nextDay = new Date(currentDay);
        nextDay.setDate(nextDay.getDate() + 1);
        var currentDate = Utilities.formatDate(new Date(currentDay), tz, "MMM dd, yyyy");
        var draftRoster = [];
        SharedFunctions.fillSpreadSheetTemplate(volRoster, iDay, "%INCIDENT_NAME%", incidentName)
        SharedFunctions.fillSpreadSheetTemplate(volRoster, iDay, "%INCIDENT_NUMBER%", incidentNumber)
        SharedFunctions.fillSpreadSheetTemplate(volRoster, iDay, "%INCIDENT_DAY%", currentDate + " (Day: " + (iDay + 1) + ")")
        var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
        var sheetData = sheetData.sort(sortFunctionAssignByDate);
        var sheetDataLen = sheetData.length;
        for (var i = 0; i < sheetDataLen; i++) {
            var assignLastName = "";
            var assignFirstName = "";
            var assignStart = "";
            var assignEnd = "";
            var nextEnd;
            var maxEnd = "";
            var startDate = "";
            var endDate = "";
            var startHours = "";
            var startMinutes = "";
            var endHours = "";
            var endMinutes = "";
            var startTime = "";
            var endTime = "";
            //this is set up for midnight as of now
            assignLastName = sheetData[i][colLastName];
            assignFirstName = sheetData[i][colFirstName];
            assignStart = sheetData[i][colStart];
            //skip if the start row is blank
            if (assignStart == "" || assignStart == "undefined") continue;
            // make a midnight date to see if the assignment crosses op periods
            assignStart = new Date(assignStart);
            //Set End of Date
            var maxEnd = new Date(currentDay);
            maxEnd.setHours(23);
            maxEnd.setMinutes(59);
            maxEnd.setSeconds(59);
            console.log("row" + i + "start: " + assignStart);
            console.log("row" + i + "max End: " + maxEnd);
            for (var ii = i; ii < sheetDataLen; ii++) {
                if (assignLastName == sheetData[ii][colLastName] && assignFirstName == sheetData[ii][colFirstName] && sheetData[ii][colEnd] != "") {
                    nextEnd = new Date(sheetData[ii][colEnd]);
                    console.log("Found a end date row " + ii + " Next End: " + nextEnd);
                    if (nextEnd > maxEnd) {
                        assignEnd = maxEnd
                    } else {
                        assignEnd = nextEnd;
                    }
                    break;
                }
            }
            //Skip row if its stdby...i think this will work?
            if (assignStart === assignEnd) {
                console.log("Skipping Standby Row");
                continue
            }
            if (assignStart <= currentDay && assignEnd == "") {
                assignEnd = maxEnd
                //console.log("End Time:"+ assignEnd);
            }
            console.log("currentDay: " + currentDay)
            console.log("assignEnd: " + assignEnd)
            console.log("nextDay: " + nextDay)
            console.log("assignStart: " + assignStart)
            if (currentDay > assignEnd || nextDay < assignStart) {
                console.log("Outside Date range");
                continue
            }
            // console.log("Assign Last Name: "+assignLastName)
            //console.log("Assign First Name: "+assignFirstName)
            if (assignStart.getDate() < currentDay.getDate()) {
                var minStart = new Date(currentDay);
                minStart.setHours(00);
                minStart.setMinutes(00);
                minStart.setSeconds(01);
                assignStart = minStart
            }
            for (var row = 0; row < volSheetDataLen; row++) {
                //console.log("Starting Row: "+volSheetData[row]);
                var volLastName = "";
                var volFirstName = "";
                var volStreet = "";
                var volCity = "";
                var volState = "";
                var volZip = "";
                var volPhone = "";
                var volPhone = "";
                var volMobilePhone = "";
                var volHomePhone = "";
                var volWorkPhone = "";
                var volAddress = "";
                var volLastName = volSheetData[row][volLastNameCol];
                var volFirstName = volSheetData[row][volFirstNameCol];
                var volStreet = volSheetData[row][volStreetCol];
                var volCity = volSheetData[row][volCityCol];
                var volState = volSheetData[row][volStateCol];
                var volZip = volSheetData[row][volZipCol];
                var volMobilePhone = volSheetData[row][volMobilePhoneCol];
                var volHomePhone = volSheetData[row][volHomePhoneCol];
                var volWorkPhone = volSheetData[row][volWorkPhoneCol];
                //console.log("Roster Last Name Row: "+volLastName)
                //console.log("Roster First Name Row: "+volFirstName)
                if (assignLastName != undefined && volLastName.toString() != assignLastName.toString() || volFirstName.toString() != assignFirstName.toString()) continue;
                if (volStreet != "" && volCity != "" && volState != "" && volZip != "") {
                    volAddress = volStreet + " " + volCity + ", " + volState + "  " + volZip;
                }
                if (volMobilePhone != "") {
                    volPhone = volMobilePhone
                } else if (volHomePhone != "") {
                    volPhone = volHomePhone
                } else if (volWorkPhone != "") {
                    volPhone = volWorkPhone
                }
                startDate = new Date(assignStart);
                endDate = new Date(assignEnd);
                startHours = addZero(startDate.getHours());
                startMinutes = addZero(startDate.getMinutes());
                endHours = addZero(endDate.getHours());
                endMinutes = addZero(endDate.getMinutes());
                startTime = startHours + ":" + startMinutes;
                endTime = endHours + ":" + endMinutes;
                var t = elapsedTimeCalc(startDate, endDate);
                var tm = t.minutes
                tm = Number(tm);
                tm = tm.toFixed(0);
                var elapsedTime = t.hours + "HR " + tm + "MIN";
                draftRoster.push([volLastName, volFirstName, volAddress, volPhone, startTime, endTime, elapsedTime, startDate, endDate]);
            }
        }

        function mysortfunction(a, b) {
            var o1 = a[0];
            var o2 = b[0];
            var p1 = a[1];
            var p2 = b[1];
            if (o1 < o2) return -1;
            if (o1 > o2) return 1;
            if (p1 < p2) return -1;
            if (p1 > p2) return 1;
            return 0;
        }
        draftRoster = draftRoster.sort(mysortfunction);
        var draftRosterLen = draftRoster.length;
        var roster = []
        console.log("draftRosterLen: " + draftRosterLen);
        for (var d = 0; d < draftRosterLen; d++) {
            //
            //
            // FIGURE OUT HOW TO MAKE THIS ADOVD PUSHIN 0000-2359 ROWS
            ///
            ///
            if (d == 0) {
                roster.push([draftRoster[d][0], draftRoster[d][1], draftRoster[d][2], draftRoster[d][3], draftRoster[d][4], draftRoster[d][5], draftRoster[d][6]]);
                continue;
            }
            var draftLastLastName = draftRoster[d - 1][0];
            var draftLastFirstName = draftRoster[d - 1][1];
            var draftLastStartDate = new Date(draftRoster[d - 1][7]);
            var draftLastEndDate = new Date(draftRoster[d - 1][8]);
            var draftLastName = draftRoster[d][0];
            var draftFirstName = draftRoster[d][1];
            var draftStartDate = new Date(draftRoster[d][7]);
            var draftEndDate = new Date(draftRoster[d][8]);
            console.log("draftLastLastName: " + draftLastLastName + "draftLastFirstName: " + draftLastFirstName + "draftLastStartDate" + draftLastStartDate + "draftLastEndDate" + draftLastEndDate);
            console.log("draftLastName: " + draftLastName + "draftFirstName: " + draftFirstName + "draftStartDate: " + draftStartDate + "draftEndDate: " + draftEndDate);
            var diff = draftLastStartDate - draftStartDate
            console.log("Diff:+" + diff)
            if (draftLastLastName == draftLastName && draftLastFirstName == draftFirstName && draftLastEndDate.toString() == draftEndDate.toString() && diff <= 0) {
                console.log("Skipping");
                continue;
            } else if (draftLastLastName == draftLastName && draftLastFirstName == draftFirstName) {
                console.log("Push Time Only Row");
                roster.push(["", "", "", "", draftRoster[d][4], draftRoster[d][5], draftRoster[d][6]]);
            } else {
                console.log("Push Full Row");
                roster.push([draftRoster[d][0], draftRoster[d][1], draftRoster[d][2], draftRoster[d][3], draftRoster[d][4], draftRoster[d][5], draftRoster[d][6]]);
            }
        }
        console.log("unsorted roster: " + roster)
        if (roster.length > 0) {
            // usage example:
            var roster = multiDimensionalUnique(roster); // returns ['a', 1, 2, '1']            
            //console.log("The Created Rroster: "+roster)       
            //find last rown on colum to start
            var rosterLastRow = rosterSheet.getLastRow();
            rosterSheet.getRange((rosterLastRow + 1), 1, roster.length, 7).setValues(roster);
        }
        console.log("COMPLETED Roster Day: " + iDay)
    }
    var fileId = volRoster;
    return fileId;
};