function doGet(request) {
    return HtmlService.createTemplateFromFile('Page').evaluate().setTitle("KVRS IMS - Member Assignment Module");
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}