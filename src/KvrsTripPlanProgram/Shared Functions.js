function sortNumber(a,b) {
    return a - b;
}

function getUser() {
    var useremail = Session.getActiveUser().getEmail();
    useremail = useremail.split("@");
    var username = useremail[0];
    var user = username.toString();
    return user
}
