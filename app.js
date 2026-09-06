const root = document.documentElement;
const toggle = document.querySelector("#theme-toggle");
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") root.classList.add("dark");

toggle.addEventListener("click", () => {
  root.classList.toggle("dark");
  localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
});

document.querySelector("#year").textContent = new Date().getFullYear();

const panels = [...document.querySelectorAll(".research-panel")];
const topicButtons = [...document.querySelectorAll(".topic-button")];

function setTopic(topic) {
  panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.topic === topic));
  topicButtons.forEach((button) => button.classList.toggle("active", button.dataset.topic === topic));
}

topicButtons.forEach((button) => {
  button.addEventListener("click", () => setTopic(button.dataset.topic));
});

const goalNote = document.querySelector("#goal-note");
const notes = {
  biology: "I want to stay close to real molecular mechanisms, not only abstract models.",
  data: "I use statistics, coding and AI to make biological signals more interpretable.",
  medicine: "My career goal is to help translational teams make stronger therapeutic decisions."
};

document.querySelectorAll(".future-orbit button").forEach((button) => {
  const update = () => {
    goalNote.textContent = notes[button.dataset.goal];
  };
  button.addEventListener("mouseenter", update);
  button.addEventListener("focus", update);
  button.addEventListener("click", update);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".section, .metric-strip").forEach((element) => {
  element.classList.add("reveal");
  observer.observe(element);
});

function revealVisibleNow() {
  document.querySelectorAll(".reveal").forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
      element.classList.add("visible");
    }
  });
}

window.addEventListener("load", revealVisibleNow);
window.addEventListener("hashchange", () => requestAnimationFrame(revealVisibleNow));
requestAnimationFrame(revealVisibleNow);

const canvas = document.querySelector("#rna-field");
const ctx = canvas.getContext("2d");
let width = 0;
let height = 0;
let strands = [];
let pointer = { x: 0, y: 0, active: false };

function color(name) {
  return getComputedStyle(root).getPropertyValue(name).trim();
}

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = Math.max(38, Math.min(88, Math.floor(width / 18)));
  strands = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    phase: Math.random() * Math.PI * 2,
    speed: 0.004 + Math.random() * 0.006,
    length: 34 + Math.random() * 72,
    hue: index % 3
  }));
}

function drawStrand(strand, time) {
  const phase = strand.phase + time * strand.speed;
  const driftX = Math.cos(phase * 0.75) * 0.55;
  const driftY = Math.sin(phase) * 0.42;
  strand.x = (strand.x + driftX + width) % width;
  strand.y = (strand.y + driftY + height) % height;

  if (pointer.active) {
    const dx = strand.x - pointer.x;
    const dy = strand.y - pointer.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 150) {
      strand.x += (dx / Math.max(distance, 1)) * 1.6;
      strand.y += (dy / Math.max(distance, 1)) * 1.6;
    }
  }

  const palette = [color("--teal"), color("--berry"), color("--blue")];
  ctx.strokeStyle = palette[strand.hue];
  ctx.globalAlpha = root.classList.contains("dark") ? 0.28 : 0.18;
  ctx.lineWidth = 1.2;
  ctx.beginPath();

  for (let i = 0; i < 10; i += 1) {
    const t = i / 9;
    const x = strand.x + (t - 0.5) * strand.length;
    const y = strand.y + Math.sin(t * Math.PI * 2 + phase) * 13;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.globalAlpha = root.classList.contains("dark") ? 0.32 : 0.22;
  for (let i = 1; i < 9; i += 2) {
    const t = i / 9;
    const x = strand.x + (t - 0.5) * strand.length;
    const y1 = strand.y + Math.sin(t * Math.PI * 2 + phase) * 13;
    const y2 = strand.y + Math.sin(t * Math.PI * 2 + phase + Math.PI) * 13;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
  }
}

function animate(time) {
  ctx.clearRect(0, 0, width, height);
  strands.forEach((strand) => drawStrand(strand, time));
  ctx.globalAlpha = 1;
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});
window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

resize();
requestAnimationFrame(animate);
