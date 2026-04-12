#!/usr/bin/env python3
"""
Заменяет «Описание в разработке…» в museum-data.js на тексты из коммита git,
где они уже были. Если в старой версии текста нет — подставляет нейтральную
заготовку по названию экспоната (без выдуманных фактов).
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MUSEUM_PATH = ROOT / "assets" / "js" / "museum-data.js"
# Коммит до массовой подстановки плейсхолдеров (все id из текущего файла там есть)
GIT_REF = "935ff56"

def is_placeholder_text(s: str) -> bool:
    """Тексты-заглушки в разных формулировках."""
    if not (s or "").strip():
        return False
    if "Описание в разработке" in s:
        return True
    if "пока уточняется" in s and "временно размещён" in s:
        return True
    if "временно размещён" in s and "на основании его названия" in s:
        return True
    return False

sys.path.insert(0, str(Path(__file__).parent))
import apply_exponaty as ae  # noqa: E402


def get_field_string(obj: str, field: str) -> str | None:
    pat = re.compile(
        rf"^[ \t]*{field}:\s*\"((?:\\.|[^\"\\])*)\"",
        re.MULTILINE | re.DOTALL,
    )
    m = pat.search(obj)
    return m.group(1) if m else None


def js_unescape_inner(inner: str) -> str:
    return inner.replace("\\n", "\n").replace('\\"', '"').replace("\\\\", "\\")


def load_old_museum_text() -> str:
    r = subprocess.run(
        ["git", "show", f"{GIT_REF}:assets/js/museum-data.js"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if r.returncode != 0:
        raise RuntimeError(
            f"git show {GIT_REF} failed: {r.stderr.strip() or r.stdout.strip()}"
        )
    return r.stdout


def build_old_description_map(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for _start, _end, obj in ae.extract_exhibit_objects(text):
        id_m = re.search(r'id:\s*"([^"]+)"', obj)
        if not id_m:
            continue
        raw = get_field_string(obj, "description")
        if raw is None:
            continue
        out[id_m.group(1)] = js_unescape_inner(raw).strip()
    return out


def generic_description(title: str) -> str:
    t = (title or "Экспонат").strip()
    return (
        f"{t}\n\n"
        "Экспонат виртуального музея Саратовской государственной юридической академии. "
        "Развёрнутое описание и историческая справка будут добавлены по мере уточнения "
        "музейного учёта."
    )


def main() -> None:
    old_text = load_old_museum_text()
    old_desc = build_old_description_map(old_text)

    text = MUSEUM_PATH.read_text(encoding="utf-8")
    parts: list[str] = []
    prev = 0
    n_restored = 0
    n_generic = 0

    for start, end, obj in ae.extract_exhibit_objects(text):
        parts.append(text[prev:start])
        id_m = re.search(r'id:\s*"([^"]+)"', obj)
        eid = id_m.group(1) if id_m else None
        raw = get_field_string(obj, "description") if eid else None
        if raw is None:
            parts.append(obj)
            prev = end
            continue
        cur = js_unescape_inner(raw)

        if eid and is_placeholder_text(cur):
            title_raw = get_field_string(obj, "title")
            title = js_unescape_inner(title_raw) if title_raw else eid
            old = old_desc.get(eid, "").strip()
            if old and not is_placeholder_text(old) and len(old) > 3:
                new_desc = old
                n_restored += 1
            else:
                new_desc = generic_description(title)
                n_generic += 1
            new_obj = ae.replace_field(obj, "description", new_desc)
            parts.append(new_obj)
        else:
            parts.append(obj)
        prev = end

    parts.append(text[prev:])
    MUSEUM_PATH.write_text("".join(parts), encoding="utf-8")
    print(
        f"Placeholder cleanup: restored from {GIT_REF}: {n_restored}, "
        f"generic fallback: {n_generic}"
    )


if __name__ == "__main__":
    main()
