function syncFilterMapper() {
    try {
        console.log("START: Export To SPOT Filter Mapper");

        const ss = SpreadsheetApp.openById(SystemSettings.SPOT_DATA_SHEET_ID);
        const mapperSS = SpreadsheetApp.openById(SystemSettings.SPOT_FILTER_MAPPER_ID);
        const logSheet = ss.getSheetByName("IMS SPOT Data");
        const settings = PropertiesService.getScriptProperties();

        // Get data from the SPOT API Log Sheet
        const logSheetData = getLogSheetData(logSheet);
        const filterSettings = getFilterSettings(settings);
        const availableIcons = SharedFunctions.getAvailableIcons("SPOT_ICON");

        const { mapperData, mapperMetaData, beaconIcons } = processData(logSheetData, filterSettings, availableIcons);

        if (mapperData.length > 0) {
            const updateRequests = prepareUpdateRequests(mapperData, mapperMetaData, beaconIcons, filterSettings, ss);
            batchUpdate(mapperSS.getId(), updateRequests);
            updateMapperDescription(filterSettings, mapperData.length);
        }

        console.log("COMPLETED: Export To SPOT Filter Mapper");
    } catch (f) {
        console.error("ERROR in newSyncFilterMapper: " + f);
        return ["Error", f.toString()];
    }
}

function getLogSheetData(logSheet) {
    // Logic to fetch and return data from logSheet
    const range = logSheet.getDataRange();
    return range.getValues();
}

function getFilterSettings(settings) {
    // Logic to fetch and return filter settings
    return {
        filterStart: new Date(settings.getProperty('filterStart')),
        filterEnd: new Date(settings.getProperty('filterEnd')),
        filterBeacons: settings.getProperty('filterBeacons').split(',')
    };
}

function processData(logSheetData, filterSettings, availableIcons) {
    // Logic to process logSheetData according to filterSettings and availableIcons
    // Returns an object containing mapperData, mapperMetaData, and beaconIcons
    // Process the log sheet data and return mapperData, mapperMetaData, and beaconIcons.
    let mapperData = [];
    let mapperMetaData = [];
    let beaconIcons = [];
    let lastIcon = 0;
    let tz = Session.getScriptTimeZone();

    logSheetData.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // Skip header row

        let candidateBeacon = row[2].toString();
        if (filterSettings.filterBeacons.length > 0 && !filterSettings.filterBeacons.includes(candidateBeacon)) return;

        let logDate = new Date(row[15]);
        if (filterSettings.filterStart > logDate || filterSettings.filterEnd < logDate) return;

        let position = row[5] + " | " + row[6];
        let dtg = Utilities.formatDate(new Date(row[15]), tz, "dd MMM YYYY - HH:mm").toString();
        let dataRow = [
            row[2], // Folder ID (Beacon Name)
            [row[2] + " - " + dtg], // Placemark Name (Beacon name + timestamp)
            row[5], // Latitude
            row[6], // Longitude
            "", // Empty Field (Address on the Mapper)
            "Template1", // Template Name
            [row[2]], // Beacon Name
            [position], // Position (concatenated lat/long separated by | pipe)
            [row[7]], // Device Type
            [row[10]], // Device Battery State
            [row[4]], // Message Type
            [row[12]], // Message Data 1
            [row[13]], // Message Data 2
            [row[14]], // Received by SPOT (Zulu)
            [row[15]], // Received by SPOT (AKST/AKDT)
            [row[16]], // Received by IMS (AKST/AKDT)
            [row[17]],  // System Delay
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
            [row[15]], // Received by SPOT (AKST/AKDT)
            "", // Empty Field
            "", // Empty Field
            "https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_gray.png" // Icon URL
        ];
        mapperData.push(dataRow);

        // Handle icon assignment
        let icon = assignIconForBeacon(candidateBeacon, beaconIcons, availableIcons, lastIcon);
        lastIcon = (lastIcon + 1) % availableIcons.length; // Cycle through available icons

        let isoTimestamp = Utilities.formatDate(new Date(row[10]), tz, "yyyy-MM-dd'T'HH:mm:ssXXX");
        mapperMetaData.push([
            [isoTimestamp],
            [""],
            [""],
            [icon]
        ]);
    });

    return { mapperData, mapperMetaData, beaconIcons };
}

