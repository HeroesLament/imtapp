function getSpotData(beacon,startTime,endTime) {
  startTime = new Date(startTime);
  endTime = new Date(endTime);
    
  var ss = SpreadsheetApp.openById(SystemSettings.SPOT_SPREADSHEET_ID);
  var spotSheet = ss.getSheetByName("SPOT Data Log");
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