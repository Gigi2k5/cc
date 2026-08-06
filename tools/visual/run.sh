#!/usr/bin/env bash
#
# Lance le build de production, un Chrome headless avec WebGL logiciel, puis un
# script de vérification. Voir tools/visual/README.md.
#
#   bash tools/visual/run.sh checks/shell.mjs
#   bash tools/visual/run.sh checks/hero.mjs
#
# Les motifs de nettoyage de ports vivent dans ce fichier et non dans la ligne
# de commande de l'appelant : sinon `pkill -f` se reconnaît lui-même et tue le
# shell qui l'invoque.
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
CHECK="${1:-checks/shell.mjs}"
PORT="${PORT:-3111}"
CDP_PORT="${CDP_PORT:-9222}"
OUT="${OUT:-$HERE/out}"

cd "$ROOT" || exit 1
mkdir -p "$OUT"

NEXT_PID=""
CHROME_PID=""
cleanup() {
  [ -n "$NEXT_PID" ] && kill "$NEXT_PID" 2>/dev/null
  [ -n "$CHROME_PID" ] && kill "$CHROME_PID" 2>/dev/null
  wait 2>/dev/null
}
trap cleanup EXIT

# Des serveurs orphelins servant un build supprimé renvoient des 500 sur les
# chunks : la page tourne alors sans CSS ni JS et tous les résultats sont faux.
for port in "$PORT" "$CDP_PORT"; do
  pids=$(ss -ltnpH "sport = :$port" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u)
  for pid in $pids; do
    echo "  port $port occupé par pid $pid — arrêt"
    kill -9 "$pid" 2>/dev/null
  done
done
sleep 1

npx next start -p "$PORT" > "$OUT/next.log" 2>&1 &
NEXT_PID=$!

# SwiftShader : WebGL en rendu logiciel, seul moyen d'avoir du WebGL2 headless.
# Les FPS mesurés ainsi n'ont aucune valeur — on ne mesure que des appels de
# dessin et des états du DOM.
# --blink-settings force hover/pointer : sans dispositif de pointage, Chrome
# headless rapporte `hover: none`, et Tailwind v4 encapsule TOUTES ses variantes
# `hover:` dans `@media (hover: hover)` — sans ça, aucun état de survol n'existe
# et les tests correspondants passent à côté du sujet en croyant tester.
# (Emulation.setEmulatedMedia ne gère pas ces deux features.)
# availableHoverTypes/primaryHoverType : 1 = none, 2 = hover
# available/primaryPointerType        : 1 = none, 2 = coarse, 4 = fine
#
# POINTER=coarse simule un écran tactile : indispensable pour vérifier ce qui
# doit être DÉSACTIVÉ au doigt (magnétisme, halo curseur). Sans cette option,
# le viewport mobile du harnais rapporte quand même un pointeur fin et ces
# chemins ne sont jamais exercés.
if [ "${POINTER:-fine}" = "coarse" ]; then
  BLINK="primaryHoverType=1,availableHoverTypes=1,primaryPointerType=2,availablePointerTypes=2"
else
  BLINK="primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4"
fi

google-chrome --headless --no-sandbox --disable-gpu \
  --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader \
  --blink-settings="$BLINK" \
  --remote-debugging-port="$CDP_PORT" --remote-allow-origins='*' \
  --user-data-dir="$(mktemp -d)" about:blank > "$OUT/chrome.log" 2>&1 &
CHROME_PID=$!

for _ in $(seq 1 60); do
  curl -sf "http://localhost:$PORT" -o /dev/null && break
  sleep 1
done
for _ in $(seq 1 30); do
  curl -sf "http://127.0.0.1:$CDP_PORT/json" -o /dev/null && break
  sleep 1
done

# Garde-fou : si le CSS ne se sert pas, on teste une page nue et tout est faux.
css=$(curl -s "http://localhost:$PORT" | grep -oP '/_next/static/chunks/[^"]+\.css' | head -1)
code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT$css")
if [ "$code" != "200" ]; then
  echo "ABANDON : le CSS répond $code — build incohérent, relancer 'npm run build'."
  exit 2
fi
echo "  next :$PORT · chrome :$CDP_PORT · CSS 200 · sorties dans $OUT"

BASE="http://localhost:$PORT" OUT="$OUT" CDP_PORT="$CDP_PORT" \
  node "$HERE/$CHECK"
