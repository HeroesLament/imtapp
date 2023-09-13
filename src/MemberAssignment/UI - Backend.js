function createVolRoster() {
    var roster = SharedFunctions.createMemberList();
    return roster;
}

function getOpenIncidents() {
    var incidents = SharedFunctions.getIncidentList("ENABLE_ASSIGNMENT", true, "INCIDENT_MEMBER_DATA_ID")
    console.log(incidents)
    return incidents
}

function getIMTPositions() {
    var ss = SpreadsheetApp.openById(SystemSettings.IMS_DROPDOWN_VALUES_SHEET_ID);
        var sheet = ss.getSheetByName("ASSIGNMENT_POSITIONS");
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var positionList = [];
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "ASSIGNMENT_NAME") {
            var colName = hrow
        };
         if (sheetHeaders[0][hrow] == "ASSIGNMENT_DESCRIPTION") {
            var colDescription= hrow};
            
        if (sheetHeaders[0][hrow] == "ASSIGNMENT_IMT") {
            var colIMT = hrow
        };
}
if (sheetLastRow == 1) return positionList;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    
    sheetData.sort();
    var sheetDataLen =sheetData.length;
for (var i=0;i < sheetDataLen;i++){
if(sheetData[i][colIMT] == true){
positionList.push([sheetData[i][colName],sheetData[i][colDescription]])
}


}
return positionList
}

function getMemberStatusList(logSheetId) {

// THIS MAY BE NO ONER USED? Check and del if needed.

    console.log("START: getMemberStatusList")
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
    sheetData.sort(sortFunctionAssignByDate);

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
    var sheetDataLen = sheetData.length;
    //console.log("Data Sheet Len:" + sheetDataLen)
    var roster = [];
    for (var row = 0; row < sheetDataLen; row++) {
        var name = ([sheetData[row][colLastName], sheetData[row][colFirstName]])
        roster.push(name);
    }

    function multiDimensionalUnique(arr) {
        var uniques = [];
        var itemsFound = {};
        for (var i = 0, l = arr.length; i < l; i++) {
            var stringified = JSON.stringify(arr[i]);
            if (itemsFound[stringified]) {
                continue;
            }
            uniques.push(arr[i]);
            itemsFound[stringified] = true;
        }
        return uniques;
    }
    // usage example:
    var members = multiDimensionalUnique(roster); // returns ['a', 1, 2, '1']
    //console.log("roster Variable:"+roster)
    //console.log("members Variable:"+members)
    var membersLen = members.length;
    for (var row = 0; row < membersLen; row++) {
        var lastRow = [];
        for (var drow = 0; drow < sheetDataLen; drow++) {
            if (sheetData[drow][colLastName] != "" && sheetData[drow][colLastName] == members[row][0] && sheetData[drow][colFirstName] == members[row][1]) {
                var dataName = (sheetData[drow][colLastName] + ", " + sheetData[drow][colFirstName])
                var startTime = sheetData[drow][colStartTime].toString();
                lastRow = [
                    [dataName],
                    [sheetData[drow][colTeam]],
                    [sheetData[drow][colSpot]],
                    [sheetData[drow][colNotes]],
                    [sheetData[drow][colEndTime]],
                    [startTime]
                ];
            } else continue;
        }
        //console.log(lastRow)
        if (lastRow[4] != "") continue;
        statusList.push(lastRow);
    }

    function mysortfunction(a, b) {
        var o1 = a[1];
        var o2 = b[1];
        var p1 = a[0];
        var p2 = b[0];
        if (o1 < o2) return -1;
        if (o1 > o2) return 1;
        if (p1 < p2) return -1;
        if (p1 > p2) return 1;
        return 0;
    }
    statusList = statusList.sort(mysortfunction);
    //console.log("Final List: " + statusList)
    console.log("COMPLETE: getMemberStatusList")
    return statusList;
}

