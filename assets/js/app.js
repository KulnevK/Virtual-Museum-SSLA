const timelineSlots = ["left", "center", "right"];
const slotOrder = { left: 0, center: 1, right: 2 };
const rawMuseumData = window.MUSEUM_DATA || { scenes: [], exhibits: [] };
const defaultSceneBackground = "assets/img/scenes/newhall1.jpg";
const defaultDescription = "Описание будет добавлено позже.";
const placeholderMuseumDescription = "Экспонат виртуального музея Саратовской государственной юридической академии. Развёрнутое описание и историческая справка будут добавлены по мере уточнения музейного учёта.";
const targetSceneExhibitCount = 3;
const chairExceptionExhibitId = "stul_derevyannyy_s_rezboy_3d";
const forceImageOnlyExhibitIds = new Set([
    "flyaga",
    "clock",
    "chasy1",
    "chasy2",
    "kaska_3d",
    "kaska_3d_2",
    "statuetka",
    "kruzhka"
]);
const thematicHallConfigs = [
    {
        key: "awards",
        title: "Галерея орденов и медалей",
        background: "assets/img/scenes/newhall3.jpg",
        timeline: ["Награды", "Подвиги", "Память"],
        exhibitIds: [
            "ordenskaya_planka",
            "ordenskaya_planka_2",
            "orden_za_veru_volyu_i_otechestvo",
            "ossnovanie_medali",
            "medali_70_let_vooruzhennyh_sil",
            "medal_50_let_vooruzhennyh_sil_sssr",
            "medal_70_let_vooruzhennyh_sil",
            "medal_truzheniku_tyla",
            "medal_truzheniku_tyla_2",
            "medal_georgiya_zhukova",
            "medal_za_doblestnyy_trud_v_vov",
            "medal_stoletiyu_georgiya_zhukova",
            "medalsoc",
            "medali_50_let_pobedy",
            "medali_60_let_vooruzhennyh_sil",
            "medal_50_let_pobedy",
            "medal_60_let_vooruzhennyh_sil",
            "medal_60_let_vyzvoleniya_respubliki_belarus_ot_nemetsko_fashistskih_za",
            "medal_za_dolgoletniy_dobrosovestnyy_trud",
            "medal_za_vozrozhdenie_kazachestva",
            "medal_za_doblestnyy_trud_v_oznamenovanie_100_letiya_so_dnya_rozhdeniya",
            "medali_20_let_s_momenta_vyvoda_sovetskih_voysk_iz_afganistana_40_armiy",
            "medal_60_let_pobedy_vov",
            "medal_zaschitniku_pridnestrovya",
            "ordenskaya_knizhka_chermenskiy_ivan",
            "medaljapan",
            "30pobeda",
            "medalveteran",
            "medalgranitz",
            "pobedavsoc",
            "40pobeda"
        ]
    },
    {
        key: "books",
        title: "Книжное собрание музея",
        background: "assets/img/scenes/newhall2.jpg",
        timeline: ["Книги", "Фонд", "Архив"],
        exhibitIds: [
            "ugolovnyy_kodeks",
            "kniga",
            "kniga_2",
            "kniga_3",
            "kniga_4",
            "kniga_5",
            "kniga_6",
            "kniga_7",
            "kniga_8",
            "kniga_9",
            "kniga_10",
            "kniga_11",
            "kniga_stanovlenie_i_razvitie_sovetskogo_ugolovnogo_zakonodatelstva",
            "kniga_pochetnyh_gostey",
            "zhurnal",
            "sbornik_nauchnyh_rabot",
            "sbornik_pesen"
        ]
    },
    {
        key: "documents",
        title: "Архив удостоверений и документов",
        background: "assets/img/scenes/newhall1.jpg",
        timeline: ["Архив", "Документы", "Память"],
        exhibitIds: [
            "udostovstud",
            "udostoverenudar",
            "mvd",
            "udostoverenie_oon_baytin_m_i_60_let_obrazovaniya_onn",
            "udostoverenie_komissiya_po_borbe_s_organizovannoy_prestupnostyu_i_korr",
            "udostoverenie_ministra_vysshego_i_srednego_spetsialnogo_obrazovanie_rs",
            "zachetnaya_knizhka",
            "zachetnaya_knizhka_2",
            "svidetelstvo",
            "albom",
            "diplom",

            "attestat_dotsenta",

            "papka",
            "papka_s_dokumentami",
            "pochetnaya_gramota",
            "pochetnaya_gramota_2",
            "sertifikat",
            "sertifikat_2",
            "soglashenie"
        ]
    },
    {
        key: "paintings",
        title: "Галерея живописи и портретов",
        background: "assets/img/scenes/newhall3.jpg",
        timeline: ["Портреты", "Живопись", "Память"],
        exhibitIds: [
            "kartina",
            "kartina_2",
            "kartina_3",
            "kartina_4",
            "kartina_5",
            "kartina_6",
            "kartina_7",
            "kartina_8",
            "kartina_korabl",
            "portret",
            "portret_d_i_kurskogo"
        ]
    },
    {
        key: "souvenirs",
        title: "Зал сувениров и подарков",
        background: "assets/img/scenes/newhall3.jpg",
        timeline: ["Подарки", "Сувениры", "Память"],
        exhibitIds: [
            "gagarin",
            "pushka",
                    "znachok_pioneriya_gdr",
            "nagrudnyy_znak_yunyy_pioner_beg",
            "blagodarstvennoe_pismo",
            "vympel",
            "vympel_2",
            "vympel_3",
            "vypel_3",
            "kubok_3d",
            "kubok_3d_2",
            "kubok_za_pervenstvo_po_basketbolu_3d",
            "urkubok",
            "kubok_po_legkoy_atletike_3d",
            "kubok_s_harkova_3d",
            "kubok_sportivnyy_po_borbe_3d",
            "super_kubok_yuga_rossii_3d",
            "nadpis_na_kubke_harkov",
            "nadpisna_kubke_latina",
            "pamyatnyy_znachok",
            "znachok_60_let_sssr",
            "znachok_kirovskiy_rayon",
            "znachok_chkv",
            "pozdravitelnaya_otkrytka",
            "pozdravitelnaya_tablichka_v_svyazi_s_yubileem",
            "syui_v_pamyat_o_vstreche_vypusknikov_1947_goda_ot_vypusknitsy_zinich_3",
            "suvenir",
            "rsv",
            "sgmu",
            "sobinov196",
            "znak_sgap",
            "kivin_2004",
            "nabor_nastolnyh_nagrad_orenburzhe_3d",
            "sgpi",
            "petr1"
        ]
    },
    {
        key: "technology",
        title: "Зал техники и приборов",
        background: "assets/img/scenes/newhall2.jpg",
        timeline: ["Техника", "Приборы", "Медиа"],
        exhibitIds: [
            "clock",
            "phone",
            "camera",
            "baltika",
            "chasy1",
            "arifmometr_3d",
            "radiola_rigonda_102_3d",
            "radiola_estoniya_3d",
            "radiopriemnik",
            "pechatmashinka",
            "calc",
            "apparat_dlya_proektsii_slaydov_3d",
            "kalkulyator_3d",
            "kassetnyy_magnitofon_3d",
            "katushechnyy_magnitofon_3d",
            "kinoproektor_3d",
            "kolonki",
            "magnitofon_3d",
            "mikroskop_3d",
            "muzykalnaya_ustanovka_3d",
            "usilzvuk",
            "chasy2",
            "pk_testovyy_3d"
        ]
    },
    {
        key: "military",
        title: "Военно-мемориальный зал",
        background: "assets/img/scenes/newhall1.jpg",
        timeline: ["Служба", "Память", "Подвиг"],
        exhibitIds: [
            "flyaga",
            "shapkarmii",
            "frontovik59",
            "50sui",
            "armeyskiy_meshok_3d",
            "armeyskiy_meshok_3d_2",
            "voennyy_galstuk_3d",
            "kakarda",
            "znachok_gotov_k_zaschite_rodiny",
            "znachok_druzhinnik_sssr",
            "znachok_otlichnik_sovetskoy_armii",
            "kaska_3d",
            "kaska_3d_2",
            "kotelok",
            "kotelok_2",
            "kotelok_3d",
            "model_samoleta_ilya_muromets_na_podstavke_3d",
            "ofitserskaya_papaha_3d",
            "ofitserskaya_polevaya_furazhka",
            "ofitserskaya_sumka_3d",
            "pilotki_3d",
            "podsumok_3d",
            "protivogaz",
            "protivogaz_2",
            "protivogaz_3d",
            "protivbak",
            "snaryad",
            "nadpis_na_snaryade",
            "pogony_prokurorskie_chermenskogo",
            "remen_3d",
            "znachok_65_let_pobedy_v_vov"
        ]
    },
    {
        key: "sculpture",
        title: "Зал скульптуры и декоративных предметов",
        background: "assets/img/scenes/newhall3.jpg",
        timeline: ["Скульптура", "Декор", "Память"],
        exhibitIds: [
            "portfel",
            "kuvshin",
            "bust",
            "statue",
            "esenin",
            "statuetka",
            "shkatulk",
            "korobka_3d",
            "grafin",
            "kruzhka",
            "exposiz",
            "statuetka_vladimir_ulyanov_3d",
            "statuetka_s_delfinami_3d",
            "statuetka_s_delfinami_3d_2",
            "miska_3d",
            "stul_derevyannyy_s_rezboy_3d"
        ]
    }
];
const exhibitHallTitleById = thematicHallConfigs.reduce((map, config) => {
    (config.exhibitIds || []).forEach(exhibitId => {
        map.set(String(exhibitId || "").trim(), String(config.title || "").trim());
    });
    return map;
}, new Map());
const hallTitleOrder = new Map(thematicHallConfigs.map((config, index) => [String(config.title || "").trim(), index]));

