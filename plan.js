/* IRON TIDE 4 — 12-week training plan data.
 * 12 weeks x 6 sessions x 3 tasks = 216 tasks.
 * Task shape: { n: "01", icon: "...", title: "...", rx: "...", cue: "..." }
 * Week 1 Session 1 is the original verbatim.
 */
(function () {
  "use strict";

  var PHASES = [
    { name: "FOUNDATION", cue: "Learn the movements. Do not chase speed yet." },
    { name: "FOUNDATION", cue: "Learn the movements. Do not chase speed yet." },
    { name: "BUILD", cue: "Add volume. Earn your pace." },
    { name: "BUILD", cue: "Add volume. Earn your pace." },
    { name: "BUILD", cue: "Add volume. Earn your pace." },
    { name: "DRIVE", cue: "Hold form under fatigue. This is where the test is won." },
    { name: "DRIVE", cue: "Hold form under fatigue. This is where the test is won." },
    { name: "DRIVE", cue: "Hold form under fatigue. This is where the test is won." },
    { name: "PEAK", cue: "Hard efforts, full recovery. Trust the work." },
    { name: "PEAK", cue: "Hard efforts, full recovery. Trust the work." },
    { name: "TAPER", cue: "Cut the volume. Stay sharp." },
    { name: "TEST", cue: "Execute. This is what the twelve weeks were for." }
  ];

  // Rowing follows the Concept2 2K 12-week plan shape:
  // time trials, intervals (8x500 / 4x1000 / pyramids), steady distance.
  var ROW_MON = [
    { t: "Initial 2,000 m time trial", rx: "2,000 m", cue: "Do not start too fast · Build pace in the second half · Record your time" },
    { t: "8 x 500 m intervals", rx: "8 x 500 m / 2:00 rest", cue: "Even splits · Strong last rep" },
    { t: "4 x 1,000 m", rx: "4 x 1,000 m / 3:00 rest", cue: "Settle into rhythm by rep 2" },
    { t: "Pyramid 250-1,000 m", rx: "250-500-750-1,000-750-500-250 / 2:00 rest", cue: "Smooth gear changes" },
    { t: "5 x 1,500 m", rx: "5 x 1,500 m / 3:00 rest", cue: "Longer reps · Stay patient" },
    { t: "Mid-plan 2,000 m time trial", rx: "2,000 m", cue: "Race plan: controlled start, push the third 500" },
    { t: "6 x 1,000 m", rx: "6 x 1,000 m / 2:30 rest", cue: "Hold your week-6 trial pace" },
    { t: "4 x 2,000 m", rx: "4 x 2,000 m / 4:00 rest", cue: "Aerobic strength · Even pacing" },
    { t: "12 x 500 m", rx: "12 x 500 m / 1:30 rest", cue: "Short rest · Practice suffering well" },
    { t: "Final 2,000 m time trial", rx: "2,000 m", cue: "Dress rehearsal · Full race plan" },
    { t: "4 x 500 m strides", rx: "4 x 500 m / 3:00 rest", cue: "Taper · Sharp but easy" },
    { t: "Shakeout row", rx: "15 min easy", cue: "Test week · Stay loose" }
  ];

  var ROW_WED = [
    { t: "Steady 3 x 10 min", rx: "30 min easy", cue: "Technique first · Conversational pace" },
    { t: "Steady 35 min", rx: "35 min easy", cue: "Long and easy" },
    { t: "Steady 40 min", rx: "40 min easy", cue: "Aerobic base" },
    { t: "Steady 35 min", rx: "35 min easy", cue: "Recovery-week volume" },
    { t: "Steady 45 min", rx: "45 min easy", cue: "Longest steady row yet" },
    { t: "Steady 40 min", rx: "40 min easy", cue: "Shake out after the trial" },
    { t: "Steady 45 min", rx: "45 min easy", cue: "Aerobic base" },
    { t: "Steady 50 min", rx: "50 min easy", cue: "Capstone distance" },
    { t: "Steady 40 min", rx: "40 min easy", cue: "Easy after hard intervals" },
    { t: "Steady 45 min", rx: "45 min easy", cue: "Last big aerobic session" },
    { t: "Steady 30 min easy", rx: "30 min easy", cue: "Taper · Keep it light" },
    { t: "Easy 20 min spin", rx: "20 min easy", cue: "Test week · Stay loose" }
  ];

  var ROW_FRI = [
    { t: "8 x 500 m", rx: "8 x 500 m / 2:00 rest", cue: "Even splits · Last one strong" },
    { t: "4 x 1,000 m", rx: "4 x 1,000 m / 3:00 rest", cue: "Rhythm by rep 2" },
    { t: "Pyramid session", rx: "250-500-750-1,000-750-500-250", cue: "Smooth gears" },
    { t: "10 x 500 m", rx: "10 x 500 m / 2:00 rest", cue: "Volume intervals · Stay tall" },
    { t: "8 x 500 m", rx: "8 x 500 m / 1:30 rest", cue: "Shorter rest this week" },
    { t: "6 x 1,000 m", rx: "6 x 1,000 m / 2:30 rest", cue: "Post-trial strength" },
    { t: "12 x 500 m", rx: "12 x 500 m / 1:30 rest", cue: "Big interval day" },
    { t: "Pyramid 500-2,000 m", rx: "500-1,000-1,500-2,000-1,500-1,000-500", cue: "The big pyramid" },
    { t: "8 x 500 m hard", rx: "8 x 500 m / 2:00 rest", cue: "Best average of the plan" },
    { t: "5 x 1,000 m", rx: "5 x 1,000 m / 3:00 rest", cue: "Sharpening" },
    { t: "6 x 250 m strides", rx: "6 x 250 m / 2:00 rest", cue: "Taper · Fast and fresh" },
    { t: "Shakeout row", rx: "15 min easy", cue: "Test week · Stay loose" }
  ];

  var ROW_SAT = [
    { t: "Optional recovery row", rx: "20-30 min easy", cue: "Optional · Keep it easy" },
    { t: "Optional steady 30 min", rx: "30 min easy", cue: "Optional · Conversational" },
    { t: "Optional 35 min", rx: "35 min easy", cue: "Optional" },
    { t: "Optional 25 min easy", rx: "25 min easy", cue: "Optional · Recovery focus" },
    { t: "Optional 40 min", rx: "40 min easy", cue: "Optional" },
    { t: "Optional 30 min", rx: "30 min easy", cue: "Optional · Flush the legs" },
    { t: "Optional 35 min", rx: "35 min easy", cue: "Optional" },
    { t: "Optional 30 min", rx: "30 min easy", cue: "Optional" },
    { t: "Optional 25 min", rx: "25 min easy", cue: "Optional · Stay fresh" },
    { t: "Optional 20 min easy", rx: "20 min easy", cue: "Optional" },
    { t: "Rest", rx: "Full rest", cue: "Taper · Rest is training" },
    { t: "Rest", rx: "Feet up", cue: "Test week · Rest" }
  ];

  // Push-up volume builds toward the 35-rep mission target.
  var PUSH = [
    { rx: "5 x 12 push-ups (easy)", cue: "Easy · 40% of your best" },
    { rx: "6 x 12 push-ups", cue: "Strict form · Full lockout" },
    { rx: "5 x 15 push-ups", cue: "Add volume" },
    { rx: "6 x 15 push-ups", cue: "Chest to deck every rep" },
    { rx: "5 x 18 push-ups", cue: "Longer sets" },
    { rx: "Max set test + 4 x 15", cue: "Test your max · Record it" },
    { rx: "6 x 18 push-ups", cue: "Hold form as sets get hard" },
    { rx: "5 x 20 push-ups", cue: "Big volume day" },
    { rx: "6 x 20 push-ups", cue: "Peak volume" },
    { rx: "Max set test + 4 x 20", cue: "Retest your max" },
    { rx: "3 x 15 push-ups (easy)", cue: "Taper · Stay sharp" },
    { rx: "3 x 10 push-ups (easy)", cue: "Test week · Grease the groove" }
  ];

  // Plank builds toward the 2:52 mission target.
  var PLANK = [
    { rx: "4 x 0:30", cue: "Hips level · Breathe slow" },
    { rx: "4 x 0:40", cue: "Add time" },
    { rx: "3 x 1:00", cue: "Longer holds" },
    { rx: "4 x 1:00", cue: "Build the base" },
    { rx: "3 x 1:15", cue: "Stay tight" },
    { rx: "2 x 1:30 + max hold test", cue: "Test your max · Record it" },
    { rx: "3 x 1:30", cue: "Post-test volume" },
    { rx: "2 x 1:45", cue: "Long holds" },
    { rx: "3 x 1:45", cue: "Peak plank volume" },
    { rx: "2 x 2:00", cue: "Two minutes strong" },
    { rx: "2 x 1:00 (easy)", cue: "Taper · Stay sharp" },
    { rx: "2 x 0:45 (easy)", cue: "Test week · Stay sharp" }
  ];

  // X3 push work: light -> heavy across the plan.
  var X3 = [
    { t: "X3 Push - light", rx: "Chest press - Overhead press - Front/split squat - Triceps press", cue: "15-25 slow reps · No partials" },
    { t: "X3 Push - light", rx: "Chest press - Overhead press - Front/split squat - Triceps press", cue: "15-25 slow reps · No partials" },
    { t: "X3 Push - light-medium", rx: "Chest press - Overhead press - Squat - Triceps press", cue: "20-30 slow reps" },
    { t: "X3 Push - medium", rx: "Chest press - Overhead press - Squat - Triceps press", cue: "20-30 slow reps" },
    { t: "X3 Push - medium", rx: "Chest press - Overhead press - Squat - Triceps press", cue: "25-35 slow reps" },
    { t: "X3 Push - medium", rx: "Chest press - Overhead press - Squat - Triceps press", cue: "25-35 slow reps" },
    { t: "X3 Push - medium-heavy", rx: "Full push day - slow eccentrics", cue: "25-35 reps · Own every inch" },
    { t: "X3 Push - heavy", rx: "Full push day", cue: "Heavy band · Perfect form" },
    { t: "X3 Push - heavy", rx: "Full push day", cue: "Peak strength" },
    { t: "X3 Push - medium-heavy", rx: "Full push day", cue: "Sharpening" },
    { t: "X3 Push - light (easy)", rx: "Easy full push day", cue: "Taper · Move blood only" },
    { t: "X3 activation - light", rx: "Easy presses - 10-15 reps", cue: "Test week · Prime, don't fatigue" }
  ];

  var LADDERS = [
    "2-4-6-8-6-4-2", "2-4-6-8-6-4-2", "4-6-8-10-8-6-4", "4-6-8-10-8-6-4",
    "4-6-8-10-8-6-4", "6-8-10-12-10-8-6", "6-8-10-12-10-8-6", "6-8-10-12-10-8-6",
    "8-10-12-14-12-10-8", "4-6-8-6-4", "2-4-6-4-2 - easy"
  ];

  var SIDE_BASE = [35, 40, 45, 50, 55, 60, 70, 75, 80, 90, 45];
  var PLANK_LIGHT = [
    "3 x 0:35", "3 x 0:40", "3 x 0:45", "3 x 0:50", "3 x 0:55", "3 x 1:00",
    "3 x 1:05", "3 x 1:10", "3 x 1:15", "3 x 1:20", "2 x 0:45 - easy"
  ];
  var WALK = [
    "20 min", "20 min", "25 min", "20 min", "25 min", "25 min",
    "30 min", "25 min", "30 min", "20 min", "15 min - easy"
  ];

  var STRETCH = {
    t: "Guided stretch routine",
    rx: "10-15 min full-body stretch",
    cue: "Follow the video · Breathe into each stretch"
  };

  function T(n, icon, title, rx, cue) {
    return { n: n, icon: icon, title: title, rx: rx, cue: cue };
  }

  // Week 1 Session 1 — original verbatim.
  function week1Session1() {
    return {
      title: "Concept2 Day 1 - Push-ups, plank & X3 Push",
      tasks: [
        T("01", "🏋", "X3 Push · light",
          "Chest press · Overhead press · Front/split squat · Triceps press",
          "15–25 slow reps · no partials"),
        T("02", "💪", "Push-ups + plank",
          "5 × 12 push-ups (easy) · 4 × 0:30",
          "Complete both before the row · Easy 40% of your best"),
        T("03", "🚣", "Initial 2,000 m time trial",
          "2,000 m",
          "Do not start too fast · Build pace in the second half · Record your time")
      ]
    };
  }

  function session1(w) {
    if (w === 0) return week1Session1();
    return {
      title: "Concept2 Day 1 - Push-ups, plank & X3 Push",
      tasks: [
        T("01", "🏋", X3[w].t, X3[w].rx, X3[w].cue),
        T("02", "💪", "Push-ups + plank", PUSH[w].rx + " · " + PLANK[w].rx, PUSH[w].cue),
        T("03", "🚣", ROW_MON[w].t, ROW_MON[w].rx, ROW_MON[w].cue)
      ]
    };
  }

  function session2(w) {
    return {
      title: "Strength - Push-up & plank volume",
      tasks: [
        T("01", "💪", "Push-up volume", PUSH[w].rx, PUSH[w].cue),
        T("02", "⏱", "Plank holds", PLANK[w].rx, PLANK[w].cue),
        T("03", "🏋", "X3 Pull - light", "Bent rows · Pulldowns · Curls", "15-20 slow reps · Squeeze every rep")
      ]
    };
  }

  function session3(w) {
    return {
      title: "Concept2 Day 2 - Row + guided stretch",
      tasks: [
        T("01", "🚣", ROW_WED[w].t, ROW_WED[w].rx, ROW_WED[w].cue),
        T("02", "🧘", STRETCH.t, STRETCH.rx, STRETCH.cue),
        T("03", "💪", "Push-up practice", "3 x 10 easy", "Grease the groove · Perfect reps")
      ]
    };
  }

  function session4(w) {
    var side = SIDE_BASE[w];
    var sideRx = "3 x 0:" + side + " + 2 x 0:" + Math.round(side * 0.6) + "/side";
    return {
      title: "Strength - Push-up ladder & core",
      tasks: [
        T("01", "💪", "Push-up ladder", LADDERS[w] + " reps", "Rest 0:30 between rungs"),
        T("02", "⏱", "Plank + side plank", sideRx, "No sagging · No holding your breath"),
        T("03", "🏋", X3[w].t, X3[w].rx, X3[w].cue)
      ]
    };
  }

  function session5(w) {
    return {
      title: "Concept2 Day 3 - Row + guided stretch",
      tasks: [
        T("01", "🚣", ROW_FRI[w].t, ROW_FRI[w].rx, ROW_FRI[w].cue),
        T("02", "🧘", STRETCH.t, STRETCH.rx, STRETCH.cue),
        T("03", "⏱", "Plank practice", PLANK_LIGHT[w], "Easy holds · Stay long")
      ]
    };
  }

  function session6(w) {
    return {
      title: "Optional Concept2 Day 4 - Recovery",
      tasks: [
        T("01", "🚣", ROW_SAT[w].t, ROW_SAT[w].rx, ROW_SAT[w].cue),
        T("02", "🚶", "Walk", WALK[w], "Optional · Nasal breathing"),
        T("03", "🧘", "Hips & shoulders mobility", "10 min", "Optional · Move well")
      ]
    };
  }

  // Week 12: test week. Friday is PFT test day.
  function week12() {
    function s(title, tasks) { return { title: title, tasks: tasks }; }
    return [
      s("Shakeout - easy movement", [
        T("01", "🏋", "X3 activation - light", "Easy presses - 10-15 reps", "Prime, don't fatigue"),
        T("02", "💪", "Push-up practice", "3 x 10 easy", "Grease the groove"),
        T("03", "🚣", "Easy 20 min spin", "20 min easy", "Stay loose")
      ]),
      s("Rehearsal - test pace", [
        T("01", "💪", "Push-up rehearsal", "2 x 15 at test pace", "Practice your cadence"),
        T("02", "⏱", "Plank rehearsal", "2 x 1:00", "Test-day position"),
        T("03", "🚣", "Easy 15 min row", "15 min easy", "Stay loose")
      ]),
      s("Easy row + stretch", [
        T("01", "🚣", "Easy 20 min spin", "20 min easy", "Conversational"),
        T("02", "🧘", STRETCH.t, STRETCH.rx, STRETCH.cue),
        T("03", "🚶", "Walk", "15 min - easy", "Nasal breathing")
      ]),
      s("Rest + mobility", [
        T("01", "🚶", "Walk", "20 min", "Easy"),
        T("02", "🧘", STRETCH.t, STRETCH.rx, STRETCH.cue),
        T("03", "🧘", "Hips & shoulders mobility", "10 min", "Move well")
      ]),
      s("PFT TEST DAY", [
        T("01", "💪", "Push-up test", "Max reps - 2:00", "Steady cadence · Don't sprint the first 30 seconds"),
        T("02", "⏱", "Plank test", "Max hold", "Breathe · One long effort"),
        T("03", "🚣", "2,000 m row test", "2,000 m", "Execute the plan · Empty the tank")
      ]),
      s("Rest - mission complete", [
        T("01", "📋", "Log your scores", "Record all three events", "Write them down while fresh"),
        T("02", "🧘", "Easy stretch", "10 min", "You earned it"),
        T("03", "🏁", "Rest", "Feet up", "Mission complete")
      ])
    ];
  }

  function build() {
    var weeks = [];
    for (var w = 0; w < 12; w++) {
      var sessions = (w === 11)
        ? week12()
        : [session1(w), session2(w), session3(w), session4(w), session5(w), session6(w)];
      weeks.push({
        num: w + 1,
        phase: PHASES[w].name,
        phaseCue: PHASES[w].cue,
        sessions: sessions
      });
    }
    return { weeks: weeks };
  }

  window.IRON_TIDE_PLAN = build();
})();
