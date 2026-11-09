
const gameGrid = document.getElementById("gameGrid");
const workFilterBar = document.getElementById("workFilterBar");
const gameModal = document.getElementById("gameModal");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");
const modalBackdrop = document.getElementById("modalBackdrop");

const filterOptions = [
    { id: "all", labelKey: "workFilterAll", defaultLabel: "全部" },
    { id: "game", labelKey: "workFilterGame", defaultLabel: "游戏" },
    { id: "drama", labelKey: "workFilterDrama", defaultLabel: "漫剧" },
    // { id: "social", labelKey: "workFilterSocial", defaultLabel: "社媒" }
    
];

let activeFilter = "all";

// 防止游戏资料中的特殊字符破坏 HTML
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function getCurrentLanguage() {
    return window.currentLanguage || localStorage.getItem("portfolio-lang") || "zh";
}

function getTranslation(key, fallback = "") {
    const lang = getCurrentLanguage();
    const langData = window.translations?.[lang];
    return (langData && langData[key]) || fallback;
}

function getLocalizedValue(value, fallback = "") {
    if (!value) return fallback;
    if (typeof value === "object") {
        const lang = getCurrentLanguage();
        return value[lang] || value.zh || value.en || fallback;
    }
    return value;
}

function getGameText(game, key, fallback = "") {
    return getLocalizedValue(game?.[key], fallback);
}

function normalizeTag(tag = "") {
    return String(tag).trim().toLowerCase().replace(/\s+/g, "");
}

function getGameTags(game = {}) {
    if (Array.isArray(game.tags) && game.tags.length) {
        return game.tags;
    }

    if (game.type) {
        return [game.type];
    }

    const categoryText = getGameText(game, "category", "");
    const categoryKey = normalizeTag(categoryText);

    if (!categoryKey) {
        return ["game"];
    }

    const categoryMap = {
        "游戏项目": ["game"],
        "gameproject": ["game"],
        "游戏": ["game"],
        "社媒": ["social"],
        "social": ["social"],
        "socialmedia": ["social"],
        "ai视频": ["drama"],
        "aivideo": ["drama"],
        "drama": ["drama"],
        "ai视频项目": ["drama"],
        "aivideoproject": ["drama"]
    };

    return categoryMap[categoryKey] || ["game"];
}

function renderFilterBar() {
    if (!workFilterBar) return;

    workFilterBar.innerHTML = filterOptions.map(option => {
        const label = getTranslation(option.labelKey, option.defaultLabel);
        const isActive = activeFilter === option.id;

        return `
            <button
                type="button"
                class="work-filter-btn${isActive ? " active" : ""}"
                data-filter="${option.id}"
                aria-pressed="${isActive ? "true" : "false"}">
                ${escapeHTML(label)}
            </button>
        `;
    }).join("");

    workFilterBar.querySelectorAll(".work-filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            const nextFilter = button.dataset.filter || "all";
            activeFilter = nextFilter;
            renderFilterBar();
            renderGameLibrary();
        });
    });
}

function matchesActiveFilter(game) {
    if (activeFilter === "all") {
        return true;
    }

    return getGameTags(game).some(tag => normalizeTag(tag) === activeFilter);
}

// 媒体排序：视频优先，图片随后
function sortMedia(media = []) {
    const validMedia = Array.isArray(media)
        ? media.filter(item =>
            item &&
            ["video", "image", "embed"].includes(item.type) &&
            item.src
        )
        : [];

    return [
        ...validMedia.filter(item =>
            item.type === "video" || item.type === "embed"
        ),
        ...validMedia.filter(item => item.type === "image")
    ];
}

