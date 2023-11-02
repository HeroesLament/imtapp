function createTripPlanPdf(tpNumber, draftRow) {
    try {
        console.log("Starting createTripPlanPDF");
        //Create Temp Folder
        var baseFolder = DriveApp.getFolderById(SystemSettings.TRIPPLAN_FILES_BASE_FOLDER);
        var tempFolders = baseFolder.getFoldersByName("Temp")
        if (tempFolders.hasNext() == false) {
            var tempFolder = baseFolder.createFolder("Temp");
        } else {
            var tempFolder = tempFolders.next();
        }
        var tz = Session.getScriptTimeZone();
        var folderDate = Utilities.formatDate(new Date(), tz, "MM-dd-yy")
        //Make  a PDF
        var copyFile = DriveApp.getFileById(SystemSettings.TRIPPLAN_PDF_TEMPLATE_ID).makeCopy(),
            copyId = copyFile.getId(),
            copyDoc = DocumentApp.openById(copyId),
            copyHeader = copyDoc.getHeader(),
            copyBody = copyDoc.getBody(),
            ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_DRAFT_SHEET_ID),
            draftSheet = ss.getSheetByName("Data"),
            numberOfColumns = draftSheet.getLastColumn(),
            activeRow = draftSheet.getRange(draftRow, 1, 1, numberOfColumns).getValues(),
            headerRow = draftSheet.getRange(1, 1, 1, numberOfColumns).getValues();
        var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
        var sheet = ss.getSheetByName("Tracker");
        var endRow = sheet.getLastRow();
        var data = sheet.getRange(1, 1, endRow, 12).getValues();
        var activatedPlan = []
        for (var i = 1; i < endRow; i++) {
            if (data[i][11] === tpNumber) {
                activatedPlan = sheet.getRange(i + 1, 1, 1, 12).getValues();
            }
        }
        var activatedDtg = Utilities.formatDate(new Date(activatedPlan[0][0]), tz, "MMM dd, yyyy HH:mm (z)").toString();
        var startDtg = Utilities.formatDate(new Date(activatedPlan[0][2]), tz, "MMM dd, yyyy HH:mm (z)").toString();
        var endDtg = Utilities.formatDate(new Date(activatedPlan[0][3]), tz, "MMM dd, yyyy HH:mm (z)").toString();
        var overdueDtg = Utilities.formatDate(new Date(activatedPlan[0][4]), tz, "MMM dd, yyyy HH:mm (z)").toString();
        // Replace Header
        copyHeader.replaceText('%activated_id%', activatedPlan[0][11]);
        //Repalce Body
        copyBody.replaceText('%activated_dtg%', activatedDtg);
        copyBody.replaceText('%spot_beacon%', activatedPlan[0][6]);
        if (activatedPlan[0][10] == "" || activatedPlan[0][10].length === 0) {
            var line = copyBody.findText('%spot_notes%').getElement()
            line.removeFromParent();
        } else {
            copyBody.replaceText('%spot_notes%', activatedPlan[0][10]);
        }
        copyBody.replaceText('%spot_partner%', activatedPlan[0][5]);
        copyBody.replaceText('%activated_user%', Session.getActiveUser().getEmail());
        copyBody.replaceText('%start_dtg%', startDtg);
        copyBody.replaceText('%end_dtg%', endDtg);
        copyBody.replaceText('%overdue_dtg%', overdueDtg);
        // Replace the keys with the spreadsheet values
        for (var columnIndex = 0; columnIndex < headerRow[0].length; columnIndex++) {
            if (activeRow[0][columnIndex].length === 0 || !activeRow[0][columnIndex]) {
                var para = copyBody.findText('%' + headerRow[0][columnIndex] + '%')
                if (para != null) {
                    var line = para.getElement();
                    line.replaceText('%' + headerRow[0][columnIndex] + '%', 'BLANK FIELD HEADING')
                    if (line.findText('%') === null) {
                        line.removeFromParent();
                    }
                }
            } else {
                copyBody.replaceText('%' + headerRow[0][columnIndex] + '%', activeRow[0][columnIndex])
            }
        }
        //Clean Up Those Extra Paragraphs
        var copyParas = copyBody.getParagraphs();
        for (var i = 0; i < copyParas.length - 1; i++) {
            if (copyParas[i].getText() === "") {
                if (copyParas[i].findElement(DocumentApp.ElementType.INLINE_IMAGE) === null) {
                    copyParas[i].removeFromParent();
                }
            }
        }
        var copyParas = copyBody.getParagraphs();
        for (var i = 0; i < copyParas.length - 2; i++) {
            //console.log("Current Heading: "+copyParas[i].getAttributes().toString()+"Next Neading: "+copyParas[i].getNextSibling().getAttributes().toString());        
            if (copyParas[i].getAttributes() === "HEADING1" && copyParas[i].getNextSibling().getAttributes() === "HEADING1") {
                if (copyParas[i].findElement(DocumentApp.ElementType.INLINE_IMAGE) === null) {
                    copyParas[i].removeFromParent();
                }
            }
        }
        // Create the PDF file, rename it if required and delete the doc copy
        copyDoc.saveAndClose()
        var currentYear = Utilities.formatDate(new Date(), tz, "yyyy");
        var currentMonth = Utilities.formatDate(new Date(), tz, "MMMM");
        var folderDate = Utilities.formatDate(new Date(), tz, "MM-dd-yy")
        var yearFolders = baseFolder.getFoldersByName(currentYear)
        if (yearFolders.hasNext() == false) {
            var yearFolder = baseFolder.createFolder(currentYear);
        } else {
            var yearFolder = yearFolders.next();
        }
        var monthFolders = yearFolder.getFoldersByName(currentMonth)
        if (monthFolders.hasNext() == false) {
            var monthFolder = yearFolder.createFolder(currentMonth);
        } else {
            var monthFolder = monthFolders.next();
        }
        var newFile = monthFolder.createFile(copyFile.getAs('application/pdf'))
        var newFileUrl = newFile.getUrl()
        console.log("TPURL: " + newFileUrl)
        newFile.setName(tpNumber)
        copyFile.setTrashed(true)
        console.log("Finished Creating TripPlan PDF URL is " + newFileUrl)
        return newFileUrl;
    } catch (error) {
        console.log("Trip Plan PDF Creation Error: " + error)
    }
}