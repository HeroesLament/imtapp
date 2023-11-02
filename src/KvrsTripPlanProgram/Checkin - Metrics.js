function updateUsageMetrics(tpRow) {
  var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
  var sheetTracker = ss.getSheetByName("Tracker");
  var partner = sheetTracker.getRange(tpRow, 6).getValue();
  console.log("Partner: "+ partner);
  var sheet =ss.getSheetByName("Metrics");
  var row =  findUsageMetricsPartner(partner);
  var column = findUsageMetricsYear();
  
  var usage = sheet.getRange(row, column).getValue();
     sheet.getRange(row, column).setValue(usage + 1);
     return;
}

function findUsageMetricsYear() {
  var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
  var sheet = ss.getSheetByName("Metrics");
  var endColumn = sheet.getLastColumn();
  var d = new Date();  
  var y = d.getFullYear();
  var m = d.getMonth();
  //console.log("Current Yr: "+ y);
  //console.log("Current month: "+ m);
  for(var column = 2; column <= endColumn; column++)
  {
  var colDate = new Date(sheet.getRange(1, column).getValue());
  var colYear = colDate.getFullYear();
  var colMonth = colDate.getMonth();  
  //console.log("Current Column Year: "+ colYear);
    if( y == colYear && m == colMonth)
    { 
  //  console.log("Returned Month Year Column: "+ column);
    return column;
    }
  }
  column = endColumn + 1  
  sheet.getRange(1, column).setValue(new Date(y,m,1));  
 // console.log("Returned Year Column: "+ column);
  return column;
} 
  
function findUsageMetricsPartner(partner) {
  var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
  var sheet = ss.getSheetByName("Metrics");
  var endRow = sheet.getLastRow();
    for(var row = 2; row <= endRow; row++)
    {
      var colPartner = sheet.getRange(row, 1).getValue();
      if( colPartner == partner)
      { 
       console.log("Partner Identifed As: "+ partner)
       return row;
      } 
    }
  row = endRow + 1
  sheet.getRange(row,1).setValue(partner);  
  console.log("New Partner Identifed As: "+ partner);
  return row;
}