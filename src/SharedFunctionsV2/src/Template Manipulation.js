function mergeDocsFiles(documentID_1, documentID_2) {

  var docIDs = [documentID_1,documentID_2];
  var baseDoc = DocumentApp.openById(docIDs[0]);

  var body = baseDoc.getActiveSection();

  for (var i = 1; i < docIDs.length; ++i ) {
    var otherBody = DocumentApp.openById(docIDs[i]).getActiveSection();
    var totalElements = otherBody.getNumChildren();
    for( var j = 0; j < totalElements; ++j ) {
      var element = otherBody.getChild(j).copy();
      var type = element.getType();
      if( type == DocumentApp.ElementType.PARAGRAPH )
        body.appendParagraph(element);
      else if( type == DocumentApp.ElementType.TABLE )
        body.appendTable(element);
      else if( type == DocumentApp.ElementType.LIST_ITEM )
        body.appendListItem(element);
      else
        throw new Error("Unknown element type: "+type);
    }
  }
}

function copyDriveFile(sourceFileId, destinationFolderId) {
  let sourceFile = DriveApp.getFileById(sourceFileId);
  let sourceFileName = sourceFile.getName();
  let newFileName = sourceFileName;
  let targetFolder = DriveApp.getFolderById(destinationFolderId);
  let newFile = sourceFile.makeCopy(newFileName, targetFolder);
  return newFile.getId();
}

function fillDocumentTemplate(doc, keyword, newText) {
  var ps = doc.getParagraphs();
  for(var i=0; i<ps.length; i++) {
    var p = ps[i];
    var text = p.getText();

    if(text.indexOf(keyword) >= 0) {
      p.setText(newText);
      p.setBold(false);
      
    }
  } 
}

    function fillSpreadSheetTemplate(fileId, sheet,placeholder, text) {
  console.log("Start fillTemplates Function with placeholder text: "+placeholder)
    //Update Forms W/ Name and Date
    
        try {
           
            var ss = SpreadsheetApp.openById(fileId);
            //Opens the First Sheet
            // console.log("File: "+fileId)
            var sheet = ss.getSheets()[sheet];
            var sheetLastRow = sheet.getLastRow();
            var sheetLastColumn = sheet.getLastColumn();
            var sheetData = sheet.getRange(1, 1, sheetLastRow, sheetLastColumn).getValues();
            for (var i = 0; i < sheetLastRow; i++) {
                for (var ii = 0; ii < sheetLastColumn; ii++) {
                    //console.log("Canidate:"+ sheetData[i][ii])
                    if (sheetData[i][ii] != (undefined || 'a' || '')) {
                        if (sheetData[i][ii].toString().indexOf(placeholder) != -1) {
                            sheet.getRange(i + 1, ii + 1, 1, 1).setValue(text);
                            //console.log("Canidate Found:" + i+"+"+ ii)
                        }
                    }
                }
            }
            console.log("File Sucessful:" + fileId)

        } catch (error) {
          console.log("Error: "+error)
            return error.toString();
        }
    
}

function fillDocsTemplate(doc, String, newString, StringHeader) {
  var ps = doc.getParagraphs();
  for(var i=0; i<ps.length; i++) {
    var p = ps[i];
    var text = p.getText();
    //var text = p.editAsText();
    
    //look if the String is present in the current paragraph
    if(text.indexOf(String) >= 0) {
            // we calculte the length of the string to modify, making sure that is trated like a string and not another ind of object.

      var newStringLength = newString.toString().length;
    
      //Add Descriptors If Provided
      if(typeof StringHeader === "undefined")
      {
        p.editAsText().replaceText(String, newString);
      }
      else
      {
        p.editAsText().replaceText(String, (StringHeader+": "+newString));
      }
      if(newString == ""){
      if(p.getText().length != 0){
      p.editAsText().replaceText(String, "");
      } else{
      var lastP = ps.length-1;
      if (i==lastP) p.clear();
      else
      p.removeFromParent();
      }
      }
    }
  } 
}
