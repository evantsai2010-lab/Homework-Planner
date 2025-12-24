let assignments = JSON.parse(localStorage.getItem("assignments")) || [];

const addBtn = document.getElementById("addBtn");
const generateBtn = document.getElementById("generateBtn");
const timeline = document.getElementById("timeline");

let animationDelay = 0; // for staggered animation

addBtn.onclick = () => {
  const assignment = {
    title: title.value,
    due: new Date(due.value),
    minutes: Number(minutes.value),
    difficulty: Number(difficulty.value),
    importance: Number(importance.value)
  };

  assignments.push(assignment);
  localStorage.setItem("assignments", JSON.stringify(assignments));
  alert("Assignment added.");
};

generateBtn.onclick = () => {
  timeline.innerHTML = "";
  animationDelay = 0;
  let currentTime = parseTime(startTime.value);

  const sorted = assignments
    .map(a => ({ ...a, score: priorityScore(a) }))
    .sort((a, b) => b.score - a.score);

  sorted.forEach((task, index) => {
    let remaining = task.minutes;

    while (remaining > 0) {
      let blockMinutes = Math.min(50, remaining);
      let endTime = addMinutes(currentTime, blockMinutes);

      renderBlock(
        formatTime(currentTime),
        formatTime(endTime),
        task.title,
        explanation(task),
        task.score
      );

      currentTime = endTime;
      remaining -= blockMinutes;

      if (remaining > 0 || index < sorted.length - 1) {
        let breakEnd = addMinutes(currentTime, 10);
        renderBreak(formatTime(currentTime), formatTime(breakEnd));
        currentTime = breakEnd;
      }
    }
  });
};

// ---------- LOGIC ----------
function priorityScore(a) {
  const daysUntilDue = Math.max(
    1,
    (a.due - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    (1 / daysUntilDue) * 4 +
    a.difficulty * 2 +
    a.importance * 3 +
    a.minutes / 30
  );
}

// ---------- RENDERING ----------
function renderBlock(start, end, title, reason, score) {
  const block = document.createElement('div');
  block.className = 'schedule-block ' + priorityClass(score);
  block.style.animationDelay = `${animationDelay}s`;
  block.innerHTML = `
    <strong>${start} – ${end}</strong><br>
    <em>${title}</em><br>
    <small>${reason}</small>
  `;
  timeline.appendChild(block);
  animationDelay += 0.15;
}

function renderBreak(start, end) {
  const block = document.createElement('div');
  block.className = 'schedule-block break';
  block.style.animationDelay = `${animationDelay}s`;
  block.innerHTML = `
    <strong>${start} – ${end}</strong><br>
    <em>Break / Rest</em><br>
    <small>Recovery time to prevent burnout.</small>
  `;
  timeline.appendChild(block);
  animationDelay += 0.15;
}

// Assign color class based on score
function priorityClass(score) {
  if(score >= 10) return 'high';
  if(score >= 6) return 'medium';
  return 'low';
}

// ---------- HELPERS ----------
function explanation(task) {
  if (task.difficulty >= 4)
    return "Scheduled early because it requires high focus.";
  if (task.importance >= 4)
    return "High impact assignment prioritized.";
  return "Lower intensity task scheduled when energy is reduced.";
}

function parseTime(t) {
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function addMinutes(date, mins) {
  return new Date(date.getTime() + mins * 60000);
}

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
