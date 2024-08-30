/**
 * Generates a detailed roster report for a specific incident from various data sources.
 * This function pulls data from Google Sheets to populate a Google Doc report template.
 * It handles daily reports for the duration of the incident, formats the document, and manages report versioning.
 *
 * @param {string} incidentFolderId - The ID of the Google Drive folder where the incident reports are managed.
 * @returns {[boolean, string]} An array where the first element is a success flag (true/false)
 *                              and the second element is the URL of the new report or an error message.
 */
function generateRosterReport(incidentFolderId) {
    try {
        // THIS IS FOR TS
        console.log("alive");
        var ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
        var sheet = ss.getSheetByName("IMS Incident Log");
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
        var sheetDataLen = sheetData.length;
        for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "INCIDENT_FOLDER_ID") {
                var colIncidentFolderId = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "INCIDENT_NAME") {
                var colIncidentName = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "INCIDENT_NUMBER") {
                var colIncidentNumber = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "INCIDENT_START_DATE") {
                var colIncidentStartDate = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "INCIDENT_END_DATE") {
                var colIncidentEndDate = hrow;
                continue;
            }
            if (sheetHeaders[0][hrow] == "INCIDENT_MEMBER_DATA_ID") {
                var colLogId = hrow;
                continue;
            }
        }
        for (var row = 0; row < sheetDataLen; row++) {
            var incidentName;
            var incidentLog;
            var incidentNumber;
            var incidentStartDate;
            var incidentEndDate;
            if (sheetData[row][colIncidentFolderId] == incidentFolderId) {
                incidentName = sheetData[row][colIncidentName];
                incidentLog = sheetData[row][colLogId];
                incidentNumber = sheetData[row][colIncidentNumber];
                incidentStartDate = sheetData[row][colIncidentStartDate];
                incidentEndDate = sheetData[row][colIncidentEndDate];
                break;
            }
        }
        console.log("alive1");
        var templateFileId = SystemSettings.IMS_TEMPLATES_ROSTER_REPORT_ID;
        var oldReportFileId = checkIfExisitngReport(incidentFolderId, templateFileId);
        if (oldReportFileId == false) {
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        } else {
            DriveApp.getFileById(oldReportFileId).setTrashed(true);
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        }
        var report = createRosterReport(incidentLog, reportFileId, incidentName, incidentNumber, incidentStartDate, incidentEndDate);
        if (report[0] === false) throw report[1];
        return report;
    } catch (error) {
        var msg = [false, error];
        return msg;
    }
}

/**
 * Creates a roster report for a specific incident based on member and incident data.
 * This function coordinates the extraction and formatting of data from multiple sources, 
 * primarily Google Sheets and Google Docs, to generate a detailed roster report in a Google Doc.
 * The report includes volunteer data, assignment schedules, and incident details.
 *
 * @param {string} logId - The ID of the Google Sheet containing log information for the incident.
 * @param {string} reportId - The ID of the Google Document where the report will be compiled.
 * @param {string} incidentName - The name of the incident.
 * @param {string} incidentNumber - The unique number identifying the incident.
 * @param {string} incidentStartDate - The starting date of the incident.
 * @param {string} incidentEndDate - The ending date of the incident.
 * @returns {[boolean, string]} An array where the first element indicates the success (true) or failure (false) 
 *                              of the report generation, and the second element is the URL of the report or an error message.
 */
