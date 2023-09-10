function getOpenIncidents() {
	var incidents = SharedFunctions.getIncidentList("ARCHIVED", false, "INCIDENT_FOLDER_ID");
	return incidents;
}

function getDocumentList(incidentFolderId) {
	var fileLog = [];
	var file;
	var folderName;
	var folder = DriveApp.getFolderById(incidentFolderId);
	var files = folder.getFiles();
	while (files.hasNext()) {
		file = files.next();
		fileLog.push([file.getName().toString(), file.getLastUpdated().toString(), file.getId().toString(), file.getUrl().toString()]);
	}

	var folders = folder.getFolders();
	while (folders.hasNext()) {

		folder = folders.next();
		folderName = folder.getName();
		if (folderName == "Data Files") continue;
		files = folder.getFiles();

		while (files.hasNext()) {
			file = files.next();
			fileLog.push([file.getName().toString(), file.getLastUpdated().toString(), file.getId().toString(), file.getUrl().toString()]);
		}
	}
	return fileLog;
}

function getTemplateList(){
  var ss = SpreadsheetApp.openById("1JpjEXB2Hxqw1Ia0smnyNH1wwPHJVGUR7J4JnDLEUXG8");
  var sheet = ss.getSheets()[0];
  var sheetLastRow = sheet.getLastRow();
  if(sheetLastRow > 1)
{  var sheetLastColumn = sheet.getLastColumn();
  var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
  var sheetHeadersLen = sheetHeaders[0].length;

  var templateList=[];
    for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
            if (sheetHeaders[0][hrow] == "TEMPLATE_ID") {
                var colFileId = hrow;
            }
            if (sheetHeaders[0][hrow] == "TITLE") {
                var colTitle = hrow;
            }
            if (sheetHeaders[0][hrow] == "TYPE") {
                var colType = hrow;
            }
             if (sheetHeaders[0][hrow] == "ENABLED") {
                var colEnabled = hrow;
            }
  }
var sheetData = sheet.getRange(2, 1, (sheetLastRow-1), sheetLastColumn).getValues();
}

    for (var i = 0; i < sheetData.length; i++) {
      if(sheetData[i][colEnabled] === true)
{    templateList.push([sheetData[i][colFileId],sheetData[i][colTitle],sheetData[i][colType]]);

}    }

templateList.sort(compareSecondColumn);

function compareSecondColumn(a, b) {
    if (a[2] === b[2]) {
        return 0;
    }
    else {
        return (a[2] < b[2]) ? -1 : 1;
    }
}

console.log(templateList);
return templateList;
}