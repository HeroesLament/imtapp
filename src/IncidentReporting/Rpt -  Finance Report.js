//Direct Expenses
//Donations
//Est KVRS Asset Expenses
//EST Private/Other Gov Exp
//Est Manpower Costs 
function generateFinanceReport(incidentFolderId) {
    try {
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
            if (sheetHeaders[0][hrow] == "INCIDENT_EXPENSE_DATA_ID") {
                var colExpenseLogId = hrow;
                continue;
            };
            if (sheetHeaders[0][hrow] == "INCIDENT_MEMBER_DATA_ID") {
                var colMemberLogId = hrow;
                continue;
            };
            if (sheetHeaders[0][hrow] == "INCIDENT_ASSET_DATA_ID") {
                var colAssetLogId = hrow;
                continue;
            };
        }
        for (var row = 0; row < sheetDataLen; row++) {
            var incidentName;
            var expenseLogId;
            var memberLogId;
            var assetLogId;
            var incidentNumber;
            var incidentStartDate;
            var incidentEndDate;
            if (sheetData[row][colIncidentFolderId] == incidentFolderId) {
                incidentName = sheetData[row][colIncidentName];
                expenseLogId = sheetData[row][colExpenseLogId];
                memberLogId = sheetData[row][colMemberLogId];
                assetLogId = sheetData[row][colAssetLogId];
                incidentNumber = sheetData[row][colIncidentNumber];
                incidentStartDate = sheetData[row][colIncidentStartDate];
                incidentEndDate = sheetData[row][colIncidentEndDate];
                break;
            }
        }
        var templateFileId = SystemSettings.IMS_TEMPLATES_FINANCE_REPORT_ID
        var oldReportFileId = checkIfExisitngReport(incidentFolderId, templateFileId);
        if (oldReportFileId == false) {
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        } else {
            DriveApp.getFileById(oldReportFileId).setTrashed(true);
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        }
        var report = createFinanceReport(expenseLogId, memberLogId, assetLogId, reportFileId, incidentName, incidentNumber, incidentStartDate, incidentEndDate);
        if (report[0] === false) throw report[1];
        return report;
    } catch (error) {
        var msg = [false, error];
        return msg;
    }
}

