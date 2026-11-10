function getSupportLang() {
  return (window.currentLanguage || localStorage.getItem("portfolio-lang") || "zh").toLowerCase();
}

function readSupportText(value, fallback) {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const lang = getSupportLang();
  return value[lang] || value.zh || value.en || fallback;
}

function resolveInlineTitle(element) {
  const lang = getSupportLang();
  const rawTitle = element.dataset.supportTitleZh;
  const rawTitleEn = element.dataset.supportTitleEn;

  if (lang === "en" && rawTitleEn) {
    return rawTitleEn;
  }

  if (rawTitle) {
    return rawTitle;
  }

  return readSupportText({ zh: "喜欢这个作品？", en: "Like this project?" }, "Like this project?");
}

function renderSupportModule(element) {
  const config = window.supportConfig || {};
  const mode = element.dataset.support || "full";
  const isCompact = mode === "compact";

  const enabledChannels = Object.entries(config)
    .filter(([key, value]) => key !== "enabled" && key !== "message" && value && value.enabled)
    .map(([key, value]) => ({ key, ...value }));

  const title = resolveInlineTitle(element);
  const fallbackText = readSupportText({ zh: "当前暂无公开支持入口，感谢你的理解与鼓励。", en: "There is no public support channel enabled right now. Thank you for your understanding and encouragement." }, "No public support channel is enabled yet.");

  const cards = enabledChannels
    .map((channel) => `
      <a class="support-channel" href="${channel.url}" target="_blank" rel="noopener noreferrer">
        <span class="support-channel-label">${channel.label}</span>
        <span class="support-channel-copy">${readSupportText(channel.description, "Support this project.")}</span>
      </a>
    `)
    .join("");

  const body = enabledChannels.length
    ? `<div class="support-grid">${cards}</div>`
    : `<p class="support-card-copy">${fallbackText}</p>`;

  const collapsedState = isCompact ? "<div class=\"support-panel-body\" hidden>" : "<div class=\"support-panel-body\">";

  element.innerHTML = `
    <div class="support-card ${isCompact ? "compact" : "full"}">
      ${isCompact ? `
        <button class="support-toggle" type="button" aria-expanded="false">
          <span>${title}</span>
          <span class="support-toggle-icon">＋</span>
        </button>
      ` : `<p class="support-card-title">${title}</p>`}
      ${collapsedState}${body}</div>
    </div>
  `;

  if (isCompact) {
    const toggle = element.querySelector(".support-toggle");
    const panelBody = element.querySelector(".support-panel-body");
    if (toggle && panelBody) {
      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        toggle.querySelector(".support-toggle-icon").textContent = isOpen ? "＋" : "－";
        panelBody.hidden = isOpen;
      });
    }
  }
}

function renderSupportPage() {
  const container = document.getElementById("supportList");
  if (!container) return;

  const config = window.supportConfig || {};
  const enabledChannels = Object.entries(config)
    .filter(([key, value]) => key !== "enabled" && key !== "message" && value && value.enabled)
    .map(([key, value]) => ({ key, ...value }));

  if (!enabledChannels.length) {
    container.innerHTML = `
      <div class="support-empty">
        <p data-i18n="supportNoChannelText">No public support channel is enabled yet. Thank you for your understanding.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = enabledChannels
    .map((channel) => `
      <a class="support-panel" href="${channel.url}" target="_blank" rel="noopener noreferrer">
        <span class="support-panel-label">${channel.label}</span>
        <span class="support-panel-copy">${readSupportText(channel.description, "Support this project.")}</span>
      </a>
    `)
    .join("");
}

function refreshSupportLanguage() {
  document.querySelectorAll("[data-support]").forEach((element) => renderSupportModule(element));
  renderSupportPage();
}

window.refreshSupportLanguage = refreshSupportLanguage;

const bindSupportLanguageToggle = () => {
  const trigger = document.querySelector(".lang-trigger");
  if (!trigger || trigger.dataset.bindSupport === "true") return;

  trigger.dataset.bindSupport = "true";
  trigger.addEventListener("click", () => {
    setTimeout(() => {
      refreshSupportLanguage();
    }, 0);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-support]").forEach((element) => renderSupportModule(element));
  renderSupportPage();
  bindSupportLanguageToggle();
});
