function deleteExpiredTripPlans() {
  var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
  var sheet = ss.getSheetByName("Tracker");
  var endRow = sheet.getLastRow();
  console.log("End Row: " + endRow);
  if(endRow === 1) {
    console.log("No Data Found");
    return;
  }
  var d = new Date(); 
  console.log("Now Date: "+ d);
  for(var row = 2; row <= endRow; row++) {
    var overdueDate = new Date(sheet.getRange(row, 5).getValue());
    if( sheet.getRange(row, 8).isBlank()) { 
      console.log("Trip Plan Still Open, Skip Row: "+ row)
    } else {
      var closedDate = new Date(sheet.getRange(row, 8).getValue());
      console.log("Row:"+ row); 
      console.log("Overdue Date: " + overdueDate);
      console.log("Closed Date: " + closedDate);
      // If ClosedDate not blank continue calcuating dates to determine if delete is needed
      //Adds 14 Days to the Closed or Expiration Date whichever is greater 
      if(closedDate > overdueDate) {
        var tpDExpiration = new Date(closedDate.setDate(closedDate.getDate()+30));
      } else {
        var tpDExpiration = new Date(overdueDate.setDate(overdueDate.getDate()+30));
      }
      console.log("Compare Date: " + tpDExpiration);
      if(tpDExpiration < d){  
        sheet.deleteRow(row);
        //subtract one from endRow to acount for deleted row
        console.log("Deleted:"+ row);
        endRow = endRow - 1;  
        console.log("New End Row:"+ endRow); 
      }
    }
  }
}

function updateLocation() {
  var ss = SpreadsheetApp.openById(SystemSettings.SPOT_INVENTORY_SHEET_ID);
  var sheet = ss.getSheetByName("SPOT Inventory");
  var sheetLastRow = sheet.getLastRow();
  var sheetLastCol = sheet.getLastColumn();  
  var data = sheet.getRange(1,1,sheetLastRow,sheetLastCol).getValues();

  var ssTp = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
  var sheetTp = ssTp.getSheetByName("Tracker");
  var sheetTpLastRow = sheetTp.getLastRow();
  var sheetTpLastCol = sheetTp.getLastColumn();    
  
  var dataTp = sheetTp.getRange(1,1,sheetTpLastRow,sheetTpLastCol).getValues();
  
  for(var row = 1; row < sheetLastRow; row++) {
    var tpDate = "";
    var tpLoc = "";
      for(var rowTp = 1; rowTp < sheetTpLastRow; rowTp++) {
        Logger.log(data[row][(SystemSettings.SPOT_INVENTORY_BEACON_COL-1)]);
        if(data[row][(SystemSettings.SPOT_INVENTORY_BEACON_COL-1)] === dataTp[rowTp][(SystemSettings.TRIPPLAN_BEACON_COL-1)]){
          if(dataTp[rowTp][(SystemSettings.TRIPPLAN_CLOSED_COL-1)].length === 0) continue
          if (data[row][(SystemSettings.SPOT_INVENTORY_REPORTED_DATE_COL-1)].length === 0){
            tpDate = dataTp[rowTp][(SystemSettings.TRIPPLAN_CLOSED_COL-1)];
            tpLoc = dataTp[rowTp][(SystemSettings.TRIPPLAN_RETURN_LOC_COL-1)];
            continue
          }
          if (new Date(data[row][(SystemSettings.SPOT_INVENTORY_REPORTED_DATE_COL-1)]) < new Date(dataTp[rowTp][(SystemSettings.TRIPPLAN_CLOSED_COL-1)])) {
          tpDate = dataTp[rowTp][(SystemSettings.TRIPPLAN_CLOSED_COL-1)];
          tpLoc = dataTp[rowTp][(SystemSettings.TRIPPLAN_RETURN_LOC_COL-1)];
          }
        }
      }
    Logger.log(tpDate)
    if (tpDate.length === 0 || tpLoc.length === 0) continue
    sheet.getRange((row+1),SystemSettings.SPOT_INVENTORY_REPORTED_LOC_COL,1,1).setValue(tpLoc);
    tpDate = Utilities.formatDate(new Date(tpDate), Session.getScriptTimeZone(), "MM/dd/yyy HH:mm")
    sheet.getRange((row+1),SystemSettings.SPOT_INVENTORY_REPORTED_DATE_COL,1,1).setValue(tpDate);
}
}
