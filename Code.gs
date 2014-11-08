// Script-as-app template.
function doGet() {
  var t = HtmlService.createTemplateFromFile("rss.html");
  return t.evaluate();
}

function getFeed(key, url, MAXITEM, MAXAGE, LEN) {
  var res = {f: key, items: [], time: Utilities.formatDate(new Date(), "GMT-4", "HH:mm:ss")};
  //Logger.log(res.f);
  var data = UrlFetchApp.fetch(url);
  var doc = Xml.parse(data.getContentText());
  var feed = doc.getElement().getElement("channel").getElement("title").getText();
  feed = feed.replace(/^.* - The Washington Post/, "The Washington Post");
  var items = doc.getElement().getElement("channel").getElements("item");
  for(var i=0; i<items.length && i < MAXITEM; i++) {
    var t = HtmlService.createTemplateFromFile("item.html");
    var item = items[i];
    t.feed = feed;
    t.title = item.getElement("title").getText();
    t.desc = getText(item.getElement("description").getText(), LEN);
    var date = new Date(item.getElement("pubDate").getText());
    if (date == null) continue;
    if ((new Date()).getDate() - date.getDate() > MAXAGE) continue;

    t.pubdate = Utilities.formatDate(date, "GMT-4", "MMMMMMMMM dd");
    t.iclass = "";//CONFIG.iclass[i % CONFIG.iclass.length];
    var html = t.evaluate().getContent();
       
    res.items.push(html);
  }
  return res;
}

function getText(desc, len) {
  var s = desc.replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").replace(/&#62;/g,"").replace(/Read full article\s*$/,"");
  if (len == 0) return s;
  if (s.length < len) return s;
  var i = s.indexOf("\. ", len);
  if (i == -1) return s;
  return s.substr(0, i+1);
}
