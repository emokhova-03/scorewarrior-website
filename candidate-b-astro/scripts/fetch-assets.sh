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