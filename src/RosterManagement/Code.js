function listUsers() {
  var workgroupUsers = [];
  let pageToken;
  let page;
  do {
    page = AdminDirectory.Users.list({
      domain: 'ketchikanrescue.org',
      orderBy: 'familyName',
      maxResults: 100,
      pageToken: pageToken
    });
    const users = page.users;
    if (!users) {
      Logger.log('No users found.');
      return;
    }
    // Print the user's full name and email.
    for (const user of users) {
      workgroupUsers.push([user.name.familyName, user.name.givenName, user.primaryEmail, user.recoveryEmail, user.recoveryPhone, user.phones, user.emails, user.addresses]);
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
  Logger.log(workgroupUsers);
  return workgroupUsers;
}
function listGroup(groupId) {
  var groupId = "all-members@ketchikanrescue.org";
  var groupMbrs = [];
  let pageToken;
  let page;
  do {
    page = AdminDirectory.Members.list({
      groupKey: groupId,
      maxResults: 100,
      pageToken: pageToken
    });
    const mbrs = page.members;
    if (!mbrs) {
      Logger.log('No users found.');
      return;
    }
    // Print the user's full name and email.
    for (const mbr of mbrs) {
      groupMbrs.push([mbr.email, mbr.delivery_settings]);
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
  Logger.log(groupMbrs);
  return groupMbrs;
}
function listGroups() {
  var domain = "ketchikanrescue.org";
  var groupMbrs = [];
  let pageToken;
  let page;
  do {
    page = AdminDirectory.Groups.list({
      domain: 'ketchikanrescue.org',
      maxResults: 100,
      pageToken: pageToken
    });
    const mbrs = page.members;
    if (!mbrs) {
      Logger.log('No users found.');
      return;
    }
    // Print the user's full name and email.
    for (const mbr of mbrs) {
      groupMbrs.push([mbr.groupKey]);
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
  Logger.log(groupMbrs);
  return groupMbrs;
}
function listRoster() {
  var ss = SpreadsheetApp.openById(SystemSettings.MEMBER_ROSTER_SHEET_ID);
  var sheet = ss.getSheetByName("Sheet1");
  var sheetLastRow = sheet.getLastRow();
  var sheetLastColumn = sheet.getLastColumn();
  var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
  var sheetHeadersLen = sheetHeaders[0].length;
  var rowFirstName;
  var rowLastName;
  var rowHomeEmail;
  var rowWorkEmail;
  var rowKVRSAccount;
  var rowMobilePhone;
  var rowHomePhone;
  var rowWorkPhone;
  var rowCity;
  var rowState;
  var rowZip;
  for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
    if (sheetHeaders[0][hrow] == "Last Name") {
      rowLastName = hrow;
    };
    if (sheetHeaders[0][hrow] == "First Name") {
      rowFirstName = hrow;
    };
    if (sheetHeaders[0][hrow] == "Home Email") {
      rowHomeEmail = hrow;
    };
    if (sheetHeaders[0][hrow] == "Work Email") {
      rowWorkEmail = hrow;
    };
    if (sheetHeaders[0][hrow] == "KVRS Account") {
      rowKVRSAccount = hrow;
    };
    if (sheetHeaders[0][hrow] == "Mobile Phone") {
      rowMobilePhone = hrow;
    };
    if (sheetHeaders[0][hrow] == "Home Phone") {
      rowHomePhone = hrow;
    };
    if (sheetHeaders[0][hrow] == "Work Phone") {
      rowWorkPhone = hrow;
    };
    if (sheetHeaders[0][hrow] == "Address") {
      rowStreet = hrow;
    };
    if (sheetHeaders[0][hrow] == "City") {
      rowCity = hrow;
    };
    if (sheetHeaders[0][hrow] == "State") {
      rowState = hrow;
    };
    if (sheetHeaders[0][hrow] == "Zip") {
      rowZip = hrow;
    };
  }
  var sheetData = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
  var sheetDataLen = sheetData.length;
  var roster = [];
  for (var row = 0; row < sheetDataLen; row++) {
    var volLastName = sheetData[row][rowLastName];
    var volFirstName = sheetData[row][rowFirstName];
    var volHomeEmail = sheetData[row][rowHomeEmail];
    var volWorkEmail = sheetData[row][rowWorkEmail];
    var volKVRSAccount = sheetData[row][rowKVRSAccount];
    var volMobilePhone = sheetData[row][rowMobilePhone].toString();
    var volHomePhone = sheetData[row][rowHomePhone].toString();
    var volWorkPhone = sheetData[row][rowWorkPhone].toString();
    var volStreet = sheetData[row][rowStreet];
    var volCity = sheetData[row][rowCity].toString();
    var volState = sheetData[row][rowState].toString();
    var volZip = sheetData[row][rowZip].toString();
    var volAddress = ""
    if (volStreet != "") { volAddress = volStreet + " " + volCity + ", " + volState + " " + volZip; }
    roster.push([volLastName, volFirstName, volKVRSAccount, volHomeEmail, volWorkEmail, volMobilePhone, volHomePhone, volWorkPhone, volAddress, volStreet]);
  }
  //Logger.log(roster);
  return roster;
}

function updateUsers() {
  var groupId = "all-members@ketchikanrescue.org";
  var group = GroupsApp.getGroupByEmail(groupId);

  var roster = listRoster();
  var users = listUsers();
  var rosterLen = roster.length;
  var usersLen = users.length;
  for (var u = 0; u < usersLen; u++) {
    var userLastName = users[u][0].toString();
    var userFirstName = users[u][1].toString();
    var userAccount = users[u][2]
    var userRecoveryEmail = users[u][3];
    var userRecoveryPhone = users[u][4];
    var userPhones = users[u][5];
    var userMobilePhone = "";
    var userHomePhone = "";
    var userWorkPhone = "";
    var userEmails = users[u][6];
    var userHomeEmail = "";
    var userWorkEmail = "";
    var userAddresses = users[u][7];
    var userHomeAddress = "";
    for (var r = 0; r < rosterLen; r++) {
      var rosterLastName = roster[r][0].toString();
      var rosterFirstName = roster[r][1].toString();
      if (rosterFirstName == userFirstName && rosterLastName == userLastName) break;
    }
    if (r != rosterLen) {
      var rosterHomeEmail = roster[r][3].toString();
      var rosterWorkEmail = roster[r][4].toString();
      var rosterMobilePhone = roster[r][5].toString();
      var rosterHomePhone = roster[r][6].toString();
      var rosterWorkPhone = roster[r][7].toString();
      var rosterAddress = roster[r][8].toString();
      Logger.log("** Active userAccount:" + userAccount)
      if (userRecoveryEmail != rosterHomeEmail && rosterHomeEmail != "") {
        Logger.log("updateEmail")
        Logger.log("userRecoveryEmail" + userRecoveryEmail)
        var opt = { "recoveryEmail": rosterHomeEmail };
        AdminDirectory.Users.update(opt, userAccount)
      }
      var rosterMobilePhoneFormatted = "\+" + rosterMobilePhone;
      var rosterHomePhoneFormatted = "\+" + rosterHomePhone;
      var rosterWorkPhoneFormatted = "\+" + rosterWorkPhone;
      if (userRecoveryPhone != rosterMobilePhoneFormatted && rosterMobilePhone != "") {
        Logger.log("updatePhone")
        Logger.log("userRecoveryPhone" + userRecoveryPhone)
        Logger.log("rosterMobilePhoneFormatted" + rosterMobilePhoneFormatted)
        var opt = { "recoveryPhone": rosterMobilePhoneFormatted };
        AdminDirectory.Users.update(opt, userAccount)
      }
      if (userPhones != null) {
        //Logger.log("userPhones")
        //Logger.log(userPhones)
        for (var i = 0; i < userPhones.length; i++) {
          if (userPhones[i].type == "mobile") {
            userMobilePhone = userPhones[i].value;
          }
          else if (userPhones[i].type == "home") {
            userHomePhone = userPhones[i].value;
          }
          else if (userPhones[i].type == "work") {
            userWorkPhone = userPhones[i].value;
          }
        }
      }
      var optMobile = "";
      var opt = "";
      if (rosterMobilePhone != "" && rosterMobilePhoneFormatted != userMobilePhone) {
        optMobile = [{
          "type": "mobile",
          "value": rosterMobilePhoneFormatted,
          primary: true
        }];
        Logger.log("updated mobile phone");
      }
      if (optMobile != "") {
        Logger.log("optMobile" + optMobile)
        var opt = {
          "phones": optMobile,
        };
      }
      if (opt != "") {
        Logger.log("Updating Profile Phone Addresses: ")
        Logger.log(opt)
        AdminDirectory.Users.update(opt, userAccount)
      }
      if (userEmails.length > 1) {
        //Logger.log("userEmails")
        //Logger.log(userEmails)
        for (var i = 0; i < userEmails.length; i++) {
          if (userEmails[i].primary != true && userEmails[i].type == "work") {
            userWorkEmail = userEmails[i].address;
            //Logger.log("profile workEmail: " + userWorkEmail);
          }
          else if (userEmails[i].primary != true && userEmails[i].type == "home") {
            userHomeEmail = userEmails[i].address;
            //Logger.log("profile homeEmail: " + userHomeEmail);
          }
        }
      }
      var optHome = "";
      var optWork = "";
      var opt = "";
      var addHomeEmail = "";
      var groupStatus = null
      if (rosterHomeEmail != "") {
        Logger.log("rosterHomeEmail not blank")
       try{ groupStatus = group.hasUser(rosterHomeEmail);}
       catch{
         //var addHomeEmail = { email: "bdurland@kpunet.net", role: "MEMBER" };
         //AdminDirectory.Members.insert(addHomeEmail, groupId);
         Logger.log("group check error")
         Logger.log(rosterHomeEmail)
         Logger.log(groupStatus)
       }
                Logger.log("groupStatus"+groupStatus)

        if (groupStatus === false) {
                  Logger.log("group hasUser False"+rosterHomeEmail);
          var addHomeEmail = { email: rosterHomeEmail, role: "MEMBER" };
          AdminDirectory.Members.insert(addHomeEmail, groupId);
        }
      }
      if (rosterHomeEmail != "" && rosterHomeEmail != userHomeEmail) {
        Logger.log("rosterHomeEmail" + rosterHomeEmail)
        Logger.log("userHomeEmail" + userHomeEmail)
        optHome = [{
          "type": "home",
          "address": rosterHomeEmail,
        }];
        Logger.log("Delcare Email in Home")
      }
      if (rosterWorkEmail != "" && rosterWorkEmail != userWorkEmail) {
        optWork = [{
          "type": "work",
          "address": rosterWorkEmail,
        }];
        Logger.log("Decare Email in Work")
      }
      if (optHome.length > 0 && optWork.length > 0) {
        Logger.log("Declare opt home & work")
        opt = {
          "emails": optHome
        };
      }
      else if (optHome.length > 0) {
        Logger.log("Delclare opt home only")
        opt = {
          "emails": optHome
        };
      }
      if (opt != "") {
        Logger.log("Updating Profile Email Addresses: ")
        Logger.log(opt)
        AdminDirectory.Users.update(opt, userAccount)
      }
      if (userAddresses != null) {
        // Logger.log("userAddresss")
        // Logger.log(userAddresses)
        for (var i = 0; i < userAddresses.length; i++) {
          if (userAddresses[i].formatted != "" && userAddresses[i].type == "home") {
            userHomeAddress = userAddresses[i].formatted;
          }
        }

      }
      var optAddresss = "";
      var opt = "";
      rosterAddress = rosterAddress.toString();
      userAddresses = userAddresses.toString();
      if (rosterAddress != "" && rosterAddress != userHomeAddress) {
        optAddresss = [{
          "type": "home",
          "formatted": rosterAddress,
        }];
        Logger.log("Delcare Home Address")
        Logger.log(optAddresss);
      }
      if (optAddresss.length > 0) {
        Logger.log("Declare opt home only")
        opt = {
          "addresses": optAddresss
        };
      }
      if (opt != "") {
        Logger.log("Updating Profile Addresses: ")
        Logger.log(opt)
        AdminDirectory.Users.update(opt, userAccount)
      }
    }
  }
}

function updateRoster() {
  var users = listUsers();
  var usersLen = users.length;
  var ss = SpreadsheetApp.openById(SystemSettings.MEMBER_ROSTER_SHEET_ID);
  var sheet = ss.getSheetByName("Sheet1");
  var sheetLastRow = sheet.getLastRow();
  var sheetLastColumn = sheet.getLastColumn();
  var sheetHeaders = sheet.getRange(1, 1, 1, sheetLastColumn).getValues();
  var sheetHeadersLen = sheetHeaders[0].length;
  var rowFirstName;
  var rowLastName;
  var rowKVRSAccout;
  for (var hrow = 0; hrow < sheetHeadersLen; hrow++) {
    if (sheetHeaders[0][hrow] == "Last Name") {
      rowLastName = hrow;
    };
    if (sheetHeaders[0][hrow] == "First Name") {
      rowFirstName = hrow;
    };
    if (sheetHeaders[0][hrow] == "KVRS Account") {
      rowKVRSAccout = hrow;
    };
  }
  var roster = sheet.getRange(2, 1, (sheetLastRow - 1), sheetLastColumn).getValues();
  var rosterLen = roster.length;
  for (var r = 0; r < rosterLen; r++) {
    var rosterLastName = roster[r][rowLastName];
    var rosterFirstName = roster[r][rowFirstName];
    for (var u = 0; u < usersLen; u++) {
      var userlastName = users[u][0].toString();
      var userFirstName = users[u][1].toString();
      if (rosterFirstName != userFirstName || rosterLastName != userlastName) continue;
      userKVRSAccount = users[u][2].toString();
      var cell = sheet.getRange(r + 2, rowKVRSAccout + 1);
      cell.setValue(userKVRSAccount);
    }
  }
}

function compareUsers(option) {
  var roster = listRoster();
  var users = listUsers();
  var rosterLen = roster.length;
  var usersLen = users.length;
  for (var u = 0; u < usersLen; u++) {
    var userLastName = users[u][0].toString();
    var userFirstName = users[u][1].toString();
    for (var r = 0; r < rosterLen; r++) {
      var rosterLastName = roster[r][0].toString();
      var rosterFirstName = roster[r][1].toString();
      if (rosterFirstName == userFirstName && rosterLastName == userLastName) break;
    }
    if (r != rosterLen) {
      users.splice(u, 1);
      usersLen = users.length;
      u--;
    }
  }
  var usersNotOnRoster = users;
  var users = listUsers();
  var usersLen = users.length;
  for (var r = 0; r < rosterLen; r++) {
    var rosterLastName = roster[r][0].toString();
    var rosterFirstName = roster[r][1].toString();
    for (var u = 0; u < usersLen; u++) {
      var userLastName = users[u][0].toString();
      var userFirstName = users[u][1].toString();
      if (rosterFirstName == userFirstName && rosterLastName == userLastName) break;
    }
    if (u != usersLen) {
      roster.splice(r, 1);
      rosterLen = roster.length;
      r--;
    }
  }
  var rosterNoAccount = roster;
  if (option == 0) {
    return usersNotOnRoster;
  }
  else if (option == 1) {
    return rosterNoAccount;
  }
  else {
    Logger.log("usersNotOnRoster:" + usersNotOnRoster);
    Logger.log("rosterNoAccount:" + rosterNoAccount)
  }
}



function addUsertoGroup(userEmail) {
  var groupId = "all-members@ketchikanrescue.org";
  var group = GroupsApp.getGroupByEmail(groupId);

  // If email is already in group
  try { var hasMember = group.hasUser(userEmail); }
  catch (e) { Logger.log(userEmail + " is already in the group"); return }

  var newMember = { email: userEmail, role: "MEMBER" };

  // AdminDirectory.Members.insert(newMember, groupId);
}