function getIncidentBeaconList(logSheetId) {
    //overall incident MSL incding all closed out teams.
    // console.log("START: getIncidentBeaconList")
    var ss = SpreadsheetApp.openById(logSheetId);
    var sheet = ss.getSheets()[0];
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var spotList = [];
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
    if (sheetLastRow == 1) {
        console.log("No Assignment Data Found")
        return spotList;
    }
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    sheetData.sort(sortFunctionAssignByDate);

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
    var teams = getTeamList(logSheetId);
    var sheetDataLen = sheetData.length
    var teamsLen = teams.length;
    for (var row = 0; row < teamsLen; row++) {
        for (var drow = 0; drow < sheetDataLen; drow++) {
            if (sheetData[drow][colTeam] == teams[row] && sheetData[drow][colSpot] != "") {
                var dataName = (sheetData[drow][colLastName] + ", " + sheetData[drow][colFirstName])
                spotList.push([
                    [dataName],
                    [sheetData[drow][colTeam]],
                    [sheetData[drow][colSpot]],
                    [sheetData[drow][colNotes]],
                    [sheetData[drow][colEndTime]]
                ]);
            } else continue;
        }
        //console.log(lastRow)
    }
    //console.log("Final List: " + statusList)
    // console.log("COMPLETE: getIncidentBeaconList");
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
    spotList = spotList.sort(mysortfunction);
    console.log("Incident Beacons & Teams List: " + spotList)
    return spotList;
}

function getTeamList(logSheetId) {
    var ss = SpreadsheetApp.openById(logSheetId);
    var sheet = ss.getSheets()[0];
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
        if (sheetHeaders[0][hrow] == "Team") {
            var colTeam = hrow
        };
    }
    //break if only header row
    if (sheetLastRow == 1) return;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    var roster = [];
    for (var row = 0; row < sheetDataLen; row++) {
        roster.push(sheetData[row][colTeam]);
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    // usage example:
    var teams = roster.filter(onlyUnique); // returns ['a', 1, 2, '1']
    return teams;
}

function getMemberStatus(logSheetId, member) {
    //this needs to be looked at for what its used for and  the sort /end date issue
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
        if (sheetHeaders[0][hrow] == "Team Leader") {
            var colLeader = hrow
        };
        
    }
    //break if only header row
    if (sheetLastRow == 1) return statusList;
    var lastRow;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    for (var drow = 0; drow < sheetDataLen; drow++) {
        var dataName = (sheetData[drow][colLastName] + ", " + sheetData[drow][colFirstName])
        if (dataName == member && sheetData[drow][colEndTime] == "") {
            lastRow = [
                [dataName],
                [sheetData[drow][colTeam]],
                [sheetData[drow][colSpot]],
                [sheetData[drow][colNotes]],
                [sheetData[drow][colLeader]]

            ]
        } else continue;
    }
    // console.log("COMPLETE getMemberStatus for member: " + member + " Result: " + lastRow)
    return lastRow;
}

function getBeaconStartTime(logSheetId, member, beacon, min) {
    var ss = SpreadsheetApp.openById(logSheetId);
    var sheet = ss.getSheets()[0];
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var beaconStartTime = "";
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
        if (sheetHeaders[0][hrow] == "SPOT") {
            var colSpot = hrow
        };
    }
    //break if only header row
    if (sheetLastRow == 1) return beaconStartTime;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    //console.log(members) 
    var startTime = "";
    for (var drow = sheetDataLen - 1; drow > 0; drow--) {
        var dataName = (sheetData[drow][colLastName] + ", " + sheetData[drow][colFirstName])
        if (dataName == member && sheetData[drow][colSpot] == beacon) {
            startTime = sheetData[drow][colStartTime];
            break;
        } else continue;
    }
    //console.log(lastRow)
    // console.log("COMPLETE: getBeaconStartTime for Member: " + member + " Result: " + startTime)
    return startTime;
}

