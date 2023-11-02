function memberUpdate(logSheetId, memberName, memberTeam, memberSpot, time, date, leader) {
    const span = OpenTelemetryGASExporter.createSpan('updateMember');
    span.setAttribute('logSheetId', logSheetId);
    span.setAttribute('memberName', memberName);
    span.setAttribute('memberTeam', memberTeam);
    span.setAttribute('memberSpot', memberSpot);
    span.setAttribute('time', time);
    span.setAttribute('date', date);
    span.setAttribute('leader', leader);
    try {
        var activeMembers = getMemberStatusList(logSheetId);
        span.addEvent('Member status list retrieved', { length: activeMembers.length });
        console.log("memberSpot: " + memberSpot);
        var activeSpots = []
        for (var row = 0; row < activeMembers.length; row++) {
            console.log(activeMembers[row][0]);
            console.log(memberName)
            var activeMemberName = activeMembers[row][0];
            if (activeMembers[row][2] != "" && activeMemberName != memberName) {
                activeSpots.push(activeMembers[row][2].toString())
            }
        }
        console.log("activeSpots: " + activeSpots);
        memberSpot = memberSpot.toString();
        console.log(activeSpots.indexOf(memberSpot));
        if (activeSpots.indexOf(memberSpot) > -1) {
            //check to see if the the spot beacon is in use
            throw "The Selected SPOT beacon is already assiged to another to another member."
        }
        var ss = SpreadsheetApp.openById(logSheetId);
        var sheet = ss.getSheets()[0];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        //get old data
        var lastRecord = [];
        lastRecord = getMemberStatus(logSheetId, memberName);
        console.log("Last Reccord:" + lastRecord)
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
            if (sheetHeaders[0][hrow] == "Notes") {
                var colNotes = hrow
            };
            if (sheetHeaders[0][hrow] == "Team") {
                var colTeam = hrow
            };
            if (sheetHeaders[0][hrow] == "SPOT") {
                var colSpot = hrow
            };
            if (sheetHeaders[0][hrow] == "Entered By") {
                var colUser = hrow
            };
            if (sheetHeaders[0][hrow] == "Team Leader") {
                var colLeader = hrow
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
            throw "Assignment Time Cannot Be In The Future."
        }
        var user = SharedFunctions.getUser();
        var lastAction = getLastMemberStatus(logSheetId, memberName);
        var lastDate = new Date(lastAction[4]);
        console.log("Last member Action: " + lastAction);
        if (dtg <= lastDate) {
            throw "A Newer Assignment Already Exisits."
        }
        var nameArray = memberName.split(", ");
        if (nameArray[1] == undefined) {
            nameArray[1] = "";
        }
        if (memberTeam == "" || memberTeam == undefined){
        leader = false;
        }
        var notes = "";
         if (memberTeam == "" & memberSpot != "") {
            memberTeam = 'T'+memberSpot.split(" ").splice(-1)[0];
            leader = true;
            notes += "Assigned SPOT Beacon " + memberSpot + " but member was not in a team. Created "+ memberTeam +" and assigned the member as team leader. ";
            var newTeam = true;
        }
        sheet.getRange((sheetLastRow + 1), (colLastName + 1)).setValue(nameArray[0]);
        sheet.getRange((sheetLastRow + 1), (colFirstName + 1)).setValue(nameArray[1]);
        sheet.getRange((sheetLastRow + 1), (colStartTime + 1)).setValue(dtg);
        sheet.getRange((sheetLastRow + 1), (colTeam + 1)).setValue(memberTeam);
        sheet.getRange((sheetLastRow + 1), (colSpot + 1)).setValue(memberSpot);
        sheet.getRange((sheetLastRow + 1), (colUser + 1)).setValue(user);
        sheet.getRange((sheetLastRow + 1), (colLeader + 1)).setValue(leader);



        var oldTeam;
        var oldSpot;
        var oldLeader = lastRecord[4];
        console.log("oldLeader: "+oldLeader)
        if (lastRecord[1] == "" || lastRecord[1] == "undefined") oldTeam = "";
        else oldTeam = lastRecord[1];
        if (lastRecord[2] == "" || lastRecord[2] == "undefined") oldSpot = "";
        else oldSpot = lastRecord[2];
        
        if (oldTeam != memberTeam && oldTeam == "" && newTeam != true) {
            notes += "Assigned to " + memberTeam + ". ";
        }
        if (oldTeam != memberTeam && memberTeam != "" && oldTeam != "") {
            notes += "Changed from " + oldTeam + " to " + memberTeam + ". ";
        }
        if (oldTeam != memberTeam && memberTeam == "") {
            notes += "Removed from " + oldTeam + ". ";
        }
       
        if (oldLeader != true && leader == true && newTeam != true) {
            notes += "Promoted to " + memberTeam + " leader postion. ";
        }
        if (oldLeader == "true" && leader != true) {
            notes += "Removed from "  + memberTeam + " leader postion. " ;       
        }
        if (oldSpot != memberSpot && memberSpot != "" && oldSpot == "" && newTeam != true) {
            notes += "Assigned SPOT Beacon " + memberSpot + ". ";
        }
        if (oldSpot != memberSpot && memberSpot != "" && oldSpot != "") {
            notes += "SPOT Beacon assignment changed from " + oldSpot + " to " + memberSpot + ". ";
        }
        if (oldSpot != memberSpot && memberSpot == "") {
            notes += "SPOT Beacon " + oldSpot + " assignment removed from member. ";
        }
notes += "Updated at " + dtg + " by " + user +".";
        sheet.getRange((sheetLastRow + 1), (colNotes + 1)).setValue(notes);
        //trigger a update of the mapper incase this is a back date assignment.
        syncSpotData();
        span.addEvent('Member updated successfully', {memberName: memberName});
        OpenTelemetryGASExporter.endSpan(span);
        return [true, memberName];
    } catch (error) {
        span.setAttribute('error', true);
        span.addEvent('Error updating member', {error: error.toString()});
        OpenTelemetryGASExporter.endSpan(span);
        console.log("Update Error: " + error);
        return [false, error.toString()];
    }
}