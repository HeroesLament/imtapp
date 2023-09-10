function generateIncidentLogReport(incidentFolderId) {
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
      if (sheetHeaders[0][hrow] == "INCIDENT_LOG_ID") {
        var colLogId = hrow;
        continue;
      };
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
    var templateFileId = SystemSettings.IMS_TEMPLATES_INCIDENT_LOG_REPORT_ID
    var oldReportFileId = checkIfExisitngReport(incidentFolderId, templateFileId);
    if (oldReportFileId == false) {
      var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
    } else {
      DriveApp.getFileById(oldReportFileId).setTrashed(true);
      var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
    }
    //console.log("alive");

    var report = createIncidentLogReport(incidentLog, reportFileId, incidentName, incidentNumber, incidentStartDate, incidentEndDate);
    if (report[0] === false) throw report[1];
    return report;
  } catch (error) {
    var msg = [false, error]
    return msg;
  }
}

function createIncidentLogReport(logId, reportId, incidentName, incidentNumber, incidentStartDate, incidentEndDate) {
  try {
    var tz = Session.getScriptTimeZone();
    var daysWithoutEntries = 0;
    var ss = SpreadsheetApp.openById(logId);
    var sheet = ss.getSheets()[0];
    var sheetLastRow = sheet.getLastRow();
    var sheetLastColumn = sheet.getLastColumn();
    var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
    var sheetHeadersLen = sheetHeaders[0].length;

    Logger = BetterLog.useSpreadsheet('1B7Da-DtBO4ovTnl9KsdstOErr3PQRfbiaNYyxa8fHA4');

    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
      if (sheetHeaders[0][hrow] == "From") {
        var colFrom = hrow
      };
      if (sheetHeaders[0][hrow] == "To") {
        var colTo = hrow
      };
      if (sheetHeaders[0][hrow] == "Description") {
        var colDescription = hrow
      };
      if (sheetHeaders[0][hrow] == "Time") {
        var colTime = hrow
      };
      if (sheetHeaders[0][hrow] == "Date") {
        var colDate = hrow
      };
    }
    var doc = DocumentApp.openById(reportId);
    //console.log("alive");

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
      var par1 = body.appendParagraph('No incident log entries were made for this incident.');
      par1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      var url = DriveApp.getFileById(reportId).getUrl();
      var msg = [true, url];
      return msg;
    }
    //console.log("alive2");

    var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
    var sheetDataLen = sheetData.length;

    for (var i = 0; i < sheetDataLen; i++) {
      if(sheetData[i][4] == "" || sheetData[i][5] =="") {
//sheetData.splice(i,1);
continue;

      }
    var date = new Date(sheetData[i][4]);
    var hours =  new Date(sheetData[i][5]).getHours();
    var minutes = new Date(sheetData[i][5]).getMinutes();
    var seconds = new Date(sheetData[i][5]).getSeconds();
date = date.setHours(hours);
//date = date.setSeconds(seconds);
date = new Date(date);
date = date.setMinutes(minutes);
date = new Date(date);
date = date.setSeconds(seconds);
date = new Date(date);
sheetData[i].push(date);
    }


    //   console.log("incidentEndDate:" + incidentEndDate)
    if (incidentEndDate === undefined || incidentEndDate === "") {
      incidentEndDate = new Date();
    }
    var incidentLength = datesDiff(incidentStartDate, incidentEndDate);
    //   console.log("incidentLength:" + incidentLength);
    for (var iDay = 0; iDay < incidentLength; iDay++) {
      // console.log("Start Day: " + iDay);
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
      var logData = [];
      for (var row = 0; row < sheetDataLen; row++) {
                console.log("log row: "+row)
                console.log("log row: "+sheetData[row])
                console.log("log row:"+sheetData[row][8])
        var dataDate = new Date(sheetData[row][colDate]);
        if (sheetData[row][colDescription] != "" && dataDate >= currentDay && dataDate < nextDay) {
          var dataTime = Utilities.formatDate(new Date(sheetData[row][colTime]), tz, "HHmm");
          logData.push([dataTime, sheetData[row][colFrom], sheetData[row][colTo], sheetData[row][colDescription],sheetData[row][8]])
        }
      }

        logData = logData.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return a[4] - b[4];
    });
      var dataLen = logData.length;
      //     console.log("dataLen: " +dataLen)
      //console.log("alive3");

      var body = doc.getBody();
      if (dataLen > 0) {
        var t = body.appendTable([
          ['Time', 'From', 'To', 'Description']
        ])
        t.setColumnWidth(0, 36)
        t.setColumnWidth(1, 60)
        t.setColumnWidth(2, 60)
        t.getCell(0, 0).setBackgroundColor("#FF9999")
        t.getCell(0, 1).setBackgroundColor("#FF9999")
        t.getCell(0, 2).setBackgroundColor("#FF9999")
        t.getCell(0, 3).setBackgroundColor("#FF9999")
        var par1 = t.getCell(0, 0).getChild(0).asParagraph();
        var par2 = t.getCell(0, 1).getChild(0).asParagraph();
        var par3 = t.getCell(0, 2).getChild(0).asParagraph();
        var par4 = t.getCell(0, 3).getChild(0).asParagraph();
        par1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        par2.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        par3.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        par4.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        par1.setBold(true);
        par2.setBold(true);
        par3.setBold(true);
        par4.setBold(true);
        for (var m = 0; m < dataLen; m++) {
          var r = t.appendTableRow();
          for (var dr = 0; dr < (logData[m].length-1); dr++) {
            var c = r.appendTableCell(logData[m][dr])
            c.setBold(false);
            c.setPaddingBottom(4);
            c.setPaddingTop(4);
            c.setPaddingLeft(4);
            c.setPaddingRight(4);
            var par1 = c.getChild(0).asParagraph();
            par1.setLineSpacing(0);
            par1.setSpacingBefore(0);
            par1.setSpacingAfter(0);
            if (dr != 3) {
              var par1 = c.getChild(0).asParagraph();
              par1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
            }
          }
        }
        daysWithoutEntries = 0; // This sets the var to 0 when a log entry exists
        console.log("Days without logs: " + daysWithoutEntries);
        Logger.log("Days without logs: " + daysWithoutEntries);
      } else {
        body.appendParagraph('');
        var par1 = body.appendParagraph('No incident log entries were made on ' + currentDate + '.');
        par1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        daysWithoutEntries++; // This adds a day to the no entries var
        console.log("Days without logs: " + daysWithoutEntries);
        Logger.log("Days without logs: " + daysWithoutEntries);
      }
      var templateFileId = SystemSettings.IMS_TEMPLATES_INCIDENT_LOG_REPORT_ID;
      if (iDay != (incidentLength - 1) && daysWithoutEntries <= 1) {
        body.appendPageBreak();
        console.log("Added page to event log document")
        Logger.log("Added page to event log document")
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
      } else {
        console.log("Breaking page building loop now");
        Logger.log("Breaking page building loop now");
        break; // exit the loop when there's more than one day without log entries
      }
      //console.log("Completed Day: " + iDay);
    }
    //  console.log("alive4");
    var url = DriveApp.getFileById(reportId).getUrl();
    var msg = [true, url];
    return msg;
  } catch (error) {
    var msg = [false, error];
    console.log(error)
    Logger.log(error);
    return msg;
  }
}