function getCheckedInMembers(logSheetId) {
    console.log("START: getCheckedInMembers")
    var ss = SpreadsheetApp.openById(logSheetId);
    var sheet = ss.getSheets()[0];
    var sheetLastRow = sheet.getLastRow();
    //break if only header row
    if (sheetLastRow == 1) return false
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
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    sheetData.sort(sortFunctionAssignByDate);

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
    var checkedIn = [];
    var checkedOut = [];
    for (var row = 0; row < sheetData.length; row++) {
        //skip if mbr is in stby status
        if (sheetData[row][colStartTime] == "") continue;
        if (sheetData[row][colEndTime] != "") {
            checkedOut.push([sheetData[row][colLastName], sheetData[row][colFirstName], sheetData[row][colEndTime]]);
        } else {
            checkedIn.push([sheetData[row][colLastName], sheetData[row][colFirstName], sheetData[row][colStartTime]]);
        }
    }
    console.log("checkedIn: " + checkedIn)
    console.log("checkedOut: " + checkedOut)
    var activeMembers = []
    for (var i = 0; i < checkedIn.length; i++) {
        console.log("checking checkedIn row:" + checkedIn[i])
        var mbrOut = false;
        for (var d = 0; d < checkedOut.length; d++) {
        console.log("starting cmparison for"+ d)
            console.log("checking checkedOut row:" + checkedOut[d])
            if (checkedIn[i][0] != checkedOut[d][0] || checkedIn[i][1] != checkedOut[d][1]) continue;
            console.log("Matching User found " + checkedIn[i][0])
            console.log("Checked In Date: " + new Date(checkedIn[i][2]))
            console.log("Checked Out Date: " + new Date(checkedOut[d][2]))
            if (new Date(checkedIn[i][2]) <= new Date(checkedOut[d][2])) {
                mbrOut = true;
                console.log("Dates are Valid")
                break;
                continue;
            }
            console.log("No match for d: " + d)
        }
        if (mbrOut == false) activeMembers.push(checkedIn[i]);
    }
    console.log("currentlyIn: " + activeMembers)
    console.log("COMPLETE: getCheckedInMembers")
    if (activeMembers.length > 0) {
        return true
    } else {
        return false
    }
}

function getMembersAssignmentList(logSheetId) {
    console.log("START: getMembersAssignmentList")
    var ss = SpreadsheetApp.openById(logSheetId);
    var sheet = ss.getSheets()[0];
    var sheetLastRow = sheet.getLastRow();
    //break if only header row
    if (sheetLastRow == 1) return false
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
             if (sheetHeaders[0][hrow] == "Team Leader") {
            var colLeader = hrow
        };
    }
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    sheetData.sort(sortFunctionAssignByDate);

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
    var checkedIn = [];
    var checkedOut = [];
    var dashboardList = [];
    for (var row = 0; row < sheetData.length; row++) {
        //skip if mbr is in stby status
        //  if (sheetData[row][colStartTime] == "") continue;
        if (sheetData[row][colEndTime] != "") {
            checkedOut.push([sheetData[row][colLastName], sheetData[row][colFirstName], sheetData[row][colEndTime]]);
        } else {
            checkedIn.push([sheetData[row][colLastName], sheetData[row][colFirstName], sheetData[row][colStartTime]]);
            var dataName = (sheetData[row][colLastName] + ", " + sheetData[row][colFirstName])
            dashboardList.push([dataName, sheetData[row][colTeam], sheetData[row][colSpot], sheetData[row][colNotes], sheetData[row][colStartTime].toString(), sheetData[row][colLeader]]);
        }
    }
    //    console.log("checkedIn: " + checkedIn)
    //   console.log("checkedOut: " + checkedOut)
    var activeMembers = []
    for (var i = 0; i < checkedIn.length; i++) {
        //       console.log("checking checkedIn row:" + checkedIn[i])
        var mbrOut = false;
        for (var d = 0; d < checkedOut.length; d++) {
            //    console.log("starting cmparison for"+ d)
            //console.log("checking checkedOut row:" + checkedOut[d])
            if (checkedIn[i][0] != checkedOut[d][0] || checkedIn[i][1] != checkedOut[d][1]) continue;
            //     console.log("Matching User found " + checkedIn[i][0])
            //     console.log("Checked In Date: " + new Date(checkedIn[i][2]))
            //     console.log("Checked Out Date: " + new Date(checkedOut[d][2]))
            if (new Date(checkedIn[i][2]) <= new Date(checkedOut[d][2])) {
                mbrOut = true;
                //console.log("Dates are Valid")
                break;
                continue;
            }
            //console.log("No match for d: " + d)
        }
        if (mbrOut == false) activeMembers.push(dashboardList[i]);
    }
    if (activeMembers.length > 0) {
        activeMembers = activeMembers.sort(function(a, b) {
            if (a === b || (a[0] === b[0] && a[4] === b[4])) return 0;
            if (a[0] > b[0]) return 1;
            if (a[0] < b[0]) return -1;
            if (a[4] > b[4]) return 1;
            if (a[4] < b[4]) return -1;
        })
        console.log("activeMembers post sort:" +activeMembers)
        for (var i = 0; i < activeMembers.length; i++) {
            var ii = (i + 1);
            if (ii == activeMembers.length) {
             statusList.push(activeMembers[i]);
            }
            else if (activeMembers[i][0].toString() == activeMembers[ii][0].toString()) {
                //console.log(activeMembers[i][0] + "matches next row")
                if (new Date(activeMembers[i][4]) < new Date(activeMembers[ii][4])) {
                    //console.log("POP!" + i)
                    continue;
                } else {
                    statusList.push(activeMembers[i])
                }
            } else {
                statusList.push(activeMembers[i])
            }
        }
        //console.log("currentlyIn: " + activeMembers)
        console.log("statusList: "+ statusList)
        console.log("COMPLETE: getMembersAssignmentList")
        return statusList
    } else {
        return false
    }
}

