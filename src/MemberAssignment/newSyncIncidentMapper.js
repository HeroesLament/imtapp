function syncIncidentMapper(incidentSheetId, incidentName, incidentIsClosed) {
    try {
        console.log("START: Export To SPOT Incident Mapper");
        // Set variables
        const mapperSheetId = SystemSettings.SPOT_INCIDENT_MAPPER_ID;
        const mapperSnapRange = 'C11:AY1000'; // Snapshot Diffing Range

        // Open Sheets
        const ss = SpreadsheetApp.openById(incidentSheetId);
        const mapperSS = SpreadsheetApp.openById(mapperSheetId);
        const logSheet = ss.getSheets()[1];

        // Get data from Incident Log Sheet
        const logSheetData = getIncidentLogSheetData(logSheet);
        const availableIcons = SharedFunctions.getAvailableIcons("SPOT_ICON");
        

        // Process the log sheet data
        const { mapperData, mapperMetaData, requests} = processIncidentData(logSheetData, availableIcons, incidentName, incidentIsClosed);

        // Update the mapper spreadsheet
        console.log("Requests: ", JSON.stringify(requests, null, 2));
        const preSnapshot = captureSnapshot(mapperSS, mapperSnapRange);
        updateIncidentMapper(mapperSheetId, requests);
        const postSnapshot = captureSnapshot(mapperSS, mapperSnapRange);
        const changes = diffSnapshots(preSnapshot, postSnapshot);
        if (changes.length > 0) {
          console.log("No changes!")
        } else {
            console.log("Changes: " + changes)
        }

        console.log("COMPLETED: Export To SPOT Incident Mapper");
    } catch (error) {
        console.error("ERROR in newSyncIncidentMapper: " + error);
        return ["Error", error.toString()];
    }
}

function getIncidentLogSheetData(logSheet) {
    // Assuming the log data starts from the second row and includes all columns
    const startRow = 2; // Starting from the second row to skip headers
    const logLastRow = logSheet.getLastRow();
    const logLastColumn = logSheet.getLastColumn();

    // Check if there's data beyond the headers
    if (logLastRow <= 1) {
        return []; // Return an empty array if there's no data
    }

    // Fetch the data range and return the values
    const dataRange = logSheet.getRange(startRow, 1, logLastRow - 1, logLastColumn);
    return dataRange.getValues();
}

function getIncidentMapperData(mapperSheet, mapperLastRow) {
    // Pull the waypoint rows data from the spreadsheet in preparation for querying data
    let startRow = 11; // Waypoints begin on 10th row index
    let lastColumn = mapperSheet.getLastColumn();
    let dataRange = mapperSheet.getRange(startRow, 3, mapperLastRow, 49);
    return dataRange.getValues();
}

function processIncidentData(logSheetData, availableIcons, incidentName, incidentIsClosed) {
    // Refactor the data processing logic from syncIncidentMapper
    // Determine where to append new data to avoid overwriting existing data
    // Return an object containing mapperData and mapperMetaData

    let mapperData = []; // Populate this array based on the processed logSheetData
    let mapperMetaData = []; // Populate this array based on the processed logSheetData
    let beaconIcons = [];
    let lastIcon = 0;
    let tz = Session.getScriptTimeZone();

    const mapperSS = SpreadsheetApp.openById(SystemSettings.SPOT_INCIDENT_MAPPER_ID);
    const mapperSheet = mapperSS.getSheets()[1];
    const mapperLastRow = SharedFunctions.lastValue(SystemSettings.SPOT_INCIDENT_MAPPER_ID, 1, "C");

    if (incidentIsClosed == true) {
        let mapperData = [];
        let mapperMetaData = [];
        const incidentMapperData = getIncidentMapperData(mapperSheet, mapperLastRow);
        const rowsToDelete = findRowsForIncident(incidentMapperData, incidentName);
        let requests = createCloseIncidentRequest(rowsToDelete);
        return { mapperData, mapperMetaData, requests }   
    }

    logSheetData.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // Skip header row
        let candidateBeacon = row[2].toString();
        let position = row[5] + " | " + row[6];
        let dtg = Utilities.formatDate(new Date(row[15]), tz, "dd MMM YYYY - HH:mm").toString();
        let dataRow = [
            incidentName, // Folder ID (Incident Name)
            candidateBeacon + " - " + dtg, // Placemark Name (Beacon name + timestamp)
            row[5], // Latitude
            row[6], // Longitude
            "", // Empty Field (Address on the Mapper)
            "Template1", // Template Name
            row[2], // Beacon Name
            position, // Position (concatenated lat/long separated by | pipe)
            row[7], // Device Type
            row[10], // Device Battery State
            row[4], // Message Type
            row[12], // Message Data 1
            row[13], // Message Data 2
            row[14], // Received by SPOT (Zulu)
            row[15], // Received by SPOT (AKST/AKDT)
            row[16], // Received by IMS (AKST/AKDT)
            row[17],  // System Delay
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            "", // Empty Field
            row[15], // Received by SPOT (AKST/AKDT)
            "", // Empty Field
            "", // Empty Field
            "https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_gray.png" // Icon URL
        ];
        mapperData.push(dataRow);
    });

    // Create a clear request to clear the range where the new data will be set
    let requests = [];
    const clearRequest = createClearRangeRequest(mapperSheet, lastRow + 1, mapperSheet.getLastRow(), 1, mapperSheet.getLastColumn());
    requests.push(clearRequest);

    // Create a set data request to set the new data
    const setDataRequest = createSetDataRequest(mapperSheet, mapperData, lastRow + 1, 1);
    requests.push(setDataRequest);

    // Return the requests along with the mapperData and mapperMetaData
    return { mapperData, mapperMetaData, requests };
}

