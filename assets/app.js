// FCS logic model: renders window.FCS_DATA (data/logic-model.js) into the page.
(function () {
  "use strict";
  var D = window.FCS_DATA;
  var app = document.getElementById("app");
  var tabsEl = document.getElementById("tabs");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function h(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content; }

  var measureIndex = {};
  D.results.forEach(function (r) { r.measures.forEach(function (m) { measureIndex[m.id] = m; }); });

  function chip(id, sm) {
    var m = measureIndex[id];
    var st = m ? m.status : "now";
    return '<span class="chip ' + st + (sm ? " sm" : "") + '">' + esc(id) + "</span>";
  }

  // ---- Views ----
  var views = [{ key: "overview", label: "Overview" }, { key: "how-to-read", label: "How to read" }];
  D.results.forEach(function (r) {
    views.push({ key: r.code.toLowerCase(), label: r.area.replace(/^Education: |^Housing: /, ""), code: r.code, result: r });
  });

  function renderTabs(active) {
    tabsEl.innerHTML = views.map(function (v) {
      return '<button class="tab" role="tab" id="tab-' + v.key + '" aria-selected="' + (v.key === active) + '" data-view="' + v.key + '">' +
        (v.code ? '<span class="code">' + v.code + "</span>" : "") + esc(v.label) + "</button>";
    }).join("");
  }

  function countAll(r) {
    var p = 0; r.programGroups.forEach(function (g) { p += g.programs.length; });
    var now = r.measures.filter(function (m) { return m.status === "now"; }).length;
    return r.measures.length + " measures, " + now + " FCS can count now. " + p + " programs.";
  }

  function viewOverview() {
    var cards = D.results.map(function (r) {
      return '<button class="result-card" data-go="' + r.code.toLowerCase() + '">' +
        '<span class="rid">' + esc(r.id) + "</span>" +
        '<span class="rtext">' + esc(r.result) + "</span>" +
        '<span class="rcount">' + esc(countAll(r)) + "</span>" +
        '<span class="rarea">' + esc(r.area) + "</span></button>";
    }).join("");

    var dep = D.dependencies;
    var head = "<tr><th>This area</th>" + dep.columns.map(function (c) {
      return "<th>Depends on " + esc(c.area) + '<span class="named">' + esc(c.named) + "</span></th>";
    }).join("") + "</tr>";
    var body = dep.rows.map(function (row) {
      return "<tr><th scope=\"row\">" + esc(row.area) + "</th>" + dep.columns.map(function (c) {
        var cell = row.cells[c.area];
        if (!cell) return "<td></td>";
        var txt = cell.unwritten ? '<span class="unwritten">' + esc(cell.text) + "</span>" : esc(cell.text);
        return "<td>" + txt + (cell.test ? '<span class="test-tag">TO TEST</span>' : "") + "</td>";
      }).join("") + "</tr>";
    }).join("");

    return '<p class="eyebrow">The six results</p>' +
      '<p class="place-note">' + esc(D.placeNote) + "</p>" +
      '<div class="results-grid">' + cards + "</div>" +
      '<section class="section"><h2>' + esc(dep.title) + "</h2>" +
      '<p class="sub">' + esc(dep.subtitle) + "</p>" +
      '<div class="table-scroll"><table class="deps"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>" +
      '<p class="foot-note">' + esc(dep.note) + "</p></section>";
  }

  function viewHow() {
    var H = D.howToRead;
    var steps = H.steps.map(function (s) {
      return '<div class="step"><div class="n">' + s.n + '</div><h3>' + esc(s.name) + '</h3><p class="q">' + esc(s.q) + "</p><p>" + esc(s.text) + "</p></div>";
    }).join("");
    var types = Object.keys(D.types).map(function (k) {
      var t = D.types[k];
      return '<li><span class="ptype" style="min-width:86px">' + esc(t.label) + '</span><span>' + '<span class="desc">' + esc(t.text) + "</span></span></li>";
    }).join("");
    var ms = Object.keys(D.measureStatus).map(function (k) {
      var t = D.measureStatus[k];
      return '<li><span class="chip ' + k + '">' + (k === "now" ? "EC1" : k === "later" ? "EC3" : "XX") + "</span><span>" + esc(t.label) + '<span class="desc">' + esc(t.text) + "</span></span></li>";
    }).join("");
    return '<p class="eyebrow">How to read</p><h2 style="font-size:28px;margin-top:6px">How to read each model</h2>' +
      '<p class="place-note" style="max-width:80ch">' + esc(H.intro) + "</p>" +
      '<div class="steps">' + steps + "</div>" +
      '<div class="section"><h2>Reading the symbols</h2><div class="legend">' +
      '<div><h3>Program boxes</h3><ul>' +
      '<li><span class="sw"></span><span>Running</span></li>' +
      '<li><span class="sw dash"></span><span>Future or proposed</span></li>' + types + "</ul></div>" +
      '<div><h3>Measure chips</h3><ul>' + ms + "</ul></div>" +
      '<div><h3>Community indicators</h3><ul>' +
      '<li><span class="sw" style="border-color:var(--accent)"></span><span>A neighborhood-wide number. FCS contributes to it and does not control it</span></li>' +
      '<li><span class="sw dash" style="border-color:var(--accent)"></span><span>A number to watch, or no indicator yet</span></li>' +
      "</ul></div></div>" +
      '<p class="foot-note">' + esc(D.placeNote) + "</p></div>";
  }

  function viewArea(r) {
    var ind = r.indicators.map(function (i) {
      var dashed = i.gap || i.watch;
      return '<div class="ind' + (dashed ? " dashed" : "") + '">' +
        (i.gap ? '<span class="gap-label">NO INDICATOR YET</span>' : '<span class="iid">' + esc(i.id) + "</span>") +
        "<span>" + esc(i.text) + "</span>" +
        (i.status ? '<span><span class="chip sm ' + i.status + '">' + esc(D.measureStatus[i.status].label) + "</span></span>" : "") +
        (i.note ? '<span class="note">' + esc(i.note) + "</span>" : "") + "</div>";
    }).join("");

    var measures = r.measures.map(function (m) {
      return '<button class="measure" data-m="' + m.id + '" aria-pressed="false">' + chip(m.id) +
        "<span>" + esc(m.text) + '<span class="mstatus">' + esc(D.measureStatus[m.status].label) + "</span></span></button>";
    }).join("");

    var pi = 0;
    var programs = r.programGroups.map(function (g) {
      return (g.name ? '<div class="group-label">' + esc(g.name) + "</div>" : "") + g.programs.map(function (p) {
        var key = r.code + "-p" + (pi++);
        var links = "";
        if (p.moves.length) links += '<div class="plinks"><span class="lbl">Moves measures:</span>' + p.moves.map(function (id) { return chip(id, true); }).join("") + "</div>";
        if (p.proposed.length) links += '<div class="plinks"><span class="lbl">Proposed for:</span>' + p.proposed.map(function (id) { return chip(id, true); }).join("") + "</div>";
        return '<button class="prog ' + p.status + '" data-p="' + key + '" data-links="' + p.moves.concat(p.proposed).join(" ") + '" aria-pressed="false">' +
          '<span class="pname">' + esc(p.name) + "</span>" + links +
          '<span class="pmeta"><span class="ptype">' + esc(D.types[p.type].label) + '</span><span class="pstat">' + (p.status === "proposed" ? "Future or proposed" : "Running") + "</span></span></button>";
      }).join("");
    }).join("");

    return '<div class="model-head"><div><p class="eyebrow">Logic model | ' + esc(r.id) + "</p><h2>" + esc(r.area) + "</h2></div>" +
      '<div class="lead-box">Leads this model<strong>' + esc(r.lead.name) + "</strong>" + esc(r.lead.title) + "</div></div>" +
      '<p class="logic"><b>THE LOGIC</b>' + esc(r.logic) + "</p>" +
      '<div class="link-hint" id="hint">Select a measure to see which programs move it, or a program to see its measures.</div>' +
      '<div class="pathway" id="pathway">' +
      '<div class="col"><div class="col-head"><span class="num">1</span><span>Desired result</span></div>' +
      '<div class="result-panel"><span class="rid">' + esc(r.id) + '</span><span class="rtext">' + esc(r.result) + "</span>" +
      '<span class="rel"><b>' + esc(r.relation.kind) + "</b>" + esc(r.relation.id) + " " + esc(r.relation.text) + "</span>" +
      '<span class="rplace">Read separately in Historic South Atlanta and Thomasville Heights</span></div></div>' +
      '<div class="col"><div class="col-head"><span class="num">2</span><span>Community indicators</span></div>' + ind + "</div>" +
      '<div class="col"><div class="col-head"><span class="num">3</span><span>What needs to be true</span></div>' +
      '<div class="true-text">' + esc(r.needsTrue) + '</div><div class="qs-label">' + esc(r.questionsLabel) + '</div><ul class="qs">' +
      r.questions.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="col c-measures"><div class="col-head"><span class="num">4</span><span>What measures need to be achieved</span></div>' + measures + "</div>" +
      '<div class="col c-programs"><div class="col-head"><span class="num">5</span><span>What programs are working to impact these measures</span></div>' + programs +
      '<div class="new-init"><b>New initiative</b>Which measures will it move?</div></div>' +
      "</div>" +
      '<div class="legend-strip"><span><span class="sw"></span>Running</span><span><span class="sw dash"></span>Future or proposed</span>' +
      '<span><span class="chip sm now">' + r.code + '1</span>Start now: FCS can count it today</span>' +
      '<span><span class="chip sm later">' + r.code + '1</span>Later: waits on a data source</span></div>';
  }

  // ---- Linking ----
  var selection = null;
  function clearLinks(path) {
    path.classList.remove("linking");
    path.querySelectorAll(".lit, .sel").forEach(function (el) { el.classList.remove("lit", "sel"); el.setAttribute("aria-pressed", "false"); });
    var hint = document.getElementById("hint");
    if (hint) hint.textContent = "Select a measure to see which programs move it, or a program to see its measures.";
    selection = null;
  }
  function setHint(text) {
    var hint = document.getElementById("hint");
    hint.innerHTML = "";
    hint.appendChild(document.createTextNode(text));
    var b = document.createElement("button"); b.className = "clear"; b.textContent = "Show all"; b.id = "clear-sel";
    b.addEventListener("click", function () { clearLinks(document.getElementById("pathway")); });
    hint.appendChild(b);
  }
  function selectMeasure(path, id) {
    clearLinks(path); selection = "m:" + id; path.classList.add("linking");
    var me = path.querySelector('.measure[data-m="' + id + '"]'); me.classList.add("lit", "sel"); me.setAttribute("aria-pressed", "true");
    var n = 0;
    path.querySelectorAll(".prog").forEach(function (p) {
      if ((" " + p.dataset.links + " ").indexOf(" " + id + " ") > -1) { p.classList.add("lit"); n++; }
    });
    setHint(id + ": " + n + (n === 1 ? " program works" : " programs work") + " toward this measure.");
  }
  function selectProgram(path, key) {
    clearLinks(path); selection = "p:" + key; path.classList.add("linking");
    var pe = path.querySelector('.prog[data-p="' + key + '"]'); pe.classList.add("lit", "sel"); pe.setAttribute("aria-pressed", "true");
    var ids = pe.dataset.links.split(" ").filter(Boolean);
    ids.forEach(function (id) { var m = path.querySelector('.measure[data-m="' + id + '"]'); if (m) m.classList.add("lit"); });
    setHint(pe.querySelector(".pname").textContent + ": " + ids.length + (ids.length === 1 ? " measure." : " measures."));
  }

  // ---- Routing ----
  function current() {
    var k = (location.hash || "").replace("#", "");
    return views.some(function (v) { return v.key === k; }) ? k : "overview";
  }
  function show(key) {
    renderTabs(key);
    var v = views.filter(function (x) { return x.key === key; })[0];
    app.innerHTML = "";
    app.appendChild(h(key === "overview" ? viewOverview() : key === "how-to-read" ? viewHow() : viewArea(v.result)));
    document.title = "FCS Logic Model";
  }
  function go(key) {
    if (location.hash !== "#" + key) { try { location.hash = key; } catch (e) { show(key); } } else { show(key); }
    window.scrollTo(0, 0);
  }

  tabsEl.addEventListener("click", function (e) { var b = e.target.closest(".tab"); if (b) go(b.dataset.view); });
  app.addEventListener("click", function (e) {
    var card = e.target.closest("[data-go]"); if (card) { go(card.dataset.go); return; }
    var path = document.getElementById("pathway"); if (!path) return;
    var m = e.target.closest(".measure");
    if (m) { selection === "m:" + m.dataset.m ? clearLinks(path) : selectMeasure(path, m.dataset.m); return; }
    var p = e.target.closest(".prog");
    if (p) { selection === "p:" + p.dataset.p ? clearLinks(path) : selectProgram(path, p.dataset.p); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { var path = document.getElementById("pathway"); if (path) clearLinks(path); }
  });
  window.addEventListener("hashchange", function () { show(current()); });

  // Print works on the hosted site; the private preview frame cannot open the print dialog.
  var printBtn = document.getElementById("print");
  if (printBtn) {
    var canPrint = /github\.io$/.test(location.hostname) || location.protocol === "file:" || location.hostname === "localhost";
    printBtn.hidden = !canPrint;
    printBtn.addEventListener("click", function () { window.print(); });
  }

  // Logo falls back to the organization name until the logo file is in assets/.
  var logo = document.getElementById("logo");
  if (logo) {
    logo.addEventListener("error", function () { logo.hidden = true; document.getElementById("logo-text").hidden = false; });
    if (logo.complete && !logo.naturalWidth) { logo.hidden = true; document.getElementById("logo-text").hidden = false; }
  }

  show(current());
})();