function getIncdentAssignmentList(logSheetId,spotOnly) {
//incudes checkout times
    console.log("START: getIncdentAssignmentList")
    var ss = SpreadsheetApp.openById(logSheetId);
    var sheet = ss.getSheets()[0];
    var sheetLastRow = sheet.getLastRow();
    if (sheetLastRow == 1) return false
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
    sheetData.sort(sortFunctionAssignByDate);

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
    var checkedIn = [];
    var checkedOut = [];
    var dashboardList = [];
    for (var row = 0; row < sheetData.length; row++) {
        //skip if mbr is in stby status
        //  if (sheetData[row][colStartTime] == "") continue;
        if (sheetData[row][colEndTime] != "") {
            checkedOut.push([sheetData[row][colLastName], sheetData[row][colFirstName], sheetData[row][colEndTime]]);
        } else if (sheetData[row][colSpot] != ""){
            checkedIn.push([sheetData[row][colLastName], sheetData[row][colFirstName], sheetData[row][colStartTime]]);
            var dataName = (sheetData[row][colLastName] + ", " + sheetData[row][colFirstName])
            dashboardList.push([dataName, sheetData[row][colTeam], sheetData[row][colSpot], sheetData[row][colNotes], sheetData[row][colStartTime].toString()]);
        } else if (spotOnly === undefined || spotOnly === false){
                    checkedIn.push([sheetData[row][colLastName], sheetData[row][colFirstName], sheetData[row][colStartTime]]);
            var dataName = (sheetData[row][colLastName] + ", " + sheetData[row][colFirstName])
            dashboardList.push([dataName, sheetData[row][colTeam], sheetData[row][colSpot], sheetData[row][colNotes], sheetData[row][colStartTime].toString()]);
        
        }
    }
    console.log("dashboardList: "+dashboardList)
    //    console.log("checkedIn: " + checkedIn)
    //   console.log("checkedOut: " + checkedOut)
    var activeMembers = []
    for (var i = 0; i < checkedIn.length; i++) {
        //       console.log("checking checkedIn row:" + checkedIn[i])
        var mbrOut = false;
        for (var d = 0; d < checkedOut.length; d++) {
            //    console.log("starting cmparison for"+ d)
            //console.log("checking checkedOut row:" + checkedOut[d])
            if (checkedIn[i][0] != checkedOut[d][0] || checkedIn[i][1] != checkedOut[d][1]) continue;
            //     console.log("Matching User found " + checkedIn[i][0])
            //     console.log("Checked In Date: " + new Date(checkedIn[i][2]))
            //     console.log("Checked Out Date: " + new Date(checkedOut[d][2]))
            if (new Date(checkedIn[i][2]) <= new Date(checkedOut[d][2])) {
                dashboardList[i].push(checkedOut[d][2].toString())
                mbrOut = true;
                //console.log("Dates are Valid")
                break;
                continue;
            }
            //console.log("No match for d: " + d)
        }
    }
    if (dashboardList.length > 0) {
        dashboardList = dashboardList.sort(function(a, b) {
            if (a === b || (a[0] === b[0] && a[4] === b[4])) return 0;
            if (a[0] > b[0]) return 1;
            if (a[0] < b[0]) return -1;
            if (a[4] > b[4]) return 1;
            if (a[4] < b[4]) return -1;
        })
        //console.log(activeMembers)
console.log(dashboardList)
        //console.log("currentlyIn: " + activeMembers)
        console.log("COMPLETE: getIncdentAssignmentList")
        return dashboardList
    } else {
        return false
    }
}
