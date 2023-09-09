function doGet(request) {
    return HtmlService.createTemplateFromFile('Page').evaluate().setTitle("KVRS IMS - System Tools Module");
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}