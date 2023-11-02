function emailOverdueAlert(row) {
    //Enter email Address For Alerts To Be Sent To  
    //sets active sheet and gets the data and sheet headers
    var ss = SpreadsheetApp.openById(SystemSettings.TRIPPLAN_SHEET_ID);
    var sheet = ss.getSheetByName("Tracker");
    var details = sheet.getRange(row, 1, 1, 10).getValues()[0];
    var headers = sheet.getRange(1, 1, 1, 10).getValues()[0];
    //Composes Email Subject and Std Body
    var subject = "KVRS TRIP PLAN OVERDUE ALERT:  " + details[1] + " Trip Plan is OVERDUE as of " + details[4];
    var body = [];
    var dtgOverdue = details[4];
    //Ccmposes details list 
    var cols = [1, 0, 2, 3, 4, 5, 6];
    for (var i = 0; i < details.length; i++) {
        if (cols.indexOf(i) === -1) continue;
        body.push(headers[i] + ": " + details[i]);
        var tpUrl = details[9];
    }
    //Append closing instructiosn  
    var beacon = details[6]
    var dtgStart = details[0]
    if (details[2] < details[0]) dtgStart = details[2]
    sendOverdueNotification(SystemSettings.TRIPPLAN_ALERT_RECIPIENTS, subject, body, beacon, dtgStart, dtgOverdue, tpUrl);
    console.log("Email Sent");
}
function sendOverdueNotification(email, subject, body, beacon, dtgStart, dtgOverdue,tpUrl) {
  //email Header  
  var tz = Session.getScriptTimeZone();
  var dtgOverdue = Utilities.formatDate(new Date(dtgOverdue), tz, "HH:mm' at 'MM-dd-yy")

  var beaconAvailable = 0;
  var ss = SpreadsheetApp.openById(SystemSettings.SPOT_SPREADSHEET_ID);
  var logSheet = ss.getSheetByName("IMS SPOT Data");
  var logLastRow = logSheet.getLastRow();
  var logLastColumn = logSheet.getLastColumn(); 
  var beaconData = logSheet.getRange(2, 1, (logLastRow-1), logLastColumn).getValues();
  
  for (var row = 0; row < beaconData.length; row++){
  if(beaconData[row][(SystemSettings.SPOT_DATAEXPORT_BEACON_COL-1)] != ("KVRS "+beacon)) continue;
    if(new Date(beaconData[row][(SystemSettings.SPOT_DATAEXPORT_LOCAL_COL-1)]) < new Date(dtgStart)) continue;
    beaconAvailable = 1;
    var beacon = beaconData[row][(SystemSettings.SPOT_DATAEXPORT_BEACON_COL-1)];
    var beaconLat = beaconData[row][(SystemSettings.SPOT_DATAEXPORT_LAT_COL-1)];
    var beaconLong = beaconData[row][(SystemSettings.SPOT_DATAEXPORT_LONG_COL-1)];
  }

  
  
  
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
KVRS Trip Plan Overdue Report \
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
    </tr>";
    
 //
  //Start Details Section
//
 
    htmlBody += "<tr>\<td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 15px;\" class=\"padding\">\
            <!--[if (gte mso 9)|(IE)]>\
            <table align=\"center\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">\
            <tr>\
            <td align=\"center\" valign=\"top\" width=\"500\">\
            <![endif]-->\
 <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"responsive-table\">\
                <tr>\
                    <td>\
                        <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\
                           <tr>\
                                <td align=\"center\">\
                                  SPOT PARTNER Locations: If this beacon has been returned to your site, please close out the becon in the <a href=\"https://script.google.com/a/macros/ketchikanrescue.org/s/AKfycbxL9zf5eamRCUqteVzzGVzSMznz-9ULgYP_o7G9hcG8/exec\">KVRS Trip Plan System</a>. A email confirmation indicating the overdue alert has been canceled will be sent after submission.\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>\
              </table>\
            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 500px;\" class=\"responsive-table\">\
                 <tr>\
                       <!-- COPY -->\
                    <td align=\"center\" style=\"font-size: 32px; font-family: Helvetica, Arial, sans-serif; color: #333333; padding-top: 30px;\" class=\"padding-copy\">Overdue Trip Plan</td>\
                </tr>\
                <tr>\
        <td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 15px;\">\
            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"responsive-table\">\
                       <tr>\
                    <td>\
                        <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">";
 for (var i = 0; i < (body.length); i++) {
        htmlBody += "<tr><td align=\"center\">\ "+body[i];+"</td><td>\"";
    }
  htmlBody +="<tr>\
<td>\
<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\
                                        <tr>\
                                            <td align=\"center\" style=\"padding-top: 25px;\" class=\"padding\">\
                                                <table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" class=\"mobile-button-container\">\
                                                    <tr>\
                                                        <td align=\"center\" style=\"border-radius: 3px;\" bgcolor=\"#256F9C\"><a href=\"";
                                                        htmlBody += tpUrl;
  htmlBody += "G\" target=\"_blank\" style=\"font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; border-radius: 3px; padding: 15px 25px; border: 1px solid #256F9C; display: inline-block;\" class=\"mobile-button\">View Trip Plan</a>\
                                                        </td>\
                                                    </tr>\
                                                </table>\
                                            </td>\
                                        </tr>\
                                    </table>\
                                    </td>\
                                    </tr>";
                                                                
htmlBody += "</table>\
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
  

    
//start section tracker Button
  if(beaconAvailable === 1) {
    htmlBody +="<tr>\
        <td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 15px;\">\
            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"responsive-table\">\
                <tr>\
                    <td>\
                        <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\
                           <tr>\
                                <td align=\"center\">\
SPOT data for the associated beacon has been logged in system since this trip plan was submitted.\
</td>\
</tr>\
<tr>\
                                <td align=\"center\">\
                                    <!-- BULLETPROOF BUTTON -->\
                                    <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\
                                        <tr>\
                                            <td align=\"center\" style=\"padding-top: 25px;\" class=\"padding\">\
                                                <table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" class=\"mobile-button-container\">\
                                                    <tr>\
                                                        <td align=\"center\" style=\"border-radius: 3px;\" bgcolor=\"#256F9C\"><a href=\"https://fusiontables.google.com/embedviz?q=select+col22+from+1SawWDb58BPPR6nFwIMlRx8DvEPct73_c0aMZerWw+where+col20+%3D+\'";
                                                        htmlBody += beacon;
  htmlBody += "\'&viz=MAP&h=false&lat=";
  htmlBody += beaconLat;
  htmlBody += "&lng=";
  htmlBody += beaconLong
  htmlBody += "&t=4&t=4&z=11&l=col22&y=2&tmplt=3&hml=TWO_COL_LAT_LNG\" target=\"_blank\" style=\"font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; border-radius: 3px; padding: 15px 25px; border: 1px solid #256F9C; display: inline-block;\" class=\"mobile-button\">View SPOT Data</a></td>\
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
    </tr>";
  };
//start Footter
htmlBody += "<tr>\
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
  MailApp.sendEmail(email, subject, body, {noReply:true, htmlBody:htmlBody});
  console.log("Overdue Sent");
}
