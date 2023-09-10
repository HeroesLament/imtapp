function generateAssignmentReport(incidentFolderId) {
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
        var templateFileId = SystemSettings.IMS_TEMPLATES_ASSIGNMENT_REPORT_ID
        var oldReportFileId = checkIfExisitngReport(incidentFolderId, templateFileId);
        if (oldReportFileId == false) {
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        } else {
            DriveApp.getFileById(oldReportFileId).setTrashed(true);
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        }
              //console.log("live0");

        var report = createTeamReport(incidentAssignmentLog, reportFileId, incidentName, incidentNumber, incidentStartDate, incidentEndDate);
        if (report[0] === false) throw report[1];
        return report;
    } catch (error) {
        var msg = [false, error];
        return msg;
    }
}

function createTeamReport(incidentAssignmentLog, reportId, incidentName, incidentNumber, incidentStartDate, incidentEndDate) {
    try {
      //console.log("live1");
        var tz = Session.getScriptTimeZone();
        var ss = SpreadsheetApp.openById(incidentAssignmentLog);
        var sheet = ss.getSheets()[0];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "Last Name") {
                var colLastName = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "First Name") {
                var colFirstName = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "Start") {
                var colStart = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "End") {
                var colEnd = hrow;
                continue;
           }
            if (sheetHeaders[0][hrow] == "Team") {
                var colTeam = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "SPOT") {
                var colBeacon = hrow;
                continue;

            }
            if (sheetHeaders[0][hrow] == "Team Leader") {
                var colLeader = hrow;
                continue;
            }
        }
        
        var doc = DocumentApp.openById(reportId);
        if (sheetLastRow == 1) {
            var currentDay = new Date(incidentStartDate);
            var iDay = 0
            var currentDate = Utilities.formatDate(new Date(currentDay), tz, "MMMM dd, yyyy");
            SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NAME%", incidentName);
            if (incidentNumber != "") {
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", ' (' + incidentNumber + ')');
            } else {
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", '');
            }
            SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_DATE%", currentDate + " (Day: " + (iDay + 1) + ")");
            var body = doc.getBody();
            body.appendParagraph('');
            var par1 = body.appendParagraph('No assignments were made for this incident.');
            par1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
                           var url = DriveApp.getFileById(reportId).getUrl();
        var msg = [true, url];
            return msg;
        }
        var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
        var sheetData = sheetData.sort(sortFunctionAssignByDate);
        var sheetDataLen = sheetData.length;
        var doc = DocumentApp.openById(reportId);
        //console.log("incidentEndDate:" + incidentEndDate);
        if (incidentEndDate === undefined || incidentEndDate === "") {
            incidentEndDate = new Date();
        }
        var incidentLength = datesDiff(incidentStartDate, incidentEndDate);
        //console.log("incidentLength:" + incidentLength);
        var staffPostions = getIMTPositions();
        for (var iDay = 0; iDay < incidentLength; iDay++) {
            //console.log("Start Day: " + iDay);
            var currentDay = new Date(incidentStartDate);
            currentDay.setDate(currentDay.getDate() + iDay);
            var nextDay = new Date(currentDay);
            nextDay.setDate(nextDay.getDate() + 1);
            var currentDate = Utilities.formatDate(new Date(currentDay), tz, "MMMM dd, yyyy");
            SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_DATE%", currentDate + " (Day: " + (iDay + 1) + ")");
            // Fetch variable names
            // they are column names in the spreadsheet
            ///TMAYHBE TEMP FOR INCIDENT DAY
            //Logger.log("Processing columns:" + header);
            //this will be used in order to loop the dates for creation of reports
            //Header Fields are Taged with :Tag: so they don't repeate in the template duplication
            SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NAME%", incidentName);
            if (incidentNumber != "") {
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", ' (' + incidentNumber + ')');
            } else {
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", '');
            }
            var entryDescriptionStyle = {};
            entryDescriptionStyle[DocumentApp.Attribute.INDENT_FIRST_LINE] = 40;
            entryDescriptionStyle[DocumentApp.Attribute.INDENT_START] = 40;
            var teams = [];
            //console.log("Teams Start " + teams);
            for (var row = 0; row < sheetDataLen; row++) {
                var dataStartDate = new Date(sheetData[row][colStart]);
                var dataEndDate = new Date(sheetData[row][colEnd]);
                //console.log("dataStartDate: " + dataStartDate);
                //console.log("dataEndDate: " + dataEndDate);
                if (sheetData[row][colTeam] != "" && dataStartDate < nextDay) {
                    teams.push(sheetData[row][colTeam])
                }
            }
            //console.log("For Date: " + currentDay + " " + nextDay + " Teams: " + teams);
            //console.log("Team List: " + teams);
            // usage example:
            //Get Team List Here
            var body = doc.getBody();
            teams = teams.filter(onlyUnique); // returns ['a', 1, 2, '1']
            teams = teams.sort();
            //console.log("Post Filter teams: " + teams);
            var teamDataLen = teams.length;
            var imtStaff = [];
            var membersAssigned = [];
            var memberCount = 0;
            for (var t = 0; t < teamDataLen; t++) {
                var team = teams[t] || ""; // No Javascript undefined
                //console.log("Starting Section for team: "+team);
                var membersTeam = []
                //Assumes row 1 is headers
                for (var row = 0; row < sheetDataLen; row++) {
                    //console.log("Considering Row: "+row);
                    var dataStartDate = new Date(sheetData[row][colStart]);
                    var dataEndDate = new Date(sheetData[row][colEnd]);
                    //Skip Row If No Team Info
                    if (sheetData[row][colTeam] != teams[t] || dataEndDate < currentDay || dataStartDate > nextDay || dataStartDate == "Invalid Date") continue;
                    memberCount++;
                    var staffPostionsKey = [];
                    for (var i = 0; i < staffPostions.length; i++) {
                        staffPostionsKey.push(staffPostions[i][0].toString())
                    }
                    var imtStaffStatus = staffPostionsKey.indexOf(teams[t].toString());
                    if (imtStaffStatus != -1) {
                        imtStaff.push([sheetData[row][colLastName] + ", " + sheetData[row][colFirstName], staffPostions[imtStaffStatus][1]]);
                    } else {
                        if (sheetData[row][colLeader] == true) {
                            membersTeam.push(sheetData[row][colLastName] + ", " + sheetData[row][colFirstName] + " (Leader)");
                        } else {
                            membersTeam.push(sheetData[row][colLastName] + ", " + sheetData[row][colFirstName]);
                        }
                    }
                    membersAssigned.push(sheetData[row][colLastName] + ", " + sheetData[row][colFirstName]);
                }
                membersTeam = membersTeam.filter(onlyUnique); // returns ['a', 1, 2, '1']
                membersTeam = membersTeam.sort();
                var membersTeamLen = membersTeam.length;
                if (membersTeamLen > 0) {
                    var ta = body.appendTable();
                    ta.setBorderWidth(0);
                    var r = ta.appendTableRow();
                    var c = r.appendTableCell(teams[t]);
                    c.setBold(true);
                    c.setPaddingBottom(4);
                    c.setPaddingTop(4);
                    c.setPaddingLeft(4);
                    c.setPaddingRight(4);
                    c.setBackgroundColor("#CDCDCD")
                    var par1 = c.getChild(0).asParagraph();
                    par1.setLineSpacing(0);
                    par1.setSpacingBefore(0);
                    par1.setSpacingAfter(0);
                    c = r.appendTableCell();
                    c.setPaddingBottom(0);
                    c.setPaddingTop(0);
                    c.setPaddingLeft(0);
                    c.setPaddingRight(0);
                    c = r.appendTableCell();
                    c.setPaddingBottom(0);
                    c.setPaddingTop(0);
                    c.setPaddingLeft(0);
                    c.setPaddingRight(0);
                    r = ta.appendTableRow();
                    var cellNr = 0;
                    for (var m = 0; m < membersTeamLen; m++) {
                        if (cellNr > 2) {
                            r = ta.appendTableRow();
                            cellNr = 0;
                        }
                        var c = r.appendTableCell(membersTeam[m]);
                        cellNr++
                        c.setBold(false);
                        c.setPaddingBottom(4);
                        c.setPaddingTop(4);
                        c.setPaddingLeft(4);
                        c.setPaddingRight(4);
                        var par1 = c.getChild(0).asParagraph();
                        par1.setLineSpacing(0);
                        par1.setSpacingBefore(0);
                        par1.setSpacingAfter(0);
                    }
                }
            }
            //console.log("All assigned members: " + membersAssigned);
            //Run for no team assignment 
            var noTeamCount = 0;
            var membersUnassigned = []
            membersAssigned = membersAssigned.filter(onlyUnique); // returns ['a', 1, 2, '1']
            for (var row = 0; row < sheetDataLen; row++) {
                //console.log("Considering Row: "+row);
                var dataStartDate = new Date(sheetData[row][colStart]);
                var dataEndDate = new Date(sheetData[row][colEnd]);
                //Skip Row If No Team Info
                if (sheetData[row][colTeam].toString() != "" || dataEndDate < currentDay || dataStartDate > nextDay || dataStartDate == "Invalid Date") continue;
                noTeamCount++;
                membersUnassigned.push(sheetData[row][colLastName] + ", " + sheetData[row][colFirstName]);
            }
            var membersUnassigned = membersUnassigned.filter(onlyUnique); // returns ['a', 1, 2, '1']
            var membersAssigned = membersAssigned.filter(onlyUnique); // returns ['a', 1, 2, '1']
            var membersNeverAssigned = []
            var membersAssignedLen = membersAssigned.length;
            var membersUnassignedLen = membersUnassigned.length;
            for (var i = 0; i < membersUnassignedLen; i++) {
                var unassignendMember = 0
                for (var d = 0; d < membersAssignedLen; d++) {
                    if (membersUnassigned[i].toString() == membersAssigned[d].toString()) {
                        unassignendMember++;
                        break;
                    }
                }
                if (unassignendMember == 0) {
                    //console.log(membersUnassigned[i]+" has never been assigned to a team")
                    membersNeverAssigned.push(membersUnassigned[i]);
                }
            }
            membersNeverAssigned = membersNeverAssigned.filter(onlyUnique); // returns ['a', 1, 2, '1']
            membersNeverAssigned = membersNeverAssigned.sort();
            var membersNeverAssignedLen = membersNeverAssigned.length;
            if (membersNeverAssignedLen > 0) {
                var ta = body.appendTable();
                ta.setBorderWidth(0);
                var r = ta.appendTableRow();
                var c = r.appendTableCell("Manpower");
                c.setBold(true);
                c.setPaddingBottom(4);
                c.setPaddingTop(4);
                c.setPaddingLeft(4);
                c.setPaddingRight(4);
                c.setBackgroundColor("#CDCDCD")
                var par1 = c.getChild(0).asParagraph();
                par1.setLineSpacing(0);
                par1.setSpacingBefore(0);
                par1.setSpacingAfter(0);
                c = r.appendTableCell();
                c.setPaddingBottom(0);
                c.setPaddingTop(0);
                c.setPaddingLeft(0);
                c.setPaddingRight(0);
                c = r.appendTableCell();
                c.setPaddingBottom(0);
                c.setPaddingTop(0);
                c.setPaddingLeft(0);
                c.setPaddingRight(0);
                r = ta.appendTableRow();
                var cellNr = 0;
                for (var i = 0; i < membersNeverAssignedLen; i++) {
                    if (cellNr > 2) {
                        var r = ta.appendTableRow();
                        cellNr = 0;
                    }
                    var c = r.appendTableCell(membersNeverAssigned[i]);
                    cellNr++
                    c.setBold(false);
                    c.setPaddingBottom(4);
                    c.setPaddingTop(4);
                    c.setPaddingLeft(4);
                    c.setPaddingRight(4);
                    var par1 = c.getChild(0).asParagraph();
                    par1.setLineSpacing(0);
                    par1.setSpacingBefore(0);
                    par1.setSpacingAfter(0);
                }
            }
            var imtStaffLen = imtStaff.length;
            //console.log("imtStaffLen: " + imtStaffLen);
            if (imtStaffLen > 0) {
                imtStaff = imtStaff.sort();
                var ta = body.appendTable();
                ta.setBorderWidth(0);
                var r = ta.appendTableRow();
                var c = r.appendTableCell("IMT Staff");
                c.setBold(true);
                c.setPaddingBottom(4);
                c.setPaddingTop(4);
                c.setPaddingLeft(4);
                c.setPaddingRight(4);
                c.setBackgroundColor("#CDCDCD")
                var par1 = c.getChild(0).asParagraph();
                par1.setLineSpacing(0);
                par1.setSpacingBefore(0);
                par1.setSpacingAfter(0);
                c = r.appendTableCell();
                c.setPaddingBottom(0);
                c.setPaddingTop(0);
                c.setPaddingLeft(0);
                c.setPaddingRight(0);
                c = r.appendTableCell();
                c.setPaddingBottom(0);
                c.setPaddingTop(0);
                c.setPaddingLeft(0);
                c.setPaddingRight(0);
                r = ta.appendTableRow();
                var cellNr = 0;
                for (var i = 0; i < imtStaffLen; i++) {
                    if (cellNr > 2) {
                        var r = ta.appendTableRow();
                        cellNr = 0;
                    }
                    var c = r.appendTableCell(imtStaff[i][0] + "\n(" + imtStaff[i][1] + ")");
                    cellNr++
                    c.setBold(false);
                    c.setPaddingBottom(4);
                    c.setPaddingTop(4);
                    c.setPaddingLeft(4);
                    c.setPaddingRight(4);
                    var par1 = c.getChild(0).asParagraph();
                    par1.setLineSpacing(0);
                    par1.setSpacingBefore(0);
                    par1.setSpacingAfter(0);
                }
            }
            if (teamDataLen == 0 && membersNeverAssignedLen == 0) {
                body.appendParagraph('');
                var par1 = body.appendParagraph('No assignments were made on ' + currentDate + '.');
                par1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
            }
            var templateFileId = SystemSettings.IMS_TEMPLATES_ASSIGNMENT_REPORT_ID;
            if (iDay != (incidentLength - 1)) {
                body.appendPageBreak();
                doc.getActiveSection();
                var otherBody = DocumentApp.openById(templateFileId).getActiveSection();
                var totalElements = otherBody.getNumChildren();
                for (var j = 0; j < totalElements; ++j) {
                    var element = otherBody.getChild(j).copy();
                    var type = element.getType();
                    if (type == DocumentApp.ElementType.PARAGRAPH) body.appendParagraph(element);
                    else if (type == DocumentApp.ElementType.TABLE) body.appendTable(element);
                    else if (type == DocumentApp.ElementType.LIST_ITEM) body.appendListItem(element);
                    else throw new Error("According to the doc this type couldn't appear in the body: " + type);
                }
            };
            //console.log("Completed Day: " + iDay);
        }
               var url = DriveApp.getFileById(reportId).getUrl();
        var msg = [true, url];
        return msg;
    } catch (error) {
        var msg = [false, error];
        return msg;
    }
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
            var colDescription = hrow
        };
        if (sheetHeaders[0][hrow] == "ASSIGNMENT_IMT") {
            var colIMT = hrow
        };
    }
    if (sheetLastRow == 1) return positionList;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    sheetData.sort();
    var sheetDataLen = sheetData.length;
    for (var i = 0; i < sheetDataLen; i++) {
        if (sheetData[i][colIMT] == true) {
            positionList.push([sheetData[i][colName], sheetData[i][colDescription]])
        }
    }
    return positionList
}