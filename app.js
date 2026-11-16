const STORAGE_KEY = "wt_data_v3";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const GROUPS = ["chest", "back", "shoulders", "arms", "legs", "core"];
const GROUP_LABELS = {
  chest: "Chest", back: "Back", shoulders: "Shoulders",
  arms: "Arms", legs: "Legs", core: "Core", custom: "Your own",
};
const GROUP_COLORS = {
  chest: "#e2685f", back: "#5ac8a0", shoulders: "#d9b65a",
  arms: "#7aa2e3", legs: "#b07ae3", core: "#5ac2c8", custom: "#8a9199",
};

function seedExercises() {
  const defs = [
    ["chest", ["Barbell Bench Press", "Incline Bench Press", "Dumbbell Bench Press", "Chest Press Machine", "Pec Deck / Chest Fly Machine", "Cable Crossover", "Push-up"]],
    ["back", ["Lat Pulldown", "Seated Cable Row", "Barbell Deadlift", "Pull-up", "Barbell Row", "T-Bar Row", "Assisted Pull-up Machine"]],
    ["shoulders", ["Overhead Press", "Dumbbell Shoulder Press", "Lateral Raise", "Rear Delt Fly", "Face Pull", "Shoulder Press Machine"]],
    ["arms", ["Barbell Bicep Curl", "Dumbbell Bicep Curl", "Hammer Curl", "Preacher Curl", "Tricep Pushdown", "Skull Crusher", "Overhead Tricep Extension", "Dips"]],
    ["legs", ["Barbell Squat", "Leg Press", "Leg Extension", "Leg Curl", "Romanian Deadlift", "Walking Lunge", "Calf Raise", "Hip Thrust", "Bulgarian Split Squat"]],
    ["core", ["Plank", "Cable Crunch", "Hanging Leg Raise", "Russian Twist", "Ab Crunch Machine"]],
  ];
  const out = [];
  defs.forEach(([group, names]) => {
    names.forEach((name) => out.push({ id: "seed-" + group + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, group, custom: false, photo: null }));
  });
  return out;
}

function findSeedIds(exercises, names) {
  return names.map((n) => exercises.find((e) => e.name === n)?.id).filter(Boolean);
}

function freshData() {
  const exercises = seedExercises();
  const routines = [
    { id: uid(), name: "Chest Day", exerciseIds: findSeedIds(exercises, ["Barbell Bench Press", "Incline Bench Press", "Dumbbell Bench Press", "Pec Deck / Chest Fly Machine", "Cable Crossover"]) },
    { id: uid(), name: "Back Day", exerciseIds: findSeedIds(exercises, ["Lat Pulldown", "Seated Cable Row", "Barbell Deadlift", "Barbell Row", "Pull-up"]) },
    { id: uid(), name: "Shoulders Day", exerciseIds: findSeedIds(exercises, ["Overhead Press", "Dumbbell Shoulder Press", "Lateral Raise", "Rear Delt Fly", "Face Pull"]) },
    { id: uid(), name: "Arms Day", exerciseIds: findSeedIds(exercises, ["Barbell Bicep Curl", "Hammer Curl", "Preacher Curl", "Tricep Pushdown", "Skull Crusher", "Dips"]) },
    { id: uid(), name: "Legs Day", exerciseIds: findSeedIds(exercises, ["Barbell Squat", "Leg Press", "Leg Extension", "Leg Curl", "Romanian Deadlift", "Calf Raise"]) },
  ];
  return { exercises, routines, sets: [], nutrition: [], profile: null };
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* fall through */ }
  }
  return freshData();
}

let data = loadData();
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fmtDate(d) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function exerciseById(id) { return data.exercises.find((e) => e.id === id); }

function topWeightOf(s) { return Math.max(...s.repWeights); }
function formatSet(s) {
  const ws = s.repWeights;
  const allSame = ws.every((w) => w === ws[0]);
  return allSame ? `${ws[0]}kg x ${ws.length}` : `${ws.join("kg, ")}kg (${ws.length} reps)`;
}

function getExerciseSets(exerciseId) {
  return data.sets
    .filter((s) => s.exerciseId === exerciseId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

function sessionsForExercise(exerciseId) {
  const sets = getExerciseSets(exerciseId);
  const byDate = {};
  sets.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });
  return Object.keys(byDate)
    .sort((a, b) => b.localeCompare(a))
    .map((date) => {
      const setsForDate = byDate[date];
      return {
        date,
        sets: setsForDate,
        maxWeight: Math.max(...setsForDate.map(topWeightOf)),
        allEasy: setsForDate.every((s) => s.easy),
      };
    });
}

