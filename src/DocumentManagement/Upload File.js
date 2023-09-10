function uploadFileToDrive(folderId, fileName, base64Data) {
    try {
        console.log("START uploadFileToDrive");
        if (base64Data != undefined && base64Data != "") {
            var tz = Session.getScriptTimeZone();
            var uploadFolder = "Documents";

        var incidentFolder = DriveApp.getFolderById(folderId);
        var folders = incidentFolder.getFolders();
        console.log("folders"+folders)
        while (folders.hasNext()) {
            var folder = folders.next();
            var folderName = folder.getName();
            console.log("folderName"+folderName)
            if (folderName == uploadFolder) {
              break
              }
            else
            {
              console.log("create folder"+folderName)
              if (folders.hasNext() === false) {
                var folder = incidentFolder.createFolder(uploadFolder);
            } else {
                            console.log("next folder"+folderName)
                var folder = folders.next();
            }
            }
        }

            var splitBase = base64Data.split(','),
                type = splitBase[0].split(';')[0].replace('data:', '');
            var byteCharacters = Utilities.base64Decode(splitBase[1]);
            var blob = Utilities.newBlob(byteCharacters, type);
            blob.setName(fileName);
            file = folder.createFile(blob);
            console.log("Created File")
            var fileId = file.getId();
            var fileUrl = DriveApp.getFileById(fileId).getUrl();
            console.log("fileId: " + fileId)
            console.log("fileUrl: " + fileUrl)
            var uploadName = DriveApp.getFileById(fileId).getName();
        }
        var msg = [true, uploadName, fileUrl];
        return msg;
    } catch (error) {
        console.log("Add Expense Error: " + error);
        var msg = [false, error.toString()];
        return msg;
    }
}