function resolveCatalogHallTitle(exhibit, scene) {
    const byConfig = exhibitHallTitleById.get(String(exhibit?.id || "").trim());
    if (byConfig) {
        return byConfig;
    }

    const text = [
        exhibit?.label,
        exhibit?.title,
        ...(Array.isArray(exhibit?.searchTerms) ? exhibit.searchTerms : [])
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    const keywordRules = [
        { pattern: /(медал|орден|наград)/, hall: "Галерея орденов и медалей" },
        { pattern: /(книг|журнал|сборник|кодекс)/, hall: "Книжное собрание музея" },
        { pattern: /(удостовер|документ|диплом|аттестат|сертификат|грамот|зачетн)/, hall: "Архив удостоверений и документов" },
        { pattern: /(картин|портрет|живопис)/, hall: "Галерея живописи и портретов" },
        { pattern: /(сувенир|подар|значок|кубок|вымпел|открытк)/, hall: "Зал сувениров и подарков" },
        { pattern: /(часы|аппарат|радио|магнитофон|калькулятор|проектор|техник|прибор)/, hall: "Зал техники и приборов" },
        { pattern: /(каск|армей|военн|снаряд|противогаз|фляг|погон|папах|пилотк|сумк)/, hall: "Военно-мемориальный зал" },
        { pattern: /(статуэт|бюст|скульптур|кувшин|кружк|шкатул|графин|стул)/, hall: "Зал скульптуры и декоративных предметов" }
    ];

    const matchedRule = keywordRules.find(rule => rule.pattern.test(text));
    if (matchedRule) {
        return matchedRule.hall;
    }

    return String(scene?.hallTitle || "Прочие экспонаты").trim() || "Прочие экспонаты";
}

function buildThematicPlan() {
    const baseScenes = Array.isArray(rawMuseumData?.scenes) ? rawMuseumData.scenes : [];
    const baseExhibits = Array.isArray(rawMuseumData?.exhibits) ? rawMuseumData.exhibits : [];
    const baseSceneMap = new Map(baseScenes.map((scene, index) => [String(scene?.id || "").trim(), { ...scene, order: index }]));
    const baseExhibitMap = new Map(baseExhibits.map((exhibit, index) => [String(exhibit?.id || "").trim(), { ...exhibit, order: index }]));
    const scenes = [];
    const exhibitSceneMap = new Map();
    const exhibitSlotMap = new Map();
    const balancedSlotsByCount = {
        1: ["center"],
        2: ["left", "right"],
        3: ["left", "center", "right"]
    };

    thematicHallConfigs.forEach(config => {
        const resolvedExhibits = (config.exhibitIds || [])
            .map(exhibitId => {
                const exhibit = baseExhibitMap.get(String(exhibitId || "").trim());

                if (!exhibit) {
                    console.warn(`[museum] Тематический зал ${config.key}: не найден exhibitId ${exhibitId}.`);
                    return null;
                }

                const sourceScene = baseSceneMap.get(String(exhibit.sceneId || "").trim());
                const sourceSceneOrder = sourceScene?.order ?? Number.MAX_SAFE_INTEGER;
                const slotOrderValue = slotOrder[exhibit.slot] ?? 99;

                return {
                    exhibitId: exhibit.id,
                    sourceScene,
                    sourceSceneOrder,
                    slotOrderValue,
                    exhibitOrder: exhibit.order ?? Number.MAX_SAFE_INTEGER,
                    configOrderValue: (config.exhibitIds || []).indexOf(exhibit.id)
                };
            })
            .filter(Boolean)
            .sort((a, b) => (
                (config.key === "awards" ? a.configOrderValue - b.configOrderValue : 0)
                || a.sourceSceneOrder - b.sourceSceneOrder
                || a.slotOrderValue - b.slotOrderValue
                || a.exhibitOrder - b.exhibitOrder
            ));

        const exhibitsByPeriod = new Map();

        resolvedExhibits.forEach(item => {
            const periodLabel = String(item.sourceScene?.label || "Без периода").trim() || "Без периода";

            if (!exhibitsByPeriod.has(periodLabel)) {
                exhibitsByPeriod.set(periodLabel, {
                    periodLabel,
                    sourceScene: item.sourceScene,
                    exhibits: []
                });
            }

            exhibitsByPeriod.get(periodLabel).exhibits.push(item);
        });

        let sceneNumber = 0;

        exhibitsByPeriod.forEach(periodGroup => {
            const sceneTemplate = periodGroup.sourceScene || {};
            const periodExhibits = periodGroup.exhibits.slice();

            // Балансируем разбиение, чтобы в тематическом зале не появлялась сцена из 1 экспоната.
            // Пример: 4 экспоната -> 2+2 вместо 3+1; 7 -> 3+2+2 вместо 3+3+1.
            if (periodExhibits.length > timelineSlots.length && periodExhibits.length % timelineSlots.length === 1) {
                const last = periodExhibits.pop();
                const beforeLast = periodExhibits.pop();

                if (beforeLast) {
                    periodExhibits.push(beforeLast);
                }

                if (last) {
                    periodExhibits.push(last);
                }
            }

            for (let index = 0; index < periodExhibits.length; index += timelineSlots.length) {
                const sceneExhibits = periodExhibits.slice(index, index + timelineSlots.length);
                const sceneId = `scene-theme-${config.key}-${String(++sceneNumber).padStart(2, "0")}`;
                const sceneSlots = balancedSlotsByCount[sceneExhibits.length] || timelineSlots;

                scenes.push({
                    id: sceneId,
                    label: periodGroup.periodLabel,
                    eraLabel: periodGroup.periodLabel,
                    hallTitle: config.title,
                    background: String(sceneTemplate.background || config.background || defaultSceneBackground).trim() || defaultSceneBackground,
                    timeline: Array.isArray(sceneTemplate.timeline) && sceneTemplate.timeline.length
                        ? sceneTemplate.timeline
                        : config.timeline,
                    isThematic: true
                });

                sceneExhibits.forEach((item, exhibitIndex) => {
                    exhibitSceneMap.set(item.exhibitId, sceneId);
                    exhibitSlotMap.set(item.exhibitId, sceneSlots[exhibitIndex] || "center");
                });
            }
        });
    });

    return { scenes, exhibitSceneMap, exhibitSlotMap };
}

const thematicPlan = buildThematicPlan();

function resolveWebpCompanion(rasterPath) {
    const path = String(rasterPath || "").trim();
    if (!path) {
        return "";
    }

    const companion = path.replace(/\.(png|jpe?g)$/i, ".webp");

    return companion !== path ? companion : "";
}

function resolveThumbCompanion(rasterPath) {
    const path = String(rasterPath || "").trim();
    if (!path) {
        return "";
    }

    const companion = path.replace(/(\.[^./\\]+)$/i, "_thumb$1");

    return companion !== path ? companion : "";
}

function rebalanceSceneExhibitDistribution(scenes, exhibits) {
    const slotLayoutByCount = {
        1: ["center"],
        2: ["left", "right"],
        3: ["left", "center", "right"]
    };
    const sceneExhibitsMap = new Map();
    const sceneOrderMap = new Map();
    const hallKeyBySceneId = new Map();
    const sceneIdsByHallKey = new Map();
    const chairSceneId = exhibits.find(exhibit => exhibit.id === chairExceptionExhibitId)?.sceneId || "";

    scenes.forEach((scene, index) => {
        sceneExhibitsMap.set(scene.id, []);
        sceneOrderMap.set(scene.id, index);

        const match = String(scene.id || "").match(/^scene-theme-([a-z0-9_-]+)-/i);
        const hallKey = match ? match[1] : "__chronology__";
        hallKeyBySceneId.set(scene.id, hallKey);

        if (!sceneIdsByHallKey.has(hallKey)) {
            sceneIdsByHallKey.set(hallKey, []);
        }

        sceneIdsByHallKey.get(hallKey).push(scene.id);
        scene.isTransition = false;
        scene.transitionFromHalls = [];
    });

    exhibits
        .slice()
        .sort((a, b) => {
            const sceneDiff = (sceneOrderMap.get(a.sceneId) ?? Number.MAX_SAFE_INTEGER) - (sceneOrderMap.get(b.sceneId) ?? Number.MAX_SAFE_INTEGER);
            if (sceneDiff !== 0) {
                return sceneDiff;
            }

            return (slotOrder[a.slot] ?? 99) - (slotOrder[b.slot] ?? 99);
        })
        .forEach(exhibit => {
            const sceneExhibits = sceneExhibitsMap.get(exhibit.sceneId);
            if (sceneExhibits) {
                sceneExhibits.push(exhibit);
            }
        });

    const getNonEmptyHallSceneCount = hallKey => {
        const hallSceneIds = sceneIdsByHallKey.get(hallKey) || [];
        return hallSceneIds.reduce((count, sceneId) => {
            const hallSceneExhibits = sceneExhibitsMap.get(sceneId) || [];
            return count + (hallSceneExhibits.length > 0 ? 1 : 0);
        }, 0);
    };

    const pullFromDonorScene = (donorSceneId, options = {}) => {
        const { preserveDonorHallVisibility = false } = options;
        const donorExhibits = sceneExhibitsMap.get(donorSceneId) || [];
        if (!donorExhibits.length) {
            return null;
        }

        const donorHallKey = hallKeyBySceneId.get(donorSceneId) || "__chronology__";
        if (preserveDonorHallVisibility && donorExhibits.length === 1 && getNonEmptyHallSceneCount(donorHallKey) <= 1) {
            return null;
        }

        if (donorSceneId !== chairSceneId) {
            return donorExhibits.shift() || null;
        }

        const movableIndex = donorExhibits.findIndex(exhibit => exhibit.id !== chairExceptionExhibitId);
        if (movableIndex === -1) {
            return null;
        }

        const [movedExhibit] = donorExhibits.splice(movableIndex, 1);
        return movedExhibit || null;
    };

    scenes.forEach((scene, sceneIndex) => {
        if (!scene?.id || scene.id === chairSceneId) {
            return;
        }

        const sceneExhibits = sceneExhibitsMap.get(scene.id) || [];
        const targetHallKey = hallKeyBySceneId.get(scene.id) || "__chronology__";

        while (sceneExhibits.length < targetSceneExhibitCount) {
            let movedExhibit = null;

            for (let donorIndex = sceneIndex + 1; donorIndex < scenes.length; donorIndex++) {
                const donorScene = scenes[donorIndex];
                if (!donorScene?.id || donorScene.id === chairSceneId) {
                    continue;
                }

                const donorHallKey = hallKeyBySceneId.get(donorScene.id) || "__chronology__";
                if (donorHallKey !== targetHallKey) {
                    continue;
                }

                movedExhibit = pullFromDonorScene(donorScene.id);
                if (movedExhibit) {
                    break;
                }
            }

            if (!movedExhibit && chairSceneId) {
                const chairHallKey = hallKeyBySceneId.get(chairSceneId) || "__chronology__";
                if (chairHallKey === targetHallKey) {
                    movedExhibit = pullFromDonorScene(chairSceneId, { preserveDonorHallVisibility: true });
                }
            }

            if (!movedExhibit) {
                break;
            }

            movedExhibit.sceneId = scene.id;
            sceneExhibits.push(movedExhibit);
        }
    });

    const findReceiverSceneId = (sourceSceneIndex, preferredHallKey) => {
        for (let receiverIndex = sourceSceneIndex - 1; receiverIndex >= 0; receiverIndex--) {
            const receiverScene = scenes[receiverIndex];
            if (!receiverScene?.id || receiverScene.id === chairSceneId) {
                continue;
            }

            const receiverExhibits = sceneExhibitsMap.get(receiverScene.id) || [];
            const receiverHallKey = hallKeyBySceneId.get(receiverScene.id) || "__chronology__";
            if (receiverExhibits.length < targetSceneExhibitCount && receiverHallKey === preferredHallKey) {
                return receiverScene.id;
            }
        }

        return "";
    };

    for (let sceneIndex = scenes.length - 1; sceneIndex >= 0; sceneIndex--) {
        const scene = scenes[sceneIndex];
        if (!scene?.id || scene.id === chairSceneId) {
            continue;
        }

        const sourceExhibits = sceneExhibitsMap.get(scene.id) || [];
        if (sourceExhibits.length >= targetSceneExhibitCount) {
            continue;
        }

        while (sourceExhibits.length > 0) {
            const sourceHallKey = hallKeyBySceneId.get(scene.id) || "__chronology__";
            const receiverSceneId = findReceiverSceneId(sceneIndex, sourceHallKey);
            if (!receiverSceneId) {
                break;
            }

            const movedExhibit = sourceExhibits.shift();
            if (!movedExhibit) {
                break;
            }

            movedExhibit.sceneId = receiverSceneId;
            const receiverExhibits = sceneExhibitsMap.get(receiverSceneId) || [];
            receiverExhibits.push(movedExhibit);
        }
    }

    scenes.forEach(scene => {
        const sceneExhibits = sceneExhibitsMap.get(scene.id) || [];
        const layout = slotLayoutByCount[Math.min(sceneExhibits.length, targetSceneExhibitCount)] || slotLayoutByCount[3];
        scene.isTransition = false;
        scene.transitionFromHalls = [];

        sceneExhibits.forEach((exhibit, index) => {
            exhibit.slot = layout[index] || "center";
        });
    });
}

function normalizeMuseumData(rawData) {
    const rawBaseScenes = Array.isArray(rawData?.scenes) ? rawData.scenes : [];
    const rawScenes = [...rawBaseScenes, ...thematicPlan.scenes];
    const rawExhibits = Array.isArray(rawData?.exhibits) ? rawData.exhibits : [];
    const sceneIds = new Set();
    const exhibitIds = new Set();

    const scenes = rawScenes.reduce((result, scene, index) => {
        if (!scene || typeof scene !== "object") {
            console.warn(`[museum] Пропущена некорректная сцена с индексом ${index}.`);
            return result;
        }

        const id = String(scene.id || "").trim();
        if (!id) {
            console.warn(`[museum] Пропущена сцена без id на позиции ${index}.`);
            return result;
        }

        if (sceneIds.has(id)) {
            console.warn(`[museum] Найден дубликат scene.id: ${id}. Сцена пропущена.`);
            return result;
        }

        sceneIds.add(id);

        const timeline = Array.isArray(scene.timeline)
            ? scene.timeline.slice(0, timelineSlots.length).map(value => String(value || ""))
            : [];

        while (timeline.length < timelineSlots.length) {
            timeline.push("");
        }

        result.push({
            ...scene,
            id,
            label: String(scene.label || `Период ${result.length + 1}`).trim(),
            hallTitle: scene.hallTitle ? String(scene.hallTitle).trim() : "",
            eraLabel: scene.eraLabel ? String(scene.eraLabel).trim() : "",
            background: String(scene.background || defaultSceneBackground).trim() || defaultSceneBackground,
            timeline,
            note: scene.note ? String(scene.note).trim() : "",
            isThematic: Boolean(scene.isThematic || String(id).startsWith("scene-theme-"))
        });

        return result;
    }, []);

    const validSceneIds = new Set(scenes.map(scene => scene.id));

    const exhibits = rawExhibits.reduce((result, exhibit, index) => {
        if (!exhibit || typeof exhibit !== "object") {
            console.warn(`[museum] Пропущен некорректный экспонат с индексом ${index}.`);
            return result;
        }

        const id = String(exhibit.id || "").trim();
        if (!id) {
            console.warn(`[museum] Пропущен экспонат без id на позиции ${index}.`);
            return result;
        }

        if (exhibitIds.has(id)) {
            console.warn(`[museum] Найден дубликат exhibit.id: ${id}. Экспонат пропущен.`);
            return result;
        }

        const preferredSceneId = thematicPlan.exhibitSceneMap.get(id) || exhibit.sceneId;
        const sceneId = String(preferredSceneId || "").trim();
        if (!validSceneIds.has(sceneId)) {
            console.warn(`[museum] Экспонат ${id} пропущен: неизвестный sceneId ${sceneId || "<empty>"}.`);
            return result;
        }

        const image = String(exhibit.image || "").trim();
        if (!image) {
            console.warn(`[museum] Экспонат ${id} пропущен: не указан путь к изображению.`);
            return result;
        }

        const thematicSlot = thematicPlan.exhibitSlotMap.get(id);
        const slot = timelineSlots.includes(thematicSlot)
            ? thematicSlot
            : (timelineSlots.includes(exhibit.slot) ? exhibit.slot : "center");
        if (!thematicSlot && slot !== exhibit.slot) {
            console.warn(`[museum] У экспоната ${id} указан неверный slot. Использован fallback: center.`);
        }

        exhibitIds.add(id);

        const title = String(exhibit.title || exhibit.label || id).trim() || id;
        const label = String(exhibit.label || title).trim() || title;

        const imageFull = String(exhibit.imageFull || image).trim() || image;

        let imageWebp = String(exhibit.imageWebp || "").trim();
        if (!imageWebp) {
            imageWebp = resolveWebpCompanion(imageFull);
        }

        let imageThumb = String(exhibit.imageThumb || "").trim();
        if (!imageThumb) {
            imageThumb = resolveThumbCompanion(imageFull) || imageFull;
        }

        let imageThumbWebp = String(exhibit.imageThumbWebp || "").trim();
        if (!imageThumbWebp) {
            imageThumbWebp = resolveWebpCompanion(imageThumb);
        }

        const model = String(exhibit.model || "").trim();
        const sourceDescription = String(exhibit.description || defaultDescription).trim() || defaultDescription;

        if (sourceDescription === placeholderMuseumDescription) {
            return result;
        }

        const forceImageOnly = forceImageOnlyExhibitIds.has(id);
        const normalizedModel = forceImageOnly ? "" : model;
        const has3D = Boolean(normalizedModel);

        result.push({
            ...exhibit,
            id,
            sceneId,
            sourceSceneId: String(exhibit.sceneId || sceneId).trim() || sceneId,
            slot,
            label,
            title,
            image: imageFull,
            imageWebp,
            imageThumb,
            imageThumbWebp,
            poster: String(exhibit.poster || "").trim(),
            model: normalizedModel,
            has3D,
            artifactClass: String(exhibit.artifactClass || "").trim(),
            imageClass: String(exhibit.imageClass || "").trim(),
            searchTerms: Array.isArray(exhibit.searchTerms)
                ? exhibit.searchTerms.filter(Boolean).map(value => String(value))
                : [],
            description: sourceDescription
        });

        return result;
    }, []);

    rebalanceSceneExhibitDistribution(scenes, exhibits);


    const usedSceneIds = new Set(exhibits.map(exhibit => exhibit.sceneId));
    const visibleScenes = scenes.filter(scene => scene.isThematic && usedSceneIds.has(scene.id));
    const visibleSceneIds = new Set(visibleScenes.map(scene => scene.id));
    const visibleExhibits = exhibits.filter(exhibit => visibleSceneIds.has(exhibit.sceneId));

    return { scenes: visibleScenes, exhibits: visibleExhibits };
}

const museumData = normalizeMuseumData(rawMuseumData);
const sceneMap = new Map(museumData.scenes.map(scene => [scene.id, scene]));
const exhibitMap = new Map(museumData.exhibits.map(exhibit => [exhibit.id, exhibit]));
const compactPairSceneIndexesByHall = {
    souvenirs: new Set([1]),
    technology: new Set([3]),
    military: new Set([8]),
    sculpture: new Set([1, 5, 6])
};
const thematicSceneCountByHall = museumData.scenes.reduce((map, scene) => {
    if (!scene?.isThematic) {
        return map;
    }

    const match = String(scene.id || "").match(/^scene-theme-([a-z0-9_-]+)-(\d+)$/i);
    if (!match) {
        return map;
    }

    const hallKey = match[1];
    const sceneNumber = Number(match[2]);
    const currentMax = map.get(hallKey) || 0;
    map.set(hallKey, Math.max(currentMax, sceneNumber));
    return map;
}, new Map());

const catalogPanel = document.getElementById("catalog-panel");
const catalogOverlay = document.getElementById("catalog-overlay");
const catalogSearch = document.getElementById("catalog-search");
const catalogEmpty = document.getElementById("catalog-empty");
const catalogList = document.getElementById("catalog-list");
const wrapper = document.getElementById("wrapper");
const catalogToggle = document.getElementById("catalog-toggle");
const homeButton = document.querySelector(".home-btn");
const mobileFocusMedia = window.matchMedia("(max-width: 900px), (max-height: 540px) and (orientation: landscape)");

let artifacts = [];
let catalogItems = [];
let scenes = [];
let mobileSceneButtons = [];
let currentIndex = 0;
let currentExhibit = null;
let modal3dRequestToken = 0;

const modalZoomState = {
    scale: 1,
    x: 0,
    y: 0,
    isPanning: false,
    lastClientX: 0,
    lastClientY: 0
};

function applyModalZoomTransform() {
    const modalImage = document.getElementById("modal-img");
    const modalPicture = document.getElementById("modal-picture");

    if (!modalImage || !modalPicture) {
        return;
    }

    const { scale, x, y } = modalZoomState;
    modalImage.style.transformOrigin = "center center";
    modalImage.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    modalPicture.classList.toggle("is-zoomed", scale > 1);
}

function resetModalZoom() {
    modalZoomState.scale = 1;
    modalZoomState.x = 0;
    modalZoomState.y = 0;
    modalZoomState.isPanning = false;
    applyModalZoomTransform();
}

function setupModalZoom() {
    const modalImage = document.getElementById("modal-img");
    const modalPicture = document.getElementById("modal-picture");

    if (!modalImage || !modalPicture) {
        return;
    }

    // Клик — переключение между 1x и 2x
    modalPicture.addEventListener("click", event => {
        // Не мешаем клику по 3D-модели, она в другом блоке
        if (event.target !== modalImage && event.target !== modalPicture) {
            return;
        }

        if (modalZoomState.scale === 1) {
            modalZoomState.scale = 2;
        } else {
            modalZoomState.scale = 1;
            modalZoomState.x = 0;
            modalZoomState.y = 0;
        }

        applyModalZoomTransform();
    });

    // Панорамирование мышью
    modalPicture.addEventListener("mousedown", event => {
        if (modalZoomState.scale === 1 || event.button !== 0) {
            return;
        }

        modalZoomState.isPanning = true;
        modalZoomState.lastClientX = event.clientX;
        modalZoomState.lastClientY = event.clientY;
        event.preventDefault();
    });

    window.addEventListener("mousemove", event => {
        if (!modalZoomState.isPanning || modalZoomState.scale === 1) {
            return;
        }

        const dx = event.clientX - modalZoomState.lastClientX;
        const dy = event.clientY - modalZoomState.lastClientY;
        modalZoomState.lastClientX = event.clientX;
        modalZoomState.lastClientY = event.clientY;

        modalZoomState.x += dx;
        modalZoomState.y += dy;
        applyModalZoomTransform();
    });

    window.addEventListener("mouseup", () => {
        modalZoomState.isPanning = false;
    });

    // Сброс по двойному клику
    modalPicture.addEventListener("dblclick", event => {
        if (event.target !== modalImage && event.target !== modalPicture) {
            return;
        }

        resetModalZoom();
    });
}

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

function getRenderableSceneExhibits(scene) {
    return getSceneExhibits(scene.id);
}

function getThematicSceneMeta(scene) {
    if (!scene?.isThematic) {
        return null;
    }

    const match = String(scene.id || "").match(/^scene-theme-([a-z0-9_-]+)-(\d+)$/i);
    if (!match) {
        return null;
    }

    return {
        hallKey: match[1],
        sceneNumber: Number(match[2])
    };
}

function shouldUseCompactPairLayout(scene, sceneExhibits) {
    return sceneExhibits.length === 2;
}

function getInitialSceneExhibit(sceneId) {
    const scene = getSceneById(sceneId);
    const sceneExhibits = scene ? getRenderableSceneExhibits(scene) : getSceneExhibits(sceneId);
    return sceneExhibits[0]?.id || "";
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
    const sourceScene = getSceneById(exhibit.sourceSceneId);
    return [
        exhibit.id,
        exhibit.label,
        exhibit.title,
        exhibit.description,
        scene?.label,
        scene?.hallTitle,
        scene?.eraLabel,
        sourceScene?.label,
        ...(exhibit.searchTerms || [])
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
}

function getCatalogHallLabel(scene, exhibit) {
    return resolveCatalogHallTitle(exhibit, scene);
}

function buildCatalogMeta(exhibit, scene) {
    const parts = [];
    const periodLabel = scene?.eraLabel || scene?.label || "";

    if (scene?.isThematic) {
        if (periodLabel) {
            parts.push(periodLabel);
        }
    } else {
        parts.push("Хронология");
        if (periodLabel) {
            parts.push(periodLabel);
        }
    }

    if (exhibit.has3D) {
        parts.push("3D");
    }

    return parts.join(" • ");
}
function getCatalogGroups() {
    const sceneOrder = new Map(museumData.scenes.map((scene, index) => [scene.id, index]));
    const groups = [];
    const groupsByLabel = new Map();

    museumData.exhibits
        .slice()
        .sort((a, b) => {
            const sceneDiff = (sceneOrder.get(a.sceneId) ?? 999) - (sceneOrder.get(b.sceneId) ?? 999);
            if (sceneDiff !== 0) {
                return sceneDiff;
            }

            const slotDiff = (slotOrder[a.slot] ?? 99) - (slotOrder[b.slot] ?? 99);
            if (slotDiff !== 0) {
                return slotDiff;
            }

            return String(a.title || a.label || a.id).localeCompare(String(b.title || b.label || b.id), "ru");
        })
        .forEach(exhibit => {
            const scene = getSceneById(exhibit.sceneId);
            const label = getCatalogHallLabel(scene, exhibit);
            let group = groupsByLabel.get(label);

            if (!group) {
                group = {
                    id: `catalog-hall-${groups.length + 1}`,
                    title: label,
                    exhibits: []
                };

                groupsByLabel.set(label, group);
                groups.push(group);
            }

            group.exhibits.push(exhibit);
        });

    return groups
        .filter(group => group.exhibits.length > 0)
        .sort((a, b) => {
            const aOrder = hallTitleOrder.get(a.title);
            const bOrder = hallTitleOrder.get(b.title);
            const aRank = Number.isInteger(aOrder) ? aOrder : Number.MAX_SAFE_INTEGER;
            const bRank = Number.isInteger(bOrder) ? bOrder : Number.MAX_SAFE_INTEGER;

            if (aRank !== bRank) {
                return aRank - bRank;
            }

            return a.title.localeCompare(b.title, "ru");
        });
}

function renderCatalog() {
    const groups = getCatalogGroups();
    const groupsMarkup = groups
        .map(group => `
            <section class="catalog-group" data-hall-id="${escapeHtml(group.id)}">
                <h3 class="catalog-group-title">${escapeHtml(group.title)}</h3>
                <div class="catalog-group-items">
                    ${group.exhibits.map(exhibit => {
                        const scene = getSceneById(exhibit.sceneId);
                        return `
                            <div class="catalog-item" data-type="${escapeHtml(exhibit.id)}" data-search="${escapeHtml(buildSearchText(exhibit))}">
                                <span class="catalog-item-title">${escapeHtml(exhibit.label || exhibit.title)}</span>
                                <span class="catalog-item-meta">${escapeHtml(buildCatalogMeta(exhibit, scene))}</span>
                            </div>
                        `;
                    }).join("")}
                </div>
            </section>
        `)
        .join("");

    catalogList.innerHTML = groupsMarkup;
}

function renderTimeline(scene) {
    const datesMarkup = timelineSlots
        .map((slot, index) => `<span class="timeline-date ${slot}">${escapeHtml(scene.timeline?.[index] || "")}</span>`)
        .join("");

    return datesMarkup;
}

function renderMobileFocusPicker(scene, sceneExhibits) {
    if (!sceneExhibits.length) {
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

function renderArtifactCard(exhibit, options = {}) {
    const effectiveSlot = options.slot || exhibit.slot;
    const artifactClasses = ["artifact", `slot-${effectiveSlot}`];
    const imageClasses = [];

    if (exhibit.id === "stul_derevyannyy_s_rezboy_3d") {
        artifactClasses.push("artifact-frame-chair");
    }

    if (exhibit.artifactClass) {
        artifactClasses.push(exhibit.artifactClass);
    }

    if (exhibit.imageClass) {
        imageClasses.push(exhibit.imageClass);
    }

    const imageClassAttr = imageClasses.length ? ` class="${escapeHtml(imageClasses.join(" "))}"` : "";
    const alt = escapeHtml(exhibit.title);
    const thumbSrc = exhibit.imageThumb || exhibit.image;
    const thumbWebpSrc = exhibit.imageThumbWebp;
    const imgTag = `<img${imageClassAttr} src="${escapeHtml(thumbSrc)}" alt="${alt}" loading="lazy" decoding="async">`;
    const pictureInner = thumbWebpSrc
        ? `<picture><source type="image/webp" srcset="${escapeHtml(thumbWebpSrc)}">${imgTag}</picture>`
        : imgTag;

    return `
        <div class="${escapeHtml(artifactClasses.join(" "))}" data-type="${escapeHtml(exhibit.id)}" data-scene-id="${escapeHtml(exhibit.sceneId)}">
            ${exhibit.has3D ? '<span class="artifact-3d-badge" aria-label="Доступен просмотр в 3D">3D</span>' : ""}
            <div class="info">${escapeHtml(exhibit.label || exhibit.title)}</div>
            ${pictureInner}
        </div>
    `;
}

function renderScene(scene, index) {
    const sceneExhibits = getRenderableSceneExhibits(scene);
    const isCompactPairLayout = shouldUseCompactPairLayout(scene, sceneExhibits);
    let sceneDisplaySlots = [];

    if (sceneExhibits.length === 1) {
        sceneDisplaySlots = ["center"];
    } else if (sceneExhibits.length === 2) {
        const currentSlots = sceneExhibits.map(exhibit => exhibit.slot);

        if (currentSlots[0] === "center" && currentSlots[1] === "right") {
            sceneDisplaySlots = ["left", "center"];
        } else if (currentSlots[0] === "left" && currentSlots[1] === "right") {
            sceneDisplaySlots = ["left", "right"];
        } else if (currentSlots[0] === "left" && currentSlots[1] === "center") {
            sceneDisplaySlots = ["left", "center"];
        } else {
            sceneDisplaySlots = ["left", "center"];
        }
    }

    if (isCompactPairLayout) {
        sceneDisplaySlots = ["left", "right"];
    }

    const placementsMarkup = sceneExhibits
        .map((exhibit, exhibitIndex) => renderArtifactCard(exhibit, { slot: sceneDisplaySlots[exhibitIndex] }))
        .join("");
    const mobilePickerMarkup = renderMobileFocusPicker(scene, sceneExhibits);
    const sceneHeaderTitle = String(
        scene.hallTitle
        || (Array.isArray(scene.transitionFromHalls) ? scene.transitionFromHalls.join(", ") : "")
        || scene.label
        || ""
    ).trim();
    const noteMarkup = !placementsMarkup && scene.note
        ? `<div class="scene-note">${escapeHtml(scene.note)}</div>`
        : "";

    return `
        <section class="scene scene-thematic${!placementsMarkup ? " scene-empty" : ""}${sceneExhibits.length === 1 ? " scene-single-artifact" : ""}${isCompactPairLayout ? " scene-two-artifacts scene-two-artifacts-compact" : ""}${scene.isTransition ? " scene-transition" : ""}" data-scene-id="${escapeHtml(scene.id)}" data-scene-index="${index}" style="background-image:url('${escapeHtml(scene.background)}')">
            <div class="scene-era">${escapeHtml(sceneHeaderTitle)}</div>
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
        const sceneModel = getSceneById(sceneId);
        const sceneExhibits = sceneModel ? getRenderableSceneExhibits(sceneModel) : getSceneExhibits(sceneId);
        const hasExhibits = sceneExhibits.length > 0;
        const activeType = mobileSceneSelections.get(sceneId) || getInitialSceneExhibit(sceneId);
        const enableFocusMode = useMobileFocus && hasExhibits;

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

    currentExhibit = exhibit;
    resetModalZoom();

    mobileSceneSelections.set(exhibit.sceneId, exhibit.id);
    applyResponsiveSceneMode();

    const modalImage = document.getElementById("modal-img");
    const modalElement = document.getElementById("modal");
    const modalPicture = document.getElementById("modal-picture");
    const modal3dWrap = document.getElementById("modal-3d-wrap");
    const modalImageLoading = document.getElementById("modal-image-loading");
    const modalSource = document.getElementById("modal-img-webp");
    const modalModel = document.getElementById("modal-model");
    const modalTitle = document.getElementById("modal-title");
    const modalDesc = document.getElementById("modal-desc");
    const modal3dSpinner = document.getElementById("modal-3d-spinner");
    const isLocalFile = window.location.protocol === "file:";
    const has3DModel = Boolean(exhibit.model);
    const posterBase = exhibit.poster || exhibit.image;
    const posterForModel = resolveWebpCompanion(posterBase) || posterBase;

    if (modalPicture) {
        modalPicture.style.display = "block";
    }
    if (modal3dWrap) {
        modal3dWrap.style.display = "none";
    }
    if (modalImageLoading) {
        modalImageLoading.style.display = "none";
        modalImageLoading.textContent = "Загрузка 3D…";
    }
    modalImage.style.display = "block";
    if (modal3dSpinner) {
        modal3dSpinner.style.display = "none";
    }
    modalModel.style.display = "none";
    modalModel.removeAttribute("src");
    modalModel.setAttribute("poster", posterForModel);
    modalImage.src = exhibit.image;

    if (exhibit.imageWebp && modalSource) {
        modalSource.setAttribute("srcset", exhibit.imageWebp);
    } else if (modalSource) {
        modalSource.removeAttribute("srcset");
    }

    if (has3DModel && !isLocalFile) {
        const requestToken = ++modal3dRequestToken;
        if (modalImageLoading) {
            modalImageLoading.style.display = "flex";
            modalImageLoading.textContent = "Загрузка 3D…";
        }

        if (modal3dWrap) {
            // Держим контейнер "живым" для загрузки model-viewer, но исключаем из потока layout.
            modal3dWrap.style.display = "block";
            modal3dWrap.style.position = "absolute";
            modal3dWrap.style.opacity = "0";
            modal3dWrap.style.pointerEvents = "none";
            modal3dWrap.style.inset = "0 auto auto 0";
            modal3dWrap.style.visibility = "hidden";
        }

        modalModel.style.display = "block";
        modalModel.setAttribute("loading", "eager");
        modalModel.src = exhibit.model;

        let settled = false;
        let watchdogId = null;

        const showModel = () => {
            if (requestToken !== modal3dRequestToken || settled) {
                return;
            }
            settled = true;
            if (watchdogId) {
                window.clearTimeout(watchdogId);
            }

            if (modalImageLoading) {
                modalImageLoading.style.display = "none";
            }
            if (modalPicture) {
                modalPicture.style.display = "none";
            }
            if (modal3dWrap) {
                modal3dWrap.style.display = "block";
                modal3dWrap.style.position = "relative";
                modal3dWrap.style.opacity = "1";
                modal3dWrap.style.pointerEvents = "auto";
                modal3dWrap.style.inset = "auto";
                modal3dWrap.style.visibility = "visible";
            }
        };

        const failModel = () => {
            if (requestToken !== modal3dRequestToken || settled) {
                return;
            }
            settled = true;
            if (watchdogId) {
                window.clearTimeout(watchdogId);
            }

            if (modal3dWrap) {
                modal3dWrap.style.display = "none";
                modal3dWrap.style.position = "relative";
                modal3dWrap.style.opacity = "1";
                modal3dWrap.style.pointerEvents = "auto";
                modal3dWrap.style.inset = "auto";
                modal3dWrap.style.visibility = "visible";
            }
            if (modalPicture) {
                modalPicture.style.display = "block";
            }
            if (modalImageLoading) {
                modalImageLoading.style.display = "none";
            }
        };

        // На некоторых мобильных браузерах событие load может приходить нестабильно.
        // Чтобы избежать бесконечного "Загрузка 3D...", через таймаут показываем контейнер модели.
        watchdogId = window.setTimeout(() => {
            if (requestToken !== modal3dRequestToken || settled) {
                return;
            }
            showModel();
        }, 20000);

        modalModel.addEventListener("load", showModel, { once: true });
        modalModel.addEventListener("error", failModel, { once: true });
        modalModel.addEventListener("model-error", failModel, { once: true });
    }

    modalTitle.innerText = exhibit.title;
    modalDesc.innerText = exhibit.description || defaultDescription;
    if (modalElement) {
        modalElement.classList.toggle("modal-chair-focus", exhibit.id === "stul_derevyannyy_s_rezboy_3d");
    }

    if (has3DModel && isLocalFile) {
        modalDesc.innerText += " 3D-модель откроется после запуска сайта через локальный сервер или хостинг, а не напрямую как file:// файл.";
    }

    if (modalElement) {
        modalElement.style.display = "block";
    }
    homeButton.classList.add("hidden");
}

function closeModal() {
    const modalElement = document.getElementById("modal");
    const modalImage = document.getElementById("modal-img");
    const modalPicture = document.getElementById("modal-picture");
    const modal3dWrap = document.getElementById("modal-3d-wrap");
    const modalImageLoading = document.getElementById("modal-image-loading");
    const modalSource = document.getElementById("modal-img-webp");
    const modalModel = document.getElementById("modal-model");
    const modal3dSpinner = document.getElementById("modal-3d-spinner");

    if (modalElement) {
        modalElement.style.display = "none";
        modalElement.classList.remove("modal-chair-focus");
    }
    modalImage.style.display = "block";
    if (modalPicture) {
        modalPicture.style.display = "block";
    }
    if (modal3dWrap) {
        modal3dWrap.style.display = "none";
        modal3dWrap.style.position = "relative";
        modal3dWrap.style.opacity = "1";
        modal3dWrap.style.pointerEvents = "auto";
        modal3dWrap.style.inset = "auto";
        modal3dWrap.style.visibility = "visible";
    }
    if (modalImageLoading) {
        modalImageLoading.style.display = "none";
    }
    if (modal3dSpinner) {
        modal3dSpinner.style.display = "none";
    }
    if (modalSource) {
        modalSource.removeAttribute("srcset");
    }

    modalModel.style.display = "none";
    modalModel.removeAttribute("src");
    modal3dRequestToken++;

    resetModalZoom();

    if (document.getElementById("home").style.display === "none") {
        homeButton.classList.remove("hidden");
    }
}

function openArtifactImageInNewTab() {
    if (!currentExhibit || !currentExhibit.image) {
        return;
    }

    try {
        window.open(currentExhibit.image, "_blank", "noopener,noreferrer");
    } catch (_error) {
        // В некоторых средах window.open может быть заблокирован.
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
    const catalogGroups = [...catalogList.querySelectorAll(".catalog-group")];

    catalogItems.forEach(item => {
        const searchText = item.dataset.search || item.textContent.toLowerCase();
        const isMatch = searchText.includes(query);
        item.style.display = isMatch ? "flex" : "none";

        if (isMatch) {
            visibleCount++;
        }
    });

    catalogGroups.forEach(group => {
        const hasVisibleItems = [...group.querySelectorAll(".catalog-item")].some(item => item.style.display !== "none");

        group.hidden = !hasVisibleItems;
    });

    if (visibleCount === 0) {
        catalogList.scrollTop = 0;
    }

    catalogList.classList.toggle("is-empty", visibleCount === 0);
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

setupModalZoom();
















