/**
 * Generates a new package of reports for a given incident.
 * @async
 * @param {string} incidentFolderId - The ID of the folder where the incident reports are stored.
 * @returns {Promise<[boolean, string]>} A promise that resolves to an array containing a success flag and the URL of the newly created report file or an error message.
 */
async function newGeneratePackage(incidentFolderId) {
    try {
        const packageOrder = getPackageOrder();
        const reportBlobs = await fetchExistingReports(incidentFolderId, packageOrder);
        const reportFileId = await manageTemplateReport(incidentFolderId);
        const newFile = await createReportFile(incidentFolderId, reportFileId);
        await updateSpreadsheetData(newFile, incidentFolderId);
        logNewFileURL(newFile);
        return [true, newFile.getUrl()];
    } catch (error) {
        console.error('Error generating package:', error);
        return [false, error.toString()];
    }
}

/**
 * Retrieves the order of report templates as an array of template IDs.
 * @returns {string[]} An array of report template IDs.
 */
function getPackageOrder() {
    return [
        SystemSettings.IMS_TEMPLATES_COVER_REPORT_ID,
        SystemSettings.IMS_TEMPLATES_SYNOPSIS_REPORT_ID,
        SystemSettings.IMS_TEMPLATES_EVENT_LOG_REPORT_ID,
        SystemSettings.IMS_TEMPLATES_FINANCE_REPORT_ID,
        SystemSettings.IMS_TEMPLATES_ROSTER_REPORT_ID,
        SystemSettings.IMS_TEMPLATES_ASSIGNMENT_REPORT_ID,
        SystemSettings.IMS_TEMPLATES_MAP_REPORT_ID
    ];
}

/**
 * Fetches existing report documents based on their IDs.
 * @async
 * @param {string} folderId - The folder ID where reports are stored.
 * @param {string[]} packageOrder - An array of report IDs to check.
 * @returns {Promise<GoogleAppsScript.Document[]>} A promise that resolves to an array of document objects.
 */
async function fetchExistingReports(folderId, packageOrder) {
    const checks = packageOrder.map(reportId => checkIfExistingReport(folderId, reportId));
    const reportIds = await Promise.all(checks);
    return reportIds.map(reportId => reportId ? DocumentApp.openById(reportId) : null).filter(Boolean);
}

/**
 * Manages the template report by checking and updating the existing report in the folder.
 * @async
 * @param {string} folderId - The ID of the folder containing the template report.
 * @returns {Promise<string>} A promise that resolves to the ID of the report file.
 */
async function manageTemplateReport(folderId) {
    const templateFileId = SystemSettings.IMS_TEMPLATES_PACKAGE_ID;
    const oldReportFileId = await checkIfExistingReport(folderId, templateFileId);
    if (oldReportFileId) {
        DriveApp.getFileById(oldReportFileId).setTrashed(true);
    }
    return SharedFunctions.copyDriveFile(templateFileId, folderId);
}

/**
 * Copies a file from one folder to another within Google Drive.
 * @async
 * @param {string} sourceFileId - The ID of the source file.
 * @param {string} destinationFolderId - The ID of the destination folder.
 * @returns {Promise<string>} A promise that resolves to the ID of the new file.
 */
async function copyDriveFile(sourceFileId, destinationFolderId) {
    const sourceFile = DriveApp.getFileById(sourceFileId);
    const newFile = sourceFile.makeCopy(sourceFile.getName(), DriveApp.getFolderById(destinationFolderId));
    return newFile.getId();
}

/**
 * Creates a new report file in the specified folder from the file ID.
 * @async
 * @param {string} folderId - The ID of the folder where the new file will be created.
 * @param {string} fileId - The ID of the file to convert and copy.
 * @returns {Promise<GoogleAppsScript.Drive.File>} A promise that resolves to the new file object.
 */
async function createReportFile(folderId, fileId) {
    const folder = DriveApp.getFolderById(folderId);
    const file = DriveApp.getFileById(fileId);  // Retrieve the file using its ID
    const blob = file.getBlob();  // Retrieve the blob of the file

    // Check if the file needs to be converted to PDF
    const contentType = blob.getContentType();  // Correct method to get the content type
    const pdfBlob = contentType === 'application/pdf' ? blob : blob.getAs('application/pdf');

    return folder.createFile(pdfBlob);  // Create the new file in the folder from the PDF blob
}

/**
 * Updates spreadsheet data based on the newly created report file.
 * @async
 * @param {GoogleAppsScript.Drive.File} file - The file object of the new report.
 * @param {string} folderId - The ID of the folder containing the spreadsheet.
 */
async function updateSpreadsheetData(file, folderId) {
    const ss = SpreadsheetApp.openById(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
    const sheet = ss.getSheetByName("IMS Incident Log");
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
    const data = dataRange.getValues();

    const folderIndex = headers.indexOf("INCIDENT_FOLDER_ID");
    const nameIndex = headers.indexOf("INCIDENT_NAME");
    const numberIndex = headers.indexOf("INCIDENT_NUMBER");

    data.forEach(row => {
        if (row[folderIndex] === folderId) {
            file.setName(`KVRS Incident Report - ${row[nameIndex]} (${row[numberIndex]})`);
        }
    });
}

/**
 * Logs the URL of the new file to the console.
 * @param {GoogleAppsScript.Drive.File} file - The file object whose URL is to be logged.
 */
function logNewFileURL(file) {
    console.log(`TPURL: ${file.getUrl()}`);
}

/**
 * Checks if a report already exists in a folder.
 * @param {string} folderId - The ID of the folder to search within.
 * @param {string} reportName - The name of the report to find.
 * @returns {string|boolean} The ID of the existing report if found, otherwise false.
 */
function checkIfExistingReport(folderId, reportName) {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFilesByName(reportName);
    if (files.hasNext()) {
        return files.next().getId();
    }
    return false;
}
