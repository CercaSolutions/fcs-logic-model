// Loads the logic model content from the FCS Google Sheet, then starts the page.
// If the sheet can't be reached, the page uses the copy in data/logic-model.js instead.
(function () {
  "use strict";

  var SHEET = {
    id: "19ocfftmRSq6wIg-yln3qebcj8WpRpN-XDz75itSuxVs",
    // Tab ids from each tab's URL (the number after gid=). Renaming a tab does not change them.
    tabs: { Results: 101, Indicators: 102, Measures: 103, Programs: 104, Partners: 105, Dependencies: 106 },
    timeoutMs: 8000
  };

  var STATUS = { "start now": "now", "later": "later", "held": "held" };
  var TYPE = { "partnership": "partnership", "asset": "asset", "program": "program", "to confirm": "confirm" };

  // ---- CSV ----
  function parseCSV(text) {
    var rows = [], row = [], field = "", i = 0, q = false, c;
    while (i < text.length) {
      c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else field += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
      i++;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows;
  }
  // Rows as objects keyed by header, in lower case. Blank rows are dropped.
  function records(text) {
    var rows = parseCSV(text);
    if (!rows.length) return [];
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    return rows.slice(1).map(function (r) {
      var o = {};
      head.forEach(function (h, j) { o[h] = (r[j] || "").trim(); });
      return o;
    }).filter(function (o) { return Object.keys(o).some(function (k) { return o[k]; }); });
  }
  function list(s) { return (s || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean); }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function short(area) { return area.replace(/^Education: |^Housing: /, ""); }

  // ---- Sheet to model ----
  function build(t) {
    var out = {};

    var results = t.Results.filter(function (r) { return r["area code"] && r["area"]; });
    if (!results.length) throw new Error("Results tab is empty");

    // Partners
    var partners = [], byName = {}, types = [];
    t.Partners.forEach(function (r) {
      if (!r.partner) return;
      var type = r.type || "Type not set";
      var p = { id: slug(r.partner), name: r.partner, type: type, confirm: /^y/i.test(r["to confirm"]) };
      partners.push(p); byName[r.partner.toLowerCase()] = p;
      if (types.indexOf(type) < 0) types.push(type);
    });
    function partnerId(name) {
      var p = byName[name.toLowerCase()];
      if (!p) {
        p = { id: slug(name), name: name, type: "Type not set", confirm: false };
        partners.push(p); byName[name.toLowerCase()] = p;
        if (types.indexOf(p.type) < 0) types.push(p.type);
      }
      return p.id;
    }

    out.results = results.map(function (r) {
      var code = r["area code"].toUpperCase();
      var heading = r["questions heading"] || "Questions";
      var res = {
        id: r["result id"], code: code, area: r.area, result: r.result,
        lead: { name: r["leads this model"], title: r["lead title"] },
        relation: { kind: r.relation, id: r["related result id"], text: r["related result"] },
        logic: r["the logic"], needsTrue: r["what needs to be true"],
        questionsLabel: heading.replace(/:?$/, ":"),
        questions: (r.questions || "").split(/\n+/).map(function (q) { return q.trim(); }).filter(Boolean),
        indicators: [], measures: [], programGroups: []
      };
      t.Indicators.forEach(function (i) {
        if ((i["area code"] || "").toUpperCase() !== code || !i.indicator) return;
        var kind = (i.kind || "").toLowerCase();
        var ind = { id: i["indicator id"] || null, text: i.indicator, note: i.note || undefined };
        if (kind === "no indicator yet") ind.gap = true;
        else { ind.status = STATUS[(i.status || "").toLowerCase()] || "now"; if (kind === "number to watch") ind.watch = true; }
        res.indicators.push(ind);
      });
      t.Measures.forEach(function (m) {
        if ((m["area code"] || "").toUpperCase() !== code || !m["measure id"]) return;
        res.measures.push({ id: m["measure id"], text: m.measure, status: STATUS[(m.status || "").toLowerCase()] || "later" });
      });
      var known = {};
      res.measures.forEach(function (m) { known[m.id] = true; });
      t.Programs.forEach(function (p) {
        if ((p["area code"] || "").toUpperCase() !== code || !p.program) return;
        var g = p.group || null;
        var grp = res.programGroups.filter(function (x) { return x.name === g; })[0];
        if (!grp) { grp = { name: g, programs: [] }; res.programGroups.push(grp); }
        grp.programs.push({
          name: p.program,
          type: TYPE[(p.type || "").toLowerCase()] || "confirm",
          status: /^future|^proposed/i.test(p.status) ? "proposed" : "running",
          moves: list(p["moves measures"]).filter(function (id) { return known[id]; }),
          proposed: list(p["proposed for"]).filter(function (id) { return known[id]; }),
          partners: list(p.partners).map(partnerId)
        });
      });
      return res;
    });

    out.partners = partners;
    out.partnerTypes = types;

    // Dependencies: columns ordered by how many areas name them
    var deps = t.Dependencies.filter(function (d) { return d["this area"] && d["depends on"]; });
    var counts = {}, rowOrder = [], rows = {};
    deps.forEach(function (d) {
      var a = short(d["this area"]), on = short(d["depends on"]);
      counts[on] = (counts[on] || 0) + 1;
      if (!rows[a]) { rows[a] = { area: a, cells: {} }; rowOrder.push(a); }
      rows[a].cells[on] = { text: d.reason, test: /^y/i.test(d["to test"]) || undefined, unwritten: /^y/i.test(d["reason not written yet"]) || undefined };
    });
    var others = out.results.length - 1;
    out.depColumns = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })
      .map(function (a) { return { area: a, named: "Named by " + counts[a] + " of " + others }; });
    out.depRows = rowOrder.map(function (a) { return rows[a]; });
    return out;
  }

  function fetchTab(name, gid) {
    var url = "https://docs.google.com/spreadsheets/d/" + SHEET.id + "/export?format=csv&gid=" + gid;
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(name + ": " + r.status);
      return r.text();
    }).then(function (text) {
      if (/^\s*</.test(text)) throw new Error(name + ": not shared");
      return records(text);
    });
  }

  function load() {
    var names = Object.keys(SHEET.tabs);
    var all = Promise.all(names.map(function (n) { return fetchTab(n, SHEET.tabs[n]); }));
    var timer = new Promise(function (_, reject) { setTimeout(function () { reject(new Error("timed out")); }, SHEET.timeoutMs); });
    return Promise.race([all, timer]).then(function (lists) {
      var t = {};
      names.forEach(function (n, i) { t[n] = lists[i]; });
      return build(t);
    });
  }

  function apply(m) {
    var D = window.FCS_DATA;
    D.results = m.results;
    D.partners = m.partners;
    D.partnerTypes = m.partnerTypes;
    D.dependencies.columns = m.depColumns;
    D.dependencies.rows = m.depRows;
    D.source = "sheet";
  }

  window.FCS_SHEET = { parseCSV: parseCSV, records: records, build: build };

  function start() { if (window.FCS_START) window.FCS_START(); }
  if (typeof fetch !== "function" || /[?&]source=local/.test(location.search)) { start(); return; }
  load().then(apply).catch(function (e) {
    window.FCS_DATA.source = "backup";
    if (window.console) console.warn("Logic model: using the backup copy (" + e.message + ")");
  }).then(start);
})();
