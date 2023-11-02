function updateSPOTDataUsers() {
  //execute the following fuctions when the "IMS SPOT Data" tab is updated to ensure the latest data is pushed to users.
  console.log("START updateSPOTDataUsers");
  console.log("Started syncFilterMapper");
  //On Demand Filter Mapper
  syncFilterMapper();
  console.log("Completed syncFilterMapper");
  //Assignment Incident Maps
  console.log("MemberAssignment.syncSpotData()");
  MemberAssignment.syncSpotData();
  console.log("MemberAssignment.syncSpotData()");
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('lastMapperUpdate', new Date());
  console.log("Completed Mapper Sync Function")
  console.log("END updateSPOTDataUsers");

}

function getSpotScriptStatus() {
  var settings = PropertiesService.getScriptProperties();
  var lastApiCall = new Date(settings.getProperty('lastApiCall'));
  var lastApiData = new Date(settings.getProperty('lastApiData'));
  var lastLoggedData = new Date(settings.getProperty('lastLoggedData'));
  var lastMapperUpdate = new Date(settings.getProperty('lastMapperUpdate'));
  var spotStatus = [];
  spotStatus.push(["lastApiCall", lastApiCall.toString()]);
  spotStatus.push(["lastApiData", lastApiData.toString()]);
  spotStatus.push(["lastLoggedData", lastLoggedData.toString()]);
  spotStatus.push(["lastMapperUpdate", lastMapperUpdate.toString()]);
  console.log("SPOT API Status Update: " + spotStatus.toString());
  Logger.log(spotStatus);
  return spotStatus
}