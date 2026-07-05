#!/usr/bin/env python3
"""Extract the 26 BLEXX alphabet glyphs from BLEXX_Alphabet.pdf as SVGs.

Each glyph is emitted as assets/alphabet/<letter>.svg with a normalized
viewBox and fill="currentColor", so the app can ink glyphs in any house
color. Re-run whenever the alphabet PDF changes.

Usage: python3 tools/extract_alphabet.py [path-to-pdf]
"""
import sys
import string
from pathlib import Path

import fitz  # PyMuPDF

PDF_DEFAULT = "/Users/bustin/Desktop/BLEXX/BLEXX-2/Alphabet - Cards - Icons/BLEXX_Alphabet.pdf"
OUT_DIR = Path(__file__).resolve().parent.parent / "assets" / "alphabet"

TILE_W_RANGE = (45, 70)  # blue rounded squares are ~55x57pt
BLUE = (0.0, 0.298, 0.992)
RED = (0.992, 0.004, 0.235)


def is_color(fill, target, tol=0.05):
    if not fill:
        return False
    return all(abs(a - b) <= tol for a, b in zip(fill, target))


def drawing_to_path_d(drawing):
    """Rebuild an SVG path 'd' string from a PyMuPDF drawing's items."""
    d = []
    cur = None
    start = None
    for item in drawing["items"]:
        op = item[0]
        if op == "l":
            p1, p2 = item[1], item[2]
            if cur is None or (abs(cur.x - p1.x) > 1e-4 or abs(cur.y - p1.y) > 1e-4):
                if start is not None:
                    d.append("Z")
                d.append(f"M {p1.x:.2f} {p1.y:.2f}")
                start = p1
            d.append(f"L {p2.x:.2f} {p2.y:.2f}")
            cur = p2
        elif op == "c":
            p1, p2, p3, p4 = item[1], item[2], item[3], item[4]
            if cur is None or (abs(cur.x - p1.x) > 1e-4 or abs(cur.y - p1.y) > 1e-4):
                if start is not None:
                    d.append("Z")
                d.append(f"M {p1.x:.2f} {p1.y:.2f}")
                start = p1
            d.append(
                f"C {p2.x:.2f} {p2.y:.2f} {p3.x:.2f} {p3.y:.2f} {p4.x:.2f} {p4.y:.2f}"
            )
            cur = p4
        elif op == "re":
            r = item[1]
            if start is not None:
                d.append("Z")
            d.append(
                f"M {r.x0:.2f} {r.y0:.2f} H {r.x1:.2f} V {r.y1:.2f} H {r.x0:.2f}"
            )
            start = fitz.Point(r.x0, r.y0)
            cur = start
        elif op == "qu":
            q = item[1]
            if start is not None:
                d.append("Z")
            d.append(
                f"M {q.ul.x:.2f} {q.ul.y:.2f} L {q.ur.x:.2f} {q.ur.y:.2f} "
                f"L {q.lr.x:.2f} {q.lr.y:.2f} L {q.ll.x:.2f} {q.ll.y:.2f}"
            )
            start = q.ul
            cur = q.ll
    if start is not None:
        d.append("Z")
    return " ".join(d)


def main():
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else PDF_DEFAULT
    page = fitz.open(pdf_path)[0]
    drawings = page.get_drawings()

    tiles = [
        d for d in drawings
        if is_color(d.get("fill"), BLUE)
        and TILE_W_RANGE[0] <= d["rect"].width <= TILE_W_RANGE[1]
        and TILE_W_RANGE[0] <= d["rect"].height <= TILE_W_RANGE[1]
    ]
    # reading order: cluster rows by y, then sort by x
    tiles.sort(key=lambda d: (round(d["rect"].y0 / 40), d["rect"].x0))
    assert len(tiles) == 26, f"expected 26 tiles, found {len(tiles)}"

    reds = [d for d in drawings if is_color(d.get("fill"), RED) and d["rect"].width < 200]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for letter, tile in zip(string.ascii_lowercase, tiles):
        tr = tile["rect"]
        glyphs = [d for d in reds if tr.contains(d["rect"])]
        assert glyphs, f"no glyph paths found inside tile for '{letter}'"
        pad = 2
        paths = []
        for g in glyphs:
            rule = ' fill-rule="evenodd"' if g.get("even_odd") else ""
            paths.append(f'<path d="{drawing_to_path_d(g)}"{rule}/>')
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="{tr.x0 - pad:.2f} {tr.y0 - pad:.2f} '
            f'{tr.width + 2 * pad:.2f} {tr.height + 2 * pad:.2f}" '
            f'fill="currentColor">'
            + "".join(paths)
            + "</svg>"
        )
        (OUT_DIR / f"{letter}.svg").write_text(svg)
        print(f"{letter}: {len(glyphs)} path(s)  tile=({tr.x0:.0f},{tr.y0:.0f})")

    print(f"\nwrote {len(tiles)} glyphs to {OUT_DIR}")


if __name__ == "__main__":
    main()
