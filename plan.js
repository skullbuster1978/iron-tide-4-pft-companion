/* IRON TIDE 4 — 12-week training plan data.
 * Base session data + Concept2 2K interval matrix + video links.
 * Rendering rules (Monday push+plank merge, matrix replacement, personalization)
 * live in app.js, mirroring the original app.
 */
(function () {
  "use strict";

  var X3_PUSH = "Chest press · Overhead press · Front/split squat · Triceps press";
  var X3_PULL = "Deadlift · Bent row · Calf raise · Biceps curl";

  var X3_VIDEOS = {
    push: [
      { title: "Chest Press", url: "https://www.youtube.com/watch?v=wzyWHYqidBY", channel: "Jaquish Biomedical" },
      { title: "Overhead Press", url: "https://www.youtube.com/watch?v=mR0vniNGjOc", channel: "YouTube" },
      { title: "Split Squat", url: "https://www.youtube.com/watch?v=G3FQuH3YFlg", channel: "YouTube" },
      { title: "Tricep Press", url: "https://www.youtube.com/watch?v=rZ_PCpQ6kC4", channel: "Jaquish Biomedical" }
    ],
    pull: [
      { title: "Deadlift", url: "https://www.youtube.com/watch?v=b_NucMEQ9jU", channel: "Jaquish Biomedical" },
      { title: "Bent-Over Row", url: "https://www.youtube.com/watch?v=E4aRw8N6Kjk", channel: "Jaquish Biomedical" },
      { title: "Calf Raise", url: "https://www.youtube.com/watch?v=wktFcNKD7Wc", channel: "Red Meat and Rubber Bands" },
      { title: "Bicep Curl", url: "https://www.youtube.com/watch?v=EupY4PaIztY", channel: "Jaquish Biomedical" }
    ]
  };

  function mx(t, d, m) { return { t: t, d: d, m: m }; }
  function rowMx(work, rest) {
    return mx("Concept2 intervals", work + " work",
      rest + " very easy row between work intervals · Warm up 5–10 min");
  }
  var D4M = "Concept2 Day 4 · Hold a consistent pace · Warm up 5–10 min";

  var M_W1 = {
    d1: mx("Initial 2,000 m time trial", "2,000 m",
      "Do not start too fast · Build pace in the second half · Record your time"),
    d2: rowMx("4 × 4:00", "2:00"),
    d3: rowMx("6 × 2:00", "1:00"),
    d4: mx("Optional steady row", "5,000 m", D4M)
  };
  var M_W2 = {
    d1: rowMx("4 × 4:00", "2:00"),
    d2: rowMx("3 × 6:00", "3:00"),
    d3: rowMx("6 × 2:00", "1:00"),
    d4: mx("Optional steady row", "5,000 m", D4M)
  };
  var M_W3 = {
    d1: rowMx("5 × 4:00", "2:00"),
    d2: rowMx("3 × 6:00", "3:00"),
    d3: rowMx("8 × 2:00", "1:00"),
    d4: mx("Optional steady row", "6,000 m", D4M)
  };
  var M_W5 = {
    d1: rowMx("6 × 4:00", "2:00"),
    d2: rowMx("4 × 6:00", "3:00"),
    d3: rowMx("10 × 2:00", "1:00"),
    d4: mx("Optional steady row", "8,000 m", D4M)
  };
  var M_W7 = {
    d1: rowMx("6 × 3:00", "2:00"),
    d2: rowMx("4 × 5:00", "3:00"),
    d3: rowMx("12 × 1:00", "1:00"),
    d4: mx("Optional steady row", "10,000 m", D4M)
  };
  var M_W8 = {
    d1: rowMx("6 × 2:00", "2:00"),
    d2: rowMx("4 × 4:00", "3:00"),
    d3: mx("2,000 m test", "2,000 m",
      "Use your recorded workout paces to plan the test · Record your final time"),
    d4: mx("Optional steady row", "10,000 m", D4M)
  };
  var MATRIX = [M_W1, M_W2, M_W3, M_W3, M_W5, M_W5, M_W7, M_W8, M_W5, M_W5, M_W7, M_W8];

  var PACE_LOG = {
    t: "Pace & log", d: "Record average / 500 m",
    m: "Row 24–34 spm · Use this pace to guide future workouts"
  };

  function x3(kind, mod, meta) { return { kind: kind, mod: mod, meta: meta || "" }; }
  function pp(icon, title, push, plank, meta) {
    return { icon: icon, title: title, push: push, plank: plank, meta: meta || "" };
  }

  var WED = {
    name: "10-minute upper-body stretch",
    tasks: [
      { n: "01", icon: "ST", title: "Chest & shoulders",
        detail: "Doorway stretch · 2 × 0:30 each side", meta: "Stand tall. Keep it gentle.",
        video: "https://www.youtube.com/watch?v=B9uY01NoqBg" },
      { n: "02", icon: "ST", title: "Upper back & lats",
        detail: "Child's pose side reach · 2 × 0:30 each side", meta: "Breathe slowly. Do not bounce.",
        video: "https://www.youtube.com/watch?v=YTAwpiX2Dsg" },
      { n: "03", icon: "ST", title: "Hip flexors",
        detail: "Half-kneeling stretch · 2 × 0:30 each side", meta: "Squeeze the back glute. Keep ribs down.",
        video: "https://www.youtube.com/watch?v=bnVfloe6yTo" }
    ]
  };
  var FRI = {
    name: "10-minute lower-body stretch",
    tasks: [
      { n: "01", icon: "ST", title: "Hamstrings",
        detail: "Standing or seated stretch · 2 × 0:30 each side", meta: "Keep your back long and knee soft.",
        video: "https://www.youtube.com/watch?v=G5EcVycvaEk" },
      { n: "02", icon: "ST", title: "Glutes",
        detail: "Figure-four stretch · 2 × 0:30 each side", meta: "Use gentle pressure only.",
        video: "https://www.youtube.com/watch?v=Xb5gHdYtHnk" },
      { n: "03", icon: "ST", title: "Calves & ankles",
        detail: "Wall calf stretch · 2 × 0:30 each side", meta: "Keep your heel down. Switch sides.",
        video: "https://www.youtube.com/watch?v=mafo7o7OnFo" }
    ]
  };

  var TEST_PP = [
    { n: "01", icon: "PU", title: "Push-ups", detail: "Target 39", meta: "13 reps each 20-second block" },
    { n: "02", icon: "PL", title: "Plank", detail: "Target 3:01", meta: "Breathe and hold one straight line" },
    { n: "03", icon: "2K", title: "Optional steady row", detail: "10,000 m", meta: D4M }
  ];

  var WEEKS = [
    { num: 1, phase: "FOUNDATION", load: "BUILD",
      goal: "Learn the movements. Do not chase speed yet.",
      mon: { name: "Concept2 Day 1 · Push-ups, plank & X3 Push",
        x3: x3("push", "light", "15–25 slow reps · no partials"),
        pushSets: "5 easy sets", plank: "4 × 0:30", plankMeta: "" },
      tue: { name: "Concept2 Day 2 · Row intervals & X3 Pull",
        x3: x3("pull", "light", "15–25 slow reps") },
      thu: { name: "Concept2 Day 3 · Row, push-ups, plank & X3 Push",
        x3: x3("push", "light", "No partials"),
        pp: pp("PU", "Push-ups + plank", "6 × 0:15 push-ups", "3 × 0:45 plank", "Smooth reps") },
      sat: { name: "Concept2 optional Day 4 · Easy row, plank & X3 Pull",
        x3: x3("pull", "light", "15–25 slow reps"),
        plank: { icon: "PL", title: "Plank hold", detail: "1 × 1:00", meta: "Finish with clean form" } } },

    { num: 2, phase: "FOUNDATION", load: "BUILD",
      goal: "Add a little more time and work.",
      mon: { name: "Concept2 Day 1 · Push-ups, plank & X3 Push",
        x3: x3("push", "light", "No partials"),
        pushSets: "6 easy sets", plank: "4 × 0:40", plankMeta: "" },
      tue: { name: "Concept2 Day 2 · Row intervals & X3 Pull",
        x3: x3("pull", "light", "") },
      thu: { name: "Concept2 Day 3 · Row, push-ups, plank & X3 Push",
        x3: x3("push", "light", ""),
        pp: pp("PU", "Push-ups + plank", "5 × 0:20 push-ups", "3 × 0:55 plank", "") },
      sat: { name: "Concept2 optional Day 4 · Easy row, plank & X3 Pull",
        x3: x3("pull", "light", ""),
        plank: { icon: "PL", title: "Plank hold", detail: "1 × 1:15", meta: "" } } },

    { num: 3, phase: "BUILD I", load: "BUILD",
      goal: "Build repeatable speed.",
      mon: { name: "Concept2 Day 1 · Push-ups, plank & X3 Push",
        x3: x3("push", "normal", "15–40 full reps, then safe partials"),
        pushSets: "8 easy sets", plank: "4 × 0:45", plankMeta: "" },
      tue: { name: "Concept2 Day 2 · Row repeats & X3 Pull",
        x3: x3("pull", "normal", "") },
      thu: { name: "Concept2 Day 3 · Row, push-ups, plank & X3 Push",
        x3: x3("push", "normal", ""),
        pp: pp("PU", "Push-ups + plank", "3 × 0:30 push-ups", "3 × 1:00 plank", "") },
      sat: { name: "Concept2 optional Day 4 · Easy row, plank & X3 Pull",
        x3: x3("pull", "normal", ""),
        plank: { icon: "PL", title: "Plank hold", detail: "1 × 1:30", meta: "" } } },

    { num: 4, phase: "CHECK-IN", load: "LIGHT",
      goal: "Finish Cycle 1 with repeatable Concept2 pace.",
      mon: { name: "Concept2 Day 1 · Push-ups, plank & light X3",
        x3: x3("push", "light", "No partials"),
        pushSets: "4 easy sets", plank: "3 × 0:30", plankMeta: "" },
      tue: { name: "Concept2 Day 2 · Row repeats & light X3",
        x3: x3("pull", "light", "") },
      thu: { name: "Concept2 Day 3 · Prime the system",
        x3: x3("push", "light", ""),
        pp: pp("PU", "Easy push-ups + plank", "2 × 0:15 push-ups", "2 × 0:45 plank", "") },
      sat: { name: "Concept2 optional Day 4 · Muscular check-in", checkin: true } },

    { num: 5, phase: "BUILD II", load: "BUILD",
      goal: "Start the second training block.",
      mon: { name: "Concept2 Day 1 · Push-ups, plank & X3 Push",
        x3: x3("push", "normal", ""),
        pushSets: "6 medium sets", plank: "3 × 1:00", plankMeta: "" },
      tue: { name: "Concept2 Day 2 · Row repeats & X3 Pull",
        x3: x3("pull", "normal", "") },
      thu: { name: "Concept2 Day 3 · Row, push-ups, plank & X3 Push",
        x3: x3("push", "normal", ""),
        pp: pp("PU", "Push-ups + plank", "4 × 0:30 push-ups", "2 × 1:15 plank", "") },
      sat: { name: "Concept2 optional Day 4 · Easy row, plank & X3 Pull",
        x3: x3("pull", "normal", ""),
        plank: { icon: "PL", title: "Plank hold", detail: "1 × 1:45", meta: "" } } },

    { num: 6, phase: "BUILD II", load: "BUILD",
      goal: "Build endurance and short speed.",
      mon: { name: "Concept2 Day 1 · Push-ups, plank & X3 Push",
        x3: x3("push", "normal", ""),
        pushSets: "8 medium sets", plank: "3 × 1:10", plankMeta: "" },
      tue: { name: "Concept2 Day 2 · Row repeats & X3 Pull",
        x3: x3("pull", "normal", "") },
      thu: { name: "Concept2 Day 3 · Short speed, push-ups & plank",
        x3: x3("push", "normal", ""),
        pp: pp("PU", "Push-ups + plank", "2 × 0:45 push-ups", "2 × 1:30 plank", "") },
      sat: { name: "Concept2 optional Day 4 · Easy row, plank & X3 Pull",
        x3: x3("pull", "normal", ""),
        plank: { icon: "PL", title: "Plank hold", detail: "1 × 2:00", meta: "" } } },

    { num: 7, phase: "BUILD II", load: "BUILD",
      goal: "Learn to hold your pace when tired.",
      mon: { name: "Concept2 Day 1 · Push-ups, plank & X3 Push",
        x3: x3("push", "normal", ""),
        pushSets: "10 easy sets", plank: "3 × 1:15", plankMeta: "" },
      tue: { name: "Concept2 Day 2 · Long row repeats & X3 Pull",
        x3: x3("pull", "normal", "") },
      thu: { name: "Concept2 Day 3 · Pace under fatigue",
        x3: x3("push", "normal", ""),
        pp: pp("PU", "Push-ups + plank", "1 controlled 1:00 set", "2 × 1:45 plank", "") },
      sat: { name: "Concept2 optional Day 4 · Easy row, plank & X3 Pull",
        x3: x3("pull", "normal", ""),
        plank: { icon: "PL", title: "Plank hold", detail: "1 × 2:15", meta: "" } } },

    { num: 8, phase: "CHECK-IN", load: "LIGHT",
      goal: "Light week. Check your full PFT score again.",
      mon: { name: "Concept2 Day 1 · Push-ups, plank & light X3",
        x3: x3("push", "light", "No partials"),
        pushSets: "4 easy sets", plank: "2 × 0:45", plankMeta: "" },
      tue: { name: "Concept2 Day 2 · Row repeats & light X3",
        x3: x3("pull", "light", "") },
      thu: { name: "Concept2 Day 3 · Prime the system",
        x3: x3("push", "light", ""),
        pp: pp("PU", "Easy push-ups + plank", "2 × 0:15 push-ups", "1 × 1:00 plank", "") },
      sat: { name: "Concept2 optional Day 4 · Muscular check-in", checkin: true } },

    { num: 9, phase: "SPECIFIC", load: "PEAK",
      goal: "Start using the 7:50 goal pace.",
      mon: { name: "Concept2 Day 1 · Push-ups, plank & X3 Push",
        x3: x3("push", "normal", ""),
        pushSets: "6 strong sets", plank: "2 × 1:30", plankMeta: "" },
      tue: { name: "Concept2 Day 2 · Goal-pace row & X3 Pull",
        x3: x3("pull", "normal", "") },
      thu: { name: "Concept2 Day 3 · Short speed & test strength",
        x3: x3("push", "normal", ""),
        pp: pp("PU", "Push-ups + plank", "3 × 0:30 push-ups", "1 × 2:30 plank", "") },
      sat: { name: "Concept2 optional Day 4 · Easy row, plank & X3 Pull",
        x3: x3("pull", "normal", ""),
        plank: { icon: "PL", title: "Plank hold", detail: "2 × 1:00", meta: "" } } },

    { num: 10, phase: "SPECIFIC", load: "PEAK",
      goal: "Make goal pace feel normal.",
      mon: { name: "Concept2 Day 1 · Push-ups, plank & X3 Push",
        x3: x3("push", "normal", ""),
        pushSets: "8 medium sets", plank: "2 × 1:45", plankMeta: "" },
      tue: { name: "Concept2 Day 2 · Goal-pace row & X3 Pull",
        x3: x3("pull", "normal", "") },
      thu: { name: "Concept2 Day 3 · Goal pace under time",
        x3: x3("push", "normal", ""),
        pp: pp("PU", "Push-ups + plank", "1 controlled 1:00 set", "1 × 2:45 plank", "") },
      sat: { name: "Concept2 optional Day 4 · Easy row, plank & X3 Pull",
        x3: x3("pull", "normal", ""),
        plank: { icon: "PL", title: "Plank hold", detail: "2 × 1:00", meta: "" } } },

    { num: 11, phase: "SHARPEN", load: "TAPER",
      goal: "Get sharp. Do less X3 so your body can recover.",
      mon: { name: "Concept2 Day 1 · Push-ups, plank & reduced X3",
        x3: x3("push", "70%", "No forced partials"),
        pushSets: "5 easy sets", plank: "1 × 2:40", plankMeta: "Do not go to failure" },
      tue: { name: "Concept2 Day 2 · Sharp row & reduced X3",
        x3: x3("pull", "70%", "") },
      thu: { name: "Concept2 Day 3 · Race-pace ladder",
        x3: null,
        rx: { t: "No X3 today", d: "Begin the recovery window" },
        pp: pp("PU", "Easy push-ups + plank", "2 × 0:20 push-ups", "2 × 1:00 plank", "") },
      sat: { name: "Concept2 optional Day 4 · Easy row & recovery",
        x3: null,
        rx: { t: "Rest", d: "Do not add extra hard work" },
        plank: { icon: "PL", title: "Easy plank", detail: "1 × 0:45", meta: "" } } },

    { num: 12, phase: "TEST WEEK", load: "TAPER",
      goal: "Finish with the Concept2 2,000 m test and muscular events.",
      mon: { name: "Concept2 Day 1 · Very easy strength",
        x3: x3("push", "half volume", "No partials"),
        pushSets: "3 easy sets", plank: "2 × 0:45", plankMeta: "" },
      tue: { name: "Concept2 Day 2 · Last row tune-up & X3",
        x3: x3("pull", "half volume", "No partials") },
      thu: { name: "Concept2 Day 3 · Stay loose, finish fresh",
        x3: null,
        rx: { t: "Stop fresh", d: "No extra work" },
        pp: pp("PU", "Easy push-ups + plank", "2 × 10 push-ups", "1 × 0:30 plank", "") },
      sat: { name: "Concept2 optional Day 4 · Push-ups & plank", testPP: true } }
  ];

  window.IRON_TIDE_PLAN = {
    weeks: WEEKS,
    matrix: MATRIX,
    wed: WED,
    fri: FRI,
    paceLog: PACE_LOG,
    testPP: TEST_PP,
    x3push: X3_PUSH,
    x3pull: X3_PULL,
    x3videos: X3_VIDEOS,
    d4meta: D4M,
    planUrl: "https://www.concept2.com/training/plans/2k-erg-test-12-week"
  };
})();

