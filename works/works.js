const DEFAULT_FILTER = "all";

function getLang() {
  return (window.currentLanguage || localStorage.getItem("portfolio-lang") || "zh").toLowerCase();
}

function getText(value, fallback) {
  if (!value || typeof value !== "object") {
    return fallback;
  }
  const lang = getLang();
  return value[lang] || value.zh || value.en || fallback;
}

function getFilterLabel(filter) {
  const labels = {
    all: { zh: "全部", en: "All" },
    games: { zh: "游戏", en: "Games" },
    experiments: { zh: "实验", en: "Experiments" },
    archives: { zh: "归档", en: "Archives" }
  };
  return getText(labels[filter] || labels.all, "All");
}

function sortProjects(list) {
  return [...list].sort((a, b) => {
    if (Number(b.featured) !== Number(a.featured)) {
      return Number(b.featured) - Number(a.featured);
    }

    const aDate = Number(a.date || 0);
    const bDate = Number(b.date || 0);
    return bDate - aDate;
  });
}

function getVisibleProjects() {
  const selected = document.querySelector(".works-filter.is-active")?.dataset.filter || DEFAULT_FILTER;
  const allProjects = sortProjects(window.worksData || []);

  if (selected === DEFAULT_FILTER) {
    return allProjects;
  }

  return allProjects.filter((project) => {
    if (selected === "games") {
      return project.type === "Games & Interactive";
    }
    if (selected === "experiments") {
      return project.status === "In Progress";
    }
    if (selected === "archives") {
      return project.status === "Archived";
    }
    return true;
  });
}

function renderFilters() {
  const container = document.getElementById("worksFilters");
  if (!container) return;

  const filters = [
    { id: DEFAULT_FILTER, label: getFilterLabel(DEFAULT_FILTER) },
    { id: "games", label: getFilterLabel("games") },
    { id: "experiments", label: getFilterLabel("experiments") },
    { id: "archives", label: getFilterLabel("archives") }
  ];

  const activeFilter = document.querySelector(".works-filter.is-active")?.dataset.filter || DEFAULT_FILTER;

  container.innerHTML = filters
    .map(
      (filter) => `
        <button
          type="button"
          class="works-filter ${filter.id === activeFilter ? "is-active" : ""}"
          data-filter="${filter.id}"
          aria-pressed="${filter.id === activeFilter}"
        >
          ${filter.label}
        </button>
      `
    )
    .join("");

  container.querySelectorAll(".works-filter").forEach((button) => {
    button.addEventListener("click", () => {
      container.querySelectorAll(".works-filter").forEach((item) => {
        item.classList.toggle("is-active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
      renderProjects();
    });
  });
}

function renderProjects() {
  const container = document.getElementById("worksGrid");
  if (!container) return;

  const projects = getVisibleProjects();

  if (!projects.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>${getText({ zh: "暂时没有可显示的作品。", en: "No projects are available to show yet." }, "No projects are available to show yet.")}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = projects
    .map((project) => {
      const detailUrl = project.detailUrl || "./projects/template/index.html";
      return `
        <a class="work-card" href="${detailUrl}" aria-label="Open ${getText(project.title, project.id)}">
          <div class="work-card-media">
            <img src="${project.cover}" alt="${getText(project.title, project.id)}" loading="lazy" />
            <span class="work-card-badge">${getText(project.status === "Live" ? { zh: "上线", en: "Live" } : project.status === "In Progress" ? { zh: "开发中", en: "In Progress" } : { zh: "归档", en: "Archive" }, project.status)}</span>
          </div>
          <div class="work-card-content">
            <h3 class="work-card-title">${getText(project.title, project.id)}</h3>
            <div class="work-card-subtitle">${getText(project.subtitle, project.id)}</div>
            <p class="work-card-description">${getText(project.description, "")}</p>
            <div class="work-card-meta">
              <span>${getText(project.participation === "Independent" ? { zh: "独立项目", en: "Independent" } : { zh: "参与制作", en: "Contributing" }, project.participation)}</span>
              <span class="work-card-arrow">↗</span>
            </div>
          </div>
        </a>
      `;
    })
    .join("");
}

function refreshWorksLanguage() {
  renderFilters();
  renderProjects();
}

window.refreshWorksLanguage = refreshWorksLanguage;

const bindWorksLanguageToggle = () => {
  const trigger = document.querySelector(".lang-trigger");
  if (!trigger || trigger.dataset.bindWorks === "true") return;

  trigger.dataset.bindWorks = "true";
  trigger.addEventListener("click", () => {
    setTimeout(() => {
      refreshWorksLanguage();
    }, 0);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  renderFilters();
  renderProjects();
  bindWorksLanguageToggle();
});
