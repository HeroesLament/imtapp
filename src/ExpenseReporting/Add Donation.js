function addDonation(logSheetId, date, donor, description, value, purchaser, notes, base64Data) {
	try {
		console.log("START addDonation. Writng To: " + logSheetId);
		var ss = SpreadsheetApp.openById(logSheetId);
		var sheet = ss.getSheets()[1];
		var sheetLastRow = sheet.getLastRow();
		var sheetLastColumn = sheet.getLastColumn();
		var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
		var sheetHeadersLen = sheetHeaders[0].length;
		for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
			if (sheetHeaders[0][hrow] == "Date") {
				var colDate = hrow;
			}
			if (sheetHeaders[0][hrow] == "Donor") {
				var colDonor = hrow;
			}
			if (sheetHeaders[0][hrow] == "Description") {
				var colDescription = hrow;
			}
			if (sheetHeaders[0][hrow] == "Value") {
				var colValue = hrow;
			}
			if (sheetHeaders[0][hrow] == "Accepted By") {
				var colPurchaser = hrow;
			}
			if (sheetHeaders[0][hrow] == "Notes") {
				var colNotes = hrow;
			}
			if (sheetHeaders[0][hrow] == "File") {
				var colFile = hrow;
			}
			if (sheetHeaders[0][hrow] == "Entered By") {
				var colUser = hrow;
			}
		}
		var dtg;
		if (date == undefined || date == null || date == "") {
			dtg = new Date();
		} else {
			dtg = new Date(date);
			if (SharedFunctions.isValidDate(dtg) == false) {
				throw "Unable to complete action due to an invalid time. Please check time data format (HH:MM) and retry action.";
			}
		}
		if (dtg > new Date()) {
			throw "Donation Date Cannot Be In The Future.";
		}
		var user = SharedFunctions.getUser();
		value = Number(value).toFixed(2);
		sheet.getRange((sheetLastRow + 1), (colDate + 1)).setValue(dtg);
		sheet.getRange((sheetLastRow + 1), (colDonor + 1)).setValue(donor);
		sheet.getRange((sheetLastRow + 1), (colDescription + 1)).setValue(description);
		sheet.getRange((sheetLastRow + 1), (colValue + 1)).setValue(value);
		sheet.getRange((sheetLastRow + 1), (colPurchaser + 1)).setValue(purchaser);
		var addNotes;

		addNotes = ("Donation report added at " + new Date() + " by " + user + ".");
		if (notes != "" && notes != null && notes != undefined) {
			addNotes += (" Additional Notes: " + notes);
		}
		sheet.getRange((sheetLastRow + 1), (colNotes + 1)).setValue(addNotes);
		sheet.getRange((sheetLastRow + 1), (colUser + 1)).setValue(user);
		var file = DriveApp.getFileById(logSheetId);
		var folders = file.getParents();
		while (folders.hasNext()) {
			var incidentFolder = folders.next();
		}
		if (base64Data != undefined && base64Data != "") {
			var tz = Session.getScriptTimeZone();
			var folderDate = Utilities.formatDate(dtg, tz, "dd-MMM-yy");
			var folderName = "Expense Documentation";
			var fileName = donor + " (" + folderDate + ")";
			var fileId = SharedFunctions.uploadFileToDrive(logSheetId, folderName, fileName, base64Data);
			var fileUrl = DriveApp.getFileById(fileId).getUrl();
			console.log("fileId: " + fileId);

			console.log("fileUrl: " + fileUrl);
			sheet.getRange((sheetLastRow + 1), (colFile + 1)).setValue(fileId);
		}
		var msg = [true, (description + " ($" + value + ")")];
		return msg;
	} catch (error) {
		console.log("Add Expense Error: " + error);
		var msg = [false, error.toString()];
		return msg;
	}
}