function doGet(request) {
    return HtmlService.createTemplateFromFile('Page').evaluate().setTitle("KVRS IMS Unified Application- V2");
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}