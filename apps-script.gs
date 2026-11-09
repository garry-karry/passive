// Общая таблица результатов для тренажёра. Вставьте в Google Таблицу: Расширения - Apps Script.
const SHEET = "Results";

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(["time", "name", "score", "n", "pool", "streak", "top_trap"]);
  }
  return sh;
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    sheet_().appendRow([
    new Date(),
    String(d.name || "").slice(0, 40),
    Number(d.score) || 0,
    Number(d.n) || 0,
    String(d.pool || ""),
    Number(d.streak) || 0,
    String(d.trap || "").slice(0, 60)
    ]);
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err.message);
  }
}

function doGet() {
  const rows = sheet_().getDataRange().getValues().slice(1).slice(-1000).map(r => ({
    t: r[0], name: r[1], score: r[2], n: r[3], pool: r[4], streak: r[5], trap: r[6]
  }));
  return ContentService.createTextOutput(JSON.stringify(rows)).setMimeType(ContentService.MimeType.JSON);
}
