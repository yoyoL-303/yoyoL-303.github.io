(function () {
    const STORAGE_KEY = "portfolio-lang";
    const DEFAULT_LANGUAGE = "zh";

    function getStoredLanguage() {
        try {
            return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
        } catch (error) {
            return DEFAULT_LANGUAGE;
        }
    }

    function setDocumentLanguage(language) {
        document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    }

    function applyTranslations(language) {
        const langData = window.translations?.[language];
        if (!langData) return;

        window.currentLanguage = language;
        setDocumentLanguage(language);

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

        const currentLangLabel = document.querySelector("[data-lang-label]");
        if (currentLangLabel) {
            currentLangLabel.textContent = language === "zh" ? "EN" : "中文";
        }

        const langTrigger = document.querySelector(".lang-trigger");
        if (langTrigger) {
            langTrigger.setAttribute("aria-label", language === "zh" ? "Switch to English" : "切换为中文");
        }

        if (typeof window.refreshGameLibraryLanguage === "function" && document.getElementById("gameGrid")) {
            window.refreshGameLibraryLanguage();
        }
    }

    function bindNavigation() {
        const menuToggle = document.getElementById("menuToggle");
        const navLinks = document.getElementById("navLinks");

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
    }

    function bindLanguageToggle() {
        const langTrigger = document.querySelector(".lang-trigger");
        const storedLanguage = getStoredLanguage();

        if (!langTrigger) {
            applyTranslations(storedLanguage);
            return;
        }

        langTrigger.addEventListener("click", () => {
            const currentLanguage = window.currentLanguage || getStoredLanguage();
            const nextLanguage = currentLanguage === "zh" ? "en" : "zh";

            try {
                localStorage.setItem(STORAGE_KEY, nextLanguage);
            } catch (error) {
                // Ignore storage errors and continue with in-memory update.
            }

            applyTranslations(nextLanguage);
        });

        applyTranslations(storedLanguage);
    }

    bindNavigation();
    bindLanguageToggle();
})();
