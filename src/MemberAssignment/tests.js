function testBatchUpdate() {
    var spreadsheetId = '1Z-KVGp2_OB6oi2fl0G9Ni-djEKU_9d5-tUMENh7SpUQ';
    var requests = [
      {
        "updateCells": {
          "start": {
            "sheetId": 0, // Assuming it's the first sheet; adjust if it's a different sheet
            "rowIndex": 76, // 0-based index, 77th row
            "columnIndex": 8 // 0-based index, 9th column (I)
          },
          "rows": [
            {
              "values": [
                {
                  "userEnteredValue": { "stringValue": "TRUE" } // Setting the value to 'TRUE'
                }
              ]
            }
          ],
          "fields": "userEnteredValue" // Specifying that only the userEnteredValue should be updated
        }
      }
    ];
    
    // Call the batchUpdate function with the predefined spreadsheetId and requests
    batchUpdate(spreadsheetId, requests);
  }

function testMapperBatchUpdate() {
    const mapperSpreadsheetId = SystemSettings.SPOT_INCIDENT_MAPPER_ID;
    const mapperSnapRange = 'C11:AY1000'; // Snapshot Diffing Range
    const mapperSS = SpreadsheetApp.openById(mapperSpreadsheetId);
    const mapperSheet = mapperSS.getSheets()[1];
    var spreadsheetId = '1mY3lM5uOwhSQNU-Qf7JgIKZqAWsrCnQXXK_tgQQOcRI';
    var requests = [
      {
        "updateCells": {
          "range": {
            "sheetId": 2,
            "startRowIndex": 10,
            "endRowIndex": 19,
            "startColumnIndex": 2,
            "endColumnIndex": 51
          },
          "rows": new Array(19 - 10).fill({
            "values": new Array(51 - 2).fill({
              "userEnteredValue": null
            })
          }),
          "fields": "userEnteredValue"
        }
      }
    ];
    // Call the batchUpdate function with the predefined spreadsheetId and requests
    const preSnapshot = captureSnapshot(mapperSheet, mapperSnapRange);
    batchUpdate(spreadsheetId, requests);
    const postSnapshot = captureSnapshot(mapperSheet, mapperSnapRange);
    const changes = diffSnapshots(preSnapshot, postSnapshot);
    console.log(changes);
  }

function testCreateIncidentPositionLog(){
    var incidentSheet = '1tnJBgVIsYBSF-2eTWFe0nHT5bjv3-Stql70DWN95P5g';
    var incidentName = 'Dev, Dev';
    createIncidentPositionLog(incidentSheet, incidentName);
}

function testSyncSpotData(){
    syncSpotData();
}

function testGetIncdentAssignmentList(){
    const logSheetId = '1gu7uOYTqhOJB_XHSy91ICtJh_kjYREy37E1VQutnLEw';
    const spotOnly = true;
    getIncdentAssignmentList(logSheetId,spotOnly)
}

function testNewGetIncdentAssignmentList(){
  const logSheetId = '1gu7uOYTqhOJB_XHSy91ICtJh_kjYREy37E1VQutnLEw';
  const spotOnly = true;
  newGetIncdentAssignmentList(logSheetId,spotOnly)
}

function testNewSyncIncidentMapper(){
    const incidentSheetId = '1tnJBgVIsYBSF-2eTWFe0nHT5bjv3-Stql70DWN95P5g';
    const incidentName = 'Dev, Dev';
    const incidentIsClosed = true;
    newSyncIncidentMapper(incidentSheetId, incidentName, incidentIsClosed);
}

function testSyncIncidentMapper(){
  const incidentSheetId = '1tnJBgVIsYBSF-2eTWFe0nHT5bjv3-Stql70DWN95P5g';
  const incidentName = 'Dev, Dev';
  const incidentIsClosed = true;
  syncIncidentMapper(incidentSheetId, incidentName, incidentIsClosed);
}

function testMapperDiff(){
    const mapperSpreadsheetId = SystemSettings.SPOT_INCIDENT_MAPPER_ID;
    const mapperSnapRange = 'C11:AY1000'; // Snapshot Diffing Range
    const mapperSS = SpreadsheetApp.openById(mapperSpreadsheetId);
    const mapperSheet = mapperSS.getSheets()[1];
    const preSnapshot = captureSnapshot(mapperSheet, mapperSnapRange);
    const postSnapshot = captureSnapshot(mapperSheet, mapperSnapRange);
    const changes = diffSnapshots(preSnapshot, postSnapshot);
    console.log(changes);
}