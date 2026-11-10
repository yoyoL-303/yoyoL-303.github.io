document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.querySelector(".lang-trigger");
  if (trigger && !trigger.dataset.bindProjectDetail) {
    trigger.dataset.bindProjectDetail = "true";
    trigger.addEventListener("click", () => {
      setTimeout(() => {
        const elements = document.querySelectorAll("[data-i18n]");
        elements.forEach((node) => {
          const key = node.getAttribute("data-i18n");
          if (window.translations && window.translations[window.currentLanguage || localStorage.getItem("portfolio-lang") || "zh"]?.[key]) {
            node.textContent = window.translations[window.currentLanguage || localStorage.getItem("portfolio-lang") || "zh"][key];
          }
        });
      }, 0);
    });
  }
});