// 生成游戏封面
function renderGameLibrary() {
    if (!gameGrid || typeof games === "undefined") return;

    const filteredGames = games.filter(matchesActiveFilter);

    if (!filteredGames.length) {
        gameGrid.innerHTML = `
            <div class="game-empty-state">
                ${getTranslation("librarySoon", "COMING SOON")}
            </div>
        `;
        return;
    }

    gameGrid.innerHTML = filteredGames.map((game, index) => {
        const number = String(index + 1).padStart(2, "0");
        const title = getGameText(game, "title");
        const englishTitle = getGameText(game, "englishTitle", "");
        const category = getGameText(game, "category", getTranslation("libraryGameProject", "GAME PROJECT"));
        const status = getGameText(game, "status", getTranslation("libraryGameProject", "GAME PROJECT"));
        const overlayText = getTranslation("libraryViewDetails", "VIEW DETAILS ↗");
        const newProjectText = getTranslation("libraryNewProject", "NEW PROJECT");
        const comingSoonText = getTranslation("libraryComingSoon", "COMING SOON");

        if (game.placeholder) {
            return `
                <div class="game-card game-placeholder">
                    <div class="game-cover">
                        <span class="game-number">${number}</span>
                        <div class="placeholder-content">
                            <span class="placeholder-plus">+</span>
                            <span>${newProjectText}</span>
                        </div>
                        <span class="game-card-status">${comingSoonText}</span>
                    </div>
                </div>
            `;
        }

        const cover = game.cover
            ? `<img src="${escapeHTML(game.cover)}"
                    alt="${escapeHTML(title)} cover">`
            : `<div class="generated-cover ${escapeHTML(game.coverStyle || "")}">
                    <span class="cover-decoration">${escapeHTML(englishTitle || "")}</span>
                    <strong>${escapeHTML(title)}</strong>
               </div>`;

        return `
            <button class="game-card"
                    type="button"
                    data-game-id="${escapeHTML(game.id)}"
                    aria-label="${getTranslation("libraryViewDetails", "VIEW DETAILS")}：${escapeHTML(title)}">

                <div class="game-cover">
                    ${cover}
                    <span class="game-number">${number}</span>
                    <span class="game-card-status">${escapeHTML(status)}</span>
                    <span class="game-card-overlay">${overlayText}</span>
                </div>

                <div class="game-card-info">
                    <span class="game-category">${escapeHTML(category)}</span>
                    <h3>${escapeHTML(title)}</h3>
                    <span class="game-english-title">${escapeHTML(englishTitle || "")}</span>
                </div>
            </button>
        `;
    }).join("");

    const cards = gameGrid.querySelectorAll("[data-game-id]");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            openGameDetail(card.dataset.gameId);
        });

        card.addEventListener("pointerenter", () => {
            cards.forEach(item => item.classList.toggle("is-active", item === card));
        });

        card.addEventListener("pointerleave", () => {
            cards.forEach(item => item.classList.remove("is-active"));
        });
    });
}

// 生成主展示区媒体
function renderMainMedia(item) {
    if (item.type === "video") {
        return `
            <video
                class="media-main-video"
                src="${escapeHTML(item.src)}"
                ${item.poster ? `poster="${escapeHTML(item.poster)}"` : ""}
                controls
                playsinline
                preload="metadata">
                Your browser does not support video playback.
            </video>
        `;
    }

    if (item.type === "embed") {
        return `
            <iframe
                class="media-main-embed"
                src="${escapeHTML(item.src)}"
                title="${escapeHTML(item.caption || "Game video")}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy">
            </iframe>
        `;
    }

    return `
        <img
            class="media-main-image"
            src="${escapeHTML(item.src)}"
            alt="${escapeHTML(item.caption || "Game screenshot")}"
            loading="lazy">
    `;
}

// 生成缩略图
function renderMediaThumbnail(item, index) {
    if (item.type === "video" || item.type === "embed") {
        const preview = item.poster
            ? `<img src="${escapeHTML(item.poster)}" alt="">`
            : `<div class="media-thumb-video-placeholder">
                    <span>▶</span>
                    <small>VIDEO</small>
               </div>`;

        return `
            <button
                class="media-thumb"
                type="button"
                data-media-index="${index}"
                aria-label="播放视频 ${index + 1}">
                ${preview}
                <span class="media-thumb-play">▶</span>
            </button>
        `;
    }

    return `
        <button
            class="media-thumb"
            type="button"
            data-media-index="${index}"
            aria-label="查看图片 ${index + 1}">
            <img src="${escapeHTML(item.src)}"
                 alt="${escapeHTML(item.caption || "Game screenshot")}">
        </button>
    `;
}

