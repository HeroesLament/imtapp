/**
 * Logs the initial message to indicate the start of the report generation process.
 */
function initializeLogging() {
    console.log("Starting report generation...");
}

/**
 * Opens the incident log Google Sheet based on the provided system settings ID.
 * @param {string} systemSettingsId - The ID of the Google Sheet containing the incident log.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The loaded Google Sheet.
 */
function loadIncidentLogSheet(systemSettingsId) {
    return SpreadsheetApp.openById(systemSettingsId).getSheetByName("IMS Incident Log");
}

/**
 * Extracts headers from the incident log sheet and maps them to their respective column indexes.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet from which headers are to be extracted.
 * @returns {Object} An object mapping header names to their column index.
 */
function extractHeaders(sheet) {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    return headers.reduce((acc, header, index) => ({ ...acc, [header]: index }), {});
}

/**
 * Searches for and retrieves the row data for a specific incident by folder ID.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet containing the data.
 * @param {Object} headers - The object mapping header names to their column index.
 * @param {string} folderId - The folder ID to match in the incident data.
 * @returns {Array} The row data for the matched incident.
 */
function findIncidentData(sheet, headers, folderId) {
    const dataRange = sheet.getDataRange().getValues();
    return dataRange.find(row => row[headers['INCIDENT_FOLDER_ID']] === folderId);
}

/**
 * Checks for an existing report and manages it by trashing the old report and copying a new template.
 * @param {string} folderId - The Google Drive folder ID where the report is stored.
 * @param {string} templateId - The ID of the template to copy if an old report is trashed.
 * @returns {string} The ID of the new or existing report file.
 */
function manageExistingReport(folderId, templateId) {
    const existingReportId = checkIfExistingReport(folderId, templateId);
    if (existingReportId) {
        DriveApp.getFileById(existingReportId).setTrashed(true);
    }
    return SharedFunctions.copyDriveFile(templateId, folderId);
}


function compileResults(doc) {
    const url = DriveApp.getFileById(doc.getId()).getUrl();
    return [true, url];
}

/**
 * Generates the report by compiling data into the specified Google Doc.
 * @param {string} docId - The ID of the Google Document where the report will be compiled.
 * @param {Object} incidentDetails - Details of the incident to include in the report.
 * @param {Array} volunteerData - The data of volunteers to be included in the report.
 * @param {Object} systemSettings - System settings necessary for the report.
 * @returns {string} The URL of the generated Google Document.
 */
function generateReport(docId, incidentDetails, volunteerData) {
    const doc = DocumentApp.openById(docId);
    volunteerData.forEach(volunteer => {
        formatVolunteerEntry(volunteer, incidentDetails, docId);
    });
    return doc.getUrl();
}

/**
 * Formats a single volunteer's entry for the report, handling detailed aspects like overlapping periods,
 * and multiple contact details, with rich formatting suited for a Google Doc.
 *
 * @param {Object} volunteer - An object containing data about the volunteer including their assignments.
 * @param {Array} incidentDetails - Array containing detailed data about the incident's duration and other details.
 * @param {string} docId - The ID of the Google Document where the report will be compiled.
 * @returns {GoogleAppsScript.Document.Paragraph} A formatted paragraph ready to be inserted into a Google Doc.
 */