function buildTrend(exerciseId) {
  const sessions = sessionsForExercise(exerciseId);
  if (sessions.length === 0) return { text: "Not logged yet.", pr: null, last: null };

  const pr = Math.max(...data.sets.filter((s) => s.exerciseId === exerciseId).map(topWeightOf));
  const latest = sessions[0];
  const latestSet = latest.sets.slice().sort((a, b) => topWeightOf(b) - topWeightOf(a))[0];
  const last = {
    date: latest.date,
    display: formatSet(latestSet),
    weight: topWeightOf(latestSet),
    reps: latestSet.repWeights.length,
    easy: latestSet.easy,
  };

  let streak = 1;
  while (streak < sessions.length && sessions[streak].maxWeight === latest.maxWeight) streak++;

  let text;
  if (streak >= 2) {
    const startDate = sessions[streak - 1].date;
    const days = Math.max(1, Math.round((new Date(latest.date) - new Date(startDate)) / 86400000));
    text = latest.allEasy
      ? `You've lifted ${latest.maxWeight}kg for your last ${streak} sessions (${days} days). Comfortable each time, try ${latest.maxWeight + 2.5}kg next session.`
      : `You've lifted ${latest.maxWeight}kg for your last ${streak} sessions (${days} days). Stay here until every set feels easy.`;
  } else if (sessions.length >= 2) {
    const prevMax = sessions[1].maxWeight;
    if (latest.maxWeight > prevMax) text = `Up from ${prevMax}kg to ${latest.maxWeight}kg last time. Good progress.`;
    else if (latest.maxWeight < prevMax) text = `Down from ${prevMax}kg to ${latest.maxWeight}kg last time. Fine once in a while, don't make it a habit.`;
    else text = latest.allEasy ? `Handled ${latest.maxWeight}kg comfortably. Try ${latest.maxWeight + 2.5}kg next session.` : `Stay at ${latest.maxWeight}kg until it feels easier.`;
  } else {
    text = latest.allEasy ? `First session: ${latest.maxWeight}kg comfortably. Try ${latest.maxWeight + 2.5}kg next time.` : `First session logged at ${latest.maxWeight}kg.`;
  }

  return { text, pr, last };
}

// ---------- Image resize ----------
function resizeImageFile(file, maxDim = 480, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- Simple SVG line chart ----------
function renderSparkline(points) {
  if (points.length < 2) return "";
  const w = 300, h = 90, pad = 10;
  const weights = points.map((p) => p.weight);
  const min = Math.min(...weights), max = Math.max(...weights);
  const range = max - min || 1;
  const step = (w - pad * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = pad + i * step;
    const y = h - pad - ((p.weight - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const path = coords.map((c, i) => (i === 0 ? "M" : "L") + c[0].toFixed(1) + "," + c[1].toFixed(1)).join(" ");
  const dots = coords.map((c) => `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="3" fill="#5ac8a0" />`).join("");
  return `<svg viewBox="0 0 ${w} ${h}" class="sparkline"><path d="${path}" fill="none" stroke="#5ac8a0" stroke-width="2" />${dots}</svg>`;
}

// ---------- Page stack ----------
const pageStack = [];
function pushPage(renderFn) {
  const el = document.createElement("div");
  el.className = "page";
  document.getElementById("pageLayer").appendChild(el);
  pageStack.push(el);
  renderFn(el);
  requestAnimationFrame(() => el.classList.add("show"));
}
function popPage() {
  const el = pageStack.pop();
  if (!el) return;
  el.classList.remove("show");
  setTimeout(() => el.remove(), 200);
}
function pageHeader(title) {
  return `<div class="page-header"><button class="back-btn" data-action="back">&larr; Back</button><h2>${title}</h2></div>`;
}

document.getElementById("pageLayer").addEventListener("click", (e) => {
  if (e.target.dataset.action === "back") popPage();
});

// ---------- Tabs ----------
const TABS = ["home", "nutrition", "profile"];
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.view;
    TABS.forEach((v) => document.getElementById("view-" + v).classList.toggle("hidden", v !== target));
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === tab));
    if (target === "nutrition") renderNutrition();
    if (target === "profile") renderProfile();
  });
});

