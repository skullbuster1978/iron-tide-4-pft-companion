/* IRON TIDE 4 V30 — app logic.
 * Static single-page app. Local state always works (localStorage, key
 * "ironTide4.v1" — unchanged so existing users keep their data). When logged
 * in via Supabase, the same state syncs to the cloud `progress` table as JSONB.
 */
(function () {
  "use strict";

  var CFG = window.IRON_TIDE_CONFIG || {};
  var PLAN = window.IRON_TIDE_PLAN || {};
  var TABLES = window.IRON_TIDE_TABLES || { male: {}, female: {} };
  var LS_KEY = "ironTide4.v1";
  var REM_KEY = "iron-tide-4-reminders";
  var WEEKS = PLAN.weeks || [];
  var MATRIX = PLAN.matrix || [];

  /* ================= state ================= */
  function blankState() {
    return {
      checks: {},
      numbers: { pushups: "30", plank: "", row: "8:10", readiness: [] },
      settings: { week: 1, day: 0 },
      calc: {
        sex: "male", age: "45-49",
        scores: { push: 90, plank: 90, row: 90 },
        req: { push: "35", plank: "2:52", row: "7:50" }
      },
      checkpoints: {
        c1: { push: "", plank: "", row: "" },
        c2: { push: "", plank: "", row: "" },
        c3: { push: "", plank: "", row: "" }
      }
    };
  }
  function num3(src) {
    var o = { push: "", plank: "", row: "" };
    if (src && typeof src === "object") {
      if (src.push != null) o.push = String(src.push);
      if (src.plank != null) o.plank = String(src.plank);
      if (src.row != null) o.row = String(src.row);
    }
    return o;
  }
  function normalizeState(s) {
    var b = blankState();
    if (!s || typeof s !== "object") return b;
    if (s.checks && typeof s.checks === "object") b.checks = s.checks;
    if (s.numbers && typeof s.numbers === "object") {
      b.numbers.pushups = (s.numbers.pushups != null && String(s.numbers.pushups) !== "")
        ? String(s.numbers.pushups) : "30";
      b.numbers.plank = s.numbers.plank != null ? String(s.numbers.plank) : "";
      b.numbers.row = (s.numbers.row != null && String(s.numbers.row) !== "")
        ? String(s.numbers.row) : "8:10";
      b.numbers.readiness = Array.isArray(s.numbers.readiness) ? s.numbers.readiness : [];
    }
    if (s.settings && typeof s.settings === "object") {
      if (s.settings.week) b.settings.week = s.settings.week;
      if (s.settings.day != null) b.settings.day = Math.min(5, Math.max(0, s.settings.day | 0));
    }
    if (s.calc && typeof s.calc === "object") {
      if (s.calc.sex === "female" || s.calc.sex === "male") b.calc.sex = s.calc.sex;
      if (typeof s.calc.age === "string" && s.calc.age) b.calc.age = s.calc.age;
      if (s.calc.scores && typeof s.calc.scores === "object") {
        ["push", "plank", "row"].forEach(function (k) {
          var v = parseInt(s.calc.scores[k], 10);
          if (v >= 45 && v <= 100) b.calc.scores[k] = v;
        });
      }
      if (s.calc.req && typeof s.calc.req === "object") {
        ["push", "plank", "row"].forEach(function (k) {
          if (s.calc.req[k] != null && String(s.calc.req[k]) !== "") b.calc.req[k] = String(s.calc.req[k]);
        });
      }
    }
    if (s.checkpoints && typeof s.checkpoints === "object") {
      ["c1", "c2", "c3"].forEach(function (k) {
        if (s.checkpoints[k]) b.checkpoints[k] = num3(s.checkpoints[k]);
      });
    }
    if (b.settings.week < 1 || b.settings.week > 12) b.settings.week = 1;
    return b;
  }
  function loadLocal() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      return raw ? normalizeState(JSON.parse(raw)) : blankState();
    } catch (e) { return blankState(); }
  }
  var state = loadLocal();
  function persistLocal() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ================= cloud (behavior preserved) ================= */
  var supabaseClient = null, currentUser = null, saveTimer = null, cloudOn = false;

  function keyConfigured() {
    return !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY &&
      CFG.SUPABASE_ANON_KEY !== "PASTE_ANON_KEY_HERE");
  }
  function initCloud() {
    if (!keyConfigured() || !window.supabase) return;
    try {
      supabaseClient = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    } catch (e) { supabaseClient = null; return; }
    supabaseClient.auth.getSession().then(function (res) {
      currentUser = (res.data && res.data.session && res.data.session.user) || null;
      onAuthChange();
    });
    supabaseClient.auth.onAuthStateChange(function (_event, session) {
      currentUser = (session && session.user) || null;
      onAuthChange();
    });
  }
  function onAuthChange() {
    renderHeader();
    renderMission();
    renderAccount();
    if (currentUser && supabaseClient) {
      /* Merge: cloud data stays the master copy; guest checkmarks made before
       * signing in are unioned in so neither set is lost. */
      var guestChecks = (state && state.checks) || {};
      supabaseClient.from("progress").select("data").eq("user_id", currentUser.id).maybeSingle()
        .then(function (res) {
          if (!res.error && res.data && res.data.data) {
            state = normalizeState(res.data.data);
            for (var k in guestChecks) {
              if (guestChecks[k]) state.checks[k] = true;
            }
            persistLocal();
            renderAll();
          }
          return cloudSave();
        });
    } else {
      cloudOn = false;
      renderHeader();
      renderMission();
    }
  }
  function scheduleSave() {
    persistLocal();
    if (currentUser && supabaseClient) {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(cloudSave, 700);
    }
  }
  function cloudSave() {
    if (!currentUser || !supabaseClient) return Promise.resolve();
    return supabaseClient.from("progress").upsert({
      user_id: currentUser.id,
      data: state,
      updated_at: new Date().toISOString()
    }).then(function (res) {
      cloudOn = !res.error;
      renderHeader();
      renderMission();
      renderAccount();
    });
  }

  /* ================= helpers ================= */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function parseTime(str) {
    var m = /^\s*(?:(\d+):)?(\d{1,2})(?:\.(\d+))?\s*$/.exec(String(str || ""));
    if (!m) return null;
    var mins = m[1] ? parseInt(m[1], 10) : 0;
    return mins * 60 + parseInt(m[2], 10);
  }
  function parsePlankStrict(str) {
    var m = /^\s*(\d+):([0-5]\d)\s*$/.exec(String(str || ""));
    if (!m) return null;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }
  function fmtMSS(totalSecs) {
    totalSecs = Math.max(0, Math.round(totalSecs));
    return Math.floor(totalSecs / 60) + ":" + pad2(totalSecs % 60);
  }
  function fmtSplit(secFloat) {
    var m = Math.floor(secFloat / 60);
    var r = secFloat - m * 60;
    var s = Math.floor(r);
    var d = Math.floor((r - s) * 10);
    return m + ":" + pad2(s) + "." + d;
  }

  /* ================= personalization ================= */
  var LEVELS = {
    easy: { name: "Easy", pct: 40, frac: 0.40 },
    medium: { name: "Medium", pct: 45, frac: 0.45 },
    strong: { name: "Strong", pct: 50, frac: 0.50 }
  };
  function bestPush() {
    var v = parseInt(state.numbers.pushups, 10);
    return (isNaN(v) || v < 1) ? 30 : v;
  }
  function plankSecs() { return parsePlankStrict(state.numbers.plank); }
  function rowSecs() { return parseTime(state.numbers.row); }
  function repsFor(frac) { return Math.max(1, Math.round(bestPush() * frac)); }
  function plankHoldFor(frac) {
    var ps = plankSecs();
    return ps == null ? null : Math.round(ps * frac);
  }
  function plankNote() {
    var ps = plankSecs();
    return ps == null ? "Enter your best plank hold to personalize"
      : String(state.numbers.plank).trim() + " plank";
  }
  /* Scale every M:SS in a plank detail by the level factor (needs valid plank).
   * Monday scales every M:SS in the merged card; Thursday/Saturday scale only the
   * "N × M:SS plank" portion — push-up times are left intact. */
  function scalePlankAll(detail, frac) {
    var hold = plankHoldFor(frac);
    if (hold == null) return detail;
    return String(detail).replace(/\d+:[0-5]\d/g, fmtMSS(hold));
  }
  function scalePlankSeg(detail, frac) {
    var hold = plankHoldFor(frac);
    if (hold == null) return detail;
    return String(detail).split(" · ").map(function (seg) {
      return /plank/i.test(seg) ? seg.replace(/\d+:[0-5]\d/g, fmtMSS(hold)) : seg;
    }).join(" · ");
  }

  /* ================= session builder ================= */
  var DAY_ABBR = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  var DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function x3Task(x) {
    return {
      icon: "X3",
      title: "X3 " + cap(x.kind) + " · " + x.mod,
      detail: x.kind === "push" ? PLAN.x3push : PLAN.x3pull,
      meta: x.meta || "",
      x3kind: x.kind
    };
  }
  function matrixTask(m) {
    return { icon: "2K", title: m.t, detail: m.d, meta: m.m };
  }
  function rxTask(rx) {
    return { icon: "RX", title: rx.t, detail: rx.d, meta: "" };
  }
  function mondayPP(wk) {
    var m = /^(\d+)\s+(easy|medium|strong)\s+sets$/i.exec(wk.mon.pushSets || "");
    var sets = m ? parseInt(m[1], 10) : 0;
    var lvl = m ? m[2].toLowerCase() : "easy";
    var info = LEVELS[lvl] || LEVELS.easy;
    var reps = repsFor(info.frac);
    return {
      icon: "PU",
      title: "Push-ups + plank",
      detail: sets + " × " + reps + " push-ups (" + lvl + ") · " + scalePlankAll(wk.mon.plank, info.frac),
      meta: "Complete both before the row · " + info.name + " " + info.pct + "% of your best"
    };
  }
  function thuPP(p) {
    var reps = repsFor(LEVELS.easy.frac);
    return {
      icon: p.icon,
      title: p.title,
      detail: scalePlankSeg(p.push + " · " + p.plank, LEVELS.easy.frac),
      meta: (p.meta ? p.meta + " · " : "") + "Easy 40% · " + reps + " push-ups · " + plankNote()
    };
  }
  function satPlank(s) {
    var reps = repsFor(LEVELS.easy.frac);
    return {
      icon: s.plank.icon,
      title: s.plank.title,
      detail: scalePlankSeg(s.plank.detail, LEVELS.easy.frac),
      meta: (s.plank.meta ? s.plank.meta + " · " : "") + "Easy 40% · " + reps + " push-ups · " + plankNote()
    };
  }
  function checkinTasks(wi) {
    var d4 = MATRIX[wi].d4;
    return [
      { icon: "GO", title: "Push-ups + plank check-in", detail: "Use official form", meta: "Record both results in Progress" },
      { icon: "RX", title: "Recover", detail: "Skip X3 today", meta: "Rest after the test" },
      { icon: "2K", title: d4.t, detail: d4.d, meta: d4.m }
    ];
  }
  /* Returns { name, tasks } for week index wi (0-11), day di (0-5). */
  function buildDay(wi, di) {
    var wk = WEEKS[wi];
    var mxr = MATRIX[wi];
    if (di === 0) {
      return { name: wk.mon.name, tasks: [x3Task(wk.mon.x3), mondayPP(wk), matrixTask(mxr.d1)] };
    }
    if (di === 1) {
      return { name: wk.tue.name, tasks: [x3Task(wk.tue.x3), matrixTask(mxr.d2),
        { icon: "2K", title: PLAN.paceLog.t, detail: PLAN.paceLog.d, meta: PLAN.paceLog.m }] };
    }
    if (di === 2) return { name: PLAN.wed.name, tasks: PLAN.wed.tasks };
    if (di === 3) {
      var th = wk.thu;
      var tasks = [];
      if (th.x3) tasks.push(x3Task(th.x3));
      tasks.push(thuPP(th.pp));
      if (th.rx) tasks.push(rxTask(th.rx));
      tasks.push(matrixTask(mxr.d3));
      return { name: th.name, tasks: tasks };
    }
    if (di === 4) return { name: PLAN.fri.name, tasks: PLAN.fri.tasks };
    var st = wk.sat;
    if (st.checkin) return { name: st.name, tasks: checkinTasks(wi) };
    if (st.testPP) return { name: st.name, tasks: PLAN.testPP };
    var stasks = [];
    if (st.x3 && st.plank && !st.rx) {
      stasks = [x3Task(st.x3), satPlank(st), matrixTask(mxr.d4)];
    } else {
      if (st.plank) stasks.push(satPlank(st));
      if (st.x3) stasks.push(x3Task(st.x3));
      if (st.rx) stasks.push(rxTask(st.rx));
      stasks.push(matrixTask(mxr.d4));
    }
    return { name: st.name, tasks: stasks };
  }

  /* ================= counts ================= */
  function taskId(w, s, t) { return "w" + pad2(w) + "s" + s + "t" + t; }
  function countDay(wi, di) {
    var day = buildDay(wi, di);
    var n = 0;
    for (var t = 0; t < day.tasks.length; t++) {
      if (state.checks[taskId(wi + 1, di + 1, t + 1)]) n++;
    }
    return { done: n, total: day.tasks.length };
  }
  function countRail(wi) {
    var n = 0;
    [0, 1, 3, 5].forEach(function (di) { n += countDay(wi, di).done; });
    return n;
  }
  function countWeek(wi) {
    var n = 0;
    for (var di = 0; di < 6; di++) n += countDay(wi, di).done;
    return n;
  }
  function countAll() {
    var n = 0;
    for (var wi = 0; wi < 12; wi++) n += countWeek(wi);
    return n;
  }

  /* ================= header / mission / tabs ================= */
  var activeTab = "training";

  function renderTabs() {
    var btns = document.querySelectorAll('[data-action="tab"]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("active", btns[i].getAttribute("data-tab") === activeTab);
    }
    var panes = document.querySelectorAll(".tabpane");
    for (var j = 0; j < panes.length; j++) {
      panes[j].classList.toggle("active", panes[j].id === "tab-" + activeTab);
    }
  }
  function renderHeader() {
    var btn = $("acctBtn");
    var label = $("acctBtnLabel");
    if (currentUser) {
      btn.classList.add("signed");
      btn.setAttribute("aria-label", "Open account. Signed in as " + currentUser.email);
      label.textContent = currentUser.email;
    } else {
      btn.classList.remove("signed");
      btn.setAttribute("aria-label", "Open account. Local only");
      label.textContent = "SIGN IN TO SYNC";
    }
  }
  function missionScores() {
    var c = state.calc;
    var a = c.scores.push, b = c.scores.plank, r = c.scores.row;
    var str = (a === b && b === r) ? a + " pts/event" : a + "/" + b + "/" + r + " pts";
    return { str: str, total: a + b + r };
  }
  function renderMission() {
    var c = state.calc;
    $("missionTargets").innerHTML = esc(c.req.push) + " PUSH-UPS &middot; " + esc(c.req.plank) +
      " PLANK &middot; " + esc(c.req.row) + " ROW";
    var ms = missionScores();
    $("missionProfile").innerHTML = esc(cap(c.sex)) + " " + esc(c.age) + " &middot; " + esc(ms.str) +
      " &middot; " + ms.total + " total";
    var el = $("cloudStatus");
    if (currentUser && cloudOn) {
      el.textContent = "CLOUD: ON";
      el.className = "cloud on";
    } else if (currentUser) {
      el.textContent = "CLOUD: SYNCING…";
      el.className = "cloud";
    } else {
      el.textContent = "CLOUD: OFF";
      el.className = "cloud";
    }
  }

  /* ================= training view ================= */
  function renderRail() {
    var html = "";
    for (var wi = 0; wi < 12; wi++) {
      var wk = WEEKS[wi];
      html += '<button class="wbtn' + (wi === state.settings.week - 1 ? " active" : "") +
        '" data-action="week" data-week="' + (wi + 1) + '" aria-label="Open week ' + (wi + 1) + '">' +
        '<span class="wnum">' + pad2(wi + 1) + "</span>" +
        '<span class="wphase">' + esc(wk.phase) + "</span>" +
        '<span class="wtasks">' + countRail(wi) + '/12 tasks</span>' +
        '<span class="wload">' + esc(wk.load) + "</span></button>";
    }
    $("weekRail").innerHTML = html;
  }
  function renderHero() {
    var wi = state.settings.week - 1;
    var wk = WEEKS[wi];
    $("heroEyebrow").innerHTML = "WEEK " + pad2(wi + 1) + " &middot; " + esc(wk.phase);
    $("heroGoal").textContent = wk.goal;
    var done = countWeek(wi);
    $("ringNum").textContent = done + " / 18";
    var circ = 326.7;
    $("ringFg").style.strokeDashoffset = String(circ * (1 - done / 18));
  }
  function renderDayTabs() {
    var wi = state.settings.week - 1;
    var html = "";
    for (var di = 0; di < 6; di++) {
      var c = countDay(wi, di);
      var isDone = c.done === c.total && c.total > 0;
      var label = isDone ? "Complete" : DAY_FULL[di] + " " + c.done + "/" + c.total + " done";
      html += '<button class="dtab' + (di === state.settings.day ? " active" : "") +
        (isDone ? " done" : "") +
        '" role="tab" aria-selected="' + (di === state.settings.day) +
        '" data-action="day" data-day="' + di + '">' +
        '<span class="dtab-day">' + DAY_ABBR[di] + "</span>" +
        '<span class="dtab-count">' + esc(label) + "</span></button>";
    }
    $("dayTabs").innerHTML = html;
  }

  /* ================= video embeds + full-screen modal ================= */
  function vidId(url) {
    var m = /[?&]v=([A-Za-z0-9_-]{6,})/.exec(String(url || ""));
    return m ? m[1] : null;
  }
  /* Split Squat demonstration embed starts at 0:57. */
  function embedUrl(url) {
    var id = vidId(url);
    if (!id) return null;
    return "https://www.youtube-nocookie.com/embed/" + id + (id === "G3FQuH3YFlg" ? "?start=57" : "");
  }

  function x3VideosHtml(kind) {
    var vids = PLAN.x3videos[kind] || [];
    var opts = "";
    for (var i = 0; i < vids.length; i++) {
      opts += '<option value="' + i + '"' + (i === 0 ? " selected" : "") + ">" +
        esc(vids[i].title) + "</option>";
    }
    var first = vids[0] || {};
    return '<details class="vids"><summary>Watch X3 exercise videos</summary>' +
      '<div class="x3-picker" data-x3kind="' + esc(kind) + '">' +
      "<label>CHOOSE EXERCISE</label>" +
      '<select data-change="x3sel">' + opts + "</select>" +
      '<button class="x3-play" data-action="x3-play" data-kind="' + esc(kind) + '" data-i="0">' +
      "&#9654; Play " + esc(first.title || "") + " full screen</button>" +
      '<div class="x3-meta">YouTube demonstration · <span class="x3-chan">' +
      esc(first.channel || "") + "</span></div>" +
      '<a class="x3-open" href="' + esc(first.url || "#") +
      '" target="_blank" rel="noopener">Open on YouTube &#8599;</a>' +
      "</div></details>";
  }
  function stretchVideoHtml(url) {
    return '<details class="stretchvids" data-embed="' + esc(url) + '"><summary>Watch demonstration</summary>' +
      '<div class="embed-slot"></div>' +
      '<a class="x3-open" href="' + esc(url) + '" target="_blank" rel="noopener">Open on YouTube &#8599;</a></details>';
  }
  function openVideoModal(title, channel, url) {
    var emb = embedUrl(url);
    if (!emb) return;
    var m = $("vidModal");
    if (!m) {
      m = document.createElement("div");
      m.className = "vidmodal";
      m.id = "vidModal";
      m.setAttribute("role", "dialog");
      m.setAttribute("aria-modal", "true");
      m.hidden = true;
      m.innerHTML = '<div class="vidmodal-back" data-action="vid-close"></div>' +
        '<div class="vidmodal-box">' +
        '<button class="vidmodal-x" data-action="vid-close" aria-label="Close video">&#215; Close</button>' +
        '<div class="vidmodal-frame"><iframe id="vidFrame" title="Exercise video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' +
        '<div class="vidmodal-foot"><span id="vidTitle"></span><span id="vidChan"></span></div></div>';
      document.body.appendChild(m);
    }
    $("vidTitle").textContent = title;
    $("vidChan").textContent = channel;
    var fr = $("vidFrame");
    fr.src = emb + (emb.indexOf("?") === -1 ? "?" : "&") + "autoplay=1";
    m.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeVideoModal() {
    var m = $("vidModal");
    if (!m || m.hidden) return;
    m.hidden = true;
    var fr = $("vidFrame");
    if (fr) fr.src = "";
    document.body.style.overflow = "";
  }
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") closeVideoModal();
  });
  /* Lazy-load stretch embeds when the disclosure opens. */
  document.addEventListener("toggle", function (ev) {
    var d = ev.target;
    if (!d || !d.classList || !d.classList.contains("stretchvids")) return;
    if (!d.open) return;
    var slot = d.querySelector(".embed-slot");
    var emb = embedUrl(d.getAttribute("data-embed"));
    if (slot && emb && !slot.firstChild) {
      var fr = document.createElement("iframe");
      fr.title = "Stretch demonstration";
      fr.loading = "lazy";
      fr.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      fr.allowFullscreen = true;
      fr.src = emb;
      slot.appendChild(fr);
    }
  }, true);

  function renderSession() {
    var wi = state.settings.week - 1;
    var di = state.settings.day;
    var day = buildDay(wi, di);
    var html = '<div class="sess-eyebrow">SESSION ' + (di + 1) + " OF 6</div>";
    html += "<h2>" + esc(day.name) + "</h2>";
    html += '<div class="sw"><span class="sw-label">STOPWATCH</span>' +
      '<span class="sw-disp" id="swDisp">00:00</span>' +
      '<span class="sw-btns" id="swBtns"></span></div>';
    html += '<div class="tasks">';
    var doneN = 0;
    for (var t = 0; t < day.tasks.length; t++) {
      var task = day.tasks[t];
      var id = taskId(wi + 1, di + 1, t + 1);
      var isDone = !!state.checks[id];
      if (isDone) doneN++;
      html += '<article class="task' + (isDone ? " done" : "") + '">' +
        '<span class="tbadge">' + esc(task.icon) + "</span>" +
        '<div class="tbody">' +
        '<span class="tnum">' + pad2(t + 1) + "</span>" +
        '<div class="ttitle">' + esc(task.title) + "</div>" +
        '<div class="tdetail">' + esc(task.detail) + "</div>" +
        (task.meta ? '<div class="tmeta">' + esc(task.meta) + "</div>" : "") +
        (task.x3kind ? x3VideosHtml(task.x3kind) : "") +
        (task.video ? stretchVideoHtml(task.video) : "") +
        "</div>" +
        '<button class="switch" role="checkbox" aria-checked="' + isDone +
        '" aria-label="Mark ' + (isDone ? "incomplete" : "complete") + ": " + esc(task.title) +
        '" data-action="toggle-check" data-id="' + id + '"></button></article>';
    }
    html += "</div>";
    var remaining = day.tasks.length - doneN;
    if (remaining === 0) {
      html += '<div class="sessfoot"><span class="footline"><strong>Session secured.</strong></span>' +
        '<span class="footline">Recover and move to the next training day.</span>' +
        '<button class="btn primary nextbtn" data-action="next-day">Next session &rarr;</button></div>';
    } else {
      html += '<div class="sessfoot"><span class="footline"><strong>' + remaining +
        " tasks remaining</strong></span>" +
        '<span class="footline">Use each switch as you finish.</span>' +
        '<button class="btn nextbtn" data-action="next-day">Preview next &rarr;</button></div>';
    }
    $("sessCard").innerHTML = html;
    swRender();
  }

  function renderIntel() {
    var done = countAll();
    var pct = Math.round(done / 216 * 100);
    var ps = plankSecs();
    var plankBad = state.numbers.plank.trim() !== "" && ps == null;
    var rs = rowSecs();
    var rows = "";
    [["Easy", 0.40], ["Medium", 0.45], ["Strong", 0.50]].forEach(function (lv) {
      var hold = plankHoldFor(lv[1]);
      rows += '<div class="derived-row"><span>' + lv[0] + " " + Math.round(lv[1] * 100) + '%</span><span>' +
        repsFor(lv[1]) + " PU &middot; " + (hold == null ? "—" : fmtMSS(hold)) + "</span></div>";
    });
    var html =
      '<div class="icard"><h3>OVERALL READINESS</h3>' +
      '<div class="readypct">' + pct + '%</div>' +
      '<div class="meter"><i style="width:' + pct + '%"></i></div>' +
      '<div class="ready-sub">' + done + " of 216 plan tasks complete</div></div>" +
      '<div class="icard"><h3>TRAINING NUMBERS</h3>' +
      '<div class="field"><label>Best 1-min push-ups</label>' +
      '<input data-change="num" data-f="pushups" inputmode="numeric" value="' + esc(state.numbers.pushups) + '"></div>' +
      '<div class="field"><label>Best plank hold (min:sec)</label>' +
      '<input data-change="num" data-f="plank" value="' + esc(state.numbers.plank) + '"' +
      (plankBad ? ' class="invalid"' : "") + ' placeholder="2:40"></div>' +
      (plankBad ? '<div class="plank-err">Enter a time such as 2:17, with seconds from 00 to 59.</div>' : "") +
      '<div class="field"><label>Current 2,000 m time</label>' +
      '<input data-change="num" data-f="row" value="' + esc(state.numbers.row) + '" placeholder="8:10"></div>' +
      '<div class="derived">' + rows +
      '<div class="derived-row"><span>Current / 500 m</span><span>' +
      (rs == null ? "—" : fmtSplit(rs / 4)) + "</span></div></div></div>" +
      '<div class="icard rulecard"><div class="rule-num">PLAN RULE 01</div>' +
      "<p>Never double a missed day.</p>" +
      '<p class="fineprint">Keep going with the next planned session. Do not stack two hard workouts.</p></div>';
    $("intelCol").innerHTML = html;
  }
  function renderTraining() {
    renderRail();
    renderHero();
    renderDayTabs();
    renderSession();
    renderIntel();
  }

  /* ================= stopwatch (one global timer) ================= */
  var sw = { elapsed: 0, running: false, last: 0, timer: null };
  function swFmt(ms) {
    var s = Math.floor(ms / 1000);
    return pad2(Math.floor(s / 60)) + ":" + pad2(s % 60);
  }
  function swRender() {
    var d = $("swDisp"), b = $("swBtns");
    if (d) d.textContent = swFmt(sw.elapsed);
    if (!b) return;
    if (sw.running) {
      b.innerHTML = '<button class="btn" data-action="sw-toggle">Pause</button>' +
        '<button class="btn ghost" data-action="sw-reset">Reset</button>';
    } else if (sw.elapsed > 0) {
      b.innerHTML = '<button class="btn" data-action="sw-toggle">Resume</button>' +
        '<button class="btn ghost" data-action="sw-reset">Reset</button>';
    } else {
      b.innerHTML = '<button class="btn primary" data-action="sw-toggle">Start</button>';
    }
  }
  function swTick() {
    var now = Date.now();
    sw.elapsed += now - sw.last;
    sw.last = now;
    var d = $("swDisp");
    if (d) d.textContent = swFmt(sw.elapsed);
  }

  /* ================= target calculator ================= */
  var SCORE_LEVELS = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45];
  var AGE_BRACKETS = ["17–19", "20–24", "25–29", "30–34", "35–39", "40–44",
    "45–49", "50–54", "55–59", "60–64", "65+"];
  function ageKey(display) { return display.replace("–", "-"); }
  function tableEntry(sex, age, score) {
    try { return TABLES[sex][age][String(score)]; } catch (e) { return null; }
  }
  function catFor(score) {
    if (score >= 90) return "Superior";
    if (score >= 75) return "Excellent";
    if (score >= 60) return "Above Average";
    return "Average";
  }
  function evalFor(avg) {
    if (avg >= 90) return { cat: "Superior", mark: 7 };
    if (avg >= 75) return { cat: "Excellent", mark: 6 };
    if (avg >= 60) return { cat: "Above Average", mark: 5 };
    return { cat: "Average", mark: 4 };
  }
  function reqFromTable(ev, sex, age, score) {
    var e = tableEntry(sex, age, score);
    if (!e) return "";
    return ev === "push" ? String(e.pushups) : String(e[ev]);
  }
  function setEventScore(ev, score) {
    state.calc.scores[ev] = score;
    state.calc.req[ev] = reqFromTable(ev, state.calc.sex, state.calc.age, score);
    scheduleSave();
    renderMission();
    renderCalculator();
    renderProgress();
  }
  function setAllScores(score) {
    ["push", "plank", "row"].forEach(function (ev) {
      state.calc.scores[ev] = score;
      state.calc.req[ev] = reqFromTable(ev, state.calc.sex, state.calc.age, score);
    });
    scheduleSave();
    renderMission();
    renderCalculator();
    renderProgress();
  }
  function lvlLabel(score) {
    if (score === 45) return "Pass · 45";
    if (score === 70) return "Ready · 70";
    if (score === 100) return "Max · 100";
    return String(score);
  }
  var EV_DEFS = [
    { key: "push", num: "01", group: "MUSCULAR ENDURANCE", name: "Push-ups",
      sub: "Maximum correct reps in 1 minute", field: "REPS", load: "LOAD PUSH-UP TARGET" },
    { key: "plank", num: "02", group: "CORE ENDURANCE", name: "Forearm plank",
      sub: "Maximum hold in correct position", field: "MIN:SEC", load: "LOAD PLANK TARGET" },
    { key: "row", num: "03", group: "CARDIORESPIRATORY ENDURANCE", name: "2,000 m row",
      sub: "Total elapsed time", field: "MIN:SEC", load: "LOAD CARDIO TARGET" }
  ];
  function renderCalculator() {
    var c = state.calc;
    var ms = missionScores();
    var avg = ms.total / 3;
    var avgTxt = (avg === Math.round(avg)) ? String(Math.round(avg)) : avg.toFixed(1);
    var ev = evalFor(avg);

    var ageOpts = "";
    AGE_BRACKETS.forEach(function (b) {
      ageOpts += '<option value="' + esc(b) + '"' + (ageKey(b) === c.age ? " selected" : "") +
        ">" + esc(b) + "</option>";
    });

    var eventsHtml = "";
    EV_DEFS.forEach(function (d) {
      var btns = "";
      SCORE_LEVELS.forEach(function (s) {
        btns += '<button class="lvlbtn' + (c.scores[d.key] === s ? " active" : "") +
          '" data-action="score" data-ev="' + d.key + '" data-score="' + s + '">' +
          esc(lvlLabel(s)) + "</button>";
      });
      eventsHtml += '<div class="evcard"><div class="evnum">' + d.num + " " + d.group + "</div>" +
        "<h2>" + d.name + "</h2>" +
        '<p class="evsub">' + d.sub + "</p>" +
        '<div class="reqfield"><label>' + d.field + " · EDITABLE</label>" +
        '<input data-change="req" data-ev="' + d.key + '" value="' + esc(c.req[d.key]) + '"' +
        ' placeholder="' + (d.key === "push" ? "35" : (d.key === "plank" ? "2:52" : "7:50")) + '"' +
        (d.key === "push" ? ' inputmode="numeric"' : "") + "></div>" +
        '<div class="score-line"><b>' + c.scores[d.key] + "</b>/100</div>" +
        '<div class="loadlabel">' + d.load + '</div><div class="lvlbtns">' + btns + "</div></div>";
    });

    var allBtns = "";
    SCORE_LEVELS.forEach(function (s) {
      var allSame = c.scores.push === s && c.scores.plank === s && c.scores.row === s;
      allBtns += '<button class="lvlbtn' + (allSame ? " active" : "") +
        '" data-action="score-all" data-score="' + s + '">' + esc(lvlLabel(s)) + "</button>";
    });

    var rows = "";
    SCORE_LEVELS.forEach(function (s) {
      var e = tableEntry(c.sex, c.age, s);
      var allSame = c.scores.push === s && c.scores.plank === s && c.scores.row === s;
      rows += '<tr data-action="score-row" data-score="' + s + '"' +
        (allSame ? ' class="active"' : "") + ">" +
        '<td class="pts">' + s + "</td>" +
        "<td>" + (e ? esc(e.pushups) : "—") + "</td>" +
        "<td>" + (e ? esc(e.plank) : "—") + "</td>" +
        "<td>" + (e ? esc(e.row) : "—") + "</td>" +
        "<td>" + catFor(s) + "</td></tr>";
    });

    var html =
      '<div class="calchead"><div class="eyebrow">PFT TARGET CALCULATOR</div>' +
      "<h1>Set the standard. Train to it.</h1>" +
      '<p class="calcintro">Choose your sex and age bracket, then load one score for all three events ' +
      "or set each event separately. Every loaded push-up, plank, and row requirement stays editable " +
      "and becomes the Mission shown across the app.</p></div>" +
      '<div class="calcgrid"><div>' +
      '<div class="ctl-row">' +
      '<div class="ctl"><label>SEX</label><div class="sexseg">' +
      '<button class="segbtn' + (c.sex === "female" ? " active" : "") +
      '" data-action="sex" data-sex="female">Female</button>' +
      '<button class="segbtn' + (c.sex === "male" ? " active" : "") +
      '" data-action="sex" data-sex="male">Male</button></div></div>' +
      '<div class="ctl agewrap"><label>AGE BRACKET</label><select data-change="age">' +
      ageOpts + "</select></div></div>" +
      '<div class="amission"><div class="am-label">ACTIVE MISSION</div>' +
      '<div class="am-total">' + ms.total + " / 300 POINTS</div>" +
      '<div class="am-req">Push-ups ' + esc(c.req.push) + " · Plank " + esc(c.req.plank) +
      " · Row " + esc(c.req.row) + "</div></div>" +
      '<div class="events">' + eventsHtml + "</div>" +
      '<div class="loadall"><div class="loadlabel">LOAD SAME TARGET FOR ALL 3 EVENTS</div>' +
      '<div class="lvlbtns">' + allBtns + "</div></div>" +
      '<div class="stable-wrap"><table class="stable"><thead><tr><th>Points</th><th>Push-ups</th>' +
      "<th>Plank</th><th>2,000 m row</th><th>Category</th></tr></thead><tbody>" +
      rows + "</tbody></table></div>" +
      '<p class="srcnote">Requirements are transcribed from the attached USCG female and male ' +
      "Physical Fitness Test scoring tables. Failed events are recorded per COMDTINST 6100.1.</p>" +
      "</div>" +
      '<div><div class="sumpanel"><div class="eyebrow">PASSING TARGET</div>' +
      "<h2>Your PFT target</h2>" +
      '<div class="sum-total">' + ms.total + "/300</div>" +
      '<div class="sum-avg">' + avgTxt + " AVG PTS</div>" +
      '<div class="sumrow"><span class="k">CATEGORY</span><span class="v">' + ev.cat + "</span></div>" +
      '<div class="sumrow"><span class="k">EVAL MARK</span><span class="v">' + ev.mark + "</span></div>" +
      '<p class="sumnote">Push-ups ' + c.scores.push + " · Plank " + c.scores.plank + " · Row " +
      c.scores.row + " points for " + esc(c.sex) + " ages " + esc(c.age) +
      ". Edit any loaded requirement to create a personal training goal.</p>" +
      "</div></div></div>";
    $("calcRoot").innerHTML = html;
  }

  /* ================= progress view ================= */
  function renderProgress() {
    var c = state.calc;
    var ms = missionScores();
    var pct = Math.round(countAll() / 216 * 100);
    var ck = state.checkpoints;
    function ckpt(num, key, title, tag) {
      var v = ck[key];
      return '<div class="ckpt"><div class="ckpt-num">' + num + "</div>" +
        "<h2>" + title + (tag ? '<span class="ckpt-tag">' + tag + "</span>" : "") + "</h2>" +
        '<div class="field"><label>Push-ups</label><input data-change="ckpt" data-ck="' + key +
        '" data-f="push" inputmode="numeric" placeholder="35" value="' + esc(v.push) + '"></div>' +
        '<div class="field"><label>Plank</label><input data-change="ckpt" data-ck="' + key +
        '" data-f="plank" placeholder="2:52" value="' + esc(v.plank) + '"></div>' +
        '<div class="field"><label>2,000 m row</label><input data-change="ckpt" data-ck="' + key +
        '" data-f="row" placeholder="7:50" value="' + esc(v.row) + '"></div></div>';
    }
    var html =
      '<div class="proghead"><div class="eyebrow">READINESS LOG</div>' +
      "<h1>Build proof, not guesswork.</h1>" +
      '<p class="progintro">Record your baseline and practice PFT results. ' +
      "Use Week 4 and Week 8 to update your working pace.</p></div>" +
      '<div class="ckpt-grid">' +
      ckpt("01", "c1", "Baseline", "") +
      ckpt("02", "c2", "Week 4", "PRACTICE PFT") +
      ckpt("03", "c3", "Week 8", "PRACTICE PFT") +
      "</div>" +
      '<div class="eyebrow">YOUR SELECTED ROUTE</div>' +
      '<div class="route-line">' + esc(c.req.push) + " push-ups · " + esc(c.req.plank) +
      " plank · " + esc(c.req.row) + " row</div>" +
      '<div class="route-pts">Push-ups ' + c.scores.push + " · Plank " + c.scores.plank +
      " · Row " + c.scores.row + " = " + ms.total + " total points for " + esc(c.sex) +
      " ages " + esc(c.age) + ".</div>" +
      '<div class="planpct">' + pct + "% PLAN COMPLETE</div>" +
      '<div class="panel"><h2>Readiness Log</h2>' +
      '<div class="remgrid">' +
      '<div class="field"><label>Date</label><input id="logDate" type="date"></div>' +
      '<div class="field"><label>Sleep (hours)</label><input id="logSleep" inputmode="decimal" placeholder="7.5"></div>' +
      '<div class="field"><label>Soreness (1&ndash;5)</label><select id="logSore">' +
      '<option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option></select></div>' +
      '<div class="field"><label>Energy (1&ndash;5)</label><select id="logEnergy">' +
      '<option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option></select></div>' +
      "</div>" +
      '<div class="field"><label>Notes</label><input id="logNotes" placeholder="How did the session go?"></div>' +
      '<button class="btn primary" data-action="add-readiness">ADD ENTRY</button></div>' +
      '<div class="panel"><h2>LOG ENTRIES</h2><div id="readinessList"></div></div>' +
      '<div class="panel backup"><div class="eyebrow">MOVE TO A NEW HOME SCREEN ICON</div>' +
      "<h2>Keep your setup and progress.</h2>" +
      '<div class="eyebrow" style="margin:10px 0 8px">ON-DEVICE BACKUP</div>' +
      "<ol>" +
      "<li><b>1 Old icon</b> — Tap &ldquo;Copy current backup.&rdquo;</li>" +
      "<li><b>2 New icon</b> — Add IRON TIDE 4 to your Home Screen without deleting the old icon.</li>" +
      "<li><b>3 Restore</b> — Paste the code, restore it, and check your numbers before deleting the old icon.</li>" +
      "</ol>" +
      '<div class="bkup-row"><button class="btn" data-action="copy-backup">Copy current backup</button></div>' +
      '<div class="field"><label>BACKUP CODE</label>' +
      '<textarea id="backupCode" data-input="backup-code" placeholder="Paste the backup code from your old icon here."></textarea></div>' +
      '<button class="btn primary" id="restoreBtn" data-action="restore-backup" disabled>Restore this backup</button>' +
      '<div class="backup-status" id="backupStatus">Nothing has been copied or restored yet.</div></div>';
    $("progRoot").innerHTML = html;
    if ($("logDate")) $("logDate").value = new Date().toISOString().slice(0, 10);
    renderReadiness();
  }
  function renderReadiness() {
    var list = $("readinessList");
    if (!list) return;
    var arr = state.numbers.readiness;
    if (!arr.length) {
      list.innerHTML = '<p class="fineprint">No entries yet. Log your first day above.</p>';
      return;
    }
    var html = "";
    for (var i = 0; i < arr.length; i++) {
      var e = arr[i];
      html += '<div class="logentry"><button class="del" data-action="del-readiness" data-i="' + i +
        '" title="Delete">&#10005;</button>' +
        '<div class="meta">' + esc(e.date) + " · sleep " + esc(e.sleep) + "h · soreness " + esc(e.sore) +
        "/5 · energy " + esc(e.energy) + "/5</div>" +
        (e.notes ? "<div>" + esc(e.notes) + "</div>" : "") + "</div>";
    }
    list.innerHTML = html;
  }
  function backupStatus(msg) {
    var el = $("backupStatus");
    if (el) el.textContent = msg;
  }

  /* ================= account view ================= */
  var acctTab = "signin";
  function authMessage(msg, isErr) {
    var el = $("authMsg");
    if (!el) return;
    el.textContent = msg;
    el.className = "amsg" + (isErr ? " err" : " ok");
  }
  function cloudStatusLabel() {
    if (currentUser && cloudOn) return "Saved to cloud";
    if (currentUser) return "Saving";
    return "Local only";
  }
  function renderAccount() {
    var root = $("acctRoot");
    var html = '<div class="accthead"><div class="eyebrow">CLOUD ACCOUNT</div>' +
      "<h1>Your progress, on every device.</h1>" +
      '<p class="acctintro">Sign in on your phone, tablet, or computer to load the same mission, ' +
      "completed workouts, checkpoints, and training numbers.</p></div>";
    if (!keyConfigured()) {
      html += '<div class="notice"><b>Cloud account settings are unavailable.</b></div>';
    } else if (!currentUser) {
      html += '<div class="acctabs">' +
        '<button class="atab' + (acctTab === "signin" ? " active" : "") +
        '" data-action="acct-tab" data-atab="signin">Sign in</button>' +
        '<button class="atab' + (acctTab === "create" ? " active" : "") +
        '" data-action="acct-tab" data-atab="create">Create account</button></div>' +
        '<div class="acctform">' +
        '<div class="field"><label>EMAIL</label><input id="authEmail" type="email" ' +
        'placeholder="name@example.com" autocomplete="email"></div>' +
        '<div class="field"><label>PASSWORD</label><input id="authPass" type="password" ' +
        'placeholder="At least 8 characters" autocomplete="' +
        (acctTab === "create" ? "new-password" : "current-password") + '"></div>' +
        (acctTab === "signin"
          ? '<button class="btn primary" data-action="login">Sign in</button>'
          : '<button class="btn primary" data-action="signup">Create account</button>') +
        '<div><a class="forgot" href="#" data-action="forgot">Forgot password?</a></div>' +
        '<div class="amsg" id="authMsg">Your password is handled securely by the account provider ' +
        "and is never stored inside IRON TIDE 4.</div>" +
        "</div>";
    } else {
      html += '<div class="signedcard"><div class="eyebrow">SIGNED IN AS</div>' +
        "<h2>" + esc(currentUser.email) + "</h2>" +
        '<div class="cloud-state"><span class="k">CLOUD STATUS</span><strong>' +
        esc(cloudStatusLabel()) + "</strong></div>" +
        '<button class="btn" data-action="logout">Sign out</button></div>';
    }
    html += renderReminders();
    root.innerHTML = html;
  }

  /* ---- workout reminders (simplified: client-side .ics download) ---- */
  var REM_DAYS = [[1, "Monday"], [2, "Tuesday"], [3, "Wednesday"], [4, "Thursday"], [5, "Friday"], [6, "Saturday"]];
  function defaultReminders() {
    var d = new Date();
    var add = ((8 - d.getDay()) % 7) || 7;
    d.setDate(d.getDate() + add);
    return {
      start: d.toISOString().slice(0, 10),
      time: "17:30",
      lead: "30",
      days: [1, 2, 3, 4, 5, 6]
    };
  }
  function loadReminders() {
    try {
      var raw = localStorage.getItem(REM_KEY);
      if (raw) {
        var r = JSON.parse(raw);
        if (r && r.start && r.time) {
          if (!Array.isArray(r.days)) r.days = [1, 2, 3, 4, 5, 6];
          return r;
        }
      }
    } catch (e) {}
    return defaultReminders();
  }
  function renderReminders() {
    var r = loadReminders();
    var days = "";
    REM_DAYS.forEach(function (sd) {
      days += "<label><input type=\"checkbox\" data-remday=\"" + sd[0] + "\"" +
        (r.days.indexOf(sd[0]) !== -1 ? " checked" : "") + "> Session " + sd[0] + " " + sd[1] + "</label>";
    });
    return '<div class="remind"><div class="eyebrow">WORKOUT REMINDERS</div>' +
      "<h2>Make the plan harder to miss.</h2>" +
      '<div class="eyebrow" style="margin-bottom:8px">DEVICE ALERTS</div>' +
      '<p class="fineprint">Calendar alerts are the reliable way to remind you even when IRON TIDE 4 is ' +
      "closed. Choose when Week 1 starts and the app will prepare all 12 weeks.</p>" +
      '<div class="remgrid">' +
      '<div class="field"><label>WEEK 1 STARTS</label><input type="date" id="remStart" value="' +
      esc(r.start) + '"></div>' +
      '<div class="field"><label>WORKOUT TIME</label><input type="time" id="remTime" value="' +
      esc(r.time) + '"></div>' +
      '<div class="field"><label>ALERT</label><select id="remLead">' +
      '<option value="0"' + (r.lead === "0" ? " selected" : "") + ">At workout time</option>" +
      '<option value="15"' + (r.lead === "15" ? " selected" : "") + ">15 min before</option>" +
      '<option value="30"' + (r.lead === "30" ? " selected" : "") + ">30 min before</option>" +
      '<option value="60"' + (r.lead === "60" ? " selected" : "") + ">1 hour before</option>" +
      "</select></div></div>" +
      '<div class="field"><label>PLAN DAYS</label><div class="remdays">' + days + "</div></div>" +
      '<button class="btn primary" data-action="dl-ics">Download .ics</button>' +
      '<div class="rem-status" id="remStatus">Choose your schedule, then use the calendar option for your device.</div>' +
      '<p class="fineprint">Haptic feedback follows your device settings. iPhone uses native switches; ' +
      "other supported devices receive a gentle vibration.</p>" +
      "</div>";
  }
  function readReminders() {
    var days = [];
    var boxes = document.querySelectorAll("[data-remday]");
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].checked) days.push(parseInt(boxes[i].getAttribute("data-remday"), 10));
    }
    var r = {
      start: $("remStart") ? $("remStart").value : "",
      time: $("remTime") ? $("remTime").value : "",
      lead: $("remLead") ? $("remLead").value : "30",
      days: days
    };
    try { localStorage.setItem(REM_KEY, JSON.stringify(r)); } catch (e) {}
    return r;
  }
  function icsDate(d) {
    return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate());
  }
  function buildICS(r) {
    var dayName = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };
    var start = new Date(r.start + "T00:00:00");
    var stamp = icsDate(new Date()) + "T000000";
    var t = String(r.time || "17:30").replace(":", "");
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0",
      "PRODID:-//IRON TIDE 4//Workout Reminders//EN", "CALSCALE:GREGORIAN"];
    for (var w = 0; w < 12; w++) {
      for (var i = 0; i < r.days.length; i++) {
        var d = r.days[i];
        var dt = new Date(start.getTime() + (w * 7 + (d - 1)) * 86400000);
        lines.push("BEGIN:VEVENT",
          "UID:it4-" + icsDate(dt) + "-s" + d + "-w" + (w + 1) + "@iron-tide-4",
          "DTSTAMP:" + stamp,
          "DTSTART:" + icsDate(dt) + "T" + t + "00",
          "DURATION:PT1H",
          "SUMMARY:IRON TIDE 4 - Session " + d + " (" + dayName[d] + "), Week " + (w + 1),
          "DESCRIPTION:12-week USCG PFT companion workout.",
          "BEGIN:VALARM",
          "TRIGGER:-PT" + r.lead + "M",
          "ACTION:DISPLAY",
          "DESCRIPTION:IRON TIDE 4 workout",
          "END:VALARM",
          "END:VEVENT");
      }
    }
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }

  /* ================= render all ================= */
  function renderAll() {
    renderTabs();
    renderHeader();
    renderMission();
    renderTraining();
    renderCalculator();
    renderProgress();
    renderAccount();
  }

  /* ================= actions ================= */
  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("[data-action]");
    if (!el) return;
    var action = el.getAttribute("data-action");

    if (action === "brand") {
      activeTab = "training";
      renderTabs();
    } else if (action === "tab") {
      activeTab = el.getAttribute("data-tab");
      renderTabs();
    } else if (action === "week") {
      state.settings.week = parseInt(el.getAttribute("data-week"), 10);
      state.settings.day = 0;
      scheduleSave();
      activeTab = "training";
      renderTabs();
      renderTraining();
    } else if (action === "day") {
      state.settings.day = parseInt(el.getAttribute("data-day"), 10);
      scheduleSave();
      renderDayTabs();
      renderSession();
    } else if (action === "next-day") {
      state.settings.day = (state.settings.day + 1) % 6;
      scheduleSave();
      renderDayTabs();
      renderSession();
    } else if (action === "toggle-check") {
      var id = el.getAttribute("data-id");
      if (state.checks[id]) delete state.checks[id];
      else state.checks[id] = true;
      scheduleSave();
      renderRail();
      renderHero();
      renderDayTabs();
      renderSession();
      renderIntel();
      renderProgress();
    } else if (action === "sw-toggle") {
      if (sw.running) {
        sw.running = false;
        if (sw.timer) clearInterval(sw.timer);
        sw.timer = null;
      } else {
        sw.running = true;
        sw.last = Date.now();
        if (sw.timer) clearInterval(sw.timer);
        sw.timer = setInterval(swTick, 1000);
      }
      swRender();
    } else if (action === "sw-reset") {
      sw.running = false;
      if (sw.timer) clearInterval(sw.timer);
      sw.timer = null;
      sw.elapsed = 0;
      swRender();
    } else if (action === "sex") {
      state.calc.sex = el.getAttribute("data-sex");
      ["push", "plank", "row"].forEach(function (k) {
        state.calc.req[k] = reqFromTable(k, state.calc.sex, state.calc.age, state.calc.scores[k]);
      });
      scheduleSave();
      renderMission();
      renderCalculator();
      renderProgress();
    } else if (action === "score") {
      setEventScore(el.getAttribute("data-ev"), parseInt(el.getAttribute("data-score"), 10));
    } else if (action === "score-all" || action === "score-row") {
      setAllScores(parseInt(el.getAttribute("data-score"), 10));
    } else if (action === "acct-tab") {
      acctTab = el.getAttribute("data-atab");
      renderAccount();
    } else if (action === "signup" || action === "login") {
      if (!supabaseClient) { authMessage("Cloud login is not configured yet.", true); return; }
      var email = $("authEmail").value.trim();
      var pass = $("authPass").value;
      if (!email || pass.length < 8) {
        authMessage("Enter an email and a password with at least 8 characters.", true);
        return;
      }
      authMessage("Please wait…", false);
      var promise = action === "signup"
        ? supabaseClient.auth.signUp({ email: email, password: pass })
        : supabaseClient.auth.signInWithPassword({ email: email, password: pass });
      promise.then(function (res) {
        if (res.error) {
          var m = res.error.message || "";
          if (/confirm/i.test(m)) authMessage("Confirm your email first, then sign in.", true);
          else if (/invalid/i.test(m)) authMessage("The email or password is incorrect.", true);
          else authMessage(m, true);
          return;
        }
        if (action === "signup" && res.data && !res.data.session) {
          authMessage("Account created. Check your email to confirm, then log in.", false);
          return;
        }
        authMessage("Signed in.", false);
      });
    } else if (action === "forgot") {
      ev.preventDefault();
      if (!supabaseClient) { authMessage("Cloud login is not configured yet.", true); return; }
      var femail = $("authEmail") ? $("authEmail").value.trim() : "";
      if (!femail) { authMessage("Enter your email first.", true); return; }
      supabaseClient.auth.resetPasswordForEmail(femail).then(function (res) {
        if (res.error) authMessage(res.error.message, true);
        else authMessage("If that account exists, a password-reset email has been sent.", false);
      });
    } else if (action === "logout") {
      if (supabaseClient) supabaseClient.auth.signOut();
    } else if (action === "add-readiness") {
      var entry = {
        date: $("logDate").value || new Date().toISOString().slice(0, 10),
        sleep: $("logSleep").value.trim() || "—",
        sore: $("logSore").value,
        energy: $("logEnergy").value,
        notes: $("logNotes").value.trim()
      };
      state.numbers.readiness.unshift(entry);
      $("logSleep").value = "";
      $("logNotes").value = "";
      scheduleSave();
      renderReadiness();
    } else if (action === "del-readiness") {
      state.numbers.readiness.splice(parseInt(el.getAttribute("data-i"), 10), 1);
      scheduleSave();
      renderReadiness();
    } else if (action === "copy-backup") {
      var payload = JSON.stringify({
        app: "iron-tide-4", version: 1,
        exportedAt: new Date().toISOString(), state: state
      });
      $("backupCode").value = payload;
      $("restoreBtn").disabled = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload).then(function () {
          backupStatus("Backup copied. Keep the old icon until the new icon has been restored and checked.");
        }, function () {
          backupStatus("Backup created. Touch and hold inside the code box, choose Select All, then Copy.");
        });
      } else {
        backupStatus("Backup created. Touch and hold inside the code box, choose Select All, then Copy.");
      }
    } else if (action === "restore-backup") {
      var raw = $("backupCode").value.trim();
      try {
        var obj = JSON.parse(raw);
        if (!obj || obj.app !== "iron-tide-4" || !obj.state) throw new Error("bad");
        state = normalizeState(obj.state);
        scheduleSave();
        renderAll();
        backupStatus("Backup restored. Check your mission, checkpoints, and completion percentage before deleting the old icon.");
      } catch (e) {
        backupStatus("That backup code could not be read. Copy it again from the old icon and paste the whole code here.");
      }
    } else if (action === "x3-play") {
      var xk = el.getAttribute("data-kind");
      var xi = parseInt(el.getAttribute("data-i"), 10) || 0;
      var xv = (PLAN.x3videos[xk] || [])[xi];
      if (xv) openVideoModal(xv.title, xv.channel, xv.url);
    } else if (action === "vid-close") {
      closeVideoModal();
    } else if (action === "dl-ics") {
      var r = readReminders();
      var st = $("remStatus");
      if (!r.start || !r.time || !r.days.length) {
        if (st) st.textContent = "Choose a start date, workout time, and at least one session first.";
        return;
      }
      var ics = buildICS(r);
      var blob = new Blob([ics], { type: "text/calendar" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "iron-tide-4-reminders.ics";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 500);
      if (st) st.textContent = "Calendar file opened. Import all events when your computer asks.";
    }
  });

  document.addEventListener("change", function (ev) {
    var el = ev.target;
    var kind = el.getAttribute("data-change");
    if (!kind) return;

    if (kind === "num") {
      var f = el.getAttribute("data-f");
      state.numbers[f] = el.value.trim();
      scheduleSave();
      renderTraining();
    } else if (kind === "req") {
      var rev = el.getAttribute("data-ev");
      var val = el.value.trim();
      state.calc.req[rev] = rev === "push" ? val.replace(/\D/g, "") : val;
      scheduleSave();
      renderMission();
      renderProgress();
    } else if (kind === "ckpt") {
      var ck = el.getAttribute("data-ck");
      var cf = el.getAttribute("data-f");
      state.checkpoints[ck][cf] = cf === "push" ? el.value.trim().replace(/\D/g, "") : el.value.trim();
      scheduleSave();
    } else if (kind === "age") {
      state.calc.age = ageKey(el.value);
      ["push", "plank", "row"].forEach(function (k) {
        state.calc.req[k] = reqFromTable(k, state.calc.sex, state.calc.age, state.calc.scores[k]);
      });
      scheduleSave();
      renderMission();
      renderCalculator();
      renderProgress();
    } else if (kind === "x3sel") {
      var picker = el.closest(".x3-picker");
      if (!picker) return;
      var kind2 = picker.getAttribute("data-x3kind");
      var vids = PLAN.x3videos[kind2] || [];
      var v = vids[parseInt(el.value, 10)];
      if (!v) return;
      var link = picker.querySelector(".x3-open");
      var chan = picker.querySelector(".x3-chan");
      var play = picker.querySelector(".x3-play");
      if (link) link.href = v.url;
      if (chan) chan.textContent = v.channel;
      if (play) {
        play.setAttribute("data-i", el.value);
        play.innerHTML = "&#9654; Play " + esc(v.title) + " full screen";
      }
    }
  });

  document.addEventListener("input", function (ev) {
    if (ev.target && ev.target.getAttribute("data-input") === "backup-code") {
      var btn = $("restoreBtn");
      if (btn) btn.disabled = ev.target.value.trim() === "";
    }
  });

  /* ================= boot ================= */
  initCloud();
  renderAll();
})();
