function emailDailyReport() {
 
//sets active sheet and gets the data and sheet headers
  var ss = SpreadsheetApp.openById(SystemSettings.SPOT_DATA_SHEET_ID);
  var sheet = ss.getSheetByName("IMS SPOT Data");
  
  var endRow = sheet.getLastRow();
  var reportDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm '('z')' 'on' EEE MMMM dd, yyyy");
  var reportTime = new Date();
  var reportDateMinus24 = new Date(reportTime.setDate(reportTime.getDate()-1));
  var reportTime =new  Date();
  var messageCount = 0;
  var beaconCount = 0;
  var headers = sheet.getRange(1, 1, 1, 17).getValues()[0];
  var beaconLog = [];
  var beaconNameLog = [];
  var beaconNameCount 
  var map = Maps.newStaticMap().setMapType(Maps.StaticMap.Type.HYBRID);
  var body;
//Gets data for filters
  var reportData = sheet.getRange(2, 1, (endRow-1), 17).getValues();
//Composes Email Subject and Std Body
  var subject = "KVRS SPOT Activity Summary as of " + reportDate;
//total Row Couter 
  for (var row = 0; row < (endRow-2); row++) {
    //Logger.log("Canidate Data:" +reportData[row][15]);
    var canidateDate = new Date(reportData[row][15]);
    //Logger.log("Canidate Date: "+ canidateDate + " Comparison Date: " +reportDateMinus24);
    if (canidateDate < reportDateMinus24) continue;
    //Logger.log( "Canidate Row Selected: "+row);
    //Logger.log( "Canidate Row Color: "+reportData[row][16]);
    var rowColor = reportData[row][16].slice(6).toUpperCase();
    //Logger.log( "Canidate Row Color: "+rowColor);
    messageCount++;
    map.setMarkerStyle(Maps.StaticMap.MarkerSize.TINY, Maps.StaticMap.Color.RED, 'T');
    map.addMarker(reportData[row][5], reportData[row][6]);
    if (beaconLog.indexOf(reportData[row][1]) == -1){ 
      beaconLog += reportData[row][1];
      beaconNameLog += reportData[row][2];
      beaconCount ++;
      }  
  }
  Logger.log("BeaconLog:"+beaconLog) 
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
SPOT Activity From ";
  htmlBody += reportDateMinus24
  htmlBody += " to ";
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
                                <td align=\"center\" style=\"font-size: 32px; font-family: Helvetica, Arial, sans-serif; color: #333333; padding-top: 30px;\" class=\"padding-copy\">SPOT Beacon Activity Report</td>\
                            </tr>";
  
  if(messageCount == 0)
  {
      htmlBody+="<tr>\
                    <td align=\"center\" style=\"padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666; class=\"padding-copy\" font-style:italic;\">No SPOT Activity Messages Have Been Recieved Within The Last 24 Hours.\
                    </td>\
                </tr>";
  }
    else
    {
      htmlBody+="<tr>\
                     <td align=\"center\" style=\"padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;\" class=\"padding-copy\"> In the Last 24 Hours "
      htmlBody+= beaconCount;
      htmlBody+= " SPOT Beacon(s) Were Actve.";
      htmlBody+="   </td>\
                </tr>";
      htmlBody+="<tr>\
                     <td align=\"center\" style=\"padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;\" class=\"padding-copy\">"
      htmlBody+= beaconNameLog;
      htmlBody+="   </td>\
                </tr>";
      
      
    } 
htmlBody+="\
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

   //If no overdue reports append note
    //Logger.log("Message Count: " +messageCount + "Beacon Count: "+ beaconCount);  
 //
  //Start Map Section
//
 if(messageCount != 0)
  {
    htmlBody += "<tr>\<td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 15px;\" class=\"padding\">\
            <!--[if (gte mso 9)|(IE)]>\
            <table align=\"center\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"500\">\
            <tr>\
            <td align=\"center\" valign=\"top\" width=\"500\">\
            <![endif]-->\
            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 500px;\" class=\"responsive-table\">\
                 <tr>\
                       <!-- COPY -->\
                    <td align=\"center\" style=\"font-size: 32px; font-family: Helvetica, Arial, sans-serif; color: #333333; padding-top: 30px;\" class=\"padding-copy\">SPOT Activity Map</td>\
                </tr>";
    
    htmlBody +="<tr>\
        <td bgcolor=\"#ffffff\" align=\"center\" style=\"padding: 15px;\">\
            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"500\" class=\"responsive-table\">\
                <tr>\
                    <td>\
                        <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\
                           <tr>\
                                <td align=\"center\">\
                                   <img alt=\"SPOT Map\" src=\"";
console.log(map.getMapUrl());  
  htmlBody += map.getMapUrl();
htmlBody +="\" style=\"display: block; font-family: Helvetica, Arial, sans-serif; color: #ffffff; font-size: 16px;\" border=\"0\">\
                                </td>\
                            </tr>\
                        </table>\
                    </td>\
                </tr>";
   htmlBody+="</table>\
            <!--[if (gte mso 9)|(IE)]>\
            </td>\
            </tr>\
            </table>\
            <![endif]-->\
        </td>\
    </tr>";
  }

    
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
                                                        <td align=\"center\" style=\"border-radius: 3px;\" bgcolor=\"#256F9C\"><a href=\"https://fusiontables.google.com/DataSource?docid=1SawWDb58BPPR6nFwIMlRx8DvEPct73_c0aMZerWw#map:id=3\" target=\"_blank\" style=\"font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; border-radius: 3px; padding: 15px 25px; border: 1px solid #256F9C; display: inline-block;\" class=\"mobile-button\">View SPOT Tracker</a></td>\
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
  MailApp.sendEmail(
  {to: SystemSettings.SPOT_COORDINATOR_RECIPIENTS,
  subject: subject,
  noReply:true,
  htmlBody:htmlBody});
  
  Logger.log("Daily Report Sent");
}