// 生成 GAME MEDIA 轮播区域
function renderMedia(media = []) {
    const sortedMedia = sortMedia(media);

    if (!sortedMedia.length) {
        return `
            <div class="media-empty">
                <span>${getTranslation("libraryGameMedia", "MEDIA GALLERY")}</span>
                <p>${getTranslation("libraryMediaEmptyText", "Game screenshots and videos are being updated.")}</p>
            </div>
        `;
    }

    const firstMedia = sortedMedia[0];

    return `
        <div class="media-carousel" data-media-carousel>

            <!-- 主展示区 -->
            <div class="media-stage">
                <div class="media-stage-content" data-media-stage>
                    ${renderMainMedia(firstMedia)}
                </div>

                <button class="media-arrow media-prev"
                        type="button"
                        data-media-prev
                        aria-label="上一项">
                    ‹
                </button>

                <button class="media-arrow media-next"
                        type="button"
                        data-media-next
                        aria-label="下一项">
                    ›
                </button>

                <span class="media-counter" data-media-counter>
                    01 / ${String(sortedMedia.length).padStart(2, "0")}
                </span>
            </div>

            <!-- 缩略图列表 -->
            <div class="media-thumbnails" data-media-thumbnails>
                ${sortedMedia.map((item, index) =>
                    renderMediaThumbnail(item, index)
                ).join("")}
            </div>

            <p class="media-caption" data-media-caption>
                ${escapeHTML(firstMedia.caption || "")}
            </p>

        </div>
    `;
}

// 绑定轮播交互
function bindMediaCarousel() {
    const carousel = modalContent.querySelector("[data-media-carousel]");

    if (!carousel) return;

    const media = carousel._mediaItems || [];
    if (!media.length) return;

    const stage = carousel.querySelector("[data-media-stage]");
    const thumbnails = carousel.querySelectorAll("[data-media-index]");
    const prevButton = carousel.querySelector("[data-media-prev]");
    const nextButton = carousel.querySelector("[data-media-next]");
    const counter = carousel.querySelector("[data-media-counter]");
    const caption = carousel.querySelector("[data-media-caption]");

    let currentIndex = 0;

    function showMedia(index) {
        if (index < 0 || index >= media.length) return;

        // 切换前暂停正在播放的视频
        const currentVideo = stage.querySelector("video");

        if (currentVideo) {
            currentVideo.pause();
        }

        currentIndex = index;

        // 更新主展示区
        stage.innerHTML = renderMainMedia(media[currentIndex]);

        // 更新缩略图高亮
        thumbnails.forEach((thumb, thumbIndex) => {
            const isActive = thumbIndex === currentIndex;

            thumb.classList.toggle("active", isActive);
            thumb.setAttribute("aria-current", isActive ? "true" : "false");
        });

        // 更新计数器
        counter.textContent =
            `${String(currentIndex + 1).padStart(2, "0")} / ${String(media.length).padStart(2, "0")}`;

        // 更新说明文字
        caption.textContent = media[currentIndex].caption || "";

        // 让当前缩略图保持在可见区域
        thumbnails[currentIndex].scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest"
        });
    }

    thumbnails.forEach(thumb => {
        thumb.addEventListener("click", () => {
            showMedia(Number(thumb.dataset.mediaIndex));
        });
    });

    prevButton.addEventListener("click", () => {
        const nextIndex = (currentIndex - 1 + media.length) % media.length;
        showMedia(nextIndex);
    });

    nextButton.addEventListener("click", () => {
        const nextIndex = (currentIndex + 1) % media.length;
        showMedia(nextIndex);
    });

    // 只有一项媒体时隐藏切换箭头
    if (media.length <= 1) {
        prevButton.hidden = true;
        nextButton.hidden = true;
    }

    // 保存排序后的媒体数据，供轮播使用
    carousel._mediaItems = media;

    showMedia(0);
}

