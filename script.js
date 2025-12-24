let assignments = JSON.parse(localStorage.getItem("assignments")) || [];

const addBtn = document.getElementById("addBtn");
const generateBtn = document.getElementById("generateBtn");
const timeline = document.getElementById("timeline");

let animationDelay = 0;

addBtn.onclick = () => {
  const assignment = {
    title: title.value,
    subject: subject.value || "General",
    color: color.value || "#1e88e5",
    due: new Date(due.value),
    minutes: Number(minutes.value),
    difficulty: Number(difficulty.value),
    importance: Number(importance.value)
  };

  if (!assignment.title || !assignment.due || !assignment.minutes) {
    alert("Please fill in Assignment name, Due date, and Minutes needed.");
    return;
  }

  assignments.push(assignment);
  localStorage.setItem("assignments", JSON.stringify(assignments));
  alert("Assignment added.");

  // Clear input fields
  title.value = "";
  subject.value = "";
  color.value = "#1e88e5";
  due.value = "";
  minutes.value = "";
  difficulty.value = "";
  importance.value = "";
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
        task.subject,
        task.color
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
  const daysUntilDue = Math.max(1, (a.due - new Date()) / (1000 * 60 * 60 * 24));
  return (1 / daysUntilDue) * 4 + a.difficulty * 2 + a.importance * 3 + a.minutes / 30;
}

// ---------- RENDERING ----------
function renderBlock(start, end, title, reason, subject, color) {
  const block = document.createElement('div');
  block.className = `schedule-block`;
  block.style.backgroundColor = color;
  block.style.borderLeft = `6px solid ${darkenColor(color, 20)}`;
  block.style.animationDelay = `${animationDelay}s`;
  block.innerHTML = `
    <strong>${start} – ${end}</strong><br>
    <em>${title} (${subject})</em><br>
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

// ---------- HELPERS ----------
function explanation(task) {
  if (task.difficulty >= 4) return "Scheduled early because it requires high focus.";
  if (task.importance >= 4) return "High impact assignment prioritized.";
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

// Darken color helper for border contrast
function darkenColor(hex, percent) {
  let num = parseInt(hex.replace("#",""),16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
  return "#" + (
    0x1000000 + 
    (R<255?R<1?0:R:255)*0x10000 + 
    (G<255?G<1?0:G:255)*0x100 + 
    (B<255?B<1?0:B:255)
  ).toString(16).slice(1);
}
