// FCS logic model: renders window.FCS_DATA (data/logic-model.js) in the digital logic model layout.
// Started by assets/sheet-loader.js once the content is loaded.
window.FCS_START = function () {
  "use strict";
  var D = window.FCS_DATA;

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var AREA_COLOR = { EC: "var(--a-ec)", ED: "var(--a-ed)", HW: "var(--a-hw)", EV: "var(--a-ev)", SH: "var(--a-sh)", LR: "var(--a-lr)" };
  var LIGHT_TEXT = { HW: true, EV: true, SH: true };

  // ---- Index the data ----
  var partners = {}, measures = {}, programs = [];
  D.partners.forEach(function (p) { partners[p.id] = p; });
  D.results.forEach(function (r) {
    r.measures.forEach(function (m) { measures[m.id] = { m: m, r: r }; });
    var i = 0;
    r.programGroups.forEach(function (g) {
      g.programs.forEach(function (p) {
        programs.push({ key: r.code + "-" + (i++), p: p, r: r, group: g.name });
      });
    });
  });
  function areaShort(r) { return r.area.replace(/^Education: |^Housing: /, ""); }

  // ---- State ----
  var S = { area: "EC", fcsOnly: false, program: null, partner: null, highlight: null };
  S.area = D.results[0].code;
  try { var saved = localStorage.getItem("fcs-area"); if (saved && (saved === "all" || D.results.some(function (r) { return r.code === saved; }))) S.area = saved; } catch (e) {}
  var hashArea = (location.hash || "").replace("#", "").toUpperCase();
  if (hashArea === "ALL" || D.results.some(function (r) { return r.code === hashArea; })) S.area = hashArea === "ALL" ? "all" : hashArea;

  // ---- Filtering ----
  function baseProgs() {
    return programs.filter(function (x) {
      if (S.area !== "all" && x.r.code !== S.area) return false;
      if (S.fcsOnly && !(x.p.type === "program" || x.p.type === "asset")) return false;
      return true;
    });
  }
  function shownProgs() {
    return baseProgs().filter(function (x) {
      if (S.program) return x.key === S.program;
      if (S.partner === "__none") return !x.p.partners.length;
      if (S.partner) return x.p.partners.indexOf(S.partner) > -1;
      return true;
    });
  }
  function linksOf(x) { return x.p.moves.concat(x.p.proposed); }

  // ---- Render ----
  var el = {
    title: document.getElementById("area-title"),
    lead: document.getElementById("area-lead"),
    btns: document.getElementById("area-btns"),
    fcs: document.getElementById("fcs-only"),
    model: document.getElementById("model"),
    deps: document.getElementById("area-deps")
  };
  var DEP_AREA = {};
  D.results.forEach(function (r) { DEP_AREA[areaShort(r)] = r.code; DEP_AREA[r.area] = r.code; });
  function depLine(r) {
    var row = D.dependencies.rows.filter(function (x) { return x.area === areaShort(r); })[0];
    if (!row) return "";
    var items = D.dependencies.columns.map(function (c) {
      var cell = row.cells[c.area]; if (!cell) return "";
      var code = DEP_AREA[c.area];
      var reason = cell.unwritten ? '<span class="unwritten">' + esc(cell.text) + "</span>" : esc(cell.text);
      return '<li><button class="dep-go" data-area="' + code + '">' + esc(c.area) + "</button>: " + reason + (cell.test ? '<span class="test-tag">TO TEST</span>' : "") + "</li>";
    }).join("");
    return items ? '<span class="dl-label">This area depends on:</span><ul>' + items + "</ul>" : "";
  }

  function renderAreaBar() {
    var html = D.results.map(function (r) {
      return '<button class="area-btn' + (LIGHT_TEXT[r.code] ? " light-c" : "") + '" style="--c:' + (AREA_COLOR[r.code] || "var(--teal)") + '" data-area="' + r.code + '" aria-pressed="' + (S.area === r.code) + '">' + esc(r.area) + "</button>";
    }).join("");
    html += '<button class="area-btn all" data-area="all" aria-pressed="' + (S.area === "all") + '">All areas</button>';
    el.btns.innerHTML = html;
    if (S.area === "all") {
      el.title.textContent = "All areas";
      el.lead.innerHTML = "";
      el.deps.innerHTML = ""; el.deps.hidden = true;
    } else {
      var r = D.results.filter(function (x) { return x.code === S.area; })[0];
      el.title.textContent = r.area;
      el.lead.innerHTML = "Leads this model: <strong>" + esc(r.lead.name) + "</strong>, " + esc(r.lead.title);
      el.deps.innerHTML = depLine(r); el.deps.hidden = !el.deps.innerHTML;
    }
  }

  var HEADS = [
    { label: "Partners", tip: "Organizations that deliver or support FCS’ programs, grouped by type. Click a group to see who is in it, then a partner to see the programs they support." },
    { label: "Programs", tip: D.howToRead.steps[4].text + " A dashed box is future or proposed." },
    { label: "Measures", tip: D.howToRead.steps[3].text },
    { label: "What needs to be true", tip: D.howToRead.steps[2].text },
    { label: "Community indicators", tip: D.howToRead.steps[1].text },
    { label: "Desired result", tip: D.howToRead.steps[0].text }
  ];

  function colPartners() {
    var base = baseProgs();
    var html = "";
    if (S.partner) {
      html += '<button class="back" data-back="partner">← Back to all partners</button>';
    }
    // Partner ids reachable from what is on screen
    var scope = S.program ? shownProgs() : base;
    var ids = {};
    scope.forEach(function (x) { x.p.partners.forEach(function (id) { ids[id] = true; }); });
    D.partnerTypes.forEach(function (t) {
      var members = D.partners.filter(function (p) { return p.type === t && ids[p.id]; });
      if (!members.length) return;
      var selHere = S.partner && partners[S.partner] && partners[S.partner].type === t;
      html += '<button class="pgroup' + (selHere ? " open" : "") + '" data-group="' + esc(t) + '"><span>' + esc(t) +
        (selHere ? '<span class="sel-name">' + esc(partners[S.partner].name) + "</span>" : "") +
        '</span><span class="count">' + members.length + "</span></button>";
    });
    var none = scope.filter(function (x) { return !x.p.partners.length; }).length;
    if (none && !S.program) {
      html += '<button class="pgroup none' + (S.partner === "__none" ? " open" : "") + '" data-none="1"><span>Partner not named yet</span><span class="count" title="Programs with no partner named">' + none + "</span></button>";
    }
    if (!html) html = '<div class="empty">' + (S.program ? "No partner named yet for this program." : "No partners named yet for these programs.") + "</div>";
    return html;
  }

  function colPrograms(shown) {
    var html = "";
    if (S.program) {
      var r0 = shown[0] && shown[0].r;
      html += '<button class="back" data-back="program">← Back to ' + esc(S.area === "all" ? "all" : areaShort(r0)) + " programs</button>";
    }
    var lastGroup = null, lastArea = null;
    shown.forEach(function (x) {
      if (S.area === "all" && x.r.code !== lastArea) { html += '<div class="group-name">' + esc(x.r.area) + "</div>"; lastArea = x.r.code; lastGroup = null; }
      if (S.area !== "all" && x.group && x.group !== lastGroup) { html += '<div class="group-name">' + esc(x.group) + "</div>"; lastGroup = x.group; }
      var lit = S.highlight && S.highlight(x);
      html += '<div class="prog ' + x.p.status + (lit ? " lit" : "") + (S.program === x.key ? " sel" : "") + '" style="--ac:' + (AREA_COLOR[x.r.code] || "var(--teal)") + '" data-prog="' + x.key + '" role="button" tabindex="0">' +
        '<div class="pbody"><span class="pname">' + esc(x.p.name) + '</span><span class="pmeta">' + esc(D.types[x.p.type].label) + " · " + (x.p.status === "proposed" ? "Future or proposed" : "Running") + "</span></div>" +
        '<div class="pfoot"><button class="learn" data-learn="' + x.key + '">Learn more</button></div></div>';
    });
    if (!shown.length) html += '<div class="empty">No programs match. Clear the filter to see them all.</div>';
    return html;
  }

  function colMeasures(shown, filtering) {
    var ids = [];
    if (filtering) {
      shown.forEach(function (x) { linksOf(x).forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); }); });
      // keep the model's own order
      var order = Object.keys(measures);
      ids.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
    } else {
      D.results.forEach(function (r) {
        if (S.area !== "all" && r.code !== S.area) return;
        r.measures.forEach(function (m) {
          if (S.fcsOnly && !shown.some(function (x) { return linksOf(x).indexOf(m.id) > -1; })) return;
          ids.push(m.id);
        });
      });
    }
    if (!ids.length) return '<div class="empty">No measures linked yet.</div>';
    var lastArea = null;
    return ids.map(function (id) {
      var e = measures[id], m = e.m, head = "";
      if (S.area === "all" && e.r.code !== lastArea) { head = '<div class="group-name">' + esc(areaShort(e.r)) + "</div>"; lastArea = e.r.code; }
      return head + '<div class="item measure"><span class="chip">' + esc(m.id) + "</span><span>" + esc(m.text) + "</span></div>";
    }).join("");
  }

  function areasShown(shown, filtering) {
    if (!filtering) return D.results.filter(function (r) { return S.area === "all" || r.code === S.area; });
    var codes = {};
    shown.forEach(function (x) { codes[x.r.code] = true; });
    return D.results.filter(function (r) { return codes[r.code]; });
  }

  function colTrue(rs) {
    return rs.map(function (r) {
      return '<div class="item"><span class="area-tag">' + esc(areaShort(r)) + '</span><span class="true-text">' + esc(r.needsTrue) + "</span></div>" +
        r.questions.map(function (q) { return '<div class="item q">' + esc(q) + "</div>"; }).join("");
    }).join("") || '<div class="empty">Nothing to show.</div>';
  }
  function colIndicators(rs) {
    return rs.map(function (r) {
      return r.indicators.map(function (i, n) {
        var tag = n === 0 && rs.length > 1 ? '<span class="area-tag">' + esc(areaShort(r)) + "</span>" : "";
        if (i.gap) return '<div class="item gap">' + tag + '<span class="iid">No indicator yet</span>' + esc(i.text) + (i.note ? '<span class="ind-note">' + esc(i.note) + "</span>" : "") + "</div>";
        return '<div class="item">' + tag + '<span class="iid">' + esc(i.id) + "</span>" + esc(i.text) +
          (i.note ? '<span class="ind-note">' + esc(i.note) + "</span>" : "") + "</div>";
      }).join("");
    }).join("") || '<div class="empty">Nothing to show.</div>';
  }
  function colResult(rs) {
    if (!rs.length) return '<div class="empty">Nothing to show.</div>';
    return rs.map(function (r) {
      return '<div class="item result"><span class="rid">' + esc(r.id) + '</span><span class="rtext">' + esc(r.result) + "</span>" +
        '<span class="rel">' + esc(r.relation.kind) + ": " + esc(r.relation.id) + " " + esc(r.relation.text) + "</span></div>";
    }).join("") + '<div class="place">' + esc(D.placeNote) + "</div>";
  }

  function render() {
    closePop();
    renderAreaBar();
    el.fcs.checked = S.fcsOnly;
    var shown = shownProgs();
    var filtering = !!(S.program || S.partner);
    var rs = areasShown(shown, filtering);
    var cols = [colPartners(), colPrograms(shown), colMeasures(shown, filtering), colTrue(rs), colIndicators(rs), colResult(rs)];
    var heads = HEADS.map(function (h, i) {
      return '<div class="head h' + (i + 1) + '">' + esc(h.label) + '<button class="info" data-tip="' + esc(h.tip) + '" aria-label="About ' + esc(h.label) + '">i</button></div>';
    }).join("");
    el.model.innerHTML = heads + cols.map(function (c, i) { return '<div class="col" data-col="' + i + '">' + c + "</div>"; }).join("");
  }

  // ---- Popover, tooltip, modal ----
  var pop = null, tip = null;
  function closePop() { if (pop) { pop.remove(); pop = null; document.querySelectorAll(".prog.lit").forEach(function (c) { c.classList.remove("lit"); }); } document.querySelectorAll(".pgroup.open").forEach(function (b) { if (!S.partner) b.classList.remove("open"); }); }
  function place(box, anchor) {
    var a = anchor.getBoundingClientRect(), w = box.offsetWidth, h = box.offsetHeight;
    var left = Math.min(a.right + 8, window.innerWidth - w - 12); if (left < 12) left = 12;
    var top = Math.min(a.top, window.innerHeight - h - 12); if (top < 12) top = 12;
    box.style.left = left + "px"; box.style.top = top + "px";
  }
  function openGroup(btn, type) {
    closePop();
    var scope = baseProgs(), ids = {};
    scope.forEach(function (x) { x.p.partners.forEach(function (id) { ids[id] = true; }); });
    var members = D.partners.filter(function (p) { return p.type === type && ids[p.id]; });
    pop = document.createElement("div");
    pop.className = "pop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", type);
    pop.innerHTML = '<div class="pop-title">' + esc(type) + '</div><div class="pop-sub">Click a partner to see the programs they support</div>' +
      members.map(function (p) {
        return '<button class="pop-item" data-partner="' + p.id + '"><span>' + esc(p.name) + "</span>" + (p.confirm ? '<span class="confirm-tag">TO CONFIRM</span>' : "") + "</button>";
      }).join("");
    document.body.appendChild(pop);
    place(pop, btn);
    btn.classList.add("open");
    var inGroup = {}; members.forEach(function (p) { inGroup[p.id] = true; });
    document.querySelectorAll(".prog[data-prog]").forEach(function (card) {
      var x = programs.filter(function (y) { return y.key === card.dataset.prog; })[0];
      if (x && x.p.partners.some(function (id) { return inGroup[id]; })) card.classList.add("lit");
    });
    var first = pop.querySelector(".pop-item"); if (first) first.focus();
  }
  function showTip(btn) {
    hideTip();
    tip = document.createElement("div"); tip.className = "tip"; tip.textContent = btn.dataset.tip;
    document.body.appendChild(tip);
    var a = btn.getBoundingClientRect();
    var left = Math.min(Math.max(12, a.left - 20), window.innerWidth - tip.offsetWidth - 12);
    tip.style.left = left + "px"; tip.style.top = (a.bottom + 8) + "px";
  }
  function hideTip() { if (tip) { tip.remove(); tip = null; } }

  var shade = null, lastFocus = null;
  function openModal(key) {
    var x = programs.filter(function (y) { return y.key === key; })[0]; if (!x) return;
    lastFocus = document.activeElement;
    var p = x.p;
    var pl = p.partners.length
      ? p.partners.map(function (id) { var q = partners[id]; return '<button class="pchip" data-partner="' + id + '">' + esc(q.name) + (q.confirm ? " (to confirm)" : "") + "</button>"; }).join("")
      : '<span style="color:var(--muted)">No partner named yet</span>';
    function mlist(ids) {
      return '<ul class="mlist">' + ids.map(function (id) { var m = measures[id].m; return '<li class="measure"><span class="chip">' + esc(id) + "</span><span>" + esc(m.text) + "</span></li>"; }).join("") + "</ul>";
    }
    shade = document.createElement("div"); shade.className = "modal-shade";
    shade.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title" style="--ac:' + (AREA_COLOR[x.r.code] || "var(--teal)") + '">' +
      '<div class="modal-head"><h2 id="m-title">' + esc(p.name) + '</h2><button class="close" id="m-close" aria-label="Close">×</button></div>' +
      '<div class="modal-body"><dl class="kv">' +
      "<dt>Area</dt><dd>" + esc(x.r.area) + (x.group ? ", " + esc(x.group) : "") + "</dd>" +
      "<dt>Type</dt><dd>" + esc(D.types[p.type].label) + ": " + esc(D.types[p.type].text) + "</dd>" +
      "<dt>Status</dt><dd>" + (p.status === "proposed" ? "Future or proposed" : "Running") + "</dd>" +
      "<dt>Partners</dt><dd>" + pl + "</dd></dl>" +
      (p.moves.length ? '<div><div class="sub-label" style="padding-left:0">Moves measures</div>' + mlist(p.moves) + "</div>" : "") +
      (p.proposed.length ? '<div><div class="sub-label" style="padding-left:0">Proposed for</div>' + mlist(p.proposed) + "</div>" : "") +
      "</div></div>";
    document.body.appendChild(shade);
    document.getElementById("m-close").focus();
  }
  function openConnect() {
    lastFocus = document.activeElement;
    var dep = D.dependencies;
    var head = "<tr><th>This area</th>" + dep.columns.map(function (c) {
      return "<th>Depends on " + esc(c.area) + '<span class="named">' + esc(c.named) + "</span></th>";
    }).join("") + "</tr>";
    var body = dep.rows.map(function (row) {
      return '<tr><th scope="row"><button class="dep-go" data-area="' + DEP_AREA[row.area] + '">' + esc(row.area) + "</button></th>" + dep.columns.map(function (c) {
        var cell = row.cells[c.area]; if (!cell) return "<td></td>";
        return "<td>" + (cell.unwritten ? '<span class="unwritten">' + esc(cell.text) + "</span>" : esc(cell.text)) + (cell.test ? '<span class="test-tag">TO TEST</span>' : "") + "</td>";
      }).join("") + "</tr>";
    }).join("");
    shade = document.createElement("div"); shade.className = "modal-shade";
    shade.innerHTML = '<div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="m-title">' +
      '<div class="modal-head"><div><h2 id="m-title">' + esc(dep.title) + '</h2><p class="modal-note" style="margin-top:4px">' + esc(dep.subtitle) + '</p></div><button class="close" id="m-close" aria-label="Close">\u00d7</button></div>' +
      '<div class="modal-body"><div class="table-scroll"><table class="deps"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>" +
      '<p class="modal-note">' + esc(dep.note) + "</p></div></div>";
    document.body.appendChild(shade);
    document.getElementById("m-close").focus();
  }
  function closeModal() { if (shade) { shade.remove(); shade = null; if (lastFocus) lastFocus.focus(); } }

  // ---- Events ----
  function setArea(a) {
    S.area = a; S.program = null; S.partner = null; S.highlight = null;
    try { localStorage.setItem("fcs-area", a); } catch (e) {}
    render();
  }
  el.btns.addEventListener("click", function (e) { var b = e.target.closest("[data-area]"); if (b) setArea(b.dataset.area); });
  el.fcs.addEventListener("change", function () { S.fcsOnly = el.fcs.checked; S.program = null; S.partner = null; render(); });

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (shade && (t === shade || t.closest("#m-close"))) { closeModal(); return; }
    var go = t.closest(".dep-go");
    if (go) { if (go.dataset.area && go.dataset.area !== "undefined") { closeModal(); setArea(go.dataset.area); window.scrollTo(0, 0); } return; }
    if (t.closest("#connect")) { openConnect(); return; }
    var chipP = t.closest(".pchip[data-partner]");
    if (chipP) { closeModal(); S.partner = chipP.dataset.partner; S.program = null; render(); return; }
    if (shade) return;

    var info = t.closest(".info");
    if (info) { tip ? hideTip() : showTip(info); return; }
    hideTip();

    var pi = t.closest(".pop-item");
    if (pi) { S.partner = pi.dataset.partner; S.program = null; render(); return; }
    if (pop && !t.closest(".pop") && !t.closest(".pgroup")) closePop();

    var g = t.closest(".pgroup[data-group]");
    if (g) { pop && g.classList.contains("open") && !S.partner ? closePop() : openGroup(g, g.dataset.group); return; }
    var none = t.closest(".pgroup[data-none]");
    if (none) { S.partner = S.partner === "__none" ? null : "__none"; S.program = null; render(); return; }

    var back = t.closest("[data-back]");
    if (back) { if (back.dataset.back === "partner") S.partner = null; else S.program = null; render(); return; }

    var learn = t.closest("[data-learn]");
    if (learn) { openModal(learn.dataset.learn); return; }
    var prog = t.closest(".prog[data-prog]");
    if (prog) { S.program = S.program === prog.dataset.prog ? null : prog.dataset.prog; render(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (shade) closeModal(); else if (pop) closePop(); else hideTip(); }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches(".prog[data-prog]")) {
      e.preventDefault(); var k = e.target.dataset.prog; S.program = S.program === k ? null : k; render();
    }
  });
  window.addEventListener("resize", function () { closePop(); hideTip(); });
  window.addEventListener("scroll", function () { closePop(); hideTip(); }, true);
  window.addEventListener("hashchange", function () {
    var h = (location.hash || "").replace("#", "").toUpperCase();
    if (h === "ALL") setArea("all"); else if (D.results.some(function (r) { return r.code === h; })) setArea(h);
  });

  // Print works on the hosted site; the private preview frame cannot open the print dialog.
  var printBtn = document.getElementById("print");
  if (printBtn) {
    printBtn.hidden = !(/github\.io$/.test(location.hostname) || location.protocol === "file:" || location.hostname === "localhost");
    printBtn.addEventListener("click", function () { window.print(); });
  }
  // Logos fall back to the organization name if the files are missing.
  document.querySelectorAll(".logo").forEach(function (img) {
    img.addEventListener("error", function () { document.querySelectorAll(".logo").forEach(function (i) { i.remove(); }); document.getElementById("logo-text").hidden = false; });
  });

  render();
};
