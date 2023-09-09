function generatePackage(incidentFolderId) {
    try {
        var report = IncidentReporting.generatePackage(incidentFolderId);
        if (report[0] === false) throw report;
        console.log("Success generatePackage: " + report[1])
        return report;
    } catch (error) {
        console.log("Error generatePackage:" + error[1])
        var msg = [false, error[1].toString()];
        return msg;
    }

}
function generateAllReports(incidentFolderId) {
    try {
        var report;
        console.log("Starting: generateCoverReport");
        report = IncidentReporting.generateCoverReport(incidentFolderId);
        if (report[0] === false) throw report;
                console.log("Starting: generateSynopsisReport");
        report = IncidentReporting.generateSynopsisReport(incidentFolderId);
        if (report[0] === false) throw report;
                console.log("Starting: generateEventLogReport");
        report = IncidentReporting.generateEventLogReport(incidentFolderId);
        if (report[0] === false) throw report; 
               console.log("Starting: generateFinanceReport");
        report = IncidentReporting.generateFinanceReport(incidentFolderId);
        if (report[0] === false) throw report;
               console.log("Starting: generateAssignmentReport")
        report = IncidentReporting.generateAssignmentReport(incidentFolderId);
        if (report[0] === false) throw report;
               console.log("Starting: generateRosterReport");
        report = IncidentReporting.generateRosterReport(incidentFolderId);
        if (report[0] === false) throw report;
               console.log("Starting: generateIncidentMapReport");
        report = IncidentReporting.generateIncidentMapReport(incidentFolderId);
        if (report[0] === false) throw report;
                       console.log("Starting: generateIncidentLogReport");
        report = IncidentReporting.generateIncidentLogReport(incidentFolderId);
        
        var url = DriveApp.getFolderById(incidentFolderId).getUrl();
        console.log("Success generateAllReports: " + url)
        var msg = [true, url];
        return msg;
    } catch (error) {
        console.log("Error generateAllReports:" + error[1])
        var msg = [false, error[1].toString()];
        return msg;
    }
}

function generateCoverReport(incidentFolderId) {
    try {
        var report = IncidentReporting.generateCoverReport(incidentFolderId);
        if (report[0] === false) throw report;
        console.log("Success generateCoverReport: " + report[1])
        return report;
    } catch (error) {
        console.log("Error generateCoverReport:" + error[1])
        var msg = [false, error[1].toString()];
        return msg;
    }
}

function generateSynopsisReport(incidentFolderId) {
    try {
        var report = IncidentReporting.generateSynopsisReport(incidentFolderId);
        if (report[0] === false) throw report;
        console.log("Success generateSynopsisReport: " + report[1])
        return report;
    } catch (error) {
        console.log("Error generateSynopsisReport:" + error[1])
        var msg = [false, error[1].toString()];
        return msg;
    }
}


function generateIncidentMapReport(incidentFolderId) {
    try {
        var report = IncidentReporting.generateIncidentMapReport(incidentFolderId);
        if (report[0] === false) throw report;
        console.log("Success generateIncdentMapReport: " + report[1]);
        return report;
    } catch (error) {
        console.log("Error generateIncdentMapReport:" + error[1])
        var msg = [false, error[1].toString()];
        return msg;
    }
}


function generateAssignmentReport(incidentFolderId) {
    try {
        var report = IncidentReporting.generateAssignmentReport(incidentFolderId);
        if (report[0] === false) throw report;
        console.log("Success generateAssignmentReport: " + report[1])
        return report;
    } catch (error) {
        console.log("Error generateAssignmentReport:" + error[1])
        var msg = [false, error[1].toString()];
        return msg;
    }
}


function generateRosterReport(incidentFolderId) {
    try {
        var report = IncidentReporting.generateRosterReport(incidentFolderId);
        if (report[0] === false) throw report;
        console.log("Success generateVolRoster: " + report[1])
        return report;
    } catch (error) {
        console.log("Error generateVolRoster:" + error[1])
        var msg = [false, error[1].toString()];
        return msg;
    }
}


function generateFinanceReport(incidentFolderId) {
    try {
        var report = IncidentReporting.generateFinanceReport(incidentFolderId);
        if (report[0] === false) throw report;
        console.log("Success generateFinanceReport: " + report[1])
        return report;
    } catch (error) {
        console.log("Error generateFinanceReport:" + error[1])
        var msg = [false, error[1].toString()];
        return msg;
    }
}

function generateIncidentLogReport(incidentFolderId) {
    try {
        var report = IncidentReporting.generateIncidentLogReport(incidentFolderId);
        if (report[0] === false) throw report;
        console.log("Success generateIncidentLogReport: " + report[1])
        return report;
    } catch (error) {
        var msg = [false, error[1].toString()];
        return msg;
    }
}

function generateEventLogReport(incidentFolderId) {
    try {
        var report = IncidentReporting.generateEventLogReport(incidentFolderId);
        if (report[0] === false) throw report;
        console.log("Success generateEventLogReport: " + report[1])
        return report;
    } catch (error) {
    let errorMessage;
    if (Array.isArray(error) && error[1] !== undefined) {
        errorMessage = error[1].toString();
    } else if (error) {
        errorMessage = error.toString();
    } else {
        errorMessage = "An unidentified error occurred.";
    }

    console.log("Error generateEventLogReport:" + errorMessage);
    var msg = [false, errorMessage];
    return msg;
}
}