#!/usr/bin/env bash
set -euo pipefail
CDN="https://cdn.prod.website-files.com/633da33305ac754156026dd8"
SRC="src/assets"
PUB="public"
mkdir -p "$PUB/brand" "$PUB/ui" "$PUB/perks" \
"$SRC/game" "$SRC/team" "$SRC/opensource" "$SRC/badges"
get () { # get <remote-name> <local-path>
echo " -> $2"
curl -fsSL "$CDN/$1" -o "$2"
}
echo "brand + ui (SVG -> public/)"
get 63457dfe98bad5623602d3e0_scorewarrior-white.svg \
"$PUB/brand/logo-scorewarrior-white.svg"
get 63566f1edf5f0712f94f7f1b_sw-triangle-821890.svg \
"$PUB/brand/logo-triangle.svg"
get 633da33305ac75fa49026e00_icon_slider-arrow-left.svg \
"$PUB/ui/arrow-left.svg"
get 633da33305ac758a1a026e0b_icon_slider-arrow-right.svg \
"$PUB/ui/arrow-right.svg"
echo "perks icons (SVG -> public/)"
get 66fd45bfe259b4f8117dd000_travel2.svg "$PUB/perks/relocation.svg"
get 66fd44162ba8d5cebdb8d420_health.svg "$PUB/perks/health.svg"
get 66fd4416cf1badd0a8d9781d_family.svg "$PUB/perks/family.svg"
get 66fd441654d0df1e5b22e348_coffee.svg "$PUB/perks/lunches.svg"
get 66fd4445159f721205c2fb84_laptop.svg "$PUB/perks/workspace.svg"
get 66fd441678d0c2983481cc10_learn.svg "$PUB/perks/development.svg"
get 66fd45bff9d71707aae4ebad_fitness.svg "$PUB/perks/sport.svg"
get 66fd4416cf1badd0a8d97825_sailing.svg "$PUB/perks/events.svg"
get 66fd61a1332984b705e94b18_anualcheckups.svg "$PUB/perks/checkups.svg"
echo "game art (JPG -> src/assets/)"
get 6340299cde6af5374275d216_2.jpg "$SRC/game/art-2.jpg"
get 6340299ca01725a3ce32e18c_3.jpg "$SRC/game/art-3.jpg"
get 6340299d4fe92a7fb3d1854b_4.jpg "$SRC/game/art-4.jpg"
get 6340299dd1a329804e6378a0_5.jpg "$SRC/game/art-5.jpg"
get 6340299ce57a77fff41036e4_6.jpg "$SRC/game/art-6.jpg"
echo "team photos (JPG -> src/assets/)"
get 63e6739e0cb9087227eff0d6_scorewarrior-team-22-33.jpg \
"$SRC/team/team-office.jpg"
get 635bdc5636cf0ac42b63fde7_Katerina.jpg "$SRC/team/katerina.jpg"
get 635bdf28d37e48fd7d7faa77_Grigory.jpg "$SRC/team/grigory.jpg"
get 635bddebb5eec8720de73084_Michalis.jpg "$SRC/team/michalis.jpg"
get 635bdf33e17e1de7746e3e5d_Anastasia.jpg "$SRC/team/anastasia.jpg"
get 635bdc563444bf1e9633f9c1_Christina.jpg "$SRC/team/christina.jpg"
get 635bdffcb5eec820cbe75569_Stelios.jpg "$SRC/team/stelios.jpg"
# --- team slider on /company -------------------------------------------
# The 14 slides of the original's `gallery18` slider, feeding the Gallery on
# /company through src/data/team-gallery.json.
#
# These were NOT collected by curling the page: Webflow's slider sets each
# <img src> from its own script, so the served HTML has empty <img> tags and
# nothing to grep. They were read out of a live browser instead — open
# https://scorewarrior.com/company, click the slider through to the last
# slide so every image has loaded, then in the DevTools console:
#
#   const big = (im) => {
#     const set = (im.srcset || "").split(",").map(s => s.trim()).filter(Boolean);
#     const url = set.length ? set[set.length - 1].split(/\s+/)[0]
#                            : (im.currentSrc || im.src);
#     return (url || "").split("?")[0];
#   };
#   [...new Set([...document.querySelectorAll('.w-slider img, [class*="gallery"] img')]
#     .map(big).filter(u => /\.(jpg|jpeg|png|webp)$/i.test(u)))]
#     .forEach((u, i) => console.log(u.split("/").pop()));
#
# These originals are 960x710 — Webflow's srcset for that slider tops out at
# the source file itself, which is why /company passes widths up to 840 rather
# than the Gallery default of 1200. Never request more than the source has.
#
# The wall-NN numbering is the order the snippet printed, i.e. DOM order of the
# slider. To check the mapping did not drift, re-run this script and then
# `git status`: correct mapping means every file is overwritten with identical
# bytes and the tree stays clean. Modified files mean the order shifted and the
# pairs below need redoing.
get 635bd93a9681785e1b85f6e4_4-1.jpg "$SRC/team/wall-01.jpg"
get 635bd93a332189b60e4adc72_3-1.jpg "$SRC/team/wall-02.jpg"
get 635bd93af1e4ed42845a2dd4_3-3.jpg "$SRC/team/wall-03.jpg"
get 635bd93a5834af569bee5686_3-5.jpg "$SRC/team/wall-04.jpg"
get 635bd9395834aff1faee55f5_2-4.jpg "$SRC/team/wall-05.jpg"
get 63ee4c18f9e505e201c4b6d2_1-14.jpg "$SRC/team/wall-06.jpg"
get 635bd938c5a75160582adac7_1-7.jpg "$SRC/team/wall-07.jpg"
get 635bd9383444bf0de433c7bd_2-1.jpg "$SRC/team/wall-08.jpg"
get 635bd9380af9692bd8f087bc_1-11.jpg "$SRC/team/wall-09.jpg"
get 635bd937c5ea0db924d216c7_1-1.jpg "$SRC/team/wall-10.jpg"
get 635bd9371cfdc046243d3c97_1-2.jpg "$SRC/team/wall-11.jpg"
get 635bd93ad37e4831417f4264_3-2.jpg "$SRC/team/wall-12.jpg"
get 635bd939e6daeb47efb5e159_1-12.jpg "$SRC/team/wall-13.jpg"
get 63ee4c042c5f25704f11f093_1-13.jpg "$SRC/team/wall-14.jpg"
echo "open source logos"
get 6797b8fdbbbf42ec44c40265_logo_large_color_light.svg \
"$PUB/opensource/godot.svg"
get 6799f8fbed265521b3d1935a_bevy_logo_light.png \
"$PUB/opensource/bevy.png"
get 67bc953b1bd6a849e49f0645_dearimgui-logo.png \
"$PUB/opensource/dearimgui.png"
get 6797b99505b237372af1508d_68747470733a2f2f61786d6f6c656e67696e652e6769746875622e696f2f6c6f676f2e706e67.png "$PUB/opensource/axmol.png"
echo "great place to work badges"
get 64677d15bd65b05cce0c1f53_SCOREWARRIOR_LIMITED_2023_Certification_Badge.png \
"$SRC/badges/gptw-2023.png"
get 663b39f55ac1ae1ca361af80_SCOREWARRIOR_LIMITED_CY_English_2024_Certification_Badge.png \
"$SRC/badges/gptw-2024.png"
get 682c779d6222034446d8c05a_English_SCOREWARRIOR_LIMITED_CY_English_2025_Certification_Badge.jpg \
"$SRC/badges/gptw-2025.jpg"
get 66fa6ecae0497f3415a32c84_2024-GPTW-Best-Small-Medium-Workplaces-Europe-List-Badge.png \
"$SRC/badges/gptw-europe-2024.png"
echo "done"