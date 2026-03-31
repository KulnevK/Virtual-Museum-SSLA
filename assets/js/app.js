const museumData = window.MUSEUM_DATA || { scenes: [], exhibits: [] };
const sceneMap = new Map(museumData.scenes.map(scene => [scene.id, scene]));
const exhibitMap = new Map(museumData.exhibits.map(exhibit => [exhibit.id, exhibit]));

const catalogPanel = document.getElementById("catalog-panel");
const catalogOverlay = document.getElementById("catalog-overlay");
const catalogSearch = document.getElementById("catalog-search");
const catalogEmpty = document.getElementById("catalog-empty");
const catalogList = document.getElementById("catalog-list");
const wrapper = document.getElementById("wrapper");
const catalogToggle = document.getElementById("catalog-toggle");
const homeButton = document.querySelector(".home-btn");
const mobileFocusMedia = window.matchMedia("(max-width: 900px), (max-height: 540px) and (orientation: landscape)");

const timelineSlots = ["left", "center", "right"];
const slotOrder = { left: 0, center: 1, right: 2 };

let artifacts = [];
let catalogItems = [];
let scenes = [];
let mobileSceneButtons = [];
let currentIndex = 0;

const mobileSceneSelections = new Map();

wrapper.addEventListener("scroll", () => {
    checkVisibility();
    updateActiveScene();
});

window.addEventListener("resize", handleViewportChange);

if (typeof mobileFocusMedia.addEventListener === "function") {
    mobileFocusMedia.addEventListener("change", handleViewportChange);
} else if (typeof mobileFocusMedia.addListener === "function") {
    mobileFocusMedia.addListener(handleViewportChange);
}

document.getElementById("next-room").onclick = () => showScene(currentIndex + 1);
document.getElementById("prev-room").onclick = () => showScene(currentIndex - 1);

bootstrapMuseum();

function bootstrapMuseum() {
    renderCatalog();
    renderScenes();
    refreshCollections();
    initializeMobileSceneSelections();
    applyResponsiveSceneMode();
    checkVisibility();
    updateActiveScene();
    preloadSceneBackgrounds();
}