// 打开游戏详情
function openGameDetail(gameId) {
    const game = games.find(item => item.id === gameId);

    if (!game) return;

    const localizedTitle = getGameText(game, "title");
    const localizedEnglishTitle = getGameText(game, "englishTitle", "");
    const localizedCategory = getGameText(game, "category", getTranslation("libraryGameProject", "GAME PROJECT"));
    const localizedStatus = getGameText(game, "status", getTranslation("libraryGameProject", "GAME PROJECT"));
    const localizedDescription = getGameText(game, "description", "");
    const localizedRole = getGameText(game, "role", "");
    const localizedYear = getGameText(game, "year", "");
    const localizedPlatform = getGameText(game, "platform", "");

    const cover = game.cover
        ? `<img class="modal-cover-image"
                src="${escapeHTML(game.cover)}"
                alt="${escapeHTML(localizedTitle)}">`
        : `<div class="modal-cover-placeholder ${escapeHTML(game.coverStyle || "")}">
                <span>${escapeHTML(localizedEnglishTitle || "")}</span>
                <strong>${escapeHTML(localizedTitle)}</strong>
           </div>`;

    const sortedMedia = sortMedia(game.media);
    gameModal.dataset.gameId = game.id;

    modalContent.innerHTML = `
        <div class="modal-hero">
            <div class="modal-cover">
                ${cover}
            </div>

            <div class="modal-intro">
                <span class="eyebrow">${escapeHTML(localizedCategory)}</span>
                <h2 id="modalTitle">${escapeHTML(localizedTitle)}</h2>
                <p class="modal-english-title">${escapeHTML(localizedEnglishTitle || "")}</p>
                <span class="modal-status">${escapeHTML(localizedStatus)}</span>
                <p class="modal-description">${escapeHTML(localizedDescription || "")}</p>
            </div>
        </div>

        <div class="modal-project-info">
            <div>
                <span>${escapeHTML(getTranslation("libraryMyRole", "MY ROLE"))}</span>
                <p>${escapeHTML(localizedRole || "")}</p>
            </div>
            <div>
                <span>${escapeHTML(getTranslation("libraryYear", "YEAR"))}</span>
                <p>${escapeHTML(localizedYear || "")}</p>
            </div>
            <div>
                <span>${escapeHTML(getTranslation("libraryPlatform", "PLATFORM"))}</span>
                <p>${escapeHTML(localizedPlatform || "")}</p>
            </div>
        </div>

        <div class="modal-gallery">
            <div class="modal-section-heading">
                <span class="eyebrow">${escapeHTML(getTranslation("libraryGameMedia", "GAME MEDIA"))}</span>
                <h3>${escapeHTML(getTranslation("libraryGalleryTitle", "Gallery"))}<span class="accent">.</span></h3>
            </div>

            ${renderMedia(sortedMedia)}
        </div>
    `;

    // 将排序后的媒体数据交给轮播组件
    const carousel = modalContent.querySelector("[data-media-carousel]");

    if (carousel) {
        carousel._mediaItems = sortedMedia;
        bindMediaCarousel();
    }

    const modalPanel = gameModal.querySelector(".game-modal-panel");
    if (modalPanel) {
        modalPanel.scrollTop = 0;
    }

    gameModal.classList.add("active");
    gameModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    if (modalPanel) {
        requestAnimationFrame(() => {
            modalPanel.scrollTop = 0;
        });
    }

    modalClose.focus();
    if (modalPanel) {
        requestAnimationFrame(() => modalPanel.scrollTop = 0);
    }
}

// 关闭详情
function closeGameDetail() {
    // 关闭时暂停所有视频
    modalContent.querySelectorAll("video").forEach(video => {
        video.pause();
    });

    gameModal.classList.remove("active");
    gameModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

// 关闭按钮
modalClose.addEventListener("click", closeGameDetail);

// 点击遮罩层关闭
modalBackdrop.addEventListener("click", closeGameDetail);

// ESC 关闭
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && gameModal.classList.contains("active")) {
        closeGameDetail();
    }
});

window.refreshGameLibraryLanguage = function () {
    renderFilterBar();
    renderGameLibrary();

    if (gameModal && gameModal.classList.contains("active") && gameModal.dataset.gameId) {
        openGameDetail(gameModal.dataset.gameId);
    }
};

// 初始化
renderFilterBar();
renderGameLibrary();
