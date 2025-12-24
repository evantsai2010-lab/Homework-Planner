let assignments = [];

const titleInput = document.getElementById("title");
const subjectInput = document.getElementById("subject");
const dueInput = document.getElementById("due");
const minutesInput = document.getElementById("minutes");
const difficultyInput = document.getElementById("difficulty");
const importanceInput = document.getElementById("importance");
const startTimeInput = document.getElementById("startTime");
const addBtn = document.getElementById("addBtn");
const generateBtn = document.getElementById("generateBtn");

const colorButtons = document.querySelectorAll('.color-btn');
let selectedColor = "#1e88e5";

colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedColor = btn.getAttribute('data-color');
    colorButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// ---------- ADD ASSIGNMENT ----------
addBtn.onclick = () => {
  const assignment = {
    title: titleInput.value,
    subject: subjectInput.value || "General",
    color: selectedColor,
    due: new Date(dueInput.value),
    minutes: Number(minutesInput.value),
    difficulty: Number(difficultyInput.value),
    importance: Number(importanceInput.value)
  };
  if (!assignment.title || !assignment.due || !assignment.minutes) {
    alert("Please fill Assignment name, Due date, and Minutes.");
    return;
  }

  assignments.push(assignment);

  // Clear inputs
  titleInput.value = "";
  subjectInput.value = "";
  dueInput.value = "";
  minutesInput.value = "";
  difficultyInput.value = "";
  importanceInput.value = "";
};

// ---------- GENERATE SCHEDULE ----------
generateBtn.onclick = () => {
  timeline.innerHTML = "";
  let currentTime = parseTime(startTimeInput.value);

  assignments.forEach(task => {
    let remaining = task.minutes;
    while (remaining > 0) {
      let blockMinutes = Math.min(50, remaining);
      let endTime = addMinutes(currentTime, blockMinutes);
      renderBlock(formatTime(currentTime), formatTime(endTime), task.title, task.subject, task.color);
      currentTime = endTime;
      remaining -= blockMinutes;
    }
  });
};

// ---------- RENDERING ----------
function renderBlock(start, end, title, subject, color) {
  const block = document.createElement('div');
  block.className = 'schedule-block';
  block.style.backgroundColor = color;
  block.style.borderLeft = `6px solid ${color}`;
  block.innerHTML = `<strong>${start} – ${end}</strong> ${title} (${subject})`;
  timeline.appendChild(block);
}

// ---------- HELPERS ----------
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
