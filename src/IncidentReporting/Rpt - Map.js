function generateIncidentMapReport(incidentFolderId) {
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
             if (sheetHeaders[0][hrow] == "INCIDENT_SITUATION_DATA_ID") {
                var colSitLogId = hrow;
                continue;
            };
                        if (sheetHeaders[0][hrow] == "INCIDENT_MEMBER_DATA_ID") {
                var colAssignLogId = hrow;
                continue;
            }
        }
        for (var row = 0; row < sheetDataLen; row++) {
            var incidentName;
            var situationLogId;
            var assignmentLogId;
            var incidentNumber;
            var incidentStartDate;
            var incidentEndDate;
            if (sheetData[row][colIncidentFolderId] == incidentFolderId) {
                incidentName = sheetData[row][colIncidentName];
                incidentNumber = sheetData[row][colIncidentNumber];
                incidentStartDate = sheetData[row][colIncidentStartDate];
                incidentEndDate = sheetData[row][colIncidentEndDate];
                situationLogId = sheetData[row][colSitLogId];
                assignmentLogId = sheetData[row][colAssignLogId];
                break;
            }
        }
        var templateFileId = SystemSettings.IMS_TEMPLATES_MAP_REPORT_ID;
        var oldReportFileId = checkIfExisitngReport(incidentFolderId, templateFileId);
        if (oldReportFileId == false) {
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        } else {
            DriveApp.getFileById(oldReportFileId).setTrashed(true);
            var reportFileId = SharedFunctions.copyDriveFile(templateFileId, incidentFolderId);
        }
        var report = createIncidentMap(reportFileId, situationLogId,assignmentLogId, incidentName, incidentNumber, incidentStartDate, incidentEndDate);
        if (report[0] === false) throw report[1];
        return report;
    } catch (error) {
        var msg = [false,error];
        return msg;
    }
}

function createIncidentMap(reportId, situationLogId,assignmentLogId, incidentName, incidentNumber, incidentStartDate, incidentEndDate) {
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

        var ss = SpreadsheetApp.openById(situationLogId);
        var sheet = ss.getSheets()[0];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var situData = [];
        var spotData = [];
        if (sheetLastRow > 1){
        var situHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var situHeadersLen = situHeaders[0].length;
        for (var hrow = 0; hrow < situHeadersLen; hrow++) {
            if (situHeaders[0][hrow] == "Title") {
                var colTitle = hrow;
            }
            if (situHeaders[0][hrow] == "Latitude") {
                var colLatitude = hrow;
            }
            if (situHeaders[0][hrow] == "Longitude") {
                var colLongitude = hrow;
            }
            if (situHeaders[0][hrow] == "Notes") {
                var colNotes = hrow;
            }
            if (situHeaders[0][hrow] == "Drive File ID") {
                var colFile = hrow;
            }
            if (situHeaders[0][hrow] == "Hidden") {
                var colHidden = hrow;
            }           
        }
            situData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();

        }
            var situDataLen = situData.length;
            var mapData = [];
var mapStyle = {};
mapStyle[DocumentApp.Attribute.BORDER_WIDTH] = 1;
mapStyle[DocumentApp.Attribute.BORDER_COLOR] = '#FFFFFF';

var spotData = getIncidentSpotList(assignmentLogId, incidentStartDate, incidentEndDate);



console.log("spotData: "+spotData)
for (var i = 0; i < situDataLen; i++){
  if(situData[i][colHidden] === false){
    mapData.push([situData[i][colLatitude],situData[i][colLongitude],situData[i][colTitle],situData[i][colNotes]])
  }
}
        var body = doc.getBody();
        var par;
        
        var spotDataLen = spotData.length;
if(situDataLen > 0 || spotDataLen > 0)
{
          par = body.appendParagraph("");
        var map = generateMap(mapData,spotData);
        par.appendInlineImage(map[0]);
         par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);


par.setAttributes(mapStyle);
}
else{
          par = body.appendParagraph("There is no geospatial data available for this incident.");
}
var situMeta = map[1].length;

