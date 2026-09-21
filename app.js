/* IRON TIDE 4 — app logic.
 * Local state always works (localStorage). When logged in via Supabase,
 * the same state syncs to the cloud `progress` table as JSONB.
 */
(function () {
  "use strict";

  var CFG = window.IRON_TIDE_CONFIG || {};
  var PLAN = window.IRON_TIDE_PLAN || { weeks: [] };
  var LS_KEY = "ironTide4.v1";

  /* ---------------- state ---------------- */
  function blankState() {
    return {
      checks: {},
      numbers: { pushups: "", plank: "", row: "", readiness: [] },
      settings: { week: 1 }
    };
  }
  function normalizeState(s) {
    var b = blankState();
    if (!s || typeof s !== "object") return b;
    if (s.checks && typeof s.checks === "object") b.checks = s.checks;
    if (s.numbers && typeof s.numbers === "object") {
      b.numbers.pushups = s.numbers.pushups || "";
      b.numbers.plank = s.numbers.plank || "";
      b.numbers.row = s.numbers.row || "";
      b.numbers.readiness = Array.isArray(s.numbers.readiness) ? s.numbers.readiness : [];
    }
    if (s.settings && typeof s.settings === "object" && s.settings.week) b.settings.week = s.settings.week;
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

  /* ---------------- cloud ---------------- */
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
    renderAccount();
    renderCloudBadge();
    renderGuestNotice();
    if (currentUser && supabaseClient) {
      supabaseClient.from("progress").select("data").eq("user_id", currentUser.id).maybeSingle()
        .then(function (res) {
          if (!res.error && res.data && res.data.data) {
            state = normalizeState(res.data.data);
            persistLocal();
            renderAll();
          }
          return cloudSave();
        });
    } else {
      cloudOn = false;
      renderCloudBadge();
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
      renderCloudBadge();
    });
  }

  /* ---------------- helpers ---------------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function taskId(w, s, t) { return "w" + pad2(w) + "s" + s + "t" + t; }

  function parseTime(str) {
    var m = /^\s*(?:(\d+):)?(\d{1,2})(?:\.(\d+))?\s*$/.exec(String(str || ""));
    if (!m) return null;
    var mins = m[1] ? parseInt(m[1], 10) : 0;
    var secs = parseInt(m[2], 10);
    return mins * 60 + secs;
  }
  function fmtTime(ms) {
    var total = Math.max(0, ms);
    var m = Math.floor(total / 60000);
    var s = Math.floor((total % 60000) / 1000);
    var d = Math.floor((total % 1000) / 100);
    return pad2(m) + ":" + pad2(s) + "." + d;
  }

  /* USCG PFT scoring tables (Male 45-49), reference anchors, linearly interpolated. */
  function interp(pairs, x) {
    if (x <= pairs[0][0]) return pairs[0][1];
    for (var i = 1; i < pairs.length; i++) {
      if (x <= pairs[i][0]) {
        var x0 = pairs[i - 1][0], y0 = pairs[i - 1][1];
        var x1 = pairs[i][0], y1 = pairs[i][1];
        return Math.round(y0 + (y1 - y0) * (x - x0) / (x1 - x0));
      }
    }
    return pairs[pairs.length - 1][1];
  }
  var PUSH_PTS = [[0,0],[10,25],[20,50],[25,65],[30,78],[35,90],[40,100]];
  var PLANK_PTS = [[0,0],[60,35],[90,55],[120,70],[150,80],[172,90],[200,100]];
  var ROW_PTS = [[440,100],[450,98],[460,95],[470,90],[480,86],[490,80],[500,76],[510,70],[525,62],[540,55],[555,47],[570,40],[585,32],[600,25],[660,10]];

  /* ---------------- stopwatches ---------------- */
  var watches = {};
  function watchFor(w, s) {
    var k = w + ":" + s;
    if (!watches[k]) watches[k] = { elapsed: 0, running: false, last: 0, timer: null, w: w, s: s };
    return watches[k];
  }
  function watchTick(wch) {
    return function () {
      var now = Date.now();
      wch.elapsed += now - wch.last;
      wch.last = now;
      var el = document.querySelector('[data-watch-display="' + wch.w + ":" + wch.s + '"]');
      if (el) el.textContent = fmtTime(wch.elapsed);
    };
  }

  /* ---------------- rendering ---------------- */
  var activeTab = "training";

  function renderTabs() {
    var btns = document.querySelectorAll("#tabs button");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("active", btns[i].getAttribute("data-tab") === activeTab);
    }
    var panes = document.querySelectorAll(".tabpane");
    for (var j = 0; j < panes.length; j++) {
      panes[j].classList.toggle("active", panes[j].id === "tab-" + activeTab);
    }
  }

  function renderWeekRail() {
    var rail = $("weekRail");
    var html = "";
    for (var i = 0; i < PLAN.weeks.length; i++) {
      var w = PLAN.weeks[i];
      html += '<button data-action="week" data-week="' + w.num + '"' +
        (w.num === state.settings.week ? ' class="active"' : "") +
        ">WEEK " + pad2(w.num) + "</button>";
    }
    rail.innerHTML = html;
    var wk = PLAN.weeks[state.settings.week - 1];
    $("phaseBanner").innerHTML =
      '<span class="phasename">' + esc(wk.phase) + "</span> &nbsp;·&nbsp; " + esc(wk.phaseCue);
  }

  function renderSessions() {
    var wk = PLAN.weeks[state.settings.week - 1];
    var html = "";
    var done = 0, total = 0;
    for (var s = 0; s < wk.sessions.length; s++) {
      var sess = wk.sessions[s];
      html += '<div class="session"><h3><span class="snum">S' + (s + 1) + "</span>" + esc(sess.title) + "</h3>";
      for (var t = 0; t < sess.tasks.length; t++) {
        var task = sess.tasks[t];
        var id = taskId(wk.num, s + 1, t + 1);
        var isDone = !!state.checks[id];
        total++;
        if (isDone) done++;
        html += '<div class="task' + (isDone ? " done" : "") + '" data-action="toggle-check" data-id="' + id + '" role="checkbox" aria-checked="' + isDone + '">' +
          '<span class="box">&#10003;</span>' +
          '<span style="flex:1"><span class="tnum">' + esc(task.n) + " " + esc(task.icon) + '</span><br>' +
          '<span class="ttitle">' + esc(task.title) + "</span><br>" +
          '<span class="trx">' + esc(task.rx) + "</span><br>" +
          '<span class="tcue">' + esc(task.cue) + "</span></span></div>";
      }
      html += '<div class="stopwatch">' +
        '<span class="display" data-watch-display="' + wk.num + ":" + (s + 1) + '">00:00.0</span>' +
        '<button data-action="watch-start" data-w="' + wk.num + '" data-s="' + (s + 1) + '">Start</button>' +
        '<button data-action="watch-reset" data-w="' + wk.num + '" data-s="' + (s + 1) + '">Reset</button>' +
        "</div></div>";
    }
    $("sessions").innerHTML = html;
    // restore any running watch displays
    for (var k in watches) {
      if (watches.hasOwnProperty(k)) {
        var wch = watches[k];
        var el = document.querySelector('[data-watch-display="' + k + '"]');
        if (el) el.textContent = fmtTime(wch.elapsed);
        var btn = document.querySelector('[data-action="watch-start"][data-w="' + wch.w + '"][data-s="' + wch.s + '"]');
        if (btn) btn.textContent = wch.running ? "Pause" : "Start";
      }
    }
    $("weekCount").innerHTML = "WEEK " + pad2(wk.num) + " TASKS COMPLETE: <b>" + done + "/" + total + "</b>";
  }

  function renderNumbers() {
    $("numPushups").value = state.numbers.pushups || "";
    $("numPlank").value = state.numbers.plank || "";
    $("numRow").value = state.numbers.row || "";
  }

  function renderReadiness() {
    var list = $("readinessList");
    var arr = state.numbers.readiness;
    if (!arr.length) {
      list.innerHTML = '<p class="fineprint">No entries yet. Log your first day above.</p>';
      return;
    }
    var html = "";
    for (var i = 0; i < arr.length; i++) {
      var e = arr[i];
      html += '<div class="logentry"><button class="del" data-action="del-readiness" data-i="' + i + '" title="Delete">&#10005;</button>' +
        '<div class="meta">' + esc(e.date) + " · sleep " + esc(e.sleep) + "h · soreness " + esc(e.sore) +
        "/5 · energy " + esc(e.energy) + "/5</div>" +
        (e.notes ? "<div>" + esc(e.notes) + "</div>" : "") + "</div>";
    }
    list.innerHTML = html;
  }

  function renderCloudBadge() {
    var el = $("cloudStatus");
    if (currentUser && cloudOn) {
      el.textContent = "CLOUD: ON";
      el.className = "on";
    } else if (currentUser) {
      el.textContent = "CLOUD: SYNCING…";
      el.className = "";
    } else {
      el.textContent = "CLOUD: OFF";
      el.className = "";
    }
  }

  function renderGuestNotice() {
    var el = $("guestNotice");
    if (!currentUser && keyConfigured()) {
      el.innerHTML = '<div class="notice">Training as a guest — your checkmarks stay on this device only. ' +
        "Log in below to save them to the cloud.</div>";
    } else {
      el.innerHTML = "";
    }
  }

  function renderAccount() {
    var setup = $("setupNotice");
    if (!keyConfigured()) {
      setup.innerHTML = '<div class="notice"><b>Cloud login is not set up yet.</b><br>' +
        "1) Run <b>supabase.sql</b> in your Supabase dashboard SQL editor.<br>" +
        "2) Confirm email auth is enabled in Supabase Auth settings.<br>" +
        "3) Paste your Supabase <b>anon</b> key into <b>config.js</b>.<br>" +
        "4) Deploy this repo to Vercel or Netlify as a static site.</div>";
      $("authForm").style.display = "none";
    } else {
      setup.innerHTML = "";
      $("authForm").style.display = "";
    }
    var status = $("authStatus");
    if (currentUser) {
      status.innerHTML = "Logged in as <b>" + esc(currentUser.email) + "</b>. Your checkmarks save to the cloud.";
      $("authForm").style.display = "none";
      $("logoutWrap").style.display = "";
    } else {
      status.textContent = "Not logged in.";
      if (keyConfigured()) $("authForm").style.display = "";
      $("logoutWrap").style.display = "none";
    }
    $("authMsg").textContent = "";
  }

  function renderAll() {
    renderTabs();
    renderWeekRail();
    renderSessions();
    renderNumbers();
    renderReadiness();
    renderCloudBadge();
    renderGuestNotice();
    renderAccount();
  }

  /* ---------------- actions ---------------- */
  function doCalc() {
    var p = parseInt(($("calcPushups").value || "").replace(/\D/g, ""), 10);
    var pl = parseTime($("calcPlank").value);
    var r = parseTime($("calcRow").value);
    var sp = isNaN(p) ? 0 : interp(PUSH_PTS, Math.min(p, 60));
    var spl = pl == null ? 0 : interp(PLANK_PTS, Math.min(pl, 300));
    var sr = r == null ? 0 : interp(ROW_PTS, r);
    $("scoreGrid").style.display = "";
    $("totalBar").style.display = "";
    $("ptsPush").textContent = sp;
    $("ptsPlank").textContent = spl;
    $("ptsRow").textContent = sr;
    $("inpPush").textContent = isNaN(p) ? "—" : p + " reps";
    $("inpPlank").textContent = pl == null ? "—" : $("calcPlank").value.trim();
    $("inpRow").textContent = r == null ? "—" : $("calcRow").value.trim();
    $("ptsTotal").textContent = sp + spl + sr;
  }

  function authMessage(msg, isErr) {
    var el = $("authMsg");
    el.textContent = msg;
    el.style.color = isErr ? "var(--red)" : "var(--green)";
  }

  document.addEventListener("click", function (ev) {
    var el = ev.target.closest("[data-action]");
    if (!el) return;
    var action = el.getAttribute("data-action");

    if (action === "tab") {
      activeTab = el.getAttribute("data-tab");
      renderTabs();
    } else if (action === "week") {
      state.settings.week = parseInt(el.getAttribute("data-week"), 10);
      scheduleSave();
      renderWeekRail();
      renderSessions();
    } else if (action === "toggle-check") {
      var id = el.getAttribute("data-id");
      state.checks[id] = !state.checks[id];
      if (!state.checks[id]) delete state.checks[id];
      scheduleSave();
      renderSessions();
    } else if (action === "watch-start") {
      var wch = watchFor(el.getAttribute("data-w"), el.getAttribute("data-s"));
      if (wch.running) {
        wch.running = false;
        if (wch.timer) clearInterval(wch.timer);
        wch.timer = null;
        el.textContent = "Start";
      } else {
        wch.running = true;
        wch.last = Date.now();
        wch.timer = setInterval(watchTick(wch), 100);
        el.textContent = "Pause";
      }
    } else if (action === "watch-reset") {
      var w2 = watchFor(el.getAttribute("data-w"), el.getAttribute("data-s"));
      w2.running = false;
      if (w2.timer) clearInterval(w2.timer);
      w2.timer = null;
      w2.elapsed = 0;
      var d = document.querySelector('[data-watch-display="' + w2.w + ":" + w2.s + '"]');
      if (d) d.textContent = fmtTime(0);
      var b = document.querySelector('[data-action="watch-start"][data-w="' + w2.w + '"][data-s="' + w2.s + '"]');
      if (b) b.textContent = "Start";
    } else if (action === "calc") {
      doCalc();
    } else if (action === "save-numbers") {
      state.numbers.pushups = $("numPushups").value.trim();
      state.numbers.plank = $("numPlank").value.trim();
      state.numbers.row = $("numRow").value.trim();
      scheduleSave();
      $("numbersSaved").textContent = "Saved.";
      setTimeout(function () { $("numbersSaved").textContent = ""; }, 2000);
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
    } else if (action === "signup" || action === "login") {
      if (!supabaseClient) { authMessage("Cloud login is not configured yet.", true); return; }
      var email = $("authEmail").value.trim();
      var pass = $("authPass").value;
      if (!email || !pass) { authMessage("Enter an email and password first.", true); return; }
      authMessage("Working…", false);
      var promise = action === "signup"
        ? supabaseClient.auth.signUp({ email: email, password: pass })
        : supabaseClient.auth.signInWithPassword({ email: email, password: pass });
      promise.then(function (res) {
        if (res.error) { authMessage(res.error.message, true); return; }
        if (action === "signup" && res.data && !res.data.session) {
          authMessage("Account created. Check your email to confirm, then log in.", false);
          return;
        }
        authMessage("Welcome aboard.", false);
      });
    } else if (action === "logout") {
      if (supabaseClient) supabaseClient.auth.signOut();
    }
  });

  /* ---------------- boot ---------------- */
  if ($("logDate")) $("logDate").value = new Date().toISOString().slice(0, 10);
  initCloud();
  renderAll();
})();
