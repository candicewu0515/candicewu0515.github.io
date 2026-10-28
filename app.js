// All page content is visible without JavaScript. Enhancements must never gate reading.
const root = document.documentElement;
const toggle = document.querySelector("#theme-toggle");

try {
  if (localStorage.getItem("theme") === "dark") root.classList.add("dark");
} catch {
  // Storage may be blocked in private or restricted browser sessions.
}

function updateThemeLabel() {
  const dark = root.classList.contains("dark");
  const chinese = root.lang.startsWith("zh");
  const label = chinese ? (dark ? "切换到浅色主题" : "切换到深色主题") : (dark ? "Switch to light theme" : "Switch to dark theme");
  toggle?.setAttribute("aria-label", label);
  toggle?.setAttribute("title", label);
  toggle?.setAttribute("aria-pressed", String(dark));
}

updateThemeLabel();
toggle?.addEventListener("click", () => {
  root.classList.toggle("dark");
  updateThemeLabel();
  try {
    localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
  } catch {
    // Theme switching still works when the preference cannot be saved.
  }
});

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

// Decorative DNA stays behind opaque reading sections and never controls visibility.
function startDNAField() {
  const canvas = document.querySelector("#dna-field");
  const ctx = canvas?.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let strands = [];
  let palette = [];
  let frame = null;
  let lastFrame = 0;
  let elapsed = 0;

  function updatePalette() {
    const styles = getComputedStyle(root);
    palette = ["--teal", "--blue", "--berry"].map(name => styles.getPropertyValue(name).trim());
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const margin = document.querySelector("main").getBoundingClientRect().left;
    const edgeCount = width < 600 ? 5 : 7;
    strands = [];
    // Keep a visible, evenly spaced group in each outer margin.
    for (let side = 0; side < 2; side++) {
      for (let i = 0; i < edgeCount; i++) {
        strands.push({
          x: side ? width - margin / 2 : margin / 2,
          y: (i + .5) * height / edgeCount,
          length: Math.min(80, Math.max(40, margin * .72)),
          phase: i * 1.7 + side * 2.4,
          angle: (i % 3 - 1) * .35,
          color: (i + side) % 3,
          drift: Math.min(14, margin * .1)
        });
      }
    }
    // The open spaces around the home portrait and title get a little movement too.
    for (let i = 0; i < 12; i++) {
      strands.push({
        x: width * (.1 + (i % 4) * .26),
        y: height * (.12 + Math.floor(i / 4) * .31),
        length: 58 + (i % 3) * 12,
        phase: i * 1.3,
        angle: (i % 3 - 1) * .3,
        color: i % 3,
        drift: 16
      });
    }
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    strands.forEach(strand => {
      const phase = strand.phase + elapsed * .42;
      ctx.save();
      ctx.translate(strand.x + Math.sin(phase * .6) * strand.drift,
        strand.y + Math.cos(phase * .45) * 20);
      ctx.rotate(strand.angle);
      ctx.strokeStyle = palette[strand.color];
      ctx.lineWidth = 1.3;
      ctx.globalAlpha = root.classList.contains("dark") ? .38 : .26;
      // Two complementary backbones and the base-pair rungs between them.
      for (const direction of [-1, 1]) {
        ctx.beginPath();
        for (let i = 0; i <= 32; i++) {
          const t = i / 32;
          const x = (t - .5) * strand.length;
          const y = direction * Math.sin(t * Math.PI * 2 + phase) * 10;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha *= .7;
      ctx.beginPath();
      for (let i = 1; i < 10; i++) {
        const t = i / 10;
        const x = (t - .5) * strand.length;
        const y = Math.sin(t * Math.PI * 2 + phase) * 10;
        ctx.moveTo(x, y);
        ctx.lineTo(x, -y);
      }
      ctx.stroke();
      ctx.restore();
    });
  }

  function animate(time) {
    if (time - lastFrame >= 1000 / 30) {
      elapsed += Math.min((time - lastFrame) / 1000, .1);
      lastFrame = time;
      draw();
    }
    frame = requestAnimationFrame(animate);
  }

  function updateMotion() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    if (document.hidden || reducedMotion.matches) {
      draw();
      return;
    }
    lastFrame = performance.now();
    frame = requestAnimationFrame(animate);
  }

  updatePalette();
  resize();
  updateMotion();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", updateMotion);
  reducedMotion.addEventListener("change", updateMotion);
  toggle?.addEventListener("click", () => { updatePalette(); draw(); });
}

startDNAField();
