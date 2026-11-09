
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const scrollTopBadge = document.getElementById("scrollTopBadge");
const languageSwitch = document.querySelector(".language-switch");
const langTrigger = document.querySelector(".lang-trigger");
const currentLangLabel = document.querySelector("[data-lang-label]");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        if (navLinks) {
            navLinks.classList.remove("active");
        }
    });
});

function applyTranslations(language) {
    const langData = (window.translations || translations)?.[language];
    if (!langData) return;

    window.currentLanguage = language;
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-i18n]").forEach(node => {
        const key = node.dataset.i18n;
        const value = langData[key];

        if (value === undefined) return;

        if (node.dataset.i18nHtml === "true") {
            node.innerHTML = value;
        } else {
            node.textContent = value;
        }
    });

    if (currentLangLabel) {
        currentLangLabel.textContent = language === "zh" ? "EN" : "中文";
    }

    if (typeof window.refreshGameLibraryLanguage === "function") {
        window.refreshGameLibraryLanguage();
    }
}

if (languageSwitch && langTrigger) {
    const storedLang = localStorage.getItem("portfolio-lang") || "zh";

    langTrigger.addEventListener("click", () => {
        const nextLanguage = window.currentLanguage === "zh" ? "en" : "zh";
        localStorage.setItem("portfolio-lang", nextLanguage);
        applyTranslations(nextLanguage);
    });

    applyTranslations(storedLang);
} else {
    document.documentElement.lang = "zh-CN";
}

if (scrollTopBadge) {
    const updateBadgePosition = (event) => {
        const offsetX = (event.clientX / window.innerWidth - 0.5) * 12;
        const offsetY = (event.clientY / window.innerHeight - 0.5) * 10;
        scrollTopBadge.style.setProperty("--move-x", `${offsetX}px`);
        scrollTopBadge.style.setProperty("--move-y", `${offsetY}px`);
    };

    const toggleScrollTopBadge = () => {
        scrollTopBadge.classList.toggle("visible", window.scrollY > 300);
    };

    scrollTopBadge.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", toggleScrollTopBadge, { passive: true });
    window.addEventListener("mousemove", updateBadgePosition, { passive: true });
    toggleScrollTopBadge();
    updateBadgePosition({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
}
