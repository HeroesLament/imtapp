function testCompleteIncident(){
  const incidentFolderId = '1jMAucwXRB9ABlODK3LbvXjMYgc3hSCU3';
  const endDate = 'December 2, 2023';
  completeIncident(incidentFolderId, endDate);
}

function testFindRowsForIncident(){
  const incidentName = "Devland, Dev";
  findRowsForIncident(incidentName);
}

function testCompleteIncidentMapperSheet(){
  const incidentName = "Devland, Dev";
  // Remove Incident Waypoints from Incident Mapper Spreadsheet 
  const rowIndexes = findRowsForIncident(incidentName);
  const deletionRequests = createDeletionRequests(rowIndexes);
  const response = batchUpdate(SystemSettings.SPOT_INCIDENT_MAPPER_ID, deletionRequests);
}