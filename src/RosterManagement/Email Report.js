function emailAccountReport() {
var noAccount = compareUsers(1);
var noAccountLen =noAccount.length;
var notOnRoster = compareUsers(0);
var notOnRosterLen =notOnRoster.length;
Logger.log("noAccount"+noAccount)
Logger.log("notOnRoster"+notOnRoster)
//sets active sheet and gets the data and sheet headers
  var reportDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MMMM dd, yyyy");
  var reportTime = new Date();

      //Composes Email Subject and Std Body
  var subject = "KVRS Google Workspace User Account Discrepancy Report (" + reportDate +")";
  var body;
  
 
//email Header  
  var htmlBody = "<!DOCTYPE html>\
<html xml:lang=\"en\" lang=\"en\" xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\">\
\
<head>\
  <!--yahoo fix-->\
</head>\
\
<head>\
  <!--Help character display properly.-->\
  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\>\
  <!--Set the initial scale of the email.-->\
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\
  <!--Force Outlook clients to render with a better MS engine.-->\
  <meta http-equiv=\"X-UA-Compatible\" content=\"IE=Edge\">\
  <!--Help prevent blue links and autolinking-->\
  <meta name=\"format-detection\" content=\"telephone=no, date=no, address=no, email=no\">\
  <!--prevent Apple from reformatting and zooming messages.-->\
  <meta name=\"x-apple-disable-message-reformatting\">\
\
  <!--target dark mode-->\
  <meta name=\"color-scheme\" content=\light dark\">\
  <meta name=\"supported-color-schemes\" content=\"light dark\">\
\
  <!-- Allow for better image rendering on Windows hi-DPI displays. -->\
  <!--[if mso]>\
        <xml>\
          <o:OfficeDocumentSettings>\
            <o:AllowPNG/>\
            <o:PixelsPerInch>96</o:PixelsPerInch>\
          </o:OfficeDocumentSettings>\
        </xml>\
        <![endif]-->\
\
  <!--to support dark mode meta tags-->\
  <style type=\"text/css\">\
    :root {\
      color-scheme: light dark;\
      supported-color-schemes: light dark;\
    }\
  </style>\
\
  <style type=\"text/css\">\
    .body-fix {\
      height: 100% !important;\
      margin: 0 auto !important;\
      padding: 0 !important;\
      width: 100% !important;\
      -webkit-text-size-adjust: 100%;\
      -ms-text-size-adjust: 100%;\
      -webkit-font-smoothing: antialiased;\
    }\
\
    div[style*=\"margin:16px 0\"] {\
      margin: 0 !important;\
    }\
\
    table,\
    td {\
      border-collapse: collapse !important;\
      mso-table-lspace: 0pt;\
      mso-table-rspace: 0pt;\
      -webkit-text-size-adjust: 100%;\
      -ms-text-size-adjust: 100%;\
    }\
\
    img {\
      border: 0;\
      line-height: 100%;\
      outline: none;\
      text-decoration: none;\
      display: block;\
    }\
\
    p,\
    h1,\
    h2,\
    h3 {\
      padding: 0;\
      margin: 0;\
    }\
\
    a[x-apple-data-detectors] {\
      color: inherit !important;\
      text-decoration: none !important;\
      font-size: inherit !important;\
      font-family: inherit !important;\
      font-weight: inherit !important;\
      line-height: inherit !important;\
    }\
\
    u+#body a {\
      color: inherit;\
      text-decoration: none;\
      font-size: inherit;\
      font-family: inherit;\
      font-weight: inherit;\
      line-height: inherit;\
    }\
\
    #MessageViewBody a {\
      color: inherit;\
      text-decoration: none;\
      font-size: inherit;\
      font-family: inherit;\
      font-weight: inherit;\
      line-height: inherit;\
    }\
\
    a:hover {\
      text-decoration: none !important;\
    }\
\
    .mobile {\
      display: none;\
    }\
  </style>\
\
  <!--mobile styles-->\
  <style>\
    @media screen and (max-width:600px) {\
      .wMobile {\
        width: 95% !important;\
      }\
\
      .wInner {\
        width: 80% !important;\
      }\
\
      .desktop {\
        width: 0 !important;\
        display: none !important;\
      }\
\
      .mobile {\
        display: block !important;\
      }\
    }\
  </style>\
\
  <!--dark mode styles-->\
  <!--these are just example classes that can be used.-->\
  <style>\
    @media (prefers-color-scheme: dark) {\
\
      /* Shows Dark Mode-Only Content, Like Images */\
      .dark-img {\
        display: block !important;\
        width: auto !important;\
        overflow: visible !important;\
        float: none !important;\
        max-height: inherit !important;\
        max-width: inherit !important;\
        line-height: auto !important;\
        margin-top: 0px !important;\
        visibility: inherit !important;\
      }\
\
      /* Hides Light Mode-Only Content, Like Images */\
      .light-img {\
        display: none;\
        display: none !important;\
      }\
\
      /* Custom Dark Mode Background Color */\
      .darkmode {\
        background-color: #100E11 !important;\
      }\
      .darkmode2 {\
        background-color: #020203 !important;\
      }\
      .darkmode3 {\
        background-color: #1b181d !important;\
      }\
\
      /* Custom Dark Mode Font Colors */\
      h1, h3, p, span, a, ol, li {\
        color: #fdfdfd !important;\
      }\
        h2, h2 a { color: #028383 !important; }\
        \
\
      /* Custom Dark Mode Text Link Color */\
      .link { color: #028383 !important; }\
      .footer a.link{ color: #fdfdfd !important; }\
    }\
\
    /* Copy dark mode styles for android support */\
    /* Shows Dark Mode-Only Content, Like Images */\
    [data-ogsc] .dark-img {\
      display: block !important;\
      width: auto !important;\
      overflow: visible !important;\
      float: none !important;\
      max-height: inherit !important;\
      max-width: inherit !important;\
      line-height: auto !important;\
      margin-top: 0px !important;\
      visibility: inherit !important;\
    }\
\
    /* Hides Light Mode-Only Content, Like Images */\
    [data-ogsc] .light-img {\
      display: none;\
      display: none !important;\
    }\
\
    /* Custom Dark Mode Background Color */\
    [data-ogsc] .darkmode {\
      background-color: #100E11 !important;\
    }\
    [data-ogsc] .darkmode2 {\
      background-color: #020203 !important;\
    }\
    [data-ogsc] .darkmode3 {\
      background-color: #1b181d !important;\
    }\
\
    /* Custom Dark Mode Font Colors */\
    [data-ogsc] h1, [data-ogsc] h3, [data-ogsc] p, [data-ogsc] span, [data-ogsc] a, [data-ogsc] li {\
      color: #fdfdfd !important;\
    }\
      [data-ogsc] h2, [data-ogsc] h2 a { color: #028383 !important; }\
\
    /* Custom Dark Mode Text Link Color */\
    [data-ogsc] .link { color: #028383 !important; }\
      \
    [data-ogsc] .footer a.link { color: #fdfdfd !important; }\
  </style>\
\
  <!--correct superscripts in Outlook-->\
  <!--[if (gte mso 9)|(IE)]>\
        <style>\
          sup{font-size:100% !important;}\
        </style>\
        <![endif]-->\
  <title></title>\
</head>\
\
<body id=\"body\" class=\"darkmode body-fix\">\
    <div role=\"article\" aria-roledescription=\"email\" aria-label=\"Email from Wonderblum\" xml:lang=\"en\" lang=\"en\">\
        \
        <!--hidden preheader with preh-header spacer hack-->\
        <div class=\"example-builder-preview-text\" style=\"display:none;font-size:0px;color:transparent;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;\"><!--preview text-->&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>\
\
      <!--start of email-->\
      <table class=\"darkmode\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" role=\"presentation\" style=\"width:100%;\">\
          <!--main content area-->\
          <tr>\
              <td align=\"center\" valign=\"top\" style=\"padding: 0 15px;\">\
                  <table class=\"wMobile\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" role=\"presentation\" style=\"width:100%;\">\
                        <!--header-->\
                        <tr>\
                            <td align=\"left\" valign=\"middle\" style=\"padding: 60px 5px 45px 5px;\">\
                                    <!--light mode logo image-->\
                                    <a href=\"https://www.ketchikanrescue.org/***utm***\" target=\"_blank\"><img class=\"light-img\" src=\"https://dl.dropboxusercontent.com/s/z8e42jwi9ncv3ja/kvrsheader.png\" width=\"100\" alt=\"Ketchikan Volunteer Rescue Squad (KVRS)\" style=\"color: #33373E;font-family: \'Trebuchet MS\', Arial, sans-serif;font-weight: bold;font-size: 20px;line-height: 40px;text-decoration: none;margin: 0;padding: 0;height: auto;\" border=\"0\" />\
                                    \
                                    <!--dark mode logo image-->\
                                    <!--[if !mso]><! -->\
                                    <div class=\"dark-img\" style=\"display:none; overflow:hidden; width:0px; max-height:0px; max-width:0px; line-height:0px; visibility:hidden;\">\
                                      <img src=\"https://dl.dropboxusercontent.com/s/z8e42jwi9ncv3ja/kvrsheader.png\" width=\"100\" alt=\"Ketchikan Volunteer Rescue Squad (KVRS)\" style=\"color: #ffffff; font-family: \'Trebuchet MS\', Arial, sans-serif; font-weight:bold; font-size: 20px; line-height:40px; text-decoration: none; margin: 0; padding: 0;\" border=\"0\" />\
                                    </div>\
                                    <!--<![endif]--></a>\
                            </td>\
                        </tr>\
                        \
                        <tr>\
                            <td align=\"center\" valign=\"top\">\
                                <!--Greeting-->\
                                <p style=\"font-family: \'Trebuchet MS\', Arial, sans-serif; font-size:16px; line-height:22px; color:#0a080b; margin: 0 0 30px; padding:0; text-align: left;\">The following is an automated report generated on "+reportDate+" to assist KVRS board members and system administrators managing user account provisioning for the ketickanrescue.org Google Workspace environment. It identifies discrepancies between the <u><a href='https://docs.google.com/spreadsheets/d/1iyFmLy4jXW01UjA3-wLJAJD_dSma1cPRKjAfGI243sQ'>Membership Roster sheet</a></u> and active Google Workspace accounts for the ketchikanrescue.org domain. It is important to note that not all the entries listed below require action, as there may be members who do not require Google Workspace accounts due to the nature of their choice of volunteer activities or are accounts used to execute scripts in the system.</p>\
                        <!--Message content-->\
                                <p style=\"font-family: \'Trebuchet MS\', Arial, sans-serif; font-size:16px; line-height:22px; color:#0a080b; margin: 0 0 10px; padding:0; text-align: left;\">The following Google Workspace (ketchikanrescue.org) user acounts do not match a name in the <a href='https://docs.google.com/spreadsheets/d/1iyFmLy4jXW01UjA3-wLJAJD_dSma1cPRKjAfGI243sQ'>Membership Roster sheet</a> and should be reviewed. They may belong to former KVRS members and need to be disabled in the <u><a href=\"https://admin.google.com\">Google Workspeace Admin Pannel</a></u>, have a mismatch between the name on the roster and their Workspace account, or the account may be a share account or used to execute scripts such as those used for the IMS or Trip Plan/SPOT programs.</p>\
<ul style=\"font-family: 'Trebuchet MS', Arial, sans-serif; font-size:14px; line-height:22px; color:#0a080b; margin: 0 0 30px; padding: 0 30px; text-align: left;\">";
//Compose details list 
  for (var i = 0; i < notOnRosterLen; i++) {   
    var mbrEmail
   
    htmlBody +="<li>"+notOnRoster[i][0] + ", " + notOnRoster[i][1]+" ("+notOnRoster[i][2]+")</li>";
        
  }
   //If no data append note
  if(notOnRosterLen == 0)
  {
      htmlBody+="<li>There are no Google Workspace Accounts that do not match a name on the roster. This probably there is probably a data error.</li>";
  }
  htmlBody+="</ul>\
<p style=\"font-family: 'Trebuchet MS', Arial, sans-serif; font-size:16px; line-height:22px; color:#0a080b; margin: 0 0 10px; padding:0; text-align: left;\">The following names on the <u><a href=\"https://docs.google.com/spreadsheets/d/1iyFmLy4jXW01UjA3-wLJAJD_dSma1cPRKjAfGI243sQ\">Membership Roster</a></u> do not match a exising Google Workspace (ketchikanrescue.org) user account. Please review this list to determine if an new account should be created for the member by an Google Workspace Admin.</p>\
                                \
                                <ul style=\"font-family: 'Trebuchet MS', Arial, sans-serif; font-size:14px; line-height:22px; color:#0a080b; margin: 0 0 30px; padding: 0 30px; text-align: left;\">";
//Compose details list 
  for (var i = 0; i < noAccountLen; i++) {   
     if (noAccount[i][3] == ""){
mbrEmail ="No Email Listed On Roster";
    }
    else
    {
      mbrEmail = noAccount[i][3];
    }
    htmlBody +="<li>"+noAccount[i][0] + ", " + noAccount[i][1]+" ("+mbrEmail+")</li>";
        
  }
   //If no overdue reports append note
  if(notOnRosterLen == 0)
  {
      htmlBody+="<li>There are no members on the roster that do no have Google Workspace (ketchikanrescue.org) accounts.</li>";
  }
  htmlBody+="</ul>\
\
                            </td>\
                        </tr>\
\
                        <!--footer-->\
                        <tr>\
                            <td align=\"left\" valign=\"top\" style=\"padding-left: 5px;\">\
                                <p style=\"font-family: \'Trebuchet MS\', Arial, sans-serif; font-size:16px; line-height:20px; color:#0a080b; margin: 30px 0; padding:0; text-align: left;\">----------</p>\
                                \
                                <p style=\"font-family: \'Trebuchet MS\', Arial, sans-serif; font-size:13px; line-height:17px; color:#0a080b; margin: 30px 0; padding:0; text-align: left;\">This is a system generated message sent from an unmonitored email box. Please contact Tai (<a href=\"mailto:taichan@ketchikanrescue.org\">taichan@ketchikanrescue.org</a>) with questions.</p>\
                            </td>\
                        </tr>\
                   </table>\
                </td>\
           </tr>\
       </table>\
   </div>\
\
   <!--analytics-->\
</body>\
\
</html>\
";
  
//Send email from no-reply address
var options = {};
options.name = "KVRS IMS System";
options.noReply = true
options.htmlBody = htmlBody;

  MailApp.sendEmail(SystemSettings.IMS_ACCOUNT_REPORT_RECIPIENTS, subject,"Basic Text",options);
  Logger.log("Account Discrepancy Report Sent");
  //sendDebugEmail();
}