function handleViewportChange() {
    updateActiveScene();
    applyResponsiveSceneMode();
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getSceneById(sceneId) {
    return sceneMap.get(sceneId);
}

function getExhibit(type) {
    return exhibitMap.get(type);
}

function getSceneExhibits(sceneId) {
    return museumData.exhibits
        .filter(exhibit => exhibit.sceneId === sceneId)
        .sort((a, b) => (slotOrder[a.slot] ?? 99) - (slotOrder[b.slot] ?? 99));
}

function getInitialSceneExhibit(sceneId) {
    return getSceneExhibits(sceneId)[0]?.id || "";
}

function initializeMobileSceneSelections() {
    museumData.scenes.forEach(scene => {
        if (!mobileSceneSelections.has(scene.id)) {
            const initialExhibit = getInitialSceneExhibit(scene.id);
            if (initialExhibit) {
                mobileSceneSelections.set(scene.id, initialExhibit);
            }
        }
    });
}

function isMobileFocusLayout() {
    return mobileFocusMedia.matches;
}

function buildSearchText(exhibit) {
    const scene = getSceneById(exhibit.sceneId);
    return [
        exhibit.id,
        exhibit.label,
        exhibit.title,
        exhibit.description,
        scene?.label,
        ...(exhibit.searchTerms || [])
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
}

function renderCatalog() {
    catalogList.innerHTML = museumData.exhibits
        .map(exhibit => {
            const scene = getSceneById(exhibit.sceneId);
            return `
                <div class="catalog-item" data-type="${escapeHtml(exhibit.id)}" data-search="${escapeHtml(buildSearchText(exhibit))}">
                    <span class="catalog-item-title">${escapeHtml(exhibit.label || exhibit.title)}</span>
                    <span class="catalog-item-meta">${escapeHtml(scene?.label || "Без периода")}</span>
                </div>
            `;
        })
        .join("");
}

function renderTimeline(scene) {
    const pointsMarkup = timelineSlots
        .map(slot => `<span class="timeline-point ${slot}"></span>`)
        .join("");

    const datesMarkup = timelineSlots
        .map((slot, index) => `<span class="timeline-date ${slot}">${escapeHtml(scene.timeline?.[index] || "")}</span>`)
        .join("");

    return pointsMarkup + datesMarkup;
}

function renderMobileFocusPicker(scene, sceneExhibits) {
    if (sceneExhibits.length < 2) {
        return "";
    }

    const buttonsMarkup = sceneExhibits
        .map((exhibit, index) => `
            <button class="scene-mobile-chip" type="button" data-scene-id="${escapeHtml(scene.id)}" data-type="${escapeHtml(exhibit.id)}" aria-pressed="false">
                <span class="scene-mobile-chip-number">${index + 1}</span>
                <span class="scene-mobile-chip-label">${escapeHtml(exhibit.label || exhibit.title)}</span>
            </button>
        `)
        .join("");

    return `
        <div class="scene-mobile-picker" aria-label="Экспонаты периода ${escapeHtml(scene.label)}">
            ${buttonsMarkup}
        </div>
    `;
}

function renderArtifactCard(exhibit) {
    const artifactClasses = ["artifact", `slot-${exhibit.slot}`];
    const imageClasses = [];

    if (exhibit.artifactClass) {
        artifactClasses.push(exhibit.artifactClass);
    }

    if (exhibit.imageClass) {
        imageClasses.push(exhibit.imageClass);
    }

    const imageClassAttr = imageClasses.length ? ` class="${escapeHtml(imageClasses.join(" "))}"` : "";

    return `
        <div class="${escapeHtml(artifactClasses.join(" "))}" data-type="${escapeHtml(exhibit.id)}" data-scene-id="${escapeHtml(exhibit.sceneId)}">
            <div class="info">${escapeHtml(exhibit.label || exhibit.title)}</div>
            <img${imageClassAttr} src="${escapeHtml(exhibit.image)}" alt="${escapeHtml(exhibit.title)}">
        </div>
    `;
}

function renderScene(scene, index) {
    const sceneExhibits = getSceneExhibits(scene.id);
    const placementsMarkup = sceneExhibits.map(renderArtifactCard).join("");
    const mobilePickerMarkup = renderMobileFocusPicker(scene, sceneExhibits);
    const noteMarkup = !placementsMarkup && scene.note
        ? `<div class="scene-note">${escapeHtml(scene.note)}</div>`
        : "";

    return `
        <section class="scene${!placementsMarkup ? " scene-empty" : ""}" data-scene-id="${escapeHtml(scene.id)}" data-scene-index="${index}" style="background-image:url('${escapeHtml(scene.background)}')">
            <div class="scene-era">${escapeHtml(scene.label)}</div>
            <div class="path">${renderTimeline(scene)}</div>
            ${placementsMarkup}
            ${mobilePickerMarkup}
            ${noteMarkup}
        </section>
    `;
}

function renderScenes() {
    wrapper.innerHTML = museumData.scenes.map(renderScene).join("");
}

function refreshCollections() {
    artifacts = [...wrapper.querySelectorAll(".artifact")];
    scenes = [...wrapper.querySelectorAll(".scene")];
    catalogItems = [...catalogList.querySelectorAll(".catalog-item")];
    mobileSceneButtons = [...wrapper.querySelectorAll(".scene-mobile-chip")];

    artifacts.forEach(artifact => {
        artifact.onclick = () => openArtifactModal(artifact.dataset.type);
    });

    catalogItems.forEach(item => {
        item.onclick = () => goToArtifact(item.dataset.type);
    });

    mobileSceneButtons.forEach(button => {
        button.onclick = event => {
            event.preventDefault();
            event.stopPropagation();
            setActiveSceneExhibit(button.dataset.sceneId, button.dataset.type);
        };
    });
}

function setActiveSceneExhibit(sceneId, type) {
    if (!sceneId || !type) {
        return;
    }

    mobileSceneSelections.set(sceneId, type);
    applyResponsiveSceneMode();
}

function applyResponsiveSceneMode() {
    initializeMobileSceneSelections();

    const useMobileFocus = isMobileFocusLayout();

    scenes.forEach(scene => {
        const sceneId = scene.dataset.sceneId;
        const sceneExhibits = getSceneExhibits(sceneId);
        const hasMultipleExhibits = sceneExhibits.length > 1;
        const activeType = mobileSceneSelections.get(sceneId) || getInitialSceneExhibit(sceneId);
        const enableFocusMode = useMobileFocus && hasMultipleExhibits;

        scene.classList.toggle("mobile-focus-mode", enableFocusMode);

        scene.querySelectorAll(".artifact").forEach(artifact => {
            const isActive = artifact.dataset.type === activeType;

            artifact.classList.toggle("mobile-active", enableFocusMode && isActive);
            artifact.classList.toggle("mobile-hidden", enableFocusMode && !isActive);

            if (enableFocusMode && isActive) {
                artifact.classList.add("visible");
            }
        });

        scene.querySelectorAll(".scene-mobile-chip").forEach(button => {
            const isActive = button.dataset.type === activeType;
            button.classList.toggle("active", enableFocusMode && isActive);
            button.setAttribute("aria-pressed", String(enableFocusMode && isActive));
            button.tabIndex = enableFocusMode ? 0 : -1;
        });
    });
}

function checkVisibility() {
    artifacts.forEach(artifact => {
        const rect = artifact.getBoundingClientRect();
        if (rect.left < window.innerWidth) {
            artifact.classList.add("visible");
        }
    });
}

function openArtifactModal(type) {
    const exhibit = getExhibit(type);

    if (!exhibit) {
        return;
    }

    mobileSceneSelections.set(exhibit.sceneId, exhibit.id);
    applyResponsiveSceneMode();

    const modalImage = document.getElementById("modal-img");
    const modalModel = document.getElementById("modal-model");
    const modalTitle = document.getElementById("modal-title");
    const modalDesc = document.getElementById("modal-desc");
    const isLocalFile = window.location.protocol === "file:";
    const has3DModel = Boolean(exhibit.model);

    modalImage.style.display = "block";
    modalModel.style.display = "none";
    modalModel.removeAttribute("src");
    modalModel.setAttribute("poster", exhibit.poster || exhibit.image);
    modalImage.src = exhibit.image;

    if (has3DModel && !isLocalFile) {
        modalImage.style.display = "none";
        modalModel.style.display = "block";
        modalModel.src = exhibit.model;
    }

    modalTitle.innerText = exhibit.title;
    modalDesc.innerText = exhibit.description;

    if (has3DModel && isLocalFile) {
        modalDesc.innerText += " 3D-модель откроется после запуска сайта через локальный сервер или хостинг, а не напрямую как file:// файл.";
    }

    document.getElementById("modal").style.display = "block";
    homeButton.classList.add("hidden");
}

function closeModal() {
    const modalImage = document.getElementById("modal-img");
    const modalModel = document.getElementById("modal-model");

    document.getElementById("modal").style.display = "none";
    modalImage.style.display = "block";
    modalModel.style.display = "none";
    modalModel.removeAttribute("src");

    if (document.getElementById("home").style.display === "none") {
        homeButton.classList.remove("hidden");
    }
}

function toggleCatalog() {
    catalogPanel.classList.toggle("open");
    catalogOverlay.classList.toggle("visible");
}

function closeCatalog() {
    catalogPanel.classList.remove("open");
    catalogOverlay.classList.remove("visible");
}

function filterCatalog() {
    const query = catalogSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    catalogItems.forEach(item => {
        const searchText = item.dataset.search || item.textContent.toLowerCase();
        const isMatch = searchText.includes(query);
        item.style.display = isMatch ? "flex" : "none";

        if (isMatch) {
            visibleCount++;
        }
    });

    catalogEmpty.classList.toggle("visible", visibleCount === 0);
}

function preloadSceneBackgrounds() {
    const backgroundUrls = [...new Set(museumData.scenes.map(scene => scene.background).filter(Boolean))];
    let loadedCount = 0;

    if (!backgroundUrls.length) {
        scenes.forEach(scene => scene.classList.add("ready"));
        wrapper.classList.add("ready");
        return;
    }

    const markReady = () => {
        loadedCount++;

        if (loadedCount === backgroundUrls.length) {
            scenes.forEach(scene => scene.classList.add("ready"));
            wrapper.classList.add("ready");
            checkVisibility();
            updateActiveScene();
        }
    };

    backgroundUrls.forEach(url => {
        const img = new Image();
        img.onload = markReady;
        img.onerror = markReady;
        img.src = url;
    });
}

function updateActiveScene() {
    if (!scenes.length) {
        return;
    }

    const sceneWidth = window.innerWidth || 1;
    const nextIndex = Math.round(wrapper.scrollLeft / sceneWidth);

    currentIndex = Math.max(0, Math.min(scenes.length - 1, nextIndex));
    scenes.forEach((scene, index) => {
        scene.classList.toggle("active", index === currentIndex);
    });
}

function showScene(index) {
    if (index < 0 || index >= scenes.length) {
        return;
    }

    wrapper.scrollTo({
        left: index * window.innerWidth,
        behavior: "smooth"
    });

    currentIndex = index;
    updateActiveScene();
}

function startTour() {
    document.getElementById("home").style.display = "none";
    catalogToggle.classList.remove("hidden");
    homeButton.classList.remove("hidden");
    closeCatalog();
}

function goHome() {
    document.getElementById("home").style.display = "flex";
    catalogToggle.classList.add("hidden");
    homeButton.classList.add("hidden");
    closeCatalog();
    closeModal();
    wrapper.scrollTo({ left: 0, behavior: "smooth" });
    currentIndex = 0;
    catalogSearch.value = "";
    filterCatalog();
}

function goToArtifact(type) {
    const exhibit = getExhibit(type);

    if (exhibit) {
        mobileSceneSelections.set(exhibit.sceneId, exhibit.id);
        applyResponsiveSceneMode();
    }

    closeCatalog();
    openArtifactModal(type);
}

document.addEventListener("keydown", event => {
    const isHomeVisible = document.getElementById("home").style.display !== "none";
    const isSearchFocused = document.activeElement === catalogSearch;

    if (event.key === "Escape") {
        closeCatalog();
        closeModal();
        return;
    }

    if (isHomeVisible || isSearchFocused) {
        return;
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        showScene(currentIndex + 1);
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        showScene(currentIndex - 1);
    }
});
