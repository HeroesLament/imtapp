function myFunction() {
        if (userPhones != null) {
        Logger.log("userPhones")
        Logger.log(userPhones)
        for (var i = 0; i < userPhones.length; i++) {
          if (userPhones[i].type == "mobile") {
            userMobile = userPhones[i].value;
          }
          else if (userPhones[i].type == "home") {
            userHome = userPhones[i].value;
          }
          else if (userPhones[i].type == "work") {
            userWork = userPhones[i].value;
          }
        }
      }
      var mobile = "";
      var home = "";
      var work = "";

      if (rosterMobilePhone != "") {
        mobile = [{
          "type": "mobile",
          "value": rosterMobilePhoneFormatted,
          primary: true
        }];
        Logger.log("updated mobile phone");
      }
      if (rosterHomePhone != "") {
        //if (opt.length > 1) opt+=",";
        home = [{
          "type": "home",
          "value": rosterHomePhoneFormatted,
        }];
        Logger.log("updated home phone");
      }
      if (rosterWorkPhone != "") {
        //if (opt.length > 1) opt+=",";
        work = [{
          "type": "work",
          "value": rosterWorkPhoneFormatted,
        }];

        Logger.log("updated work phone");
      }
      var data = "";
      if (mobile.length > 0) { data += JSON.stringify(mobile) }
      if (home.length > 0 && data.length > 0) { data += "," }
      if (home.length > 0) { data += JSON.stringify(home) }
      if (work.length > 0 && data.length > 0) { data += "," }
      if (work.length > 0) { data += JSON.stringify(work); }

      Logger.log("data" + data);
      var opt = {
        "phones": mobile,
      };

      Logger.log("opt" + JSON.stringify(opt));

      var updates = AdminDirectory.Users.update(opt, userAccount)
}
