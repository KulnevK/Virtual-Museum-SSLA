#!/usr/bin/env python3
"""
Patch assets/js/museum-data.js: merge exponaty.docx «Описание» + «Историческая связь»
into description; set title/label from official «Название» where mapped.

Mapping is manual (exhibit id -> row index in tools/exponaty_rows.json).
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROWS_PATH = ROOT / "tools" / "exponaty_rows.json"
MUSEUM_PATH = ROOT / "assets" / "js" / "museum-data.js"

# exhibit_id -> row index (0-based) in exponaty_rows.json
EXHIBIT_ROW: dict[str, int] = {
    "bust": 0,
    "phone": 1,
    "statue": 2,
    "protivbak": 3,
    "flyaga": 4,
    "gagarin": 6,
    "esenin": 7,
    "pushka": 8,
    "suvenir": 9,
    "kruzhka": 10,
    "portfel": 11,
    "portfel_rektora_professora_v_a_poznanskogo_3d": 11,
    "clock": 12,
    "statuetka": 13,
    "papka_s_dokumentami": 14,
    "diplom": 15,
    "konstsud": 16,
    "camera": 17,
    "rsv": 18,
    "medalveteran": 27,
    "medaljapan": 28,
    "ordenskaya_knizhka_chermenskiy_ivan": 29,
    "model_samoleta_ilya_muromets_na_podstavke_3d": 34,
    "stul_derevyannyy_s_rezboy_3d": 35,
    "pozdravitelnaya_tablichka_v_svyazi_s_yubileem": 36,
    "pozdravitelnaya_otkrytka": 36,
    "exposiz": 37,
    "kaska_3d": 39,
    "kaska_3d_2": 39,
    "vympel": 41,
    "vympel_2": 41,
    "vympel_3": 41,
    "vypel_3": 41,
    "ofitserskaya_polevaya_furazhka": 42,
    "ofitserskaya_sumka_3d": 43,
    "syui_v_pamyat_o_vstreche_vypusknikov_1947_goda_ot_vypusknitsy_zinich_3": 44,
    "svidetelstvo": 46,
    "kubok_s_harkova_3d": 47,
    "urkubok": 47,
    "katushechnyy_magnitofon_3d": 48,
    "kinoproektor_3d": 49,
    "udostovstud": 51,
    "mvd": 54,
    "znak_sgap": 56,
    "znachok_druzhinnik_sssr": 57,
    "udostoverenie_oon_baytin_m_i_60_let_obrazovaniya_onn": 58,
    "frontovik59": 60,
    "attestat_dotsenta_2": 61,
    "attestat_dotsenta": 63,
    "attekstat_dotsenta": 63,
    "blagodarstvennoe_pismo": 65,
    "pochetnaya_gramota_2": 66,
    "pochetnaya_gramota": 88,
    "sobinov196": 70,
    "petr1": 78,
    "kartina": 79,
    "kartina_2": 80,
    "kartina_3": 81,
    "kartina_4": 82,
    "kartina_5": 83,
    "kartina_6": 85,
    "kartina_7": 84,
    "kartina_8": 85,
    "kartina_korabl": 84,
    "ofitserskaya_papaha_3d": 89,
    "pamyatnyy_znak": 75,
    "znachok_chkv": 76,
    "ordenskaya_planka_2": 87,
    "udostoverenie_ministra_vysshego_i_srednego_spetsialnogo_obrazovanie_rs": 22,
}


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")


def merge_description(row: dict) -> str:
    """Склеивает описание и историческую связь с явным абзацным разрывом."""
    d = (row.get("description") or "").strip()
    h = (row.get("history") or "").strip()
    if d and h:
        return f"{d.rstrip()}\n\n{h.lstrip()}"
    return d or h


def replace_field(obj: str, field: str, new_value: str) -> str:
    esc = js_escape(new_value)
    pat = re.compile(
        rf"^([ \t]*{field}:\s*)\"(?:\\.|[^\"\\])*\"",
        re.MULTILINE,
    )
    if not pat.search(obj):
        raise ValueError(f"field {field!r} not found in exhibit object")

    def repl(m: re.Match[str]) -> str:
        return f'{m.group(1)}"{esc}"'

    return pat.sub(repl, obj, count=1)


def extract_exhibit_objects(text: str) -> list[tuple[int, int, str]]:
    """Return list of (start, end, object_str) for each exhibit `{ id: ...` block."""
    out = []
    for m in re.finditer(
        r'^\s+\{\s*\n\s+id:\s*"([^"]+)"\s*,\s*\n\s+sceneId:\s*"([^"]+)"',
        text,
        re.MULTILINE,
    ):
        start = m.start()
        i, depth, in_str, esc = start, 0, False, False
        while i < len(text):
            c = text[i]
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
                        out.append((start, i + 1, text[start : i + 1]))
                        break
            i += 1
    return out


def main() -> None:
    rows = json.loads(ROWS_PATH.read_text(encoding="utf-8"))
    text = MUSEUM_PATH.read_text(encoding="utf-8")

    parts: list[str] = []
    prev = 0
    patched = 0

    for start, end, obj in extract_exhibit_objects(text):
        id_m = re.search(r'id:\s*"([^"]+)"', obj)
        if not id_m:
            continue
        eid = id_m.group(1)
        parts.append(text[prev:start])
        if eid in EXHIBIT_ROW:
            ri = EXHIBIT_ROW[eid]
            row = rows[ri]
            name = (row.get("name") or "").strip()
            merged = merge_description(row)
            new_obj = obj
            new_obj = replace_field(new_obj, "title", name)
            new_obj = replace_field(new_obj, "label", name)
            new_obj = replace_field(new_obj, "description", merged)
            parts.append(new_obj)
            patched += 1
        else:
            parts.append(obj)
        prev = end

    parts.append(text[prev:])
    new_text = "".join(parts)
    MUSEUM_PATH.write_text(new_text, encoding="utf-8")
    print(f"Patched {patched} exhibit(s) from exponaty_rows.json")


if __name__ == "__main__":
    main()
