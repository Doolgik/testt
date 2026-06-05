#!/usr/bin/env python3
"""Generate a GONE.Fludd-themed tattoo sketch (SVG) with the date 27.11.2026 hidden."""
import math

# --- date veiling ---------------------------------------------------------
# 1) Morse code ring encoding the digits 2 7 1 1 2 0 2 6
MORSE = {
    "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
    "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
}
digits = "27112026"

cx, cy, R = 300, 330, 165          # morse ring center + radius
elements = []                       # (is_dash) booleans, with gaps between digits
for i, d in enumerate(digits):
    for sym in MORSE[d]:
        elements.append(("dash" if sym == "-" else "dot"))
    elements.append("gap")          # separator between digits

n = len(elements)
ring = []
for i, kind in enumerate(elements):
    ang = -90 + (360.0 * i / n)     # start at top, go clockwise
    a = math.radians(ang)
    x = cx + R * math.cos(a)
    y = cy + R * math.sin(a)
    if kind == "dot":
        ring.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4.5" fill="#1a1a1a"/>')
    elif kind == "dash":
        # short tangential dash
        t = math.radians(ang + 90)
        dx, dy = 9 * math.cos(t), 9 * math.sin(t)
        ring.append(
            f'<line x1="{x-dx:.1f}" y1="{y-dy:.1f}" x2="{x+dx:.1f}" y2="{y+dy:.1f}" '
            f'stroke="#1a1a1a" stroke-width="5" stroke-linecap="round"/>')
ring_svg = "\n  ".join(ring)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="820" viewBox="0 0 600 820">
  <defs>
    <style>
      .ink   {{ fill:none; stroke:#1a1a1a; stroke-width:5;  stroke-linecap:round; stroke-linejoin:round; }}
      .thin  {{ fill:none; stroke:#1a1a1a; stroke-width:2.5;stroke-linecap:round; stroke-linejoin:round; }}
      .alien {{ fill:#cfe9d8; stroke:#1a1a1a; stroke-width:5; stroke-linejoin:round; }}
      .eye   {{ fill:#1a1a1a; }}
      .dark  {{ fill:#1a1a1a; }}
      .glow  {{ fill:#bfe0ff; }}
    </style>
  </defs>

  <rect width="600" height="820" fill="#fbf7ef"/>

  <!-- ===== outer medallion ring ===== -->
  <circle cx="{cx}" cy="{cy}" r="{R+34}" fill="none" stroke="#1a1a1a" stroke-width="3"/>
  <circle cx="{cx}" cy="{cy}" r="{R+30}" fill="none" stroke="#1a1a1a" stroke-width="1.5"/>

  <!-- ===== MORSE CODE RING (hidden date: 27 11 2026) ===== -->
  {ring_svg}

  <!-- ===== UFO beam glow behind alien ===== -->
  <path class="glow" d="M300 200 L210 470 Q300 510 390 470 Z" opacity="0.35"/>

  <!-- ===== ALIEN HEAD ===== -->
  <path class="alien" d="
    M300 205
    C 392 205, 432 285, 412 360
    C 398 412, 352 452, 300 452
    C 248 452, 202 412, 188 360
    C 168 285, 208 205, 300 205 Z"/>

  <!-- big almond eyes (angled) -->
  <path class="eye" d="M250 330 C 235 300, 262 292, 286 312 C 300 324, 282 350, 260 348 C 252 347, 252 338, 250 330 Z"/>
  <path class="eye" d="M350 330 C 365 300, 338 292, 314 312 C 300 324, 318 350, 340 348 C 348 347, 348 338, 350 330 Z"/>
  <circle class="glow" cx="278" cy="316" r="4"/>
  <circle class="glow" cx="322" cy="316" r="4"/>

  <!-- nostrils + mouth -->
  <path class="thin" d="M294 372 q 6 6 12 0"/>
  <path class="thin" d="M285 402 q 15 14 30 0"/>

  <!-- forehead contour shading -->
  <path class="thin" d="M252 250 q 48 -26 96 0"/>

  <!-- ===== little UFO above ===== -->
  <ellipse cx="300" cy="150" rx="70" ry="20" fill="#cfe9d8" stroke="#1a1a1a" stroke-width="5"/>
  <path class="ink" d="M255 142 q 45 -42 90 0"/>
  <circle class="dark" cx="270" cy="158" r="4"/>
  <circle class="dark" cx="300" cy="161" r="4"/>
  <circle class="dark" cx="330" cy="158" r="4"/>

  <!-- ===== scattered stars + glitch sparks ===== -->
  <g fill="#1a1a1a">
    <path d="M120 250 l4 10 l11 1 l-8 7 l3 11 l-10 -6 l-10 6 l3 -11 l-8 -7 l11 -1 Z"/>
    <path d="M480 250 l4 10 l11 1 l-8 7 l3 11 l-10 -6 l-10 6 l3 -11 l-8 -7 l11 -1 Z"/>
    <path d="M150 430 l3 8 l9 1 l-7 6 l2 9 l-7 -5 l-8 5 l2 -9 l-6 -6 l9 -1 Z"/>
    <path d="M455 430 l3 8 l9 1 l-7 6 l2 9 l-7 -5 l-8 5 l2 -9 l-6 -6 l9 -1 Z"/>
  </g>

  <!-- ===== wordmark ===== -->
  <text x="300" y="585" text-anchor="middle"
        font-family="'Courier New', monospace" font-size="46" font-weight="bold"
        letter-spacing="4" fill="#1a1a1a">GONE.FLUDD</text>

  <!-- ===== veiled date as Roman numerals on a faint orbit line ===== -->
  <line x1="120" y1="630" x2="480" y2="630" stroke="#1a1a1a" stroke-width="2"/>
  <circle cx="120" cy="630" r="4" fill="#1a1a1a"/>
  <circle cx="480" cy="630" r="4" fill="#1a1a1a"/>
  <text x="300" y="640" text-anchor="middle"
        font-family="Georgia, serif" font-size="30" letter-spacing="6"
        fill="#1a1a1a">XXVII · XI · MMXXVI</text>

  <!-- ===== star-map / coordinates style hidden date ===== -->
  <text x="300" y="700" text-anchor="middle"
        font-family="'Courier New', monospace" font-size="18" letter-spacing="3"
        fill="#1a1a1a" opacity="0.85">27.11 // 20:26 // SECTOR-26</text>

  <!-- legend (so the wearer/artist knows the cipher) -->
  <text x="300" y="760" text-anchor="middle"
        font-family="'Courier New', monospace" font-size="12" letter-spacing="1"
        fill="#1a1a1a" opacity="0.5">· — morse ring &amp; roman numerals encode 27.11.2026 —  ·</text>

  <rect x="14" y="14" width="572" height="792" fill="none" stroke="#1a1a1a" stroke-width="2.5" rx="14" opacity="0.45"/>
</svg>
'''

with open("gonefludd_tattoo_sketch.svg", "w") as f:
    f.write(svg)
print("written gonefludd_tattoo_sketch.svg")
print("morse elements:", n, "| digits:", digits)