function formatVolunteerEntry(volunteer, incidentDetails, docId) {
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();
    const startDate = new Date(incidentDetails[1]).toLocaleDateString("en-US"); // Accessing start date by index
    const endDate = incidentDetails[2] ? new Date(incidentDetails[2]).toLocaleDateString("en-US") : 'ongoing'; // Accessing end date by index
    const phone = volunteer.mobilePhone || volunteer.homePhone || volunteer.workPhone || 'No phone available';
    const address = `${volunteer.address}, ${volunteer.city}, ${volunteer.state} ${volunteer.zip}`;

    // Create paragraph with basic volunteer information
    const paragraph = body.appendParagraph(`${volunteer.firstName} ${volunteer.lastName} - Contact: ${phone}, Address: ${address}`);
    paragraph.setHeading(DocumentApp.ParagraphHeading.NORMAL);

    // Detailing the assignment periods
    if (Array.isArray(volunteer.assignments)) {
        volunteer.assignments.forEach(assignment => {
            const assignmentStart = new Date(assignment.startDate).toLocaleDateString("en-US");
            const assignmentEnd = assignment.endDate ? new Date(assignment.endDate).toLocaleDateString("en-US") : 'ongoing';
            const assignmentParagraph = body.appendParagraph(`Assigned from ${assignmentStart} to ${assignmentEnd}`);
            assignmentParagraph.setHeading(DocumentApp.ParagraphHeading.NORMAL);
        });
    } else {
        console.log(`No assignments found for volunteer ${volunteer.firstName} ${volunteer.lastName}`);
    }

    // Add any additional notes or details about the volunteer
    if (volunteer.notes) {
        const notesParagraph = body.appendParagraph(`Notes: ${volunteer.notes}`);
        notesParagraph.setHeading(DocumentApp.ParagraphHeading.NORMAL);
    }

    return paragraph;
}

/**
 * Handles errors encountered during the report generation process.
 * @param {Error} error - The error object caught during the execution.
 * @returns {[boolean, string]} An array indicating failure and containing the error message.
 */
function handleError(error) {
    console.error('Error during report generation:', error);
    return [false, error.toString()];
}

/**
 * Prepares formatted volunteer data from a Google Sheet for inclusion in the report.
 * This function extracts necessary columns and sorts data by relevant criteria for report generation.
 * It also handles the transformation of raw spreadsheet data into a structured format that can be directly used to populate the report.
 *
 * @param {string} sheetId - The ID of the Google Sheet containing volunteer data.
 * @returns {Array} An array of objects where each object represents a volunteer with their details formatted for report inclusion.
 */
function prepareVolunteerData(sheetId) {
    const sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

    const headerIndex = headers.reduce((acc, header, index) => ({ ...acc, [header]: index }), {});
    return data.map(row => ({
        lastName: row[headerIndex["Last Name"]],
        firstName: row[headerIndex["First Name"]],
        address: row[headerIndex["Address"]],
        city: row[headerIndex["City"]],
        state: row[headerIndex["State"]],
        zip: row[headerIndex["Zip"]],
        mobilePhone: row[headerIndex["Mobile Phone"]],
        homePhone: row[headerIndex["Home Phone"]],
        workPhone: row[headerIndex["Work Phone"]]
    })).filter(volunteer => volunteer.lastName && volunteer.firstName); // Filter out entries without essential data
}


/**
 * Generates a roster report for a specific incident by compiling related data from various sources.
 * This function manages the process of logging, loading data sheets, extracting and finding incident data,
 * handling existing reports, preparing volunteer data, and finally generating the report.
 *
 * @param {string} incidentFolderId - The ID of the Google Drive folder where the incident reports are managed.
 * @returns {[boolean, string]} An array where the first element is a success flag (true/false) 
 *          and the second element is the URL of the new report or an error message.
 */
function newGenerateRosterReport(incidentFolderId) {
    try {
        initializeLogging();
        const sheet = loadIncidentLogSheet(SystemSettings.IMS_INCIDENT_LOG_SHEET_ID);
        const headers = extractHeaders(sheet);
        const incidentData = findIncidentData(sheet, headers, incidentFolderId);

        if (!incidentData) {
            throw new Error('No incident data found for the provided ID.');
        }

        const reportFileId = manageExistingReport(incidentFolderId, SystemSettings.IMS_TEMPLATES_ROSTER_REPORT_ID);

        const volunteerSheetId = SystemSettings.MEMBER_ROSTER_SHEET_ID;
        const volunteerData = prepareVolunteerData(volunteerSheetId); // Now passing the sheetId to the function

        const reportUrl = generateReport(reportFileId, incidentData, volunteerData, SystemSettings);

        return [true, reportUrl];
    } catch (error) {
        return handleError(error);
    }
}

