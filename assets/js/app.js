const artifacts = document.querySelectorAll(".artifact");
const catalogPanel = document.getElementById("catalog-panel");
const catalogOverlay = document.getElementById("catalog-overlay");
const catalogSearch = document.getElementById("catalog-search");
const catalogItems = document.querySelectorAll("#catalog-list div");
const catalogEmpty = document.getElementById("catalog-empty");
const wrapper = document.getElementById("wrapper");
const catalogToggle = document.getElementById("catalog-toggle");
const homeButton = document.querySelector(".home-btn");

/* появление */
function checkVisibility() {
    artifacts.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.left < window.innerWidth) el.classList.add("visible");
    });
}
wrapper.addEventListener("scroll", checkVisibility);

/* описания */
const data = {
clock: {
title: "Настольные часы ректора",
desc: "Эти часы находились в кабинете ректора, профессора Борисова В.В. Их ход сопровождал принятие ключевых решений, формировавших развитие Академии. Точный механизм и строгий дизайн отражают дух научной дисциплины и времени, в котором они служили."
},
bust: {
title: "Бюст юридического института",
desc: "Подарен в 1980-х годах в честь награждения института орденом «Знак Почета». Символизирует коллективный труд преподавателей и сотрудников. По преданию, прикосновение к бюсту перед экзаменом приносило студентам удачу."
},
phone: {
title: "Телефон-часы",
desc: "Редкий настольный прибор 1950-х годов, объединяющий телефон и часы. Принадлежал секретарю ученого совета и отражает атмосферу деловой жизни и технологий середины XX века."
},
statue: {
title: "Скульптура «Родина-мать»",
desc: "Типовой образ послевоенного периода, олицетворяющий победу и силу народа. Подарена институту выпуском 1975 года - фронтовиками, завершившими образование в мирное время."
},
protivbak: {
title: "Немецкий противогазный бак",
desc: "Металлический бак для хранения и переноски противогаза. Был привезен в институт в 1946 году выпускником-фронтовиком, как символ победы над врагом. Использовался на занятиях по гражданской обороне."
},
flyaga: {
title: "Походная фляга",
desc: "Походная фляга предназначалась для хранения воды в дороге и полевых условиях. Принадлежала студенту-ополченцу 1941 года, который ушёл на фронт с третьего курса и не вернулся. Передана в музей его одногруппниками в 1960-е годы."
}
};

/* клик */
function openArtifactModal(type) {
    document.getElementById("modal-img").src = "assets/img/exhibits/" + type + ".png";
    document.getElementById("modal-title").innerText = data[type].title;
    document.getElementById("modal-desc").innerText = data[type].desc;
    document.getElementById("modal").style.display = "block";
    homeButton.classList.add("hidden");
}

artifacts.forEach(el => {
    el.onclick = () => {
        const type = el.dataset.type;
        openArtifactModal(type);
    };
});

function closeModal() {
    document.getElementById("modal").style.display = "none";
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
        const isMatch = item.textContent.toLowerCase().includes(query);
        item.style.display = isMatch ? "block" : "none";
        if (isMatch) visibleCount++;
    });

    catalogEmpty.classList.toggle("visible", visibleCount === 0);
}

/* навигация */
const scenes = document.querySelectorAll(".scene");
let currentIndex = 0;

function preloadSceneBackgrounds() {
    const backgroundUrls = [
        "assets/img/scenes/testfon.jpg",
        "assets/img/scenes/hall2.jpg"
    ];
    let loadedCount = 0;

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
    const sceneWidth = window.innerWidth || 1;
    const nextIndex = Math.round(wrapper.scrollLeft / sceneWidth);

    currentIndex = Math.max(0, Math.min(scenes.length - 1, nextIndex));
    scenes.forEach((scene, index) => {
        scene.classList.toggle("active", index === currentIndex);
    });
}

function showScene(index) {
    if (index < 0 || index >= scenes.length) return;
	wrapper.scrollTo({
		left: index * window.innerWidth,
		behavior: "smooth"
	});
	currentIndex = index;
    updateActiveScene();
}

document.getElementById("next-room").onclick = () => showScene(currentIndex + 1);
document.getElementById("prev-room").onclick = () => showScene(currentIndex - 1);
wrapper.addEventListener("scroll", updateActiveScene);
window.addEventListener("resize", updateActiveScene);
updateActiveScene();
preloadSceneBackgrounds();

/* старт */
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
