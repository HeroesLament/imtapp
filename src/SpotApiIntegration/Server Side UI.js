function doGet(request) {
    return HtmlService.createTemplateFromFile('Page').evaluate().setTitle("KVRS - On Demand SPOT Filter");
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}