function createRosterReport(logId, reportId, incidentName, incidentNumber, incidentStartDate, incidentEndDate) {
    try {
        var tz = Session.getScriptTimeZone();
        // LOAD THE VOLUNTEER ROSTER    
        var volSs = SpreadsheetApp.openById(SystemSettings.MEMBER_ROSTER_SHEET_ID);
        var volSheet = volSs.getSheets()[0];
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
                var volLastNameCol = [hrow];
            }
            if (volSheetHeaders[0][hrow] == "First Name") {
                var volFirstNameCol = [hrow];
            }
            if (volSheetHeaders[0][hrow] == "Address") {
                var volStreetCol = [hrow];
            }
            if (volSheetHeaders[0][hrow] == "City") {
                var volCityCol = [hrow];
            }
            if (volSheetHeaders[0][hrow] == "State") {
                var volStateCol = [hrow];
            }
            if (volSheetHeaders[0][hrow] == "Zip") {
                var volZipCol = [hrow];
            }
            if (volSheetHeaders[0][hrow] == "Mobile Phone") {
                var volMobilePhoneCol = [hrow];
            }
            if (volSheetHeaders[0][hrow] == "Home Phone") {
                var volHomePhoneCol = [hrow];
            }
            if (volSheetHeaders[0][hrow] == "Work Phone") {
                var volWorkPhoneCol = [hrow];
            }
        }
        console.log("Loaded Sheet Data");
        //LOAD THE ASSIGNMENT DATA  
        var ss = SpreadsheetApp.openById(logId);
        var sheet = ss.getSheets()[0];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
        sheetData = sheetData.sort(function(a, b) {
            a = new Date(a[5]);
            b = new Date(b[5]);
            return a > b ? -1 : a < b ? 1 : 0;
        });
        // console.log("sheetData sorted: "+sheetData)
        var sheetDataLen = sheetData.length;
        for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "Last Name") {
                var colLastName = hrow;
            }
            if (sheetHeaders[0][hrow] == "First Name") {
                var colFirstName = hrow;
            }
            if (sheetHeaders[0][hrow] == "Start") {
                var colStart = hrow;
            }
            if (sheetHeaders[0][hrow] == "End") {
                var colEnd = hrow;
            }
        }
        var doc = DocumentApp.openById(reportId);
        if (sheetLastRow == 1) {
            var currentDay = new Date(incidentStartDate);
            var iDay = 0;
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
            var par1 = body.appendParagraph('No members were checked in during this incident.');
            par1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
            var url = DriveApp.getFileById(reportId).getUrl();
            var msg = [true, url];
            return msg;
        }
        // console.log("incidentEndDate:" + incidentEndDate)
        if (incidentEndDate === undefined || incidentEndDate === "") {
            incidentEndDate = new Date();
        }
        var incidentLength = datesDiff(incidentStartDate, incidentEndDate);
        console.log("incidentLength:" + incidentLength);
        var memberList = [];
        for (var i = 0; i < sheetDataLen; i++) {
            memberList.push([sheetData[i][colLastName], sheetData[i][colFirstName]]);
        }
        //console.log("memberList Before Filter: " + memberList);
        var memberList = multiDimensionalUnique(memberList);
        //console.log("memberList After Filter: " + memberList);
        var memberListLen = memberList.length;
        for (iDay = 0; iDay < incidentLength; iDay++) {
            console.log("Start Day: " + iDay);
            var currentDay = new Date(incidentStartDate);
            currentDay.setDate(currentDay.getDate() + iDay);
            var nextDay = new Date(currentDay);
            nextDay.setDate(nextDay.getDate() + 1);
            console.log("Cur Day: " + currentDay);
            console.log("Nex Day: " + nextDay);
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
            var rosterData = [];
            console.log("alive - page 1 header");
            var startDate;
            var endDate;
            var startHours;
            var startMinutes;
            var endHours;
            var endMinutes;
            var startTime;
            var endTime;
            var t;
            var tm;
            var elapsedTime;
            //console.log("sheetData: "+sheetData);
            for (var m = 0; m < memberListLen; m++) {
                var memStartDate = "";
                var memEndDate = "";
                var memLastName = memberList[m][0];
                var memFirstName = memberList[m][1];
                for (var v = 0; v < volSheetDataLen; v++) {
                    var volLastName = "";
                    var volFirstName = "";
                    var volLastName = volSheetData[v][volLastNameCol];
                    var volFirstName = volSheetData[v][volFirstNameCol];
                    if (memLastName != undefined && volLastName.toString() != memLastName.toString() || volFirstName.toString() != memFirstName.toString()) continue;
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
                    var volStreet = volSheetData[v][volStreetCol];
                    var volCity = volSheetData[v][volCityCol];
                    var volState = volSheetData[v][volStateCol];
                    var volZip = volSheetData[v][volZipCol];
                    var volMobilePhone = volSheetData[v][volMobilePhoneCol];
                    var volHomePhone = volSheetData[v][volHomePhoneCol];
                    var volWorkPhone = volSheetData[v][volWorkPhoneCol];
                    //console.log("Roster Last Name Row: "+volLastName)
                    //console.log("Roster First Name Row: "+volFirstName)
                    if (volStreet != "" && volCity != "" && volState != "" && volZip != "") {
                        volAddress = volStreet + " "+ String.fromCharCode(10) + volCity + ", " + volState + "  " + volZip;
                    }
                    if (volMobilePhone != "") {
                        volPhone = volMobilePhone;
                    } else if (volHomePhone != "") {
                        volPhone = volHomePhone;
                    } else if (volWorkPhone != "") {
                        volPhone = volWorkPhone;
                    }
                }
                volPhone = volPhone.toString();
                //console.log(memLastName);
                //THE ASSIGNMENT LIST IS SORTED BY START DATE SO MOST RECENT DATE IS FIRST!
                for (var i = 0; i < sheetDataLen; i++) {
                    //  console.log("Assignment Log Search i=: " + i)
                    var assignLastName = sheetData[i][colLastName];
                    var assignFirstName = sheetData[i][colFirstName];
                    var assignStartDate = sheetData[i][colStart];
                    var assignEndDate = sheetData[i][colEnd];
                    //  console.log("assignStart: " + assignStartDate);
                    //console.log("assignEnd: " + assignEndDate);
                    //Ignore Stby Rows
                    if (assignStartDate == "" || assignStartDate === undefined || assignStartDate === null) continue;
                    assignStartDate = new Date(sheetData[i][colStart]);
                    //Ignore row if not selected member
                    if (memLastName != assignLastName && memFirstName != assignFirstName) continue;
                    if (assignEndDate != "") assignEndDate = new Date(assignEndDate);
                    if (assignEndDate != "" && assignEndDate < currentDay) break;
                    if (assignEndDate != "" && memEndDate == "") {
                        memEndDate = assignEndDate;
                    } else if (assignEndDate != "" && memEndDate != "" && memStartDate != "") {
                        if (memStartDate >= nextDay) {
                            memStartDate = "";
                            memEndDate = assignEndDate;
                            continue;
                        }
                        if (memStartDate < currentDay) memStartDate = currentDay;
                        startDate = memStartDate;
                        endDate = memEndDate;
                        startHours = addZero(startDate.getHours());
                        startMinutes = addZero(startDate.getMinutes());
                        endHours = addZero(endDate.getHours());
                        endMinutes = addZero(endDate.getMinutes());
                        startTime = startHours + ":" + startMinutes;
                        endTime = endHours + ":" + endMinutes;
                        t = elapsedTimeCalc(startDate, endDate);
                        tm = t.minutes;
                        tm = Number(tm);
                        tm = tm.toFixed(0);
                        tm = tm.toString();
                        tm = tm.padStart(2, "0");
                        th = t.hours;
                        th = Number(th);
                        th = th.toFixed(0);
                        th = th.toString();
                        th = th.padStart(2, "0");                        
 if (th == "00"){elapsedTime = tm + " Mins";}else                        
{                        elapsedTime = th + " Hours " + tm + " Mins";
}                        rosterData.push([(memLastName + ", " + memFirstName), volAddress, volPhone, startTime, endTime, elapsedTime]);
                        console.log("Exec Option 2 Start :" + memStartDate + " End: " + memEndDate + " current: " + currentDay);
                        console.log("Opt 2 Push" + [memLastName, memFirstName, volAddress, volPhone, startTime, endTime, elapsedTime]);
                        memStartDate = "";
                        memEndDate = assignEndDate;
                    } else {
                        memStartDate = assignStartDate;
                    }
                    // This will need to then figure out somthing about setitng end date to 2359 or now if mbr if end date exceeds iday
                    //this needs some sort of logic to find the ariest start date before the next end date
                }
                //console.log("memStartDate: " + memStartDate);
                //console.log("memEndDate: " + memEndDate);
                console.log("memLastName: " + memLastName);
                console.log("memStartDate: " + memStartDate);
                console.log("memEndDate: " + memEndDate);
                console.log("currentDay: " + currentDay);
                //problem with day 2 non checked out
                if (memEndDate == "" && memStartDate != "" && memStartDate < nextDay) {
                    memEndDate = currentDay;
                    console.log("memEndDate1: " + memEndDate);
                    memEndDate = new Date(memEndDate).setHours(23, 59, 59);
                    memEndDate = new Date(memEndDate);
                    console.log("memEndDate2: " + memEndDate);
                    if (memEndDate > new Date()) memEndDate = new Date();
                }
                if (memStartDate != "" && memStartDate < currentDay) memStartDate = currentDay;
                console.log("final memStartDate: " + memStartDate);
                console.log("final memEndDate: " + memEndDate);
                if (memStartDate != "" && memEndDate > currentDay) {
                    startDate = memStartDate;
                    endDate = memEndDate;
                    startHours = addZero(startDate.getHours());
                    startMinutes = addZero(startDate.getMinutes());
                    endHours = addZero(endDate.getHours());
                    endMinutes = addZero(endDate.getMinutes());
                    startTime = startHours + ":" + startMinutes;
                    endTime = endHours + ":" + endMinutes;
                        t = elapsedTimeCalc(startDate, endDate);
                        tm = t.minutes;
                        tm = Number(tm);
                        tm = tm.toFixed(0);
                        tm = tm.toString();
                        tm = tm.padStart(2, "0");
                        th = t.hours;
                        th = Number(th);
                        th = th.toFixed(0);
                        th = th.toString();
                        th = th.padStart(2, "0");
                        if (th == "00"){elapsedTime = tm + " Mins";}else                        
{                        elapsedTime = th + " Hours " + tm + " Mins";
}                    console.log("Exec Regular Start :" + memStartDate + " End: " + memEndDate + " current: " + currentDay);
                    rosterData.push([(memLastName + ", " + memFirstName), volAddress, volPhone, startTime, endTime, elapsedTime]);
                    console.log("Regular Push" + [memLastName, memFirstName, volAddress, volPhone, startTime, endTime, elapsedTime]);
                }
            }



            console.log("done with memlist: " + rosterData);
            var rosterLen = rosterData.length;
            //   console.ldataLenog("dataLen: " +dataLen)
            var style = {};
            style[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.CENTER;
            style[DocumentApp.Attribute.VERTICAL_ALIGNMENT] = DocumentApp.VerticalAlignment.CENTER;
            style[DocumentApp.Attribute.FONT_SIZE] = 10;
            var body = doc.getBody();

console.log("rosterData bef: "+rosterData);
                        rosterData = rosterData.sort(rosterSortFunction);
console.log("rosterData aft: "+rosterData);

                        function rosterSortFunction(a, b) {

  var o1 = a[0];
  var o2 = b[0];
console.log(a[3])
  var p1 = new Date("7/3/2006 "+a[3]);
  var p2 = new Date ("7/3/2006 "+b[3]);
console.log(p2)
  if (o1 < o2) return -1;
  if (o1 > o2) return 1;
  if (p1 < p2) return -1;
  if (p1 > p2) return 1;
  return 0;
}

            if (rosterLen > 0) {
                var t = body.appendTable([
                    ['Name', 'Address', 'Phone', 'Time In', 'Time Out', 'Duration']
                ]);
                console.log("aliveTable1");
                t.setColumnWidth(0, 108);
                t.setColumnWidth(1, 126);
                t.setColumnWidth(2, 72);
                t.setColumnWidth(3, 54);
                t.setColumnWidth(4, 54);
                t.setColumnWidth(5, 54);
                t.setBorderColor("#AEAAAA");
                t.setBorderWidth(.5);
                //tableLen must = num header colums
                var tableLen = 6
                for (var h = 0; h < tableLen; h++) {
                    var c = t.getCell(0, h);
                    c.setPaddingBottom(4);
                    c.setPaddingTop(4);
                    c.setPaddingLeft(4);
                    c.setPaddingRight(4);
                    c.setBackgroundColor("#DEEAF6");
                    c.setVerticalAlignment(DocumentApp.VerticalAlignment.CENTER);
                    var par = c.getChild(0).asParagraph();
                    par.setAttributes(style);
                    par.setBold(true);
                }
                console.log("aliveTable2");
                for (var m = 0; m < rosterLen; m++) {
                    console.log("aliveTable3");
                    var r = t.appendTableRow();
                    console.log("aliveTable4: " + rosterData[m]);
                    console.log("rosterData[m].length: " + rosterData[m].length);
                    for (var dr = 0; dr < rosterData[m].length; dr++) {
                        console.log("aliveTable4a: " + rosterData[m][dr]);
                        if (m>0 && dr == 0 && rosterData[m][dr] == rosterData[m-1][dr]) {
                          var c = r.appendTableCell('"');
                                                  var par = c.getChild(0).asParagraph();
                                                  par.setAttributes(style);
                        c.setBold(false);
                        c.setPaddingBottom(2);
                        c.setPaddingTop(2);
                        c.setPaddingLeft(2);
                        c.setPaddingRight(2);
                        c.setVerticalAlignment(DocumentApp.VerticalAlignment.CENTER);
                          var c = r.appendTableCell('"');
                                                  var par = c.getChild(0).asParagraph();
                                                  par.setAttributes(style);
                        c.setBold(false);
                        c.setPaddingBottom(2);
                        c.setPaddingTop(2);
                        c.setPaddingLeft(2);
                        c.setPaddingRight(2);
                        c.setVerticalAlignment(DocumentApp.VerticalAlignment.CENTER);
                          var c = r.appendTableCell('"');
                          dr++
                          dr++
                          } else{                        
  var c = r.appendTableCell(rosterData[m][dr]);
}                        var par = c.getChild(0).asParagraph();
                        par.setAttributes(style);
                        c.setBold(false);
                        c.setPaddingBottom(2);
                        c.setPaddingTop(2);
                        c.setPaddingLeft(2);
                        c.setPaddingRight(2);
                        c.setVerticalAlignment(DocumentApp.VerticalAlignment.CENTER);
                        if (dr == 1) {
                            par.setAlignment(DocumentApp.HorizontalAlignment.LEFT);
                        }
                    }
                }
            } else {
                body.appendParagraph('');
                var par1 = body.appendParagraph('No members were checked in on ' + currentDate + '.');
                par1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
            }
            var templateFileId = SystemSettings.IMS_TEMPLATES_ROSTER_REPORT_ID;
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
            }
            console.log("Completed Day: " + iDay);
        }
        var url = DriveApp.getFileById(reportId).getUrl();
        var msg = [true, url];
        return msg;
    } catch (error) {
        console.log(error);
        var msg = [false, error.toString()];
        return msg;
    }
}