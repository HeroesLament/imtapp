function doGet(request) {
  return HtmlService.createTemplateFromFile('Page').evaluate().setTitle("KVRS IMS - Incident GIS Web View");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}