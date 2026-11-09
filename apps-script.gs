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

function answers_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("Answers");
  if (!sh) {
    sh = ss.insertSheet("Answers");
    sh.appendRow(["time", "name", "situation_id", "situation", "answer", "red_flags", "warnings", "comment"]);
  }
  return sh;
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.kind === "answer") {
      answers_().appendRow([
        new Date(),
        String(d.name || "").slice(0, 40),
        String(d.id || ""),
        String(d.situation || ""),
        String(d.text || "").slice(0, 2000),
        Number(d.bad) || 0,
        Number(d.warn) || 0,
        ""
      ]);
      return ContentService.createTextOutput("ok");
    }
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

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === "feedback") {
    // Комментарии только для одного имени и только те, где комментарий заполнен.
    const name = String(p.name || "").trim().toLowerCase();
    if (!name) return json_([]);
    const rows = answers_().getDataRange().getValues().slice(1)
      .filter(r => String(r[1]).trim().toLowerCase() === name && String(r[7]).trim() !== "")
      .slice(-50)
      .map(r => ({ t: r[0], id: r[2], situation: r[3], text: r[4], comment: r[7] }));
    return json_(rows);
  }
  const rows = sheet_().getDataRange().getValues().slice(1).slice(-1000).map(r => ({
    t: r[0], name: r[1], score: r[2], n: r[3], pool: r[4], streak: r[5], trap: r[6]
  }));
  return json_(rows);
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
