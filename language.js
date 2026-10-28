// Both languages are complete static pages. These enhancements remember the reader's choice.
(() => {
  const preferenceKey = "xia-wu-language";
  const positionKey = "xia-wu-reading-position";
  const pageLanguage = document.documentElement.lang.startsWith("zh") ? "zh" : "en";
  const url = new URL(window.location.href);
  const requested = url.searchParams.get("lang");
  const explicitLanguage = ["en", "zh"].includes(requested) ? requested : null;
  let savedLanguage = null;
  try { savedLanguage = localStorage.getItem(preferenceKey); } catch { /* Optional storage. */ }

  // A direct Chinese URL always opens Chinese; only the default entry follows a saved choice.
  const desired = explicitLanguage || (pageLanguage === "en" && savedLanguage === "zh" ? "zh" : pageLanguage);
  if (desired !== pageLanguage) {
    const target = new URL(desired === "zh" ? "zh.html" : "index.html", url);
    target.search = url.search;
    target.searchParams.set("lang", desired);
    target.hash = url.hash;
    window.location.replace(target.href);
    return;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const links = [...document.querySelectorAll("[data-language]")];
    // The two pages share this element order, including paragraph and chapter boundaries.
    const blocks = [...document.querySelectorAll("main h1, main h2, main h3, main p, .work-grid li")]
      .filter(element => !element.closest(".story-index"));
    const readingLine = () => document.querySelector(".site-header").getBoundingClientRect().bottom + 20;

    function capturePosition() {
      if (window.scrollY < 2) return { top: true, anchor: "home" };
      const line = readingLine();
      const candidates = blocks.map((element, index) => ({ element, index, rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => rect.height > 0 && rect.bottom > line);
      const containing = candidates.filter(({ rect }) => rect.top <= line)
        .sort((a, b) => a.rect.height - b.rect.height);
      const item = containing[0] || candidates.sort((a, b) => a.rect.top - b.rect.top)[0];
      if (!item) return { anchor: "goal" };
      return {
        index: item.index,
        progress: Math.max(0, Math.min(1, (line - item.rect.top) / item.rect.height)),
        offset: Math.max(0, item.rect.top - line),
        anchor: item.element.closest(".story-chapter[id], section[id]")?.id || "home"
      };
    }

    function updateLinks() {
      links.forEach(link => {
        const target = new URL(link.href);
        target.hash = window.location.hash;
        link.href = target.href;
      });
    }
    updateLinks();
    window.addEventListener("hashchange", updateLinks);

    links.forEach(link => {
      link.addEventListener("click", event => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const language = link.dataset.language;
        if (language === pageLanguage) {
          event.preventDefault();
          return;
        }
        const position = capturePosition();
        const target = new URL(link.href);
        target.hash = position.anchor;
        link.href = target.href;
        try { localStorage.setItem(preferenceKey, language); } catch { /* The link still works. */ }
        try {
          sessionStorage.setItem(positionKey, JSON.stringify({ ...position, language, created: Date.now() }));
        } catch { /* The chapter hash remains a useful fallback. */ }
      });
    });

    let pending;
    try {
      pending = JSON.parse(sessionStorage.getItem(positionKey) || "null");
      sessionStorage.removeItem(positionKey);
    } catch { pending = null; }
    if (!pending || pending.language !== pageLanguage || Date.now() - pending.created > 120000) return;

    function restorePosition() {
      if (pending.top) {
        window.scrollTo(0, 0);
        return;
      }
      const element = blocks[pending.index];
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const target = window.scrollY + rect.top + pending.progress * rect.height - readingLine() - pending.offset;
      window.scrollTo(0, Math.max(0, target));
    }
    // Wait for the browser's normal fragment jump before restoring the corresponding paragraph.
    window.addEventListener("pageshow", () => requestAnimationFrame(restorePosition), { once: true });
  });
})();