window.IRON_TIDE_TABLES = {"female":{"17-19":{"45":{"pushups":15,"plank":"1:01","row":"10:40"},"50":{"pushups":18,"plank":"1:11","row":"10:30"},"55":{"pushups":19,"plank":"1:22","row":"10:20"},"60":{"pushups":21,"plank":"1:32","row":"10:10"},"65":{"pushups":23,"plank":"1:52","row":"9:40"},"70":{"pushups":24,"plank":"2:13","row":"9:10"},"75":{"pushups":27,"plank":"2:33","row":"8:50"},"80":{"pushups":28,"plank":"2:43","row":"8:40"},"85":{"pushups":33,"plank":"2:53","row":"8:30"},"90":{"pushups":37,"plank":"3:04","row":"8:20"},"95":{"pushups":42,"plank":"3:09","row":"8:10"},"100":{"pushups":47,"plank":"3:14","row":"8:00"}},"20-24":{"45":{"pushups":15,"plank":"1:00","row":"10:45"},"50":{"pushups":18,"plank":"1:10","row":"10:35"},"55":{"pushups":19,"plank":"1:20","row":"10:25"},"60":{"pushups":21,"plank":"1:30","row":"10:15"},"65":{"pushups":23,"plank":"1:50","row":"9:45"},"70":{"pushups":24,"plank":"2:10","row":"9:15"},"75":{"pushups":27,"plank":"2:30","row":"8:55"},"80":{"pushups":28,"plank":"2:40","row":"8:45"},"85":{"pushups":33,"plank":"2:50","row":"8:35"},"90":{"pushups":37,"plank":"3:00","row":"8:25"},"95":{"pushups":42,"plank":"3:05","row":"8:15"},"100":{"pushups":47,"plank":"3:10","row":"8:05"}},"25-29":{"45":{"pushups":14,"plank":"0:59","row":"10:50"},"50":{"pushups":17,"plank":"1:09","row":"10:40"},"55":{"pushups":19,"plank":"1:18","row":"10:30"},"60":{"pushups":21,"plank":"1:28","row":"10:20"},"65":{"pushups":23,"plank":"1:48","row":"9:50"},"70":{"pushups":24,"plank":"2:07","row":"9:20"},"75":{"pushups":27,"plank":"2:27","row":"9:00"},"80":{"pushups":28,"plank":"2:37","row":"8:50"},"85":{"pushups":33,"plank":"2:47","row":"8:40"},"90":{"pushups":37,"plank":"2:56","row":"8:30"},"95":{"pushups":42,"plank":"3:01","row":"8:20"},"100":{"pushups":47,"plank":"3:06","row":"8:10"}},"30-34":{"45":{"pushups":11,"plank":"0:58","row":"10:55"},"50":{"pushups":13,"plank":"1:07","row":"10:45"},"55":{"pushups":14,"plank":"1:17","row":"10:35"},"60":{"pushups":15,"plank":"1:26","row":"10:25"},"65":{"pushups":16,"plank":"1:46","row":"9:55"},"70":{"pushups":18,"plank":"2:05","row":"9:25"},"75":{"pushups":19,"plank":"2:24","row":"9:05"},"80":{"pushups":23,"plank":"2:34","row":"8:55"},"85":{"pushups":26,"plank":"2:43","row":"8:45"},"90":{"pushups":33,"plank":"2:53","row":"8:35"},"95":{"pushups":40,"plank":"2:58","row":"8:25"},"100":{"pushups":46,"plank":"3:02","row":"8:15"}},"35-39":{"45":{"pushups":10,"plank":"0:56","row":"11:00"},"50":{"pushups":12,"plank":"1:06","row":"10:50"},"55":{"pushups":13,"plank":"1:15","row":"10:40"},"60":{"pushups":14,"plank":"1:25","row":"10:30"},"65":{"pushups":15,"plank":"1:44","row":"10:00"},"70":{"pushups":17,"plank":"2:02","row":"9:30"},"75":{"pushups":18,"plank":"2:21","row":"9:10"},"80":{"pushups":22,"plank":"2:31","row":"9:00"},"85":{"pushups":25,"plank":"2:40","row":"8:50"},"90":{"pushups":32,"plank":"2:49","row":"8:40"},"95":{"pushups":39,"plank":"2:54","row":"8:30"},"100":{"pushups":42,"plank":"2:59","row":"8:20"}},"40-44":{"45":{"pushups":8,"plank":"0:55","row":"11:05"},"50":{"pushups":11,"plank":"1:05","row":"10:55"},"55":{"pushups":12,"plank":"1:14","row":"10:45"},"60":{"pushups":13,"plank":"1:23","row":"10:35"},"65":{"pushups":14,"plank":"1:41","row":"10:05"},"70":{"pushups":15,"plank":"2:00","row":"9:35"},"75":{"pushups":16,"plank":"2:18","row":"9:15"},"80":{"pushups":18,"plank":"2:28","row":"9:05"},"85":{"pushups":23,"plank":"2:37","row":"8:55"},"90":{"pushups":29,"plank":"2:46","row":"8:45"},"95":{"pushups":33,"plank":"2:51","row":"8:35"},"100":{"pushups":38,"plank":"2:55","row":"8:25"}},"45-49":{"45":{"pushups":7,"plank":"0:54","row":"11:10"},"50":{"pushups":10,"plank":"1:03","row":"11:00"},"55":{"pushups":11,"plank":"1:12","row":"10:50"},"60":{"pushups":12,"plank":"1:21","row":"10:40"},"65":{"pushups":13,"plank":"1:39","row":"10:10"},"70":{"pushups":14,"plank":"1:58","row":"9:40"},"75":{"pushups":15,"plank":"2:16","row":"9:20"},"80":{"pushups":17,"plank":"2:25","row":"9:10"},"85":{"pushups":22,"plank":"2:34","row":"9:00"},"90":{"pushups":27,"plank":"2:43","row":"8:50"},"95":{"pushups":32,"plank":"2:47","row":"8:40"},"100":{"pushups":37,"plank":"2:52","row":"8:30"}},"50-54":{"45":{"pushups":6,"plank":"0:53","row":"11:15"},"50":{"pushups":9,"plank":"1:02","row":"11:05"},"55":{"pushups":10,"plank":"1:11","row":"10:55"},"60":{"pushups":11,"plank":"1:20","row":"10:45"},"65":{"pushups":12,"plank":"1:37","row":"10:15"},"70":{"pushups":13,"plank":"1:55","row":"9:45"},"75":{"pushups":14,"plank":"2:13","row":"9:25"},"80":{"pushups":15,"plank":"2:22","row":"9:15"},"85":{"pushups":20,"plank":"2:31","row":"9:05"},"90":{"pushups":25,"plank":"2:39","row":"8:55"},"95":{"pushups":30,"plank":"2:44","row":"8:45"},"100":{"pushups":35,"plank":"2:48","row":"8:35"}},"55-59":{"45":{"pushups":5,"plank":"0:52","row":"11:20"},"50":{"pushups":8,"plank":"1:01","row":"11:10"},"55":{"pushups":9,"plank":"1:09","row":"11:00"},"60":{"pushups":10,"plank":"1:18","row":"10:50"},"65":{"pushups":11,"plank":"1:35","row":"10:20"},"70":{"pushups":12,"plank":"1:53","row":"9:50"},"75":{"pushups":13,"plank":"2:10","row":"9:30"},"80":{"pushups":14,"plank":"2:19","row":"9:20"},"85":{"pushups":19,"plank":"2:28","row":"9:10"},"90":{"pushups":22,"plank":"2:36","row":"9:00"},"95":{"pushups":24,"plank":"2:41","row":"8:50"},"100":{"pushups":28,"plank":"2:45","row":"8:40"}},"60-64":{"45":{"pushups":4,"plank":"0:51","row":"11:25"},"50":{"pushups":7,"plank":"1:00","row":"11:15"},"55":{"pushups":8,"plank":"1:08","row":"11:05"},"60":{"pushups":10,"plank":"1:17","row":"10:55"},"65":{"pushups":11,"plank":"1:34","row":"10:25"},"70":{"pushups":12,"plank":"1:51","row":"9:55"},"75":{"pushups":13,"plank":"2:08","row":"9:35"},"80":{"pushups":14,"plank":"2:16","row":"9:25"},"85":{"pushups":15,"plank":"2:25","row":"9:15"},"90":{"pushups":17,"plank":"2:33","row":"9:05"},"95":{"pushups":19,"plank":"2:37","row":"8:55"},"100":{"pushups":21,"plank":"2:42","row":"8:45"}},"65+":{"45":{"pushups":4,"plank":"0:50","row":"11:30"},"50":{"pushups":7,"plank":"0:58","row":"11:20"},"55":{"pushups":8,"plank":"1:07","row":"11:10"},"60":{"pushups":10,"plank":"1:15","row":"11:00"},"65":{"pushups":11,"plank":"1:32","row":"10:30"},"70":{"pushups":12,"plank":"1:48","row":"10:00"},"75":{"pushups":13,"plank":"2:05","row":"9:40"},"80":{"pushups":14,"plank":"2:13","row":"9:30"},"85":{"pushups":15,"plank":"2:22","row":"9:20"},"90":{"pushups":17,"plank":"2:30","row":"9:10"},"95":{"pushups":19,"plank":"2:34","row":"9:00"},"100":{"pushups":21,"plank":"2:38","row":"8:50"}}},"male":{"17-19":{"45":{"pushups":30,"plank":"1:11","row":"9:20"},"50":{"pushups":33,"plank":"1:22","row":"9:10"},"55":{"pushups":35,"plank":"1:32","row":"9:00"},"60":{"pushups":37,"plank":"1:42","row":"8:50"},"65":{"pushups":39,"plank":"2:02","row":"8:30"},"70":{"pushups":41,"plank":"2:23","row":"8:10"},"75":{"pushups":44,"plank":"2:43","row":"7:50"},"80":{"pushups":47,"plank":"2:53","row":"7:40"},"85":{"pushups":52,"plank":"3:04","row":"7:30"},"90":{"pushups":57,"plank":"3:14","row":"7:20"},"95":{"pushups":62,"plank":"3:19","row":"7:10"},"100":{"pushups":67,"plank":"3:24","row":"7:00"}},"20-24":{"45":{"pushups":30,"plank":"1:10","row":"9:25"},"50":{"pushups":33,"plank":"1:20","row":"9:15"},"55":{"pushups":35,"plank":"1:30","row":"9:05"},"60":{"pushups":37,"plank":"1:40","row":"8:55"},"65":{"pushups":39,"plank":"2:00","row":"8:35"},"70":{"pushups":41,"plank":"2:20","row":"8:15"},"75":{"pushups":44,"plank":"2:40","row":"7:55"},"80":{"pushups":47,"plank":"2:50","row":"7:45"},"85":{"pushups":52,"plank":"3:00","row":"7:35"},"90":{"pushups":57,"plank":"3:10","row":"7:25"},"95":{"pushups":62,"plank":"3:15","row":"7:15"},"100":{"pushups":67,"plank":"3:20","row":"7:05"}},"25-29":{"45":{"pushups":27,"plank":"1:09","row":"9:30"},"50":{"pushups":30,"plank":"1:18","row":"9:20"},"55":{"pushups":32,"plank":"1:28","row":"9:10"},"60":{"pushups":34,"plank":"1:38","row":"9:00"},"65":{"pushups":36,"plank":"1:58","row":"8:40"},"70":{"pushups":38,"plank":"2:17","row":"8:20"},"75":{"pushups":41,"plank":"2:37","row":"8:00"},"80":{"pushups":44,"plank":"2:47","row":"7:50"},"85":{"pushups":48,"plank":"2:56","row":"7:40"},"90":{"pushups":54,"plank":"3:06","row":"7:30"},"95":{"pushups":59,"plank":"3:11","row":"7:20"},"100":{"pushups":62,"plank":"3:16","row":"7:10"}},"30-34":{"45":{"pushups":24,"plank":"1:07","row":"9:35"},"50":{"pushups":27,"plank":"1:17","row":"9:25"},"55":{"pushups":29,"plank":"1:26","row":"9:15"},"60":{"pushups":30,"plank":"1:36","row":"9:05"},"65":{"pushups":31,"plank":"1:55","row":"8:45"},"70":{"pushups":34,"plank":"2:14","row":"8:25"},"75":{"pushups":36,"plank":"2:34","row":"8:05"},"80":{"pushups":39,"plank":"2:43","row":"7:55"},"85":{"pushups":41,"plank":"2:53","row":"7:45"},"90":{"pushups":46,"plank":"3:02","row":"7:35"},"95":{"pushups":52,"plank":"3:07","row":"7:25"},"100":{"pushups":57,"plank":"3:12","row":"7:15"}},"35-39":{"45":{"pushups":21,"plank":"1:06","row":"9:40"},"50":{"pushups":24,"plank":"1:15","row":"9:30"},"55":{"pushups":26,"plank":"1:25","row":"9:20"},"60":{"pushups":27,"plank":"1:34","row":"9:10"},"65":{"pushups":28,"plank":"1:53","row":"8:50"},"70":{"pushups":31,"plank":"2:12","row":"8:30"},"75":{"pushups":33,"plank":"2:31","row":"8:10"},"80":{"pushups":36,"plank":"2:40","row":"8:00"},"85":{"pushups":38,"plank":"2:49","row":"7:50"},"90":{"pushups":43,"plank":"2:59","row":"7:40"},"95":{"pushups":49,"plank":"3:04","row":"7:30"},"100":{"pushups":51,"plank":"3:08","row":"7:20"}},"40-44":{"45":{"pushups":18,"plank":"1:05","row":"9:45"},"50":{"pushups":21,"plank":"1:14","row":"9:35"},"55":{"pushups":22,"plank":"1:23","row":"9:25"},"60":{"pushups":24,"plank":"1:32","row":"9:15"},"65":{"pushups":25,"plank":"1:51","row":"8:55"},"70":{"pushups":26,"plank":"2:09","row":"8:35"},"75":{"pushups":29,"plank":"2:28","row":"8:15"},"80":{"pushups":30,"plank":"2:37","row":"8:05"},"85":{"pushups":34,"plank":"2:46","row":"7:55"},"90":{"pushups":36,"plank":"2:55","row":"7:45"},"95":{"pushups":40,"plank":"3:00","row":"7:35"},"100":{"pushups":44,"plank":"3:04","row":"7:25"}},"45-49":{"45":{"pushups":15,"plank":"1:03","row":"9:50"},"50":{"pushups":18,"plank":"1:12","row":"9:40"},"55":{"pushups":20,"plank":"1:21","row":"9:30"},"60":{"pushups":22,"plank":"1:30","row":"9:20"},"65":{"pushups":24,"plank":"1:48","row":"9:00"},"70":{"pushups":25,"plank":"2:07","row":"8:40"},"75":{"pushups":28,"plank":"2:25","row":"8:20"},"80":{"pushups":29,"plank":"2:34","row":"8:10"},"85":{"pushups":33,"plank":"2:43","row":"8:00"},"90":{"pushups":35,"plank":"2:52","row":"7:50"},"95":{"pushups":39,"plank":"2:56","row":"7:40"},"100":{"pushups":44,"plank":"3:01","row":"7:30"}},"50-54":{"45":{"pushups":12,"plank":"1:02","row":"9:55"},"50":{"pushups":15,"plank":"1:11","row":"9:45"},"55":{"pushups":17,"plank":"1:20","row":"9:35"},"60":{"pushups":19,"plank":"1:29","row":"9:25"},"65":{"pushups":21,"plank":"1:46","row":"9:05"},"70":{"pushups":22,"plank":"2:04","row":"8:45"},"75":{"pushups":23,"plank":"2:22","row":"8:25"},"80":{"pushups":24,"plank":"2:31","row":"8:15"},"85":{"pushups":26,"plank":"2:39","row":"8:05"},"90":{"pushups":29,"plank":"2:48","row":"7:55"},"95":{"pushups":33,"plank":"2:53","row":"7:45"},"100":{"pushups":36,"plank":"2:57","row":"7:35"}},"55-59":{"45":{"pushups":12,"plank":"1:01","row":"10:00"},"50":{"pushups":15,"plank":"1:09","row":"9:50"},"55":{"pushups":16,"plank":"1:18","row":"9:40"},"60":{"pushups":18,"plank":"1:27","row":"9:30"},"65":{"pushups":20,"plank":"1:44","row":"9:10"},"70":{"pushups":21,"plank":"2:02","row":"8:50"},"75":{"pushups":22,"plank":"2:19","row":"8:30"},"80":{"pushups":23,"plank":"2:28","row":"8:20"},"85":{"pushups":25,"plank":"2:36","row":"8:10"},"90":{"pushups":28,"plank":"2:45","row":"8:00"},"95":{"pushups":30,"plank":"2:49","row":"7:50"},"100":{"pushups":33,"plank":"2:54","row":"7:40"}},"60-64":{"45":{"pushups":11,"plank":"1:00","row":"10:05"},"50":{"pushups":14,"plank":"1:08","row":"9:55"},"55":{"pushups":16,"plank":"1:17","row":"9:45"},"60":{"pushups":18,"plank":"1:25","row":"9:35"},"65":{"pushups":20,"plank":"1:42","row":"9:15"},"70":{"pushups":21,"plank":"1:59","row":"8:55"},"75":{"pushups":22,"plank":"2:16","row":"8:35"},"80":{"pushups":23,"plank":"2:25","row":"8:25"},"85":{"pushups":24,"plank":"2:33","row":"8:15"},"90":{"pushups":26,"plank":"2:42","row":"8:05"},"95":{"pushups":28,"plank":"2:46","row":"7:55"},"100":{"pushups":30,"plank":"2:50","row":"7:45"}},"65+":{"45":{"pushups":11,"plank":"0:58","row":"10:10"},"50":{"pushups":14,"plank":"1:07","row":"10:00"},"55":{"pushups":16,"plank":"1:15","row":"9:50"},"60":{"pushups":18,"plank":"1:23","row":"9:40"},"65":{"pushups":20,"plank":"1:40","row":"9:20"},"70":{"pushups":21,"plank":"1:57","row":"9:00"},"75":{"pushups":22,"plank":"2:13","row":"8:40"},"80":{"pushups":23,"plank":"2:22","row":"8:30"},"85":{"pushups":24,"plank":"2:30","row":"8:20"},"90":{"pushups":26,"plank":"2:38","row":"8:10"},"95":{"pushups":28,"plank":"2:43","row":"8:00"},"100":{"pushups":30,"plank":"2:47","row":"7:50"}}}};