// ================= HOME =================
function weeklyWorkoutCount() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;
  return new Set(data.sets.filter((s) => s.date >= cutoffStr).map((s) => s.date)).size;
}

function renderHome() {
  const count = weeklyWorkoutCount();
  document.getElementById("weekStat").textContent = `${count} workout${count === 1 ? "" : "s"}`;

  const list = document.getElementById("routineList");
  list.innerHTML = "";
  data.routines.forEach((r) => {
    const groups = [...new Set(r.exerciseIds.map((id) => exerciseById(id)?.group).filter(Boolean))];
    const chips = groups.map((g) => `<span class="chip" style="background:${GROUP_COLORS[g]}22;color:${GROUP_COLORS[g]}">${GROUP_LABELS[g]}</span>`).join("");
    const card = document.createElement("div");
    card.className = "routine-card";
    card.innerHTML = `
      <div class="routine-main">
        <div class="routine-name">${r.name}</div>
        <div class="routine-sub">${r.exerciseIds.length} exercises</div>
        <div class="chip-row">${chips}</div>
      </div>
      <button class="btn small" data-start="${r.id}">Start</button>
    `;
    card.querySelector("[data-start]").addEventListener("click", () => openSession(r.id));
    card.querySelector(".routine-main").addEventListener("click", () => openRoutineBuilder(r.id));
    list.appendChild(card);
  });

  const recent = document.getElementById("recentWorkouts");
  const dates = [...new Set(data.sets.map((s) => s.date))].sort((a, b) => b.localeCompare(a)).slice(0, 5);
  recent.innerHTML = dates.length ? "" : '<p class="hint">No workouts logged yet.</p>';
  dates.forEach((date) => recent.appendChild(buildDayCard(date)));
}

document.getElementById("newRoutineBtn").addEventListener("click", () => openRoutineBuilder(null));
document.getElementById("seeAllHistoryBtn").addEventListener("click", () => openHistoryList());
document.getElementById("recordsBtn").addEventListener("click", () => openRecords());

function openRecords() {
  pushPage((el) => {
    const exIds = [...new Set(data.sets.map((s) => s.exerciseId))];
    el.innerHTML = pageHeader("Your records") + `<div class="page-body" id="recordsBody"></div>`;
    const body = el.querySelector("#recordsBody");
    if (!exIds.length) { body.innerHTML = '<p class="hint">Log a few workouts to see your records here.</p>'; return; }
    const rows = exIds.map((exId) => {
      const ex = exerciseById(exId);
      const sets = data.sets.filter((s) => s.exerciseId === exId);
      const best = sets.reduce((a, b) => (topWeightOf(b) > topWeightOf(a) ? b : a));
      return { exId, name: ex ? ex.name : "Deleted exercise", weight: topWeightOf(best), date: best.date };
    }).sort((a, b) => b.weight - a.weight);
    rows.forEach((r) => {
      const row = document.createElement("div");
      row.className = "list-item clickable";
      row.innerHTML = `<span>${r.name}</span><span class="muted">${r.weight}kg &middot; ${fmtDate(r.date)}</span>`;
      row.addEventListener("click", () => openExerciseInfo(r.exId));
      body.appendChild(row);
    });
  });
}

