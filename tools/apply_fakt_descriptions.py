#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Сопоставление экспонатов museum-data.js с таблицей Muzey_FAKT(1).docx
и обновление полей description, при необходимости label и title.
"""
from __future__ import annotations

import json
import re
import zipfile
import xml.etree.ElementTree as ET
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "Muzey_FAKT(1).docx"
MUSEUM_DATA = ROOT / "assets" / "js" / "museum-data.js"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def load_fakt_rows() -> list[tuple[str, str]]:
    with zipfile.ZipFile(DOCX) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    rows: list[tuple[str, str]] = []
    for tbl in root.findall(".//w:tbl", NS):
        for tr in tbl.findall("w:tr", NS):
            cells: list[str] = []
            for tc in tr.findall("w:tc", NS):
                parts: list[str] = []
                for t in tc.findall(".//w:t", NS):
                    if t.text:
                        parts.append(t.text)
                    if t.tail:
                        parts.append(t.tail)
                cells.append("".join(parts).strip())
            if len(cells) >= 4 and cells[1] and cells[1] != "Название":
                name, note = cells[1], cells[3]
                note = re.sub(r"\s*\|\s*$", "", note)
                note = re.sub(r"\s+", " ", note).strip()
                rows.append((name, note))
    return rows


def norm(s: str) -> str:
    s = s.lower().replace("ё", "е")
    s = re.sub(r"[«»\"'`]", " ", s)
    s = re.sub(r"[^\w\s\-]", " ", s, flags=re.UNICODE)
    return re.sub(r"\s+", " ", s).strip()


def polish_note(note: str, fakt_name: str) -> str:
    note = note.strip()
    note = re.sub(r"\s+", " ", note)
    note = note.replace("по материалом", "по материалам")
    note = re.sub(r"(\d{4})г\.", r"\1 г.", note)
    # артефакты слияния ячеек в исходной таблице
    note = note.replace("Кому принадлежит?Нужно проверить", " ")
    note = re.sub(r"\s+", " ", note).strip()
    if "Экспозиция из природных камней" in fakt_name and "Коллекция была собрана" in note:
        idx = note.find("Коллекция была собрана")
        note = note[idx:]
    if not note:
        return f"В музейной описи: «{fakt_name}». Сведения о происхождении предмета уточняются."
    return note


def museum_description(note: str, fakt_name: str) -> str:
    """Текст описания — примечание из таблицы фактов (без отдельной вводной про «экспонат коллекции»)."""
    return polish_note(note, fakt_name)


def js_escape(s: str) -> str:
    return (
        s.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
        .replace("\r", "")
    )


def extract_object(s: str, start: int) -> tuple[str, int] | tuple[None, int]:
    i = start
    depth = 0
    in_str = False
    esc = False
    while i < len(s):
        c = s[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
        else:
            if c == '"':
                in_str = True
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    return s[start : i + 1], i + 1
        i += 1
    return None, start


def parse_exhibits(text: str) -> list[tuple[int, int, str]]:
    out: list[tuple[int, int, str]] = []
    for m in re.finditer(
        r"\{\s*\n\s+id:\s*\"([^\"]+)\"\s*,\s*\n\s+sceneId:\s*\"([^\"]+)\"",
        text,
    ):
        obj, _ = extract_object(text, m.start())
        if obj:
            out.append((m.start(), m.end(), obj))
    return out


def q(obj: str, field: str) -> str:
    mm = re.search(rf"{field}:\s*\"((?:\\.|[^\"\\])*)\"", obj)
    return mm.group(1).replace("\\n", "\n") if mm else ""


def sub_field(obj: str, field: str, new_val: str) -> str:
    esc = js_escape(new_val)

    def repl(m: re.Match) -> str:
        return f'{field}: "{esc}"'

    return re.sub(rf"({field}:\s*)\"((?:\\.|[^\"\\])*)\"", repl, obj, count=1)


def best_fakt_match(
    label: str,
    title: str,
    eid: str,
    fakt_rows: list[tuple[str, str]],
    banned_names: set[str] | None = None,
) -> tuple[str, str, float]:
    banned_names = banned_names or set()
    blob = " ".join([title, label, eid.replace("_", " ")])
    nb, nt, nid = norm(label), norm(title), norm(eid.replace("_", " "))
    best: tuple[str, str, float] = ("", "", 0.0)
    for name, note in fakt_rows:
        if name in banned_names:
            continue
        nn = norm(name)
        if not nn:
            continue
        scores: list[float] = []
        if nn == nt or nn == nb:
            scores.append(1.0)
        if len(nn) > 5 and (nn in nt or nn in nb or nt in nn or nb in nn):
            scores.append(0.92)
        if len(nn) > 8 and (nn in nid or nid in nn):
            scores.append(0.88)
        scores.append(SequenceMatcher(None, nt, nn).ratio())
        scores.append(SequenceMatcher(None, nb, nn).ratio())
        scores.append(SequenceMatcher(None, norm(blob), nn).ratio() * 0.95)
        sc = max(scores)
        if sc > best[2]:
            best = (name, note, sc)
    return best


# Явные соответствия: id экспоната -> (отображаемое название, текст из факта или None если взять имя из факта)
# Значение может быть str (имя строки в таблице) или tuple (имя, переопределённый короткий title для карточки)
EXPLICIT: dict[str, str | tuple[str, str]] = {
    "exposiz": "Экспозиция из природных камней и минералов",
    "konstsud": "Статуэтка в виде материка от Всероссийского государственного университета юстиции",
    "urkubok": "1 место в фестивале юридических факультетов",
    "kubok_3d": "Кубок",
    "kubok_3d_2": "Кубок",  # второй «Кубок» — различим по индексу в списке дубликатов
    "nadpis_na_kubke_harkov": "Кубок с Харькова",
    "nadpis_na_snaryade": "учебный снаряд ЗИД КТМ-1-У",
    "nadpisna_kubke_latina": "Кубок",
    "ossnovanie_medali": "Основание от медали",
    "pamyatnyy_znachok": "Памятные значки",
    "grafin": "Хрустальный графин",
    "kruzhka": "Кружка синяя",
    "suvenir": "Статуэтка",
    "plastinka": "Пластинка",
    "plastinka_2": "Пластинка",
    "plastinka_3": "Пластинка",
    "plastinka_4": "Пластинка",
    "plastinka_5": "Пластинка",
    "plastinka_6": "Пластинка",
    "plastinka_7": "Пластинка",
    "plastinka_8": "Пластинка",
    "plastinka_9": "Пластинка",
    "plastinka_10": "Пластинка",
    "plastinka_11": "Пластинка",
    "portret": "Портрет",
    "pochetnaya_gramota": "грамота Президиума ВС СССР",
    "pochetnaya_gramota_2": "Почетная грамота генеральной прокуратуры",
    "svidetelstvo": "Свидетельство за высокие успехи и высокие результаты в работе по итогам 2004",
    "pozdravitelnaya_otkrytka": "Поздравительная табличка в связи с юбилеем",
    "pozdravitelnaya_tablichka_v_svyazi_s_yubileem_2": "Подарочная табличка от МГУ им. М.В. Ломоносова 2016 г.",
    "statuetka_s_delfinami_3d_2": "Статуэтка с дельфинами",
    "ordenskaya_planka_2": "Орденская планка",
    "kaska_3d_2": "Каски",
    "kotelok_2": "Котелки",
    "kotelok_3d": "Котелок",
    "armeyskiy_meshok_3d_2": "Армейский мешок 2 шт",
}

# Порядок раздачи записей «Книга» с разными примечаниями (имя в таблице, ориентир по примечанию)
BOOK_ASSIGNMENT = [
    ("Книги", "Подборка первых изданий учебников по праву"),
    ("Книги", "Книги который использовались для обучения"),
    ("Книга", "Наше дело правое"),
    ("Журналы", None),
    ("Уголовный кодекс", None),
    ("Книга", "Преподаватели СГЮА"),
    ("Книга", "докторской диссертации"),
    ("Книга", "Украина-5"),
    ("Книга", None),
    ("Сборник научных работ", None),
    ("Книги", "Подборка книг, которые использовались"),
]

BOOK_IDS_ORDER = [
    "kniga",
    "kniga_10",
    "kniga_11",
    "kniga_2",
    "kniga_3",
    "kniga_4",
    "kniga_5",
    "kniga_6",
    "kniga_7",
    "kniga_8",
    "kniga_9",
]


def find_fakt_row(
    rows: list[tuple[str, str]],
    name: str,
    note_substr: str | None,
    skip_first: int = 0,
) -> tuple[str, str]:
    candidates = [(n, note) for n, note in rows if n == name]
    if not candidates:
        for n, note in rows:
            if norm(n) == norm(name):
                candidates.append((n, note))
    if note_substr:
        matched = [(n, note) for n, note in candidates if note_substr.lower() in note.lower()]
        if skip_first < len(matched):
            return matched[skip_first]
        for n, note in rows:
            if n == name and note_substr.lower() in note.lower():
                return n, note
    if candidates and skip_first < len(candidates):
        return candidates[skip_first]
    if candidates:
        return candidates[0]
    for n, note in rows:
        if norm(name) in norm(n) or norm(n) in norm(name):
            if not note_substr or (note_substr.lower() in note.lower()):
                return n, note
    return name, ""


def resolve_kubok_duplicates(
    rows: list[tuple[str, str]],
) -> dict[str, tuple[str, str]]:
    """Два подряд «Кубок» с разными примечаниями."""
    kubok_rows = [(n, note) for n, note in rows if n == "Кубок"]
    return {
        "debates": kubok_rows[0] if len(kubok_rows) > 0 else ("Кубок", ""),
        "gift2007": kubok_rows[1] if len(kubok_rows) > 1 else kubok_rows[0] if kubok_rows else ("Кубок", ""),
    }


def main() -> None:
    fakt_rows = load_fakt_rows()
    kuboks = resolve_kubok_duplicates(fakt_rows)

    text = MUSEUM_DATA.read_text(encoding="utf-8")
    spans = parse_exhibits(text)
    new_chunks: list[str] = []
    last = 0
    book_iter = 0

    for start, _end, obj in spans:
        new_chunks.append(text[last:start])
        eid = q(obj, "id")
        label = q(obj, "label")
        title = q(obj, "title")

        fakt_name = ""
        fakt_note = ""
        new_title = None
        new_label = None

        if eid == "clock":
            fakt_name, fakt_note = find_fakt_row(fakt_rows, "Часы", "Борисов")
        elif eid == "chasy1":
            fakt_name = "Часы"
            fakt_note = (
                "Настольные часы с обозначением «СЧЗ на 4 камня» на циферблате. "
                "Связаны с периодом ректорства И. П. Демидова (1964–1971 гг.) и отражают обстановку кабинета руководителя вуза."
            )
        elif eid == "chasy2":
            fakt_name, fakt_note = find_fakt_row(fakt_rows, "Часы", "Слава")
            new_title = "Настольные часы «Слава» (11 камней)"
            new_label = "Часы «Слава», 11 камней"
        elif eid == "gagarin":
            fakt_name, fakt_note = find_fakt_row(fakt_rows, "Статуэтка-памятника", None)
        elif eid == "bust":
            for n, note in fakt_rows:
                if "Бюст коллективу" in n and "Знак почёта" in n:
                    fakt_name, fakt_note = n, note
                    break
            new_title = (
                "Бюст коллективу Саратовского ордена «Знак Почёта» "
                "юридического института им. Д. И. Курского"
            )
            new_label = "Бюст коллективу (орден «Знак Почёта»)"
        elif eid == "sgmu":
            fakt_name = "Сувенир партнёрского вуза"
            fakt_note = (
                "Памятный сувенир Саратовского государственного медицинского университета им. В. И. Разумовского, "
                "переданный в музей как знак межвузовского сотрудничества и общественной жизни региона."
            )
        elif eid == "sobinov196":
            fakt_name = "Сувенир Саратовской консерватории"
            fakt_note = (
                "Сувенирная продукция, связанная с Саратовской государственной консерваторией им. Л. В. Собинова. "
                "Отражает культурные связи юридического вуза с другими учебными заведениями города."
            )
        elif eid == "kaska_3d":
            fakt_name = "Каска"
            fakt_note = (
                "Стальной шлем (каска) советского солдата времён Великой Отечественной войны. "
                "Обнаружена при раскопках в Новгородской области и передана в музей в память о выпускниках, "
                "не вернувшихся с фронта."
            )
        elif eid == "kakarda":
            fakt_name = "Кокарда"
            fakt_note = (
                "Кокарда (нагрудный или наголовный знак различия) из предметов, связанных с военно-патриотической "
                "и правовой тематикой музейной экспозиции."
            )
            new_title = "Кокарда"
            new_label = "Кокарда"
        elif eid == "vympel":
            fakt_name = "Вымпел"
            fakt_note = (
                "Сувенирный вымпел Академии Федеральной службы исполнения наказания России. "
                "Отражает связи юридического вуза с правоохранительной и пенитенциарной системой, профильной для подготовки кадров."
            )
            new_title = "Вымпел Академии ФСИН России"
        elif eid == "vympel_2":
            fakt_name = "Вымпел"
            fakt_note = (
                "Тканевый сувенирный вымпел вузовского или ведомственного образца. "
                "Передан в дар музею партнёрами или выпускниками; дополняет раздел о межведомственных связях академии."
            )
            new_title = "Вымпел (сувенирный)"
        elif eid == "vympel_3":
            fakt_name = "Вымпел"
            fakt_note = (
                "Тканевый сувенирный вымпел. В коллекции музея соседствует с материалами о военной и правоохранительной подготовке студентов."
            )
            new_title = "Вымпел (сувенирный)"
        elif eid == "vypel_3":
            fakt_name = "Вымпел"
            fakt_note = (
                "Сувенирный вымпел Академии Федеральной службы исполнения наказания России. "
                "На полотнище — символика ведомственного учебного заведения; предмет передан в музей как знак сотрудничества."
            )
            new_title = "Вымпел Академии ФСИН России"
            new_label = "Вымпел"
        elif eid in EXPLICIT:
            spec = EXPLICIT[eid]
            if isinstance(spec, tuple):
                fakt_name, new_title = spec
            elif spec == "Кубок" and eid == "kubok_3d":
                fakt_name, fakt_note = kuboks["debates"]
            elif spec == "Кубок" and eid == "kubok_3d_2":
                fakt_name, fakt_note = kuboks["gift2007"]
            elif spec == "Кубок" and eid == "nadpisna_kubke_latina":
                fakt_name, fakt_note = kuboks["gift2007"]
            elif spec == "Пластинка":
                plat = [(n, nt) for n, nt in fakt_rows if n == "Пластинка"]
                plat_all = [(n, nt) for n, nt in fakt_rows if n in ("Пластинка", "Пластинки")]
                mnum = re.search(r"_(\d+)$", eid)
                idx = int(mnum.group(1)) - 1 if mnum else 0
                if eid == "plastinka":
                    idx = 0
                if idx < len(plat):
                    fakt_name, fakt_note = plat[idx]
                else:
                    fakt_name, fakt_note = plat_all[-1] if plat_all else ("Пластинка", "")
                    if not fakt_note:
                        fakt_note = (
                            "Виниловая грампластинка из фонда культурно-массовой работы института. "
                            "Подобные записи использовались на вечерах отдыха и в студенческих клубах."
                        )
            else:
                fakt_name = spec
                fakt_note = ""
                for n, note in fakt_rows:
                    if n == fakt_name or norm(n) == norm(fakt_name):
                        fakt_name, fakt_note = n, note
                        break
        elif eid == "kniga_stanovlenie_i_razvitie_sovetskogo_ugolovnogo_zakonodatelstva":
            fakt_name, fakt_note = find_fakt_row(
                fakt_rows,
                "Книга «Становление и развитие советского уголовного законодательства»",
                None,
            )
        elif eid == "kniga_pochetnyh_gostey":
            fakt_name, fakt_note = find_fakt_row(fakt_rows, "Книга почётных гостей", None)
            if not fakt_note:
                fakt_name, fakt_note = find_fakt_row(fakt_rows, "Книга почетных гостейКниги", None)
        elif eid in BOOK_IDS_ORDER:
            if book_iter < len(BOOK_ASSIGNMENT):
                bn, hint = BOOK_ASSIGNMENT[book_iter]
                fakt_name, fakt_note = find_fakt_row(fakt_rows, bn, hint)
                book_iter += 1
            else:
                fakt_name, fakt_note = find_fakt_row(fakt_rows, "Книги", None)
            base_title = fakt_name
            if bn == "Книги":
                if "Подборка первых" in fakt_note:
                    new_title = "Учебные издания преподавателей СЮИ (1950–1960-е годы)"
                elif "образовательном процессе" in fakt_note:
                    new_title = "Издания из учебно-методического фонда академии"
                else:
                    new_title = "Учебная и методическая литература института"
            elif fakt_note and len(fakt_note) < 100 and not fakt_note.startswith("Книга "):
                new_title = fakt_note.split(".")[0].strip()
            elif "Становление" in fakt_note:
                new_title = "«Становление и развитие советского уголовного законодательства»"
            elif "Наше дело правое" in fakt_note:
                new_title = "Книга «Наше дело правое. Мы победили»"
            elif "Преподаватели СГЮА" in fakt_note:
                new_title = "«Преподаватели СГЮА — заслуженные юристы РФ» (2011)"
            elif "Борисова" in fakt_note and "доктор" in fakt_note.lower():
                new_title = "Книга по материалам докторской диссертации В. В. Борисова"
            elif "Украина-5" in fakt_note:
                new_title = "Руководство по эксплуатации киноустановки «Украина-5»"
            elif bn == "Журналы":
                new_title = "Подшивки научных журналов"
            elif bn == "Уголовный кодекс":
                new_title = "Издание Уголовного кодекса (учебно-методический фонд)"
            elif bn == "Сборник научных работ":
                new_title = "Сборник научных работ (1957)"
            else:
                new_title = base_title
            new_label = new_title if len(new_title) < 60 else new_title[:57] + "…"
        else:
            fname, fnote, sc = best_fakt_match(label, title, eid, fakt_rows)
            if sc >= 0.52:
                fakt_name, fakt_note = fname, fnote
            else:
                fakt_name = title or label
                fakt_note = (
                    "Предмет музейного фонда Саратовской государственной юридической академии; "
                    "сведения о происхождении уточняются."
                )

        if not fakt_note and fakt_name:
            for n, note in fakt_rows:
                if n == fakt_name:
                    fakt_note = note
                    break

        display = new_title or title or label
        if new_title:
            display = new_title
        desc = museum_description(fakt_note, fakt_name or display)

        obj2 = sub_field(obj, "description", desc)
        if new_title:
            obj2 = sub_field(obj2, "title", new_title)
            obj2 = sub_field(obj2, "label", new_label or new_title)

        new_chunks.append(obj2)
        last = start + len(obj)

    new_chunks.append(text[last:])
    out = "".join(new_chunks)
    MUSEUM_DATA.write_text(out, encoding="utf-8")
    print("Updated", MUSEUM_DATA)


if __name__ == "__main__":
    main()
