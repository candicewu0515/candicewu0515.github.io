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
  toggle?.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
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
