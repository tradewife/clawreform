#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="${ROOT_DIR}/output/demo"
PLAYWRIGHT_OUT="${ROOT_DIR}/output/playwright"
REMOTION_DIR="${ROOT_DIR}/remotion-demo"
VIDEO_OUT="${OUT_DIR}/swarm-demo.mp4"
VOICE_OUT="${OUT_DIR}/voiceover.mp3"
MUXED_OUT="${OUT_DIR}/swarm-demo-with-voice.mp4"

mkdir -p "${OUT_DIR}"

echo "Running dashboard proof..."
"${ROOT_DIR}/scripts/dashboard-proof.sh" "${1:-http://127.0.0.1:4332/#agents}"

if [[ -d "${REMOTION_DIR}/node_modules" ]]; then
  echo "Rendering remotion demo..."
  mkdir -p "${ROOT_DIR}/demo"
  (
    cd "${REMOTION_DIR}"
    if command -v bun >/dev/null 2>&1; then
      bun run render
    else
      npm run render
    fi
  )
  if [[ -f "${ROOT_DIR}/demo/clawreform-remotion.mp4" ]]; then
    cp "${ROOT_DIR}/demo/clawreform-remotion.mp4" "${VIDEO_OUT}"
  fi
else
  echo "Skipping remotion render; ${REMOTION_DIR}/node_modules is missing."
fi

if command -v espeak >/dev/null 2>&1 && command -v ffmpeg >/dev/null 2>&1; then
  echo "Generating voiceover..."
  espeak -v en-us -s 145 -w "${OUT_DIR}/voiceover.wav" \
    "This sandbox proof ran end to end. The swarm generated browser proof artifacts, validated the dashboard, and left reproducible outputs under output."
  ffmpeg -y -i "${OUT_DIR}/voiceover.wav" -ac 2 -ar 44100 "${VOICE_OUT}" >/dev/null 2>&1
  rm -f "${OUT_DIR}/voiceover.wav"
else
  echo "Skipping voiceover; espeak and ffmpeg are both required."
fi

if [[ -f "${VIDEO_OUT}" && -f "${VOICE_OUT}" ]] && command -v ffmpeg >/dev/null 2>&1; then
  echo "Muxing voiceover and video..."
  ffmpeg -y -i "${VIDEO_OUT}" -i "${VOICE_OUT}" -c:v copy -c:a aac -shortest "${MUXED_OUT}" >/dev/null 2>&1
fi

echo
echo "Artifacts"
echo "  Playwright: ${PLAYWRIGHT_OUT}"
if [[ -f "${VIDEO_OUT}" ]]; then
  echo "  Demo video: ${VIDEO_OUT}"
fi
if [[ -f "${MUXED_OUT}" ]]; then
  echo "  Demo video with voice: ${MUXED_OUT}"
fi
