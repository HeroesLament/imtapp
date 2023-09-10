function doGet(request) {
    return HtmlService.createTemplateFromFile('Page').evaluate().setTitle("KVRS IMS - Expense Reporting Module");
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}