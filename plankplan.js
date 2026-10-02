/* IRON TIDE 4 — 12-week forearm plank progression data.
 * Target: one clean 3:01 hold (male 45-49 max-points target).
 * Three sessions per week (A/B/C), 48 hours between sessions, 10-16 min each.
 * Transcribed from the 12-week plank progression PDF.
 */
(function () {
  "use strict";

  function sess(s, rx, rest, note) { return { s: s, rx: rx, rest: rest, note: note }; }

  var WEEKS = [
    { n: 1, phase: "OWN THE POSITION", title: "Repeat clean holds", sessions: [
      sess("A", "6 × 0:30", "0:30", "Stop every set before alignment fails."),
      sess("B", "4 × 0:45", "0:45", "Accumulate quality without maxing out."),
      sess("C", "3 × 1:00", "1:00", "Finish with shape intact.")
    ] },
    { n: 2, phase: "OWN THE POSITION", title: "Add time", sessions: [
      sess("A", "6 × 0:35", "0:30", "Keep the Week 1 shape as holds lengthen."),
      sess("B", "4 × 0:50", "0:40", ""),
      sess("C", "2 × 1:15", "1:15", "Reduce volume, then take one clean read.")
    ] },
    { n: 3, phase: "OWN THE POSITION", title: "Build density", sessions: [
      sess("A", "5 × 0:45", "0:30", "Accumulate quality without maxing out."),
      sess("B", "4 × 1:00", "0:45", ""),
      sess("C", "2 × 1:25", "1:15", "")
    ] },
    { n: 4, phase: "OWN THE POSITION", title: "Deload + checkpoint", sessions: [
      sess("A", "4 × 0:45", "0:30", "Deload — freshen up."),
      sess("B", "2 × 1:10", "1:00", "Easy rehearsal."),
      sess("C", "One clean checkpoint", "—", "Aim 1:45 · after 48 hours easy.")
    ] },
    { n: 5, phase: "EXTEND CAPACITY", title: "Resume the build", sessions: [
      sess("A", "6 × 0:45", "0:30", "Keep full-body tension through every minute."),
      sess("B", "4 × 1:10", "0:45", ""),
      sess("C", "2 × 1:35", "1:15", "")
    ] },
    { n: 6, phase: "EXTEND CAPACITY", title: "Cross 1:45", sessions: [
      sess("A", "5 × 0:55", "0:35", "Stay braced without holding your breath."),
      sess("B", "3 × 1:25", "1:00", ""),
      sess("C", "1 × 1:50, then 2 × 0:45", "1:15 / 0:45", "")
    ] },
    { n: 7, phase: "EXTEND CAPACITY", title: "Hold under fatigue", sessions: [
      sess("A", "5 × 1:00", "0:30", "No set is a max; finish with shape intact."),
      sess("B", "3 × 1:35", "1:00", ""),
      sess("C", "2 × 1:50", "1:30", "")
    ] },
    { n: 8, phase: "EXTEND CAPACITY", title: "Deload + checkpoint", sessions: [
      sess("A", "4 × 0:50", "0:35", "Freshen up before one controlled test."),
      sess("B", "2 × 1:20", "1:00", ""),
      sess("C", "One clean checkpoint", "—", "Aim 2:20 · after 48 hours easy.")
    ] },
    { n: 9, phase: "REHEARSE THE TARGET", title: "Build past five minutes", sessions: [
      sess("A", "6 × 0:55", "0:30", "Accumulate time while every set stays submaximal."),
      sess("B", "4 × 1:20", "0:45", ""),
      sess("C", "1 × 2:15, then 2 × 0:45", "1:30 / 0:45", "")
    ] },
    { n: 10, phase: "REHEARSE THE TARGET", title: "Extend the lead hold", sessions: [
      sess("A", "5 × 1:05", "0:30", "Stay calm through the two-minute mark."),
      sess("B", "3 × 1:40", "1:00", ""),
      sess("C", "1 × 2:30, then 2 × 0:40", "1:30 / 0:40", "")
    ] },
    { n: 11, phase: "REHEARSE THE TARGET", title: "Peak rehearsal", sessions: [
      sess("A", "4 × 1:10", "0:35", "Touch 2:45 once; leave the last 16 seconds for test day."),
      sess("B", "2 × 1:45, then 1 × 1:00", "1:15", ""),
      sess("C", "1 × 2:45 — stop there", "—", "Capped rehearsal. Not a max.")
    ] },
    { n: 12, phase: "REHEARSE THE TARGET", title: "Taper + test", sessions: [
      sess("A", "3 × 1:00", "0:45", "Arrive fresh; do not chase fatigue."),
      sess("B", "1 × 1:45, then 2 × 0:30", "1:30 / 0:30", "Easy rehearsal."),
      sess("C", "One clean test", "—", "Target 3:01 · stop on first form break · after 48–72 hours easy.")
    ] }
  ];

  var FORM = [
    ["Stack", "Elbows under shoulders. Press forearms firmly into the floor."],
    ["Lengthen", "Head neutral, gaze down, reach heels away behind you."],
    ["Brace", "Ribs down. Tighten abs, glutes, and quads before the clock starts."],
    ["Hold the line", "Shoulders, hips, knees, and ankles in one straight line — no sag or pike."],
    ["Breathe", "Quiet breaths. Exhale fully without letting the midsection soften."],
    ["Stay still", "Do not shift weight, shorten the body, or rest through the shoulders."]
  ];

  var SETUP = [
    "Shoulder circles: 10 each direction.",
    "Glute bridges: 8 controlled reps.",
    "Dead bugs: 5 per side.",
    "Easy forearm plank: 0:15.",
    "Rest 0:45, then begin the work sets."
  ];

  var CHECKPOINTS = [
    ["Before Week 1", "Record baseline", "Choose the written track, or the 75% track below."],
    ["End of Week 4", "1:45", "Confirm the position is stable beyond 1:30."],
    ["End of Week 8", "2:20", "Confirm long-hold capacity before the specificity phase."],
    ["Week 11", "2:45, capped", "Rehearse without spending the final effort."],
    ["End of Week 12", "3:01", "Max-point target attempt."]
  ];

  var STOP_RULES = [
    "Stop the timer if hips sag or rise.",
    "Stop if an elbow or foot moves to create rest.",
    "Stop if a knee touches down.",
    "Stop for sharp pain, numbness, chest discomfort, or dizziness.",
    "Record only the clean time."
  ];

  var TEST_DAY = [
    "Do not max out during the prior 48–72 hours.",
    "Use the same surface, shoes, elbow position, and timer cues you practiced.",
    "For PFT specificity, complete your normal one-minute push-up effort first, then start the plank after 5–10 minutes of recovery (no more than 15 minutes between events).",
    "Have a partner call 1:00, 1:30, 2:00, 2:20, 2:45, 3:00, and 3:01. Keep breathing; do not change position to chase the clock."
  ];

  window.IRON_TIDE_PLANK = {
    weeks: WEEKS,
    form: FORM,
    setup: SETUP,
    checkpoints: CHECKPOINTS,
    stopRules: STOP_RULES,
    testDay: TEST_DAY,
    scaling: "Under 1:15 baseline: perform 75% of every listed hold, rounded down to 5 seconds (minimum 0:20). " +
      "1:15 or longer: use the plan as written. Failed a week: repeat that week once; do not stack extra sessions."
  };
})();
