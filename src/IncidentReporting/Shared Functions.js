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

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function elapsedTimeCalc(start, end) {
    var timeStart = new Date(start).getTime();
    var timeEnd = new Date(end).getTime();
    var hourDiff = timeEnd - timeStart; //in ms
    var secDiff = hourDiff / 1000; //in s
    var minDiff = hourDiff / 60 / 1000; //in minutes
    var hDiff = hourDiff / 3600 / 1000; //in hours
    var humanReadable = {};
    humanReadable.hours = Math.floor(hDiff);
    humanReadable.minutes = minDiff - 60 * humanReadable.hours;
    //console.log(humanReadable); //{hours: 0, minutes: 30}
    return humanReadable;
}

function sortFunctionAssignByDate(a, b) {
    var o1 = a[4];
    var o2 = b[4];
    var p1 = a[0];
    var p2 = b[0];
    if (o1 < o2) return -1;
    if (o1 > o2) return 1;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
    return 0;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function checkIfExisitngReport(folderId, templateId) {
    var templateFile = DriveApp.getFileById(templateId);
    var tempateFileName = templateFile.getName();
    var targetFolder = DriveApp.getFolderById(folderId);
    var files = targetFolder.getFilesByName(tempateFileName)
    var chk = files.hasNext()
    if (chk === true) {
        var file = files.next();
        var reportId = file.getId()
        return reportId
    } else {
        return false
    }
}

function datesDiff(dat1, dat2) {
    //console.log("dat1:" + dat1 + "dat2:" + dat2)
    //converts string to date object
    var date1 = new Date(dat1);
    date1.setHours(0);
    date1.setMinutes(0);
    date1.setSeconds(1);
    var date2 = new Date(dat2);
    date2.setHours(0);
    date2.setMinutes(0);
    date2.setSeconds(2);
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var diffDays = Math.abs((date1.getTime() - date2.getTime()) / (oneDay));
    diffDays = Math.ceil(diffDays);
    //console.log("diffDays:" + diffDays)
    return diffDays;
}

function addNewTemplateSection(template, doc) {
    Logger.log("Duplicating Template Rows");
    var body = doc.getBody();
    var templateBody = DocumentApp.openById(template).getBody();
    var ps = templateBody.getParagraphs();
    var bLen = body.getParagraphs().length;
    var dps = body.getParagraphs();
    //add a blank line between the existing data and new template if it doesn't already exist
    Logger.log("Check last Row: " + dps[(bLen - 1)].getText());
    if (dps[(bLen - 1)].getText() != "" && dps[(bLen - 1)].getHeading() === DocumentApp.ParagraphHeading.NORMAL) {
        body.appendParagraph("");
        Logger.log("Added a New P due to lack of spacing between template")
    }
    for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        var pSpacingBefore = p.getSpacingBefore();
        var text = p.getText();
        if (text.indexOf("<") >= 0 && text.indexOf(">") >= 0) {
            if (text.indexOf("Name") >= 0) {
                //Logger.log("text:"+text)
                body.appendParagraph(text).setBold(true).setSpacingBefore(pSpacingBefore);
            } else {
                body.appendParagraph(text).setBold(false).setSpacingBefore(pSpacingBefore);
            }
        }
    }
}

function createBlankPageReport(reportId, incidentName, incidentNumber, incidentStartDate, incidentEndDate) {
    try {
        var tz = Session.getScriptTimeZone();
        incidentStartDate = Utilities.formatDate(new Date(incidentStartDate), tz, "MMMM dd, yyyy");
        //console.log("Incident Date" + incidentEndDate);
        if (incidentEndDate != "Present" && incidentEndDate != undefined && incidentEndDate != "") {
            incidentEndDate = Utilities.formatDate(new Date(incidentEndDate), tz, "MMMM dd, yyyy");
        } else {
            incidentEndDate = "Present";
        }
        var doc = DocumentApp.openById(reportId);
        /*   if (incidentNumber == undefined || incidentNumber == "" || incidentNumber == null) {
               incidentNumber = "None";
           }*/
        SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NAME%", incidentName);
        if (incidentNumber != "") {
            SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", ' (' + incidentNumber + ')');
        } else {
            SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_NUMBER%", '');
        }
        var incidentDates;
        if (incidentStartDate === incidentEndDate) {
            incidentDates = incidentStartDate;
        } else {
            incidentDates = incidentStartDate + " - " + incidentEndDate;
        }
        SharedFunctions.fillDocsTemplate(doc, "%INCIDENT_DATES%", incidentDates);
        var url = DriveApp.getFileById(reportId).getUrl();
        var msg = [true, url,reportId];
        return msg;
    } catch (error) {
        var msg = [false, error]
        return msg;
    }
}