function doGet(request) {
    return HtmlService.createTemplateFromFile('Page').evaluate().setTitle("KVRS IMS - Situation Display Module");
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}