function createFinanceReport(expenseLogId, memberLogId, assetLogId, reportId, incidentName, incidentNumber, incidentStartDate, incidentEndDate) {
    try {

                    //TEMP TERRIF COST
                    var mbrHrRate = 28.54;

        var par;
        var c;
        var r;
        var t;
        var tz = Session.getScriptTimeZone();
        var ss = SpreadsheetApp.openById(expenseLogId);
        var sheet = ss.getSheets()[0];
        var sheetExpLastRow = sheet.getLastRow();
        var sheetExpLastColumn = sheet.getLastColumn();
        if (sheetExpLastRow > 1){
        var expenseHeaders = sheet.getRange(1, 1, 1, sheetExpLastColumn).getValues();
        var expenseHeadersLen = expenseHeaders[0].length;
        for (var hrow = 0; hrow < expenseHeadersLen; hrow++) {
            if (expenseHeaders[0][hrow] == "Date") {
                var colExpDate = hrow;
            }
            if (expenseHeaders[0][hrow] == "Vendor") {
                var colExpVendor = hrow;
            }
            if (expenseHeaders[0][hrow] == "Description") {
                var colExpDescription = hrow;
            }
            if (expenseHeaders[0][hrow] == "Amount") {
                var colExpAmount = hrow;
            }
            if (expenseHeaders[0][hrow] == "File") {
                var colExpFile = hrow;
            }
        }
        
            var expenseData = sheet.getRange(2, 1, (sheetExpLastRow - 1), sheetExpLastColumn).getValues();
            var expenseData = expenseData.sort(sortFunctionAssignByDate);
            var expenseDataLen = expenseData.length;
        }

        var sheet = ss.getSheets()[1];
        var donationLastRow = sheet.getLastRow();
        var donationLastColumn = sheet.getLastColumn();
        if (donationLastRow > 1){
        var donationHeaders = sheet.getRange(1, 1, 1, donationLastColumn).getValues();
        var donationHeadersLen = donationHeaders[0].length;
        for (var hrow = 0; hrow < donationHeadersLen; hrow++) {
            if (donationHeaders[0][hrow] == "Date") {
                var colDonDate = hrow;
            }
            if (donationHeaders[0][hrow] == "Donor") {
                var colDonDonor = hrow;
            }
            if (donationHeaders[0][hrow] == "Description") {
                var colDonDescription = hrow;
            }
            if (donationHeaders[0][hrow] == "Value") {
                var colDonValue = hrow;
            }
            if (donationHeaders[0][hrow] == "File") {
                var colDonFile = hrow;
            }
        }
        
            var donationData = sheet.getRange(2, 1, (donationLastRow - 1), donationLastColumn).getValues();
            var donationData = donationData.sort(sortFunctionAssignByDate);
            var donationDataLen = donationData.length;
        }



        var doc = DocumentApp.openById(reportId);
                var body = doc.getBody();

var headingStyle1 ={};
headingStyle1[DocumentApp.Attribute.HEADING] = DocumentApp.ParagraphHeading.HEADING1
headingStyle1[DocumentApp.Attribute.FONT_SIZE] = 16;
headingStyle1[DocumentApp.Attribute.BOLD] = true;

var headingStyle2 ={};
headingStyle2[DocumentApp.Attribute.HEADING] = DocumentApp.ParagraphHeading.HEADING2
headingStyle2[DocumentApp.Attribute.FONT_SIZE] = 16;
headingStyle2[DocumentApp.Attribute.BOLD] = true;

 var tableStyle = {};
 tableStyle[DocumentApp.Attribute.BORDER_COLOR] = "#AEAAAA";
 tableStyle[DocumentApp.Attribute.BORDER_WIDTH] = .5;

 var tableCellStyle = {};
                tableCellStyle[DocumentApp.Attribute.VERTICAL_ALIGNMENT] = DocumentApp.VerticalAlignment.CENTER;
                tableCellStyle[DocumentApp.Attribute.PADDING_TOP] = 4;
                tableCellStyle[DocumentApp.Attribute.PADDING_BOTTOM] = 4;
                tableCellStyle[DocumentApp.Attribute.PADDING_LEFT] = 4;
                tableCellStyle[DocumentApp.Attribute.PADDING_RIGHT] = 4;

 var tableParStyle = {};
                tableParStyle[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.CENTER;
                tableParStyle[DocumentApp.Attribute.FONT_SIZE] = 11;
                tableParStyle[DocumentApp.Attribute.SPACING_BEFORE] = 0;
                tableParStyle[DocumentApp.Attribute.SPACING_AFTER] = 0;
                tableParStyle[DocumentApp.Attribute.LINE_SPACING] = 1;

var normalStyle = {};
            normalStyle[DocumentApp.Attribute.HEADING] = DocumentApp.ParagraphHeading.NORMAL
            normalStyle[DocumentApp.Attribute.BOLD] = false;
            normalStyle[DocumentApp.Attribute.FONT_SIZE] = 11;

            // console.log("incidentEndDate:" + incidentEndDate);
            if (incidentEndDate === undefined || incidentEndDate === "") {
                incidentEndDate = new Date();
            }
            var incidentLength = datesDiff(incidentStartDate, incidentEndDate);
            //  console.log("incidentLength:" + incidentLength);
            var totalDirectCost = 0;
            var totalIndirectCost = 0;
            var mbrTotalCost = 0;
            var mbrTotalHours = 0;
            for (var iDay = 0; iDay < incidentLength; iDay++) {
                var dailyDirectCost = 0;
                var dailyIndirectCost = 0;
                //console.log("Start Day: " + iDay);
                var currentDay = new Date(incidentStartDate);
                currentDay.setDate(currentDay.getDate() + iDay);
                var nextDay = new Date(currentDay);
                nextDay.setDate(nextDay.getDate() + 1);
                var currentDate = Utilities.formatDate(new Date(currentDay), tz, "MMMM dd, yyyy");
                var incidentStartDay = Utilities.formatDate(new Date(incidentStartDate), tz, "MMMM dd, yyyy");
                var incidentEndDay = Utilities.formatDate(new Date(incidentEndDate), tz, "MMMM dd, yyyy");
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_DATE%", currentDate + " (Day: " + (iDay + 1) + ")");
                SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NAME%", incidentName);
                if (incidentNumber != "") {
                    SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", ' (' + incidentNumber + ')');
                } else {
                    SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", '');
                }
                par = body.appendParagraph('Direct Expenses');
                par.setAttributes(headingStyle2);


                var entryDescriptionStyle = {};
                entryDescriptionStyle[DocumentApp.Attribute.INDENT_FIRST_LINE] = 40;
                entryDescriptionStyle[DocumentApp.Attribute.INDENT_START] = 40;
                var billableData = [];
                var donorData = [];

                        if (sheetExpLastRow == 1) {

            par = body.appendParagraph('No direct expenses were incurred for this incident.');
            par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        }
        else{

                for (var row = 0; row < expenseDataLen; row++) {
                    var dataDate = new Date(expenseData[row][colExpDate]);
                    var dataAmount = expenseData[row][colExpAmount];
                    dataAmount = dataAmount.toFixed(2);
                    if (dataDate >= currentDay && dataDate < nextDay) {
                        billableData.push([expenseData[row][colExpVendor], expenseData[row][colExpDescription], dataAmount])
                        totalDirectCost = totalDirectCost + Number(dataAmount);
                        dailyDirectCost = dailyDirectCost + Number(dataAmount);
                    }
                }
                var billableDataLen = billableData.length;              
                if (billableDataLen > 0) {
                     t = body.appendTable([
                        ['Vendor', 'Description', 'Amount']
                    ])
                    t.setAttributes(tableStyle);
                    //tableLen must = num header colums
                    var tableLen = 3;
                    for (var h = 0; h < tableLen; h++) {
                        c = t.getCell(0, h);
                        c.setBackgroundColor("#E2EFD9");
                        c.setAttributes(tableCellStyle);
                        par = c.getChild(0).asParagraph();
                        par.setAttributes(tableParStyle);
                        par.setBold(true);
                    }
                    for (var m = 0; m < billableDataLen; m++) {
                        r = t.appendTableRow();
                        for (var dr = 0; dr < billableData[m].length; dr++) {
                            if (dr === 2) {
                                c = r.appendTableCell("$" + billableData[m][dr])
                            } else {
                                c = r.appendTableCell(billableData[m][dr])
                            }
                            c.setBold(false);
                        c.setAttributes(tableCellStyle);
                            par = c.getChild(0).asParagraph();
                            par.setAttributes(tableParStyle);
                        }
                    }
                    r = t.appendTableRow();
                    c = r.appendTableCell("")
                    c.setBackgroundColor("#AEAAAA");
                    c = r.appendTableCell("")
                    c.setBackgroundColor("#AEAAAA");
                    c = r.appendTableCell("Sub Total: $" + dailyDirectCost.toFixed(2));
                    par = c.getChild(0).asParagraph();
                        par.setAttributes(tableParStyle);
                } else {
                    par = body.appendParagraph('No direct expenses were incurred on ' + currentDate + '.');
                    par = body.appendParagraph('');
                    par.setAttributes(normalStyle);
                }
                }


  for (var row = 0; row < donationDataLen; row++) {
                    var dataDate = new Date(donationData[row][colDonDate]);
                    var dataAmount = donationData[row][colDonValue];
                    dataAmount = dataAmount.toFixed(2);
                    if (dataDate >= currentDay && dataDate < nextDay) {
                        donorData.push([donationData[row][colDonDonor], donationData[row][colDonDescription], dataAmount])
                        totalIndirectCost = totalIndirectCost + Number(dataAmount);
                        dailyIndirectCost = dailyIndirectCost + Number(dataAmount);
                    }
                }
                var donorDataLen = donorData.length;              
                if (donorDataLen > 0) {
                                  par = body.appendParagraph('Donations');
                par.setAttributes(headingStyle2);
                     t = body.appendTable([
                        ['Donor', 'Description', 'Value']
                    ])
                    t.setAttributes(tableStyle);
                    //tableLen must = num header colums
                    var tableLen = 3;
                    for (var h = 0; h < tableLen; h++) {
                        c = t.getCell(0, h);
                        c.setAttributes(tableCellStyle);
                        c.setBackgroundColor("#e6d9ef");
                        par = c.getChild(0).asParagraph();
                        par.setAttributes(tableParStyle);
                        par.setBold(true);
                    }
                    for (var m = 0; m < donorDataLen; m++) {
                        r = t.appendTableRow();
                        for (var dr = 0; dr < donorData[m].length; dr++) {
                            if (dr === 2) {
                                c = r.appendTableCell("$" + donorData[m][dr])
                            } else {
                                c = r.appendTableCell(donorData[m][dr])
                            }
                            c.setBold(false);
                        c.setAttributes(tableCellStyle);
                            par = c.getChild(0).asParagraph();
                        par.setAttributes(tableParStyle);
                        }
                    }
                    r = t.appendTableRow();
                    c = r.appendTableCell("")
                    c.setBackgroundColor("#AEAAAA");
                    c = r.appendTableCell("")
                    c.setBackgroundColor("#AEAAAA");
                    c = r.appendTableCell("Sub Total: $" + dailyIndirectCost.toFixed(2));
                    par = c.getChild(0).asParagraph();
                        par.setAttributes(tableParStyle);
                }
                
                par = body.appendParagraph('Manpower Costs');
                par.setAttributes(headingStyle2);
                var mbrTime = Number(getDailyMemberTime(memberLogId, iDay, incidentStartDate, incidentEndDate));
                console.log("mbrTime: " + mbrTime)
                if (mbrTime > 0) {
                    mbrTime = mbrTime / 60;
                    mbrTime = Math.ceil(mbrTime);

                    var dailyMbrEstCost = mbrHrRate * mbrTime
                    dailyMbrEstCost = dailyMbrEstCost.toFixed(2);
                    par = body.appendParagraph("KVRS volunteers logged " + mbrTime + " manpower hours on " + currentDate + " at an estimated cost of $" + mbrHrRate + " per hour for an indirect cost of $" + dailyMbrEstCost + ".");
                    par.setAttributes(normalStyle);
                    totalIndirectCost = totalIndirectCost + Number(dailyMbrEstCost);
                    dailyIndirectCost = dailyIndirectCost + Number(dailyMbrEstCost);
                    mbrTotalCost = mbrTotalCost + Number(dailyMbrEstCost);
                    mbrTotalHours = mbrTotalHours + mbrTime;
                } else {
                    par = body.appendParagraph("No manpower hours were logged on " + currentDate + ".");
                    par.setAttributes(normalStyle);
                }
                body.appendParagraph('');
                par = body.appendParagraph('Daily Summary');
                par.setAttributes(headingStyle2);
                     t = body.appendTable([
                        ['', 'Today ('+currentDate+')', 'Since Start ('+incidentStartDay+')'],['Direct Expenses', '$'+dailyDirectCost.toFixed(2), '$'+totalDirectCost.toFixed(2)], ['Indirect Costs', '$'+dailyIndirectCost.toFixed(2), '$'+totalIndirectCost.toFixed(2)]]);
                    t.setAttributes(tableStyle);
      for (var row = 0 ; row < t.getNumRows(); row++) { 
      r = t.getRow(row);
      for(var cell = 0; cell < r.getNumChildren(); cell++){
       
        c = t.getCell(row,cell);
        c.setAttributes(tableCellStyle)
        par = c.getChild(0).asParagraph();
        par.setAttributes(tableParStyle);
         if(row  == 0 && cell > 0) {
                              c.setBackgroundColor("#e2efd9");
                              par.setBold(true);
        }
        if(cell == 0 && row > 0) {
          c.setBackgroundColor("#e6d9ef");
                                        par.setBold(true);

        }
      }
  }


                var templateFileId = SystemSettings.IMS_TEMPLATES_FINANCE_REPORT_ID;
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
                //console.log("Completed Day: " + iDay)
            }
        
            body.appendPageBreak();
        par = body.appendParagraph('Incident Costs Summary');
        par.setAttributes(headingStyle1);


        console.log("mbrTotalHours: " + mbrTotalHours);
        var incidentSummary = "In support of the incident response "; 
        if (incidentLength >1)
                {
                  incidentSummary += "between "+incidentStartDay+" and "+incidentEndDay}
        else
{        incidentSummary += "on "+ incidentStartDay; 
}  
incidentSummary += " volunteers logged "; 
       if (mbrTotalHours > 0) { incidentSummary += mbrTotalHours+" manpower hours for an estimated indirect cost of $" + mbrTotalCost.toFixed(2);
        } else { incidentSummary += "no manpower hours";}
incidentSummary += ". The Ketchikan Volunteer Rescue Squad incurred ";
        if (totalDirectCost > 0) { incidentSummary += "$" + totalDirectCost.toFixed(2) +" in";
        } else { incidentSummary += "no"; }
incidentSummary += " direct expenses and ";

if (totalIndirectCost > 0) { incidentSummary += "$" + totalIndirectCost.toFixed(2) +" in";
        } else { incidentSummary += "no"; }
incidentSummary += " total indirect costs including manpower costs."

par = body.appendParagraph(incidentSummary);
par.setAttributes(normalStyle);

        if (totalDirectCost > 0) {
            par = body.appendParagraph('Reimbursable Expenses Documentation');
            par.setAttributes(headingStyle1);
            var file;
            var fileId;
            var fileUrl;


            expenseData = expenseData.sort(function(a, b) {
                a = new Date(a[colExpDate]);
                b = new Date(b[colExpDate]);
                return a > b ? 1 : a < b ? -1 : 0;
            });
            for (var row = 0; row < expenseDataLen; row++) {
                fileId = expenseData[row][colExpFile].toString();
                console.log("fileId: " + fileId)
                if (fileId == "") continue;
                //console.log("log row:"+row)
                var dataDate = new Date(expenseData[row][colExpDate]);
                var dataDate = Utilities.formatDate(dataDate, tz, "MMMM dd, yyyy");
                var dataVendor = expenseData[row][colExpVendor];
                var dataDescription = expenseData[row][colExpDescription];
                var dataAmount = expenseData[row][colExpAmount];
                dataAmount = dataAmount.toFixed(2);
                //    console.log(dataDate+" || "+currentDay)
                console.log("fileId: " + fileId)
                fileUrl = DriveApp.getFileById(fileId).getUrl();
                var item = body.appendListItem(dataDate + " - Vendor: " + dataVendor + " - Amount: $" + dataAmount + " - %FILE_URL% " + String.fromCharCode(10) + "Description: " + dataDescription);
                item.setAttributes(normalStyle);
                            item.setAlignment(DocumentApp.HorizontalAlignment.LEFT);

                var textToFind = "%FILE_URL%";
                var text = "View Documentation";
                var foundText = body.findText(textToFind);
                // Get the start and end location of the text in the paragraph.
                var startText = foundText.getStartOffset();
                var endText = startText + text.length - 1;
                // Get the element indext for this section of text.
                var element = foundText.getElement();
                // Replace the text and insert the URL.
                element.asText().replaceText(textToFind, text).setLinkUrl(startText, endText, fileUrl);
            }
        }
        var url = DriveApp.getFileById(reportId).getUrl();
        var msg = [true, url];
        return msg;
    } catch (error) {
        var msg = [false, error];
        return msg;
    }
}

function getDailyMemberTime(logId, iDay, incidentStartDate, incidentEndDate) {
    var mbrTime = [];
    var tz = Session.getScriptTimeZone();
    // LOAD THE VOLUNTEER ROSTER    
    var assignLastName;
    var assignFirstName;
    console.log("Loaded Sheet Data");
    //LOAD THE ASSIGNMENT DATA  
    var ss = SpreadsheetApp.openById(logId);
    var sheet = ss.getSheets()[0];
    var sheetLastRow = sheet.getLastRow();
    if (sheetLastRow == 1) return 0;
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;
    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;
    sheetData = sheetData.sort(function(a, b) {
        a = new Date(a[5]);
        b = new Date(b[5]);
        return a > b ? -1 : a < b ? 1 : 0;
    });
    // console.log("sheetData sorted: "+sheetData)
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
    var memberList = []
    for (var i = 0; i < sheetDataLen; i++) {
        memberList.push([sheetData[i][colLastName], sheetData[i][colFirstName]]);
    }
    //console.log("memberList Before Filter: " + memberList);
    var memberList = multiDimensionalUnique(memberList);
    //console.log("memberList After Filter: " + memberList);
    var memberListLen = memberList.length;
    console.log("Start Day: " + iDay);
    var currentDay = new Date(incidentStartDate);
    currentDay.setDate(currentDay.getDate() + iDay);
    var nextDay = new Date(currentDay);
    nextDay.setDate(nextDay.getDate() + 1);
    console.log("Cur Day: " + currentDay);
    console.log("Nex Day: " + nextDay);
    // Fetch variable names
    // they are column names in the spreadsheet
    ///TMAYHBE TEMP FOR INCIDENT DAY
    //Logger.log("Processing columns:" + header);
    //this will be used in order to loop the dates for creation of reports
    //Header Fields are Taged with :Tag: so they don't repeate in the template duplication
    console.log("alive - page 1 header");
    for (var m = 0; m < memberListLen; m++) {
        var memStartDate = "";
        var memEndDate = "";
        var memLastName = memberList[m][0];
        var memFirstName = memberList[m][1];
        //console.log("sheetData: "+sheetData);
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
                    console.log("Exec Option 1")
                    continue;
                }
                if (memStartDate < currentDay) memStartDate = currentDay;
                var diff = (memEndDate.getTime() - memStartDate.getTime()) / 1000;
                diff /= 60;
                var mins = Math.abs(Math.round(diff));
                mbrTime.push(mins);
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
            var diff = (memEndDate.getTime() - memStartDate.getTime()) / 1000;
            diff /= 60;
            var mins = Math.abs(Math.round(diff));
            mbrTime.push(mins);
        }
    }
    var totalMins = 0;
    console.log("func mbrTime:" + mbrTime);
    for (var t = 0; t < mbrTime.length; t++) {
        totalMins = totalMins + Number(mbrTime[t]);
        console.log("totalMins: " + totalMins)
        console.log("mbrTime: " + mbrTime)
    }
    console.log("totalMins: " + totalMins)
    totalMins = Number(totalMins);
    return totalMins
}

function addZeroes(num) {
    const dec = num.split('.')[1]
    const len = dec && dec.length > 2 ? dec.length : 2
    return Number(num).toFixed(len)
}