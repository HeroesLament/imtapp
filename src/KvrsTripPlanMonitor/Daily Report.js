function emailDailyReport() {
//Enter email Address For Alerts To Be Sent To    
 
//sets active sheet and gets the data and sheet headers
  var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
  var sheet = ss.getSheetByName("Tracker");
  var endRow = sheet.getLastRow();
  var reportDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm '('z')' 'on' EEE MMMM dd, yyyy");
  var reportTime = new Date();
  var reportTimePlus24 = new Date(reportTime.setDate(reportTime.getDate()+1));
  var overdueCount = 0;
  var openCount = 0
  var expiringCount = 0;
  var headers = sheet.getRange(1, 1, 1, 9).getValues()[0];
  //Gets data for filters
  if(endRow == 1){
    var reportData
    }else{
  var reportData = sheet.getRange(2, 1, (endRow-1), 9).getValues();
    }
      //Composes Email Subject and Std Body
  var subject = "KVRS Trip Plan Status Summary as of " + reportDate;
  var body;
  
 
//email Header  
  var htmlBody = "\
<!DOCTYPE html>\
<html>\
<head>\
<title>A Responsive Email Template</title>\
<!--\
\
    An email present from your friends at Litmus (@litmusapp)\
\
    Email is surprisingly hard. While this has been thoroughly tested, your mileage may vary.\
    It's highly recommended that you test using a service like Litmus (http://litmus.com) and your own devices.\
\
    Enjoy!\
 -->\
<meta charset=\"utf-8\">\
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\
<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\
<style type=\"text/css\">\
    /* CLIENT-SPECIFIC STYLES */\
    body, table, td, a{-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;} /* Prevent WebKit and Windows mobile changing default text sizes */\
    table, td{mso-table-lspace: 0pt; mso-table-rspace: 0pt;} /* Remove spacing between tables in Outlook 2007 and up */\
    img{-ms-interpolation-mode: bicubic;} /* Allow smoother rendering of resized image in Internet Explorer */\
\
    /* RESET STYLES */\
    img{border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none;}\
    table{border-collapse: collapse !important;}\
    body{height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important;}\
\
    /* iOS BLUE LINKS */\
    a[x-apple-data-detectors] {\
        color: inherit !important;\
        text-decoration: none !important;\
        font-size: inherit !important;\
        font-family: inherit !important;\
        font-weight: inherit !important;\
        line-height: inherit !important;\
    }\
\
    /* MOBILE STYLES */\
    @media screen and (max-width: 525px) {\
\
        /* ALLOWS FOR FLUID TABLES */\
        .wrapper {\
          width: 100% !important;\
            max-width: 100% !important;\
        }\
\
        /* ADJUSTS LAYOUT OF LOGO IMAGE */\
        .logo img {\
          margin: 0 auto !important;\
        }\
\
        /* USE THESE CLASSES TO HIDE CONTENT ON MOBILE */\
        .mobile-hide {\
          display: none !important;\
        }\
\
        .img-max {\
          max-width: 100% !important;\
          width: 100% !important;\
          height: auto !important;\
        }\
\
        /* FULL-WIDTH TABLES */\
        .responsive-table {\
          width: 100% !important;\
        }\
\
        /* UTILITY CLASSES FOR ADJUSTING PADDING ON MOBILE */\
        .padding {\
          padding: 10px 5% 15px 5% !important;\
        }\
\
        .padding-meta {\
          padding: 30px 5% 0px 5% !important;\
          text-align: center;\
        }\
\
        .padding-copy {\
             padding: 10px 5% 10px 5% !important;\
          text-align: center;\
        }\
\
        .no-padding {\
          padding: 0 !important;\
        }\
\
        .section-padding {\
          padding: 50px 15px 50px 15px !important;\
        }\
\
        /* ADJUST BUTTONS ON MOBILE */\
        .mobile-button-container {\
            margin: 0 auto;\
            width: 100% !important;\
        }\
\
        .mobile-button {\
            padding: 15px !important;\
            border: 0 !important;\
            font-size: 16px !important;\
            display: block !important;\
        }\
\
    }\
\
    /* ANDROID CENTER FIX */\
    div[style*=\"margin: 16px 0;\"] { margin: 0 !important; }\
</style>\
</head>\
<body style=\"margin: 0 !important; padding: 0 !important;\">\
\
<!-- HIDDEN PREHEADER TEXT -->\
<div style=\"display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;\">\
Summary of Open Trip Plans For ";
  htmlBody += reportDate; 
  htmlBody +=".\
</div>\
\
<!-- HEADER -->\
<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\
    <tr>\
        <td bgcolor=\"#ffffff\" align=\"center\">\
            <!--[if (gte mso 9)|(IE)]>\
            <table align=\"center\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">\
            <tr>\
            <td align=\"center\" valign=\"top\" width=\"500\">\
            <![endif]-->\
            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 500px;\" class=\"wrapper\">\
                <tr>\
                    <td align=\"center\" valign=\"top\" style=\"padding: 15px 0;\" class=\"logo\">\
                        <a href=\"http://ketchikanrescue.org\" target=\"_blank\">\
<img alt=\"KVRS Logo\" src=\"https://dl.dropboxusercontent.com/s/z8e42jwi9ncv3ja/kvrsheader.png\" width=\"250\" height=\"100\" style=\"display: block; font-family: Helvetica, Arial, sans-serif; color: #ffffff; font-size: 16px;\" border=\"0\">\
                        </a>\
                    </td>\
                </tr>\
            </table>\
            <!--[if (gte mso 9)|(IE)]>\
            </td>\
            </tr>\
            </table>\
            <![endif]-->\
        </td>\
    </tr>\
    <tr>\
        <td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 15px;\">\
            <!--[if (gte mso 9)|(IE)]>\
            <table align=\"center\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">\
            <tr>\
            <td align=\"center\" valign=\"top\" width=\"500\">\
            <![endif]-->\
            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 500px;\" class=\"responsive-table\">\
                <tr>\
                    <td>\
                        <!-- COPY -->\
                        <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\
                            <tr>\
                                <td align=\"center\" style=\"font-size: 32px; font-family: Helvetica, Arial, sans-serif; color: #333333; padding-top: 30px;\" class=\"padding-copy\">Trip Plan Status Report</td>\
                            </tr>\
                            <tr>\
                                <td align=\"center\" style=\"padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;\" class=\"padding-copy\">The following is the current status of active trip plans in the KVRS system as of ";
  htmlBody += reportDate 
  htmlBody += ".\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>\
            </table>\
            <!--[if (gte mso 9)|(IE)]>\
            </td>\
            </tr>\
            </table>\
            <![endif]-->\
        </td>\
    </tr>";

//
//Start Section For Overdue Trip Reports
// 
  
  htmlBody += "<tr>\<td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 15px;\" class=\"padding\">\
            <!--[if (gte mso 9)|(IE)]>\
            <table align=\"center\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">\
            <tr>\
            <td align=\"center\" valign=\"top\" width=\"500\">\
            <![endif]-->\
            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 500px;\" class=\"responsive-table\">\
                 <tr>\
                       <!-- COPY -->\
                    <td align=\"center\" style=\"font-size: 32px; font-family: Helvetica, Arial, sans-serif; color: #FF0000; padding-top: 30px;\" class=\"padding-copy\">Currently Overdue</td>\
                </tr>";
//Compose details list 
  for (var row = 0; row < (endRow-1); row++) {
    if (reportData[row][8].toString() != "OVERDUE") continue;
    overdueCount++;
    var details = sheet.getRange((row+2), 1, 1, 9).getValues()[0];
    
    //Last Name and SPOT Number
    htmlBody += "<tr>\
                      <td>\
                        <!-- TWO COLUMNS -->\
                        <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\">\
                            <tr>\
                                <td valign=\"top\" class=\"mobile-wrapper\" style=\"padding: 10px 0 0 0; border-top: 1px solid #aaaaaa\">\
                                    <!-- LEFT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"left\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"left\" style=\"font-family: Arial, sans-serif; color: #333333; font-size: 16px; font-weight: bold;\">";
    htmlBody +=headers[1] + ": " + details[1];
    htmlBody += "\
                                                        </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                    <!-- RIGHT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"right\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"right\" style=\"font-family: Arial, sans-serif; color: #333333; font-size: 16px;\">";
    htmlBody += headers[6] + ": KVRS " + details[6];
    htmlBody += "\
                                                        </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>";
                    
//Partner Location
    
        htmlBody += " <tr>\
                    <td style=\"padding: 0 0 0 0; border-bottom: 1px dashed #eaeaea;\">\
                        <!-- TWO COLUMNS -->\
                        <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\">\
                            <tr>\
                                <td valign=\"top\" class=\"mobile-wrapper\">\
                                    <!-- LEFT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"left\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"left\" style=\"font-family: Arial, sans-serif; color: #333333; font-size: 16px;\">";
    htmlBody +=headers[5];
    htmlBody += "\
                                                        </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                    <!-- RIGHT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"right\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"right\" style=\"font-family: Arial, sans-serif; color: #333333; font-size: 16px;\">";
    htmlBody += details[5];
    htmlBody += "\
                                                        </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>";
    
    //Dates
    for (var i = 0; i < details.length; i++) {
      var cols = [0, 2, 3, 4];
      if (cols.indexOf(i) === -1) continue;
        htmlBody += "\
                 <tr>\
                    <td>\
        <!-- TWO COLUMNS -->\
                        <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\">\
                            <tr>\
                                <td valign=\"top\" style=\"padding: 0;\" class=\"mobile-wrapper\">\
                                    <!-- LEFT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"left\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"left\" style=\"font-family: Arial, sans-serif;";
      //Changes Overdue Line To Red
      if (i == 4)
      {
        htmlBody += "color: #FF0000;";
      } else { 
        htmlBody += "color: #333333;";
      }
                                                        
                                                        htmlBody += " font-size: 16px;\">";
    htmlBody += headers[i];
    htmlBody +="\
                                                       </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                    <!-- RIGHT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"right\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"right\" style=\"font-family: Arial, sans-serif;";
      //Changes Overdue Line to Red
      if (i == 4)
      {
        htmlBody += "color: #FF0000;";
      } else { 
        htmlBody += "color: #333333;";
      }
                                                        
                                                        htmlBody += " font-size: 16px;\">";
                                                        
  htmlBody += reportDisplayFormat(details[i]);
  htmlBody += "\
                                                       </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>";
  }
  }
   //If no overdue reports append note
  Logger.log("Overdue Count: " +overdueCount);  
  if(overdueCount == 0)
  {
      htmlBody+="<tr>\
                    <td align=\"center\" style=\"padding: 10px 0 0 0; border-top: 1px dashed #aaaaaa; font-family: Helvetica, Arial, sans-serif; color: #666666; font-style:italic;\"> There Are No Trip Reports That Are Currently Overdue.\
                    </td>\
                </tr>";
  }
  htmlBody+="</table>\
            <!--[if (gte mso 9)|(IE)]>\
            </td>\
            </tr>\
            </table>\
            <![endif]-->\
        </td>\
    </tr>";
  
  
  
  
  
  
  
  
// 
//Start Section For Exipring Trip Reports
//
  
 htmlBody += "<tr>\<td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 15px;\" class=\"padding\">\
            <!--[if (gte mso 9)|(IE)]>\
            <table align=\"center\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">\
            <tr>\
            <td align=\"center\" valign=\"top\" width=\"500\">\
            <![endif]-->\
            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 500px;\" class=\"responsive-table\">\
                 <tr>\
                       <!-- COPY -->\
                    <td align=\"center\" style=\"font-size: 32px; font-family: Helvetica, Arial, sans-serif; color: #FF4F00; padding-top: 30px;\" class=\"padding-copy\">Overdue Within The Next 24 Hours</td>\
                </tr>";
//Compose details list 
  for (var row = 0; row < (endRow-1); row++) {
    if (reportData[row][8].toString() != "Open") continue;
    if (new Date(reportData[row][4]) > new Date(reportTimePlus24)) continue;;
    expiringCount++;
    var details = sheet.getRange((row+2), 1, 1, 9).getValues()[0];
    
    //Last Name and SPOT Number
    htmlBody += "<tr>\
                      <td>\
                        <!-- TWO COLUMNS -->\
                        <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\">\
                            <tr>\
                                <td valign=\"top\" class=\"mobile-wrapper\" style=\"padding: 10px 0 0 0; border-top: 1px solid #aaaaaa\">\
                                    <!-- LEFT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"left\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"left\" style=\"font-family: Arial, sans-serif; color: #333333; font-size: 16px; font-weight: bold;\">";
    htmlBody +=headers[1] + ": " + details[1];
    htmlBody += "\
                                                        </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                    <!-- RIGHT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"right\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"right\" style=\"font-family: Arial, sans-serif; color: #333333; font-size: 16px;\">";
    htmlBody += headers[6] + ": KVRS " + details[6];
    htmlBody += "\
                                                        </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>";
                    
//Partner Location
    
        htmlBody += " <tr>\
                    <td style=\"padding: 0 0 0 0; border-bottom: 1px dashed #eaeaea;\">\
                        <!-- TWO COLUMNS -->\
                        <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\">\
                            <tr>\
                                <td valign=\"top\" class=\"mobile-wrapper\">\
                                    <!-- LEFT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"left\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"left\" style=\"font-family: Arial, sans-serif; color: #333333; font-size: 16px;\">"
    htmlBody +=headers[5];
    htmlBody +="\
                                                       </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                    <!-- RIGHT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"right\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"right\" style=\"font-family: Arial, sans-serif; color: #333333; font-size: 16px;\">"
    htmlBody += details[5];
    htmlBody += "\
                                                        </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>";
    
    //Dates
    for (var i = 0; i < details.length; i++) {
      var cols = [0, 2, 3, 4];
      if (cols.indexOf(i) === -1) continue;
        htmlBody += "\
                 <tr>\
                    <td>\
        <!-- TWO COLUMNS -->\
                        <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\">\
                            <tr>\
                                <td valign=\"top\" style=\"padding: 0;\" class=\"mobile-wrapper\">\
                                    <!-- LEFT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"left\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"left\" style=\"font-family: Arial, sans-serif;";
    //Chages Overdue Line to Red      
    if (i == 4)
      {
        htmlBody += "color: #FF0000;";
      } else { 
        htmlBody += "color: #333333;";
      }
                                                        
                                                        htmlBody += " font-size: 16px;\">";
    htmlBody += headers[i];
    htmlBody +=" </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                    <!-- RIGHT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"right\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"right\" style=\"font-family: Arial, sans-serif; ";
    //Chages Overdue Line to Red      
    if (i == 4)
      {
        htmlBody += "color: #FF0000;";
      } else { 
        htmlBody += "color: #333333;";
      }
                                                        
                                                        htmlBody += " font-size: 16px;\">";;
                                                        
  htmlBody += reportDisplayFormat(details[i]);
  htmlBody += "</td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>";
  }
  }
   //If no expiring reports append note
  Logger.log("Expiring Count: " +expiringCount);  
  if(expiringCount == 0)
  {
      htmlBody+="<tr>\
                    <td align=\"center\" style=\"padding: 10px 0 0 0; border-top: 1px dashed #aaaaaa; font-family: Helvetica, Arial, sans-serif; color: #666666; font-style:italic;\">There Are No Trip Reports Expiring Withing The Next 24 Hours.\
                    </td>\
                </tr>";
  }
  htmlBody+="</table>\
            <!--[if (gte mso 9)|(IE)]>\
            </td>\
            </tr>\
            </table>\
            <![endif]-->\
        </td>\
    </tr>";  

  
//    
//Start Section for Open Trip Reports 
//
  
 htmlBody += "<tr>\<td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 15px;\" class=\"padding\">\
            <!--[if (gte mso 9)|(IE)]>\
            <table align=\"center\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">\
            <tr>\
            <td align=\"center\" valign=\"top\" width=\"500\">\
            <![endif]-->\
            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 500px;\" class=\"responsive-table\">\
                 <tr>\
                       <!-- COPY -->\
                    <td align=\"center\" style=\"font-size: 32px; font-family: Helvetica, Arial, sans-serif; color: #000000; padding-top: 30px;\" class=\"padding-copy\">Open Trip Reports\
</td>\
                </tr>";
//Compose details list 
  for (var row = 0; row < (endRow-1); row++) {
    if (reportData[row][8].toString() != "Open") continue;

    if (new Date(reportData[row][4]) <= new Date(reportTimePlus24))  continue;
    openCount++;
    var details = sheet.getRange((row+2), 1, 1, 9).getValues()[0];
    
    //Last Name and SPOT Number
    htmlBody += "<tr>\
                      <td>\
                        <!-- TWO COLUMNS -->\
                        <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\">\
                            <tr>\
                                <td valign=\"top\" class=\"mobile-wrapper\" style=\"padding: 10px 0 0 0; border-top: 1px solid #aaaaaa\">\
                                    <!-- LEFT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"left\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"left\" style=\"font-family: Arial, sans-serif; color: #333333; font-size: 16px; font-weight: bold;\">";
    htmlBody +=headers[1] + ": " + details[1];
    htmlBody += "</td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                    <!-- RIGHT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"right\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"right\" style=\"font-family: Arial, sans-serif; color: #333333; font-size: 16px;\">";
    htmlBody += headers[6] + ": KVRS " + details[6];
    htmlBody += "</td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>";
                    
//Partner Location
    
        htmlBody += " <tr>\
                    <td style=\"padding: 0 0 0 0; border-bottom: 1px dashed #eaeaea;\">\
                        <!-- TWO COLUMNS -->\
                        <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\">\
                            <tr>\
                                <td valign=\"top\" class=\"mobile-wrapper\">\
                                    <!-- LEFT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"left\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"left\" style=\"font-family: Arial, sans-serif; color: #333333; font-size: 16px;\">";
    htmlBody +=headers[5];
    htmlBody += "</td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                    <!-- RIGHT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"right\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"right\" style=\"font-family: Arial, sans-serif; color: #333333; font-size: 16px;\">";
    htmlBody += details[5];
    htmlBody += "</td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>";
    
    //Dates
    for (var i = 0; i < details.length; i++) {
      var cols = [0, 2, 3, 4];
      if (cols.indexOf(i) === -1) continue;
        htmlBody += "\
                 <tr>\
                    <td>\
        <!-- TWO COLUMNS -->\
                        <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\">\
                            <tr>\
                                <td valign=\"top\" style=\"padding: 0;\" class=\"mobile-wrapper\">\
                                    <!-- LEFT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"left\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"left\" style=\"font-family: Arial, sans-serif; ";
    //Chages Overdue Line to Red      
    if (i == 4)
      {
        htmlBody += "color: #FF0000;";
      } else { 
        htmlBody += "color: #333333;";
      }
                                                        
                                                        htmlBody += " font-size: 16px;\">";;
    htmlBody += headers[i];
    htmlBody +=" </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                    <!-- RIGHT COLUMN -->\
                                    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"47%\" style=\"width: 47%;\" align=\"right\">\
                                        <tr>\
                                            <td style=\"padding: 0 0 5 px 0;\">\
                                                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">\
                                                    <tr>\
                                                        <td align=\"right\" style=\"font-family: Arial, sans-serif; ";
    //Chages Overdue Line to Red      
    if (i == 4)
      {
        htmlBody += "color: #FF0000;";
      } else { 
        htmlBody += "color: #333333;";
      }
                                                        
                                                        htmlBody += " font-size: 16px;\">";;
                                                        
  htmlBody += reportDisplayFormat(details[i]);
  htmlBody += "</td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>";
  }
  }
   //If no open reports append note
  Logger.log("Open Count: " +openCount);  
  if(openCount == 0)
  {
      htmlBody+="<tr>\
                    <td align=\"center\" style=\"padding: 10px 0 0 0; border-top: 1px dashed #aaaaaa; font-family: Helvetica, Arial, sans-serif; color: #666666; font-style:italic;\"> There Are No Other Open Trip Reports.\
                    </td>\
                </tr>";
  }
  htmlBody+="</table>\
            <!--[if (gte mso 9)|(IE)]>\
            </td>\
            </tr>\
            </table>\
            <![endif]-->\
        </td>\
    </tr>"
    
//start section for footer
    htmlBody +="<tr>\
        <td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 15px;\">\
            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"responsive-table\">\
                <tr>\
                    <td>\
                        <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\
                           <tr>\
                                <td align=\"center\">\
                                    <!-- BULLETPROOF BUTTON -->\
                                    <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\
                                        <tr>\
                                            <td align=\"center\" style=\"padding-top: 25px;\" class=\"padding\">\
                                                <table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" class=\"mobile-button-container\">\
                                                    <tr>\
                                                        <td align=\"center\" style=\"border-radius: 3px;\" bgcolor=\"#256F9C\"><a href=\"https://spot.ketchikanrescue.org\" target=\"_blank\" style=\"font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; border-radius: 3px; padding: 15px 25px; border: 1px solid #256F9C; display: inline-block;\" class=\"mobile-button\">View Dashboard</a></td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>\
            </table>\
            <!--[if (gte mso 9)|(IE)]>\
            </td>\
            </tr>\
            </table>\
            <![endif]-->\
        </td>\
    </tr>\
    <tr>\
        <td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 20px 0px;\">\
            <!--[if (gte mso 9)|(IE)]>\
            <table align=\"center\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">\
            <tr>\
            <td align=\"center\" valign=\"top\" width=\"500\">\
            <![endif]-->\
            <!-- UNSUBSCRIBE COPY -->\
            <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" align=\"center\" style=\"max-width: 500px;\" class=\"responsive-table\">\
                  <tr>\
                    <td align=\"center\" style=\"font-size: 12px; line-height: 18px; font-family: Helvetica, Arial, sans-serif; color:#666666;\">\
                        Please do not respond to this email as it is automatically generated by an account that is not checked. <br>\
                        <br>\
                    </td>\
                </tr>\
                <tr>\
                    <td align=\"center\" style=\"font-size: 12px; line-height: 18px; font-family: Helvetica, Arial, sans-serif; color:#666666;\">\
                        Box 5786 Ketchikan, Alaska 99901 || (907) 225-9010 Phone \\ (907) 225-1909 Fax\
                    </td>\
                </tr>\
            </table>\
            <!--[if (gte mso 9)|(IE)]>\
            </td>\
            </tr>\
            </table>\
            <![endif]-->\
        </td>\
    </tr>\
</table>\
</body>\
</html>";
  
//Send email from no-reply address
var options = {};
options.name = "KVRS Trip Plan Program";
options.noReply = true
options.htmlBody = htmlBody;

  MailApp.sendEmail(SystemSettings.TRIPPLAN_DAILY_REPORT_RECIPIENTS, subject,"Basic Text",options);
  Logger.log("Daily Report Sent");
  //sendDebugEmail();
}

function reportDisplayFormat(time){
  return Utilities.formatDate( new Date(time), Session.getScriptTimeZone(), "EEE '('MM'/'dd'/'yy')' 'at' HH:mm '('z')'");
  
}