if(situMeta > 0) {
          par = body.appendParagraph("");
        par = body.appendParagraph("Situation Display");
         par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        par.setBold(true);
}
for (var i = 0; i < situMeta; i++){
if(map[1][i][3] != "") {
  var item = body.appendListItem("Red "+map[1][i][4]+" - "+map[1][i][2]+" ("+map[1][i][0]+", "+map[1][i][1]+")"+String.fromCharCode(10)+map[1][i][3]);
}
else
{
  var item = body.appendListItem("Red "+map[1][i][4]+" - "+map[1][i][2]+" ("+map[1][i][0]+", "+map[1][i][1]+")");
}

 item.setAlignment(DocumentApp.HorizontalAlignment.LEFT);
          item.setBold(false);

}
var spotMeta = map[2].length;

if(spotMeta > 0) {
          par = body.appendParagraph("");
        par = body.appendParagraph("Team SPOT Locations");
 par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        par.setBold(true);
}
for (var i = 0; i < spotMeta; i++){
var item = body.appendListItem("Blue "+map[2][i][2]+" - "+map[2][i][0] + " ("+map[2][i][1]+ " Positions)");
 item.setAlignment(DocumentApp.HorizontalAlignment.LEFT);
         item.setBold(false);

}
console.log("mapData: "+mapData);
console.log("map: "+map);

        var url = DriveApp.getFileById(reportId).getUrl();
        var msg = [true, url,reportId];
        return msg;
    } catch (error) {
        var msg = [false, error]
        return msg;
    }
}


function generateMap(situationData,spotData){
  console.log("situationData: "+situationData)
    var map = Maps.newStaticMap().setMapType(Maps.StaticMap.Type.TERRAIN);;
    map.setSize(576,576)
    var situMeta = [];
    var spotMeta = [];
    var situLen = situationData.length;
    var marker;
       for (var i = 0; i < situLen; i++){
             if (i<10) { marker = i+1;} else{marker = "0";}
             map.setMarkerStyle(Maps.StaticMap.MarkerSize.MID, Maps.StaticMap.Color.RED, marker);
             map.addMarker(situationData[i][0],situationData[i][1]);
             situMeta.push([situationData[i][0],situationData[i][1],situationData[i][2],situationData[i][3],marker]);
       } 
    var spotLen = spotData.length;
console.log("alive");
           for (var i = 0; i < spotLen; i++){
             var spotMsgLen = spotData[i][1].length;
             if (i<10) { marker = i+1;} else{marker = "0";}
             map.setMarkerStyle(Maps.StaticMap.MarkerSize.MID, Maps.StaticMap.Color.BLUE, marker);
                        for (var s = 0; s < spotMsgLen; s++){
 
             map.addMarker(spotData[i][1][s][0],spotData[i][1][s][1]);
                        }
                                     spotMeta.push([spotData[i][0],spotMsgLen,marker]);

       } 



            /*
            map.beginPath()
            for (var i = 0; i < spotData.length; i++) {
              if(beacon == spotData[i][2].toString() && new Date(startTime) >= new Date(spotData[i][14])){
              beaconLen = beaconData.length;
              if(beaconLen < 51){
                if(beaconLen === 1) {
                map.setMarkerStyle(Maps.StaticMap.MarkerSize.TINY, Maps.StaticMap.Color.GRAY,'1');
                }
              map.addMarker(spotData[i][5],spotData[i][6]);
              map.addPoint(spotData[i][5],spotData[i][6]);
              }
              beaconData.push([spotData[i][5],spotData[i][6],spotData[i][14]]);
              }
            }
              map.endPath();
              */

//var url = map.getMapUrl() + "&key=AIzaSyDuc6ZLpaLPjpBkiSHDnn0_B1Ul560E5Jw";
//console.log(url);
//var location = Maps.newGeocoder().reverseGeocode(beaconData[0][0],beaconData[0][1]);
//var locationName = location.results[0].formatted_address
//var elevation = Maps.newElevationSampler().sampleLocation(beaconData[0][0],beaconData[0][1]);
//elevation = Math.round(elevation.results[0].elevation);
//var lastLocationDate = Utilities.formatDate(new Date(beaconData[0][2]), tz, "MMM dd, yyyy HH:mm (z)").toString()
//var geoData = [lastLocationDate,beaconData[0][0],beaconData[0][1],elevation.toString(),locationName,(beaconLen-1)]
var msg = [map, situMeta,spotMeta];
console.log("msg: "+msg);

  return msg;
}