function prepareUpdateRequests(mapperData, mapperMetaData, beaconIcons, filterSettings, ss) {
    // Implement logic to create requests for batchUpdate
    let requests = [];
    const mapperSS = SpreadsheetApp.openById(SystemSettings.SPOT_FILTER_MAPPER_ID);
    const mapperSheet = mapperSS.getSheets()[1];
    const sheetIndex = 1; // Assuming the mapper sheet is the second sheet

    // Assuming we want to clear and set data starting from a specific row/column
    const startRow = 10; // for example, starting from row 11
    const endRow = mapperSheet.getLastRow(); // up to the last row with data
    const startCol = 2; // for example, starting from column C
    const endCol = mapperSheet.getLastColumn(); // up to the last column with data

    // Prepare request to clear old data
    const clearRequest = createClearRangeRequest(mapperSS, sheetIndex, startRow, endRow, startCol, endCol);
    requests.push(clearRequest);

    // Prepare request to set new data
    const setDataRequest = createSetDataRequest(mapperSS, sheetIndex, mapperData, startRow, startCol);
    requests.push(setDataRequest);

    return requests;
}

function updateMapperDescription(filterSettings, dataLength) {
    // Logic to update the description of the mapper
    // Update the description based on filter settings and data length
    const mapperSS = SpreadsheetApp.openById(SystemSettings.SPOT_FILTER_MAPPER_ID);
    const mapperSettings = mapperSS.getSheets()[0];
    const descripText = "<p><em>As of " + new Date() + "</em></p>"
                       + "<p class ='black-text'><Strong><span class = 'purple-text'>Filter Results:</strong></span> There are "
                       + dataLength + " position reports in the system.<p> Filter Start Date: "
                       + filterSettings.filterStart + " <br> Filter End Date: "
                       + filterSettings.filterEnd;

    const mapperUpdateDescrip = mapperSettings.getRange('C33');
    mapperUpdateDescrip.setValue(descripText);
}

function createClearRangeRequest(ss, sheetIndex, startRow, endRow, startCol, endCol) {
    // Logic to create a request that clears a specific range
    // Create and return a request object to clear a specific range
    const sheetId = ss.getSheets()[sheetIndex].getSheetId();

    // Define the range that needs to be cleared
    return {
        updateCells: {
            range: {
                // The range object is a box defined vertically with start/end rows and horizontally
                // with start/end columns and a SpreadSheet ID, defaulting to Sheet[0]
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

function createSetDataRequest(ss, sheetIndex, data, startRow, startCol) {
    // Logic to create a request that sets data in a specific range
    // Create and return a request object to set data in a specific range
    // Sort the data array based on the first column (assuming it's a string or number)
    data.sort((a, b) => {
       // Compare the first column of each row
        return a[0] > b[0] ? 1 : -1;
    });

    const sheetId = ss.getSheets()[sheetIndex].getSheetId();
    return {
        updateCells: {
            rows: data.map(row => ({
                values: row.map(cell => ({
                    userEnteredValue: { stringValue: cell.toString() }
                }))
            })),
            fields: "*",
            range: {
                // The range object is a box defined vertically with start/end rows and horizontally 
                // with start/end columns and a SpreadSheet ID, defaulting to Sheet[0]
                sheetId: sheetId,
                startRowIndex: startRow,
                endRowIndex: startRow + data.length,
                startColumnIndex: startCol,
                endColumnIndex: startCol + (data[0] ? data[0].length : 0)
            }
        }
    };
}

function assignIconForBeacon(beaconId, beaconIcons, availableIcons, lastIconIndex) {
    // Possible good location for a rule block subsystem that allows icon selection
    // based on the contents of the array dataRow's 48 indices. 
    let existingIconEntry = beaconIcons.find(iconEntry => iconEntry[1] === beaconId);
    if (existingIconEntry) return existingIconEntry[0];

    let newIcon = availableIcons[lastIconIndex];
    beaconIcons.push([newIcon, beaconId]);
    return newIcon;
}