function updateIncidentMapper(mapperSheetId, requests) {
    // Implement the logic to update the incident mapper spreadsheet
    // Similar to the updating logic in newSyncFilterMapper
    // Ensure new data is appended after the last row of existing data
    if (requests.length > 0) {
        batchUpdate(mapperSheetId, requests);
    }
}

function createClearRangeRequest(sheet, startRow, endRow, startCol, endCol) {
    // Create and return a request object to clear a specific range in the sheet
    const sheetId = sheet.getSheetId();
    return {
        updateCells: {
            range: {
                sheetId: sheetId,
                startRowIndex: startRow,
                endRowIndex: endRow,
                startColumnIndex: startCol,
                endColumnIndex: endCol
            },
            fields: "*" // to clear all data in the range
        }
    };
}

function createSetDataRequest(sheet, data, startRow, startCol) {
    // Sort the data array based on the first column (index 0)
    data.sort((a, b) => {
        // Compare the first column of each row
        return a[0] > b[0] ? 1 : -1;
    });

    const sheetId = sheet.getSheetId();
    return {
        updateCells: {
            rows: data.map(row => ({
                values: row.map(cell => ({
                    userEnteredValue: { stringValue: cell.toString() }
                }))
            })),
            fields: "*",
            range: {
                sheetId: sheetId,
                startRowIndex: startRow,
                endRowIndex: startRow + data.length,
                startColumnIndex: startCol,
                endColumnIndex: startCol + (data[0] ? data[0].length : 0)
            }
        }
    };
}

const createCloseIncidentRequest = (rowsToDelete) => {
    return rowsToDelete.map(rowIndex => {
        return {
            updateCells: {
                range: {
                    sheetId: 2, // Make sure to use the correct sheetId
                    startRowIndex: rowIndex,
                    endRowIndex: rowIndex,
                    startColumnIndex: 3, // Skip over Mapper Sheet critical cells
                    endColumnIndex: 50 // Extend to the Icon URL link
                },
                fields: "*" // Clear all data in the range
            }
        };
    });
};


function findRowsForIncident(mapperData, incidentName) {
    let rowsToDelete = [];
    for (let i = 0; i < mapperData.length; i++) {
        let folderId = mapperData[i][0]; // Assuming folder ID is in the first column of the data array
        if (folderId.includes(incidentName)) {
            rowsToDelete.push(i + 10); // Add 2 to adjust for array index and header row
        }
    }
    return rowsToDelete;
}

function captureSnapshot(sheet, range) {
    return sheet.getRange(range).getValues();
}

function diffSnapshots(preSnapshot, postSnapshot) {
    let changes = [];
    for (let i = 0; i < preSnapshot.length; i++) {
        for (let j = 0; j < preSnapshot[i].length; j++) {
            if (preSnapshot[i][j] !== postSnapshot[i][j]) {
                changes.push(`Cell ${i + 1},${j + 1} changed from ${preSnapshot[i][j]} to ${postSnapshot[i][j]}`);
            }
        }
    }
    return changes;
}