function getIncidentSpotList(logId,incidentStartDate,incidentEndDate) {
    try {
        console.log("Start Incident SPOT List");

        // LOAD THE VOLUNTEER ROSTER    
        var assignLastName;
        var assignFirstName;
        console.log("Loaded Sheet Data");
        //LOAD THE ASSIGNMENT DATA  
        var ss = SpreadsheetApp.openById(logId);
        var sheet = ss.getSheets()[0];
        var sheetLastRow = sheet.getLastRow();
        var sheetLastColumn = sheet.getLastColumn();
        var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
        var sheetHeadersLen = sheetHeaders[0].length;
        var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
        var rosterData = [];
        sheetData = sheetData.sort(function(a, b) {
            a = new Date(a[5]);
            b = new Date(b[5]);
            return a > b ? -1 : a < b ? 1 : 0;
        });
        //console.log("sheetData sorted: "+sheetData)
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
            if (sheetHeaders[0][hrow] == "SPOT") {
                var colSpot = hrow;
            }
        }
        console.log("alive1");
        if (sheetLastRow == 1) {
return false;
        }
            var currentDay = new Date(incidentStartDate);
            var iDay = 0;
           // console.log("incidentEndDate:" + incidentEndDate)
        if (incidentEndDate === undefined || incidentEndDate === "") {
            incidentEndDate = new Date();
        }
               console.log("alive2");

        var incidentLength = datesDiff(incidentStartDate, incidentEndDate);
        console.log("incidentLength:" + incidentLength);
        var memberList = [];
        for (var i = 0; i < sheetDataLen; i++) {
                      memberList.push([sheetData[i][colLastName], sheetData[i][colFirstName]]);

        }
        console.log("memberList Before Filter: " + memberList);
        var memberList = multiDimensionalUnique(memberList);
        console.log("memberList After Filter: " + memberList);
        var memberListLen = memberList.length;
               console.log("alive3");

        for (iDay = 0; iDay < incidentLength; iDay++) {
            console.log("Start Day: " + iDay);
            var currentDay = new Date(incidentStartDate);
            currentDay.setDate(currentDay.getDate() + iDay);
            var nextDay = new Date(currentDay);
            nextDay.setDate(nextDay.getDate() + 1);
            console.log("Cur Day: " + currentDay);
            console.log("Nex Day: " + nextDay);
            //console.log("sheetData: "+sheetData);
            for (var m = 0; m < memberListLen; m++) {
                var memStartDate = "";
                var memEndDate = "";
                var memLastName = memberList[m][0];
                var memFirstName = memberList[m][1];
                var memSpot = "";
                //console.log(memLastName);
                //THE ASSIGNMENT LIST IS SORTED BY START DATE SO MOST RECENT DATE IS FIRST!
                for (var i = 0; i < sheetDataLen; i++) {
                    //  console.log("Assignment Log Search i=: " + i)
                    var assignLastName = sheetData[i][colLastName];
                    var assignFirstName = sheetData[i][colFirstName];
                    var assignStartDate = sheetData[i][colStart];
                    var assignEndDate = sheetData[i][colEnd];
                    var assignSpot = sheetData[i][colSpot];
                    //console.log("assignSpot: "+assignSpot)
                    //  console.log("assignStart: " + assignStartDate);
                    //console.log("assignEnd: " + assignEndDate);
                    //Ignore Stby Rows
                    if (assignStartDate == "" || assignStartDate === undefined || assignStartDate === null) continue;
                    if (assignSpot == "" && assignEndDate == "") continue;
                    assignStartDate = new Date(sheetData[i][colStart]);
                    //Ignore row if not selected member
                    if (memLastName != assignLastName && memFirstName != assignFirstName) continue;
                    if (assignEndDate != "") assignEndDate = new Date(assignEndDate);
                    if (assignEndDate != "" && assignEndDate < currentDay) break;
                    if (assignSpot != "") memSpot = assignSpot;
                    if (assignEndDate != "" && memEndDate == "") {
                        memEndDate = assignEndDate;
                    } else if (assignEndDate != "" && memEndDate != "" && memStartDate != ""  && memSpot != "") {
                        if (memStartDate >= nextDay) {
                            memStartDate = "";
                            memEndDate = assignEndDate;
                            memSpot = "";
                            continue;
                        }
                        if (memStartDate < currentDay) memStartDate = currentDay;                    
                        rosterData.push([memSpot,memStartDate,memEndDate]);
                 //       console.log("Exec Option 2 Start :" + memStartDate + " End: " + memEndDate + " current: " + currentDay);
                        console.log("Option 2 Push" + [memSpot, memStartDate, memEndDate]);

                        memStartDate = "";
                        memEndDate = assignEndDate;
                        memSpot = "";
                    } else {
                        memStartDate = assignStartDate;
                    }
                    // This will need to then figure out somthing about setitng end date to 2359 or now if mbr if end date exceeds iday
                    //this needs some sort of logic to find the ariest start date before the next end date
                }
                //console.log("memStartDate: " + memStartDate);
                //console.log("memEndDate: " + memEndDate);
               // console.log("memLastName: " + memLastName);
               // console.log("memStartDate: " + memStartDate);
              //  console.log("memEndDate: " + memEndDate);
               // console.log("currentDay: " + currentDay);
                //problem with day 2 non checked out
                if (memEndDate == "" && memStartDate != "" && memStartDate < nextDay) {
                    memEndDate = currentDay;
                 //   console.log("memEndDate1: " + memEndDate);
                    memEndDate = new Date(memEndDate).setHours(23, 59, 59);
                    memEndDate = new Date(memEndDate);
               //     console.log("memEndDate2: " + memEndDate);
                    if (memEndDate > new Date()) memEndDate = new Date();
                }
                if (memStartDate != "" && memStartDate < currentDay) memStartDate = currentDay;
               // console.log("final memStartDate: " + memStartDate);
               // console.log("final memEndDate: " + memEndDate);
                if (memStartDate != "" && memEndDate > currentDay && memSpot != "") {
                                          rosterData.push([memSpot,memStartDate,memEndDate]);

                    console.log("Regular Push" + [memSpot, memStartDate, memEndDate]);
                }
            }

                        rosterData = rosterData.sort(function(a, b) {
                a = new Date(a[1]);
                b = new Date(b[1]);
                return a > b ? 1 : a < b ? -1 : 0;
            });

            //console.log("done with memlist: " + rosterData);
            var rosterLen = rosterData.length;
            //   console.ldataLenog("dataLen: " +dataLen)
         
    } 
    var spotLocData =[]
    var spotLoc;
    for (i = 0; i < rosterLen; i++){
spotLoc = getSpotData(rosterData[i][0],rosterData[i][1],rosterData[i][2]);

if (spotLoc.length > 0) spotLocData.push([rosterData[i][0], spotLoc]);
    }
var spotLocDataLen =  spotLocData.length
var msg;   
            if (spotLocDataLen > 0) {
              msg = spotLocData;
            }
            else {
            msg = false
        }
        return msg;
    }catch (error) {
        console.log(error);
        var msg = [false, error.toString()];
        return msg;
    }
}

function getSpotData(beacon,startTime,endTime) {
  console.log(beacon+startTime+endTime);
  startTime = new Date(startTime);
  endTime = new Date(endTime);
    
  var ss = SpreadsheetApp.openById(SystemSettings.SPOT_SPREADSHEET_ID);
  var spotSheet = ss.getSheetByName("IMS SPOT Data");
  var spotEndRow = spotSheet.getLastRow();
  var spotEndCol = spotSheet.getLastColumn();
  var spotHeaders = spotSheet.getRange(1, 1,1,spotEndCol).getValues();  
  var spotData = spotSheet.getRange(2, 1,spotEndRow,spotEndCol).getValues();
  var beaconData =[];
  console.log(beacon)
  console.log(startTime)
  console.log(endTime)
  for (var i = 0; i < (spotEndRow-1); i++) {
    if(spotData[i][2] === beacon){
      //console.log("Matched Beacon ID @ Row"+ i+2)
      var messageTime = new Date(spotData[i][15])
      if( messageTime > startTime && messageTime < endTime){
        //console.log("Beacon Between Start and End Dates");
        beaconData.push([spotData[i][5], spotData[i][6], messageTime]);
      }
    }
  }
  console.log(beaconData)
  return beaconData;  
}
