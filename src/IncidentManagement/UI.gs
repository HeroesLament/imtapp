function doGet(request) {
  return HtmlService.createTemplateFromFile('Page').evaluate().setTitle("KVRS IMS - File Management Module");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}