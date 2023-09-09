function getSystemStatus() {
  var spotStatusMsg = [];
  spotStatusMsg = SPOTAPIIntegration.getSpotScriptStatus();
  Logger.log(spotStatusMsg[1])

  return spotStatusMsg;
}

function forceUpdate() {
  try {
    SPOTAPIIntegration.updateSPOTDataUsers();
        var msg = [true];

    return msg
  }
  catch (error) {
    console.log("Force Update Error: " + error);
    var msg = [false, error.toString()];
    return msg;
  }
}