// ================= SESSION =================
function buildExerciseLogCard(exId, today, draw, onRemoveFromToday) {
  const ex = exerciseById(exId);
  const trend = buildTrend(exId);
  const todaysSets = getExerciseSets(exId).filter((s) => s.date === today);
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="ex-card-head">
      <button class="ex-thumb" data-info="${exId}">${exerciseThumbHtml(ex)}</button>
      <div class="ex-card-title">
        <h3 data-info="${exId}">${ex.name}</h3>
        <span class="muted small-label">${GROUP_LABELS[ex.group] || ""} &middot; tap for form guide</span>
      </div>
      ${onRemoveFromToday ? `<button class="remove-x" data-remove-today title="Remove from today">&times;</button>` : ""}
    </div>
    ${trend.last
      ? `<p class="hint">Last time: ${trend.last.display} (${fmtDate(trend.last.date)}) &middot; PR ${trend.pr}kg</p><p class="suggestion">${trend.text}</p>
         <button class="btn small secondary" data-repeat>&#8635; Repeat last set (${trend.last.weight}kg x ${trend.last.reps})</button>`
      : `<p class="hint">Not logged yet. Add your first set below.</p>`}
    <div class="set-rows">
      ${todaysSets.map((s) => `<div class="list-item"><span>${formatSet(s)}${s.easy ? "" : " (hard)"}</span><button class="remove-x" data-remove-set="${s.id}" title="Delete this set">&times;</button></div>`).join("")}
    </div>
    <label class="checkbox tiny mode-toggle"><input type="checkbox" data-field="mode" /> log each rep separately</label>
    <div class="inline-form" data-mode="simple">
      <input type="number" step="0.5" placeholder="kg" class="w-small" data-field="weight" />
      <input type="number" step="1" placeholder="reps" class="w-small" data-field="reps" />
      <label class="checkbox tiny"><input type="checkbox" data-field="easy" checked /> easy</label>
      <button class="btn small" data-add="${exId}">Add set</button>
    </div>
    <div class="inline-form hidden" data-mode="advanced">
      <input type="number" step="0.5" placeholder="kg" class="w-small" data-field="repWeight" />
      <input type="number" step="1" placeholder="reps" class="w-small" data-field="repCount" />
      <button class="btn small secondary" data-field="addRep">+ Add</button>
    </div>
    <div class="draft-chips" data-field="draftChips"></div>
    <div class="inline-form hidden" data-mode="advancedSave">
      <label class="checkbox tiny"><input type="checkbox" data-field="easyAdv" checked /> easy</label>
      <button class="btn small" data-field="saveDraft">Save set</button>
    </div>
  `;

  card.querySelectorAll(`[data-info="${exId}"]`).forEach((elm) => elm.addEventListener("click", () => openExerciseInfo(exId)));

  const removeTodayBtn = card.querySelector("[data-remove-today]");
  if (removeTodayBtn) removeTodayBtn.addEventListener("click", () => onRemoveFromToday());

  const repeatBtn = card.querySelector("[data-repeat]");
  if (repeatBtn) repeatBtn.addEventListener("click", () => {
    data.sets.push({
      id: uid(), exerciseId: exId, date: today,
      repWeights: Array(trend.last.reps).fill(trend.last.weight),
      easy: trend.last.easy, createdAt: Date.now(),
    });
    saveData();
    draw();
  });

  card.querySelectorAll("[data-remove-set]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirm("Delete this set?")) return;
    data.sets = data.sets.filter((s) => s.id !== btn.dataset.removeSet);
    saveData();
    draw();
  }));

  const simpleRow = card.querySelector('[data-mode="simple"]');
  const advRow = card.querySelector('[data-mode="advanced"]');
  const advSaveRow = card.querySelector('[data-mode="advancedSave"]');
  const chipsEl = card.querySelector('[data-field="draftChips"]');
  card.querySelector('[data-field="mode"]').addEventListener("change", (e) => {
    const advanced = e.target.checked;
    simpleRow.classList.toggle("hidden", advanced);
    advRow.classList.toggle("hidden", !advanced);
    advSaveRow.classList.toggle("hidden", !advanced);
  });

  card.querySelector("[data-add]").addEventListener("click", () => {
    const weight = parseFloat(card.querySelector('[data-field="weight"]').value);
    const reps = parseInt(card.querySelector('[data-field="reps"]').value, 10);
    const easy = card.querySelector('[data-field="easy"]').checked;
    if (isNaN(weight) || isNaN(reps) || reps < 1) { alert("Enter weight and reps."); return; }
    data.sets.push({ id: uid(), exerciseId: exId, date: today, repWeights: Array(reps).fill(weight), easy, createdAt: Date.now() });
    saveData();
    draw();
  });

  let draft = []; // chunks: {weight, reps}
  function renderChips() {
    chipsEl.innerHTML = draft.map((c, i) => `<span class="chip draft-chip" data-remove="${i}">${c.weight}kg &times; ${c.reps} reps &nbsp;<strong>&times;</strong></span>`).join("");
    chipsEl.querySelectorAll("[data-remove]").forEach((c) => c.addEventListener("click", () => {
      draft.splice(parseInt(c.dataset.remove, 10), 1);
      renderChips();
    }));
  }
  card.querySelector('[data-field="addRep"]').addEventListener("click", () => {
    const w = parseFloat(card.querySelector('[data-field="repWeight"]').value);
    const r = parseInt(card.querySelector('[data-field="repCount"]').value, 10);
    if (isNaN(w) || isNaN(r) || r < 1) { alert("Enter a weight and how many reps at that weight."); return; }
    draft.push({ weight: w, reps: r });
    card.querySelector('[data-field="repWeight"]').value = "";
    card.querySelector('[data-field="repCount"]').value = "";
    renderChips();
  });
  card.querySelector('[data-field="saveDraft"]').addEventListener("click", () => {
    if (draft.length === 0) { alert("Add at least one weight/reps entry first."); return; }
    const easy = card.querySelector('[data-field="easyAdv"]').checked;
    const repWeights = draft.flatMap((c) => Array(c.reps).fill(c.weight));
    data.sets.push({ id: uid(), exerciseId: exId, date: today, repWeights, easy, createdAt: Date.now() });
    saveData();
    draw();
  });

  return card;
}

function openSession(routineId) {
  const routine = data.routines.find((r) => r.id === routineId);
  const today = todayStr();
  // Show every exercise that shares a muscle group with this routine (not just the
  // ones explicitly added to it), so you never have to pre-curate the routine's list.
  const routineGroups = [...new Set(routine.exerciseIds.map((id) => exerciseById(id)?.group).filter(Boolean))];
  const candidateIds = [...new Set([
    ...routine.exerciseIds,
    ...data.exercises.filter((ex) => routineGroups.includes(ex.group)).map((ex) => ex.id),
  ])];
  const starred = new Set(
    candidateIds.filter((exId) => getExerciseSets(exId).some((s) => s.date === today))
  );

  pushPage((el) => {
    function draw() {
      el.innerHTML = pageHeader(routine.name) + `<div class="page-body" id="sessionBody"></div>`;
      const body = el.querySelector("#sessionBody");

      const todayIds = candidateIds.filter((id) => starred.has(id));
      const restIds = candidateIds.filter((id) => !starred.has(id)).sort((a, b) => {
        const aUsed = getExerciseSets(a).length > 0;
        const bUsed = getExerciseSets(b).length > 0;
        if (aUsed !== bUsed) return aUsed ? -1 : 1;
        return (exerciseById(a)?.name || "").localeCompare(exerciseById(b)?.name || "");
      });

      if (todayIds.length) {
        const h = document.createElement("h3");
        h.textContent = "Today's exercises";
        body.appendChild(h);
        todayIds.forEach((exId) => body.appendChild(buildExerciseLogCard(exId, today, draw, () => { starred.delete(exId); draw(); })));
      } else {
        body.innerHTML += '<p class="hint">Tap "Add to today" on any exercise below to start logging it.</p>';
      }

      if (restIds.length) {
        const h = document.createElement("h3");
        h.textContent = todayIds.length ? "More exercises" : "Exercises";
        body.appendChild(h);
        restIds.forEach((exId) => {
          const ex = exerciseById(exId);
          if (!ex) return;
          const usedBefore = getExerciseSets(exId).length > 0;
          const row = document.createElement("div");
          row.className = "list-item picker-row";
          row.innerHTML = `
            <button class="ex-thumb small" data-info="${exId}">${exerciseThumbHtml(ex)}</button>
            <span data-info="${exId}" class="rest-name">${usedBefore ? "&#9733; " : ""}${ex.name}</span>
            <button class="btn small secondary" data-star="${exId}">Add to today</button>
          `;
          row.querySelectorAll(`[data-info="${exId}"]`).forEach((elm) => elm.addEventListener("click", () => openExerciseInfo(exId)));
          row.querySelector("[data-star]").addEventListener("click", () => { starred.add(exId); draw(); });
          body.appendChild(row);
        });
      }

      const finishBtn = document.createElement("button");
      finishBtn.className = "btn secondary";
      finishBtn.textContent = "Finish workout";
      finishBtn.style.margin = "16px 0 24px";
      finishBtn.addEventListener("click", () => { popPage(); renderHome(); });
      body.appendChild(finishBtn);
    }
    draw();
  });
}

// ================= ROUTINE BUILDER =================
function openRoutineBuilder(routineId) {
  const isNew = !routineId;
  const routine = isNew
    ? { id: uid(), name: "", exerciseIds: [] }
    : JSON.parse(JSON.stringify(data.routines.find((r) => r.id === routineId)));
  const selected = new Set(routine.exerciseIds);
  let filterGroup = "all";
  let search = "";

  pushPage((el) => {
    function draw() {
      el.innerHTML = pageHeader(isNew ? "New routine" : "Edit routine") + `
        <div class="page-body">
          <label>Routine name<input type="text" id="rbName" value="${routine.name.replace(/"/g, "&quot;")}" placeholder="e.g. Push Day" /></label>
          <input type="text" id="rbSearch" placeholder="Search exercises" value="${search}" />
          <div class="chip-row filter-row" id="rbFilters"></div>
          <button class="btn secondary" id="rbAddCustom">+ Add your own exercise</button>
          <div class="list" id="rbList"></div>
          <div class="sticky-footer">
            <button class="btn" id="rbSave">Save routine</button>
            ${!isNew ? '<button class="btn danger" id="rbDelete">Delete routine</button>' : ""}
          </div>
        </div>
      `;

      const filterRow = el.querySelector("#rbFilters");
      ["all", ...GROUPS, "custom"].forEach((g) => {
        const chip = document.createElement("button");
        chip.className = "chip filter" + (filterGroup === g ? " active" : "");
        chip.textContent = g === "all" ? "All" : GROUP_LABELS[g];
        chip.addEventListener("click", () => { filterGroup = g; draw(); });
        filterRow.appendChild(chip);
      });

      el.querySelector("#rbSearch").addEventListener("input", (e) => { search = e.target.value; renderList(); });
      el.querySelector("#rbName").addEventListener("input", (e) => { routine.name = e.target.value; });
      el.querySelector("#rbAddCustom").addEventListener("click", () => openAddCustomExercise(() => draw()));
      el.querySelector("#rbSave").addEventListener("click", () => {
        if (!routine.name.trim()) { alert("Give the routine a name."); return; }
        routine.exerciseIds = [...selected];
        if (isNew) {
          data.routines.push(routine);
        } else {
          const idx = data.routines.findIndex((r) => r.id === routine.id);
          if (idx !== -1) data.routines[idx] = routine;
        }
        saveData();
        popPage();
        renderHome();
      });
      const delBtn = el.querySelector("#rbDelete");
      if (delBtn) delBtn.addEventListener("click", () => {
        if (!confirm("Delete this routine? Your logged history stays intact.")) return;
        data.routines = data.routines.filter((r) => r.id !== routine.id);
        saveData();
        popPage();
        renderHome();
      });

      renderList();
    }

    function renderList() {
      const listEl = el.querySelector("#rbList");
      listEl.innerHTML = "";
      const q = search.toLowerCase();
      data.exercises
        .filter((ex) => (filterGroup === "all" ? true : (filterGroup === "custom" ? ex.custom : ex.group === filterGroup)))
        .filter((ex) => ex.name.toLowerCase().includes(q))
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((ex) => {
                  const row = document.createElement("div");
          row.className = "list-item picker-row";
          row.innerHTML = `
            <label class="checkbox">
              <input type="checkbox" ${selected.has(ex.id) ? "checked" : ""} />
              <span>${ex.name}</span>
            </label>
            <button class="ex-thumb small" data-view-info>${exerciseThumbHtml(ex)}</button>
            ${ex.custom ? `<button class="remove-x" data-delete-ex title="Delete this exercise">&times;</button>` : ""}
          `;
          row.querySelector("input").addEventListener("change", (e) => {
            if (e.target.checked) selected.add(ex.id); else selected.delete(ex.id);
          });
          row.querySelector("[data-view-info]").addEventListener("click", (e) => {
            e.preventDefault();
            openExerciseInfo(ex.id);
          });
          const delBtn = row.querySelector("[data-delete-ex]");
          if (delBtn) delBtn.addEventListener("click", () => {
            if (!confirm(`Delete "${ex.name}"? It will be removed from every routine. Logged history stays intact.`)) return;
            data.exercises = data.exercises.filter((e) => e.id !== ex.id);
            data.routines.forEach((r) => { r.exerciseIds = r.exerciseIds.filter((id) => id !== ex.id); });
            selected.delete(ex.id);
            saveData();
            renderList();
          });
          listEl.appendChild(row);
        });
    }

    draw();
  });
}

function openAddCustomExercise(onDone) {
  pushPage((el) => {
    el.innerHTML = pageHeader("Add your own exercise") + `
      <div class="page-body">
        <label>Name<input type="text" id="newExName" placeholder="e.g. Leg Press (my gym)" /></label>
        <label>Muscle group
          <select id="newExGroup">${GROUPS.map((g) => `<option value="${g}">${GROUP_LABELS[g]}</option>`).join("")}</select>
        </label>
        <label>Photo (optional)<input type="file" id="newExPhoto" accept="image/*" capture="environment" /></label>
        <img id="newExPreview" class="preview hidden" />
        <button class="btn" id="saveCustomEx">Save exercise</button>
      </div>
    `;
    let pendingPhoto = null;
    el.querySelector("#newExPhoto").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      pendingPhoto = await resizeImageFile(file);
      const preview = el.querySelector("#newExPreview");
      preview.src = pendingPhoto;
      preview.classList.remove("hidden");
    });
    el.querySelector("#saveCustomEx").addEventListener("click", () => {
      const name = el.querySelector("#newExName").value.trim();
      const group = el.querySelector("#newExGroup").value;
      if (!name) { alert("Give it a name."); return; }
      data.exercises.push({ id: uid(), name, group, custom: true, photo: pendingPhoto });
      saveData();
      popPage();
      onDone && onDone();
    });
  });
}

// ================= HISTORY =================
function buildDayCard(date) {
  const card = document.createElement("div");
  card.className = "card";
  const exIds = [...new Set(data.sets.filter((s) => s.date === date).map((s) => s.exerciseId))];
  card.innerHTML = `<h3 class="day-card-date">${fmtDate(date)}</h3>` +
    exIds.map((exId) => {
      const ex = exerciseById(exId);
      const sets = data.sets.filter((s) => s.exerciseId === exId && s.date === date);
      return `
        <div class="day-ex-row">
          <div class="day-ex-name" data-ex="${exId}">${ex ? ex.name : "Deleted exercise"}</div>
          <div class="chip-row">${sets.map((s) => `<span class="chip set-chip">${formatSet(s)}${s.easy ? "" : " (hard)"}</span>`).join("")}</div>
        </div>
      `;
    }).join("");
  card.querySelectorAll("[data-ex]").forEach((elm) => elm.addEventListener("click", () => openExerciseInfo(elm.dataset.ex)));
  return card;
}

function openHistoryList() {
  pushPage((el) => {
    const dates = [...new Set(data.sets.map((s) => s.date))].sort((a, b) => b.localeCompare(a));
    el.innerHTML = pageHeader("History") + `<div class="page-body" id="histList"></div>`;
    const listEl = el.querySelector("#histList");
    if (!dates.length) listEl.innerHTML = '<p class="hint">No workouts logged yet.</p>';
    dates.forEach((date) => listEl.appendChild(buildDayCard(date)));
  });
}

function openExerciseInfo(exId) {
  const ex = exerciseById(exId);
  if (!ex) return;
  pushPage((el) => {
    const sessions = sessionsForExercise(exId).slice().reverse();
    const trend = buildTrend(exId);
    const info = EXERCISE_INFO[ex.name];
    const photoPath = ex.photo || EXERCISE_PHOTOS[(info || {}).pattern];
    const thumb = photoPath
      ? `<img class="preview" src="${photoPath}" />`
      : `<div class="pictogram-box">${PICTOGRAMS[(info || {}).pattern] || PICTOGRAMS.generic}</div>`;

    el.innerHTML = pageHeader(ex.name) + `
      <div class="page-body">
        ${thumb}
        <p class="muted">Targets: <strong>${GROUP_LABELS[ex.group] || "Custom"}</strong></p>
        ${sessions.length ? `<p class="suggestion">${trend.text}</p>` : '<p class="hint">Not logged yet — add it to a routine and log a set to start tracking.</p>'}
        ${renderSparkline(sessions.map((s) => ({ weight: s.maxWeight })))}
        ${info ? `
          <h3>How to do it</h3>
          <ol class="info-list">${info.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
          <h3>Correct form</h3>
          <ul class="info-list good">${info.goodForm.map((s) => `<li>${s}</li>`).join("")}</ul>
          <h3>Common mistakes</h3>
          <ul class="info-list bad">${info.mistakes.map((s) => `<li>${s}</li>`).join("")}</ul>
        ` : '<p class="hint">No form guide yet for your own custom exercises — log it from a routine instead.</p>'}
        ${sessions.length ? `<h3>History</h3><div id="progHistory"></div>` : ""}
      </div>
    `;
    const histEl = el.querySelector("#progHistory");
    if (histEl) {
      sessions.slice().reverse().forEach((s) => {
        const row = document.createElement("div");
        row.className = "list-item";
        row.innerHTML = `<span>${s.maxWeight}kg top set &middot; ${s.sets.length} sets</span><span class="muted">${fmtDate(s.date)}</span>`;
        histEl.appendChild(row);
      });
    }
  });
}

// ================= NUTRITION =================
function computeMaintenance() {
  const p = data.profile;
  if (!p) return null;
  const bmr = p.gender === "male"
    ? 10 * p.weight + 6.25 * p.height - 5 * p.age + 5
    : 10 * p.weight + 6.25 * p.height - 5 * p.age - 161;
  return Math.round(bmr * p.activity);
}

function renderNutrition() {
  const today = todayStr();
  const entries = data.nutrition.filter((n) => n.date === today);
  const eaten = entries.reduce((sum, n) => sum + n.calories, 0);
  const maintenance = computeMaintenance();

  document.getElementById("nutEaten").textContent = eaten;
  document.getElementById("nutMaintenance").textContent = maintenance ?? "set profile";

  const balanceEl = document.getElementById("nutBalance");
  if (maintenance == null) balanceEl.textContent = "-";
  else {
    const diff = maintenance - eaten;
    balanceEl.textContent = diff >= 0 ? `-${diff} (deficit)` : `+${Math.abs(diff)} (surplus)`;
  }

  const list = document.getElementById("foodList");
  list.innerHTML = "";
  entries.slice().reverse().forEach((n) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `<span>${n.desc}</span><span class="muted">${n.calories} cal</span>`;
    list.appendChild(row);
  });
}

document.getElementById("addFoodBtn").addEventListener("click", () => {
  document.getElementById("newFoodDesc").value = "";
  document.getElementById("newFoodCal").value = "";
  document.getElementById("addFoodModal").classList.remove("hidden");
});

document.getElementById("saveFoodBtn").addEventListener("click", () => {
  const desc = document.getElementById("newFoodDesc").value.trim();
  const calories = parseInt(document.getElementById("newFoodCal").value, 10);
  if (!desc || isNaN(calories)) { alert("Add a description and calories."); return; }
  data.nutrition.push({ id: uid(), date: todayStr(), desc, calories });
  saveData();
  document.getElementById("addFoodModal").classList.add("hidden");
  renderNutrition();
});

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", () => document.getElementById(btn.dataset.close).classList.add("hidden"));
});

// ================= PROFILE =================
function renderProfile() {
  const p = data.profile;
  if (p) {
    document.getElementById("pfWeight").value = p.weight;
    document.getElementById("pfHeight").value = p.height;
    document.getElementById("pfAge").value = p.age;
    document.getElementById("pfGender").value = p.gender;
    document.getElementById("pfActivity").value = p.activity;
  }
  if (!p) {
    document.getElementById("pfBmi").textContent = "-";
    document.getElementById("pfBmr").textContent = "-";
    document.getElementById("pfMaintenance").textContent = "-";
    document.getElementById("pfBmiLabel").textContent = "";
    return;
  }
  const bmi = p.weight / Math.pow(p.height / 100, 2);
  const bmr = p.gender === "male"
    ? 10 * p.weight + 6.25 * p.height - 5 * p.age + 5
    : 10 * p.weight + 6.25 * p.height - 5 * p.age - 161;
  const maintenance = Math.round(bmr * p.activity);
  document.getElementById("pfBmi").textContent = bmi.toFixed(1);
  document.getElementById("pfBmr").textContent = Math.round(bmr);
  document.getElementById("pfMaintenance").textContent = maintenance;
  let label = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal range" : bmi < 30 ? "Overweight" : "Obese range";
  document.getElementById("pfBmiLabel").textContent = `BMI category: ${label}`;
}

document.getElementById("saveProfileBtn").addEventListener("click", () => {
  const weight = parseFloat(document.getElementById("pfWeight").value);
  const height = parseFloat(document.getElementById("pfHeight").value);
  const age = parseInt(document.getElementById("pfAge").value, 10);
  const gender = document.getElementById("pfGender").value;
  const activity = parseFloat(document.getElementById("pfActivity").value);
  if ([weight, height, age, activity].some((v) => isNaN(v))) { alert("Fill in all fields."); return; }
  data.profile = { weight, height, age, gender, activity };
  saveData();
  renderProfile();
  renderNutrition();
});

// ---------- Backup / restore ----------
document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workout-tracker-backup-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFile").click());

document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!confirm("This will replace all current data with the backup. Continue?")) return;
      data = parsed;
      saveData();
      renderHome();
      renderNutrition();
      renderProfile();
      alert("Backup restored.");
    } catch (err) {
      alert("Could not read that file.");
    }
  };
  reader.readAsText(file);
});

// ---------- Service worker ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

// ---------- Init ----------
renderHome();
