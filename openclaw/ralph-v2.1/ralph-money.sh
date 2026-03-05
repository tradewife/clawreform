#!/bin/bash

# ralph-money.sh — run: ./ralph-money.sh 100

MAX_ITERS=${1:-50}
ITER=0

while [ $ITER -lt $MAX_ITERS ]; do
  echo "=== MoneyRalph v2.1 iter $ITER $(date) — $ impact mode ==="
  
  claude-code --prompt-file openclaw/ralph-v2.1/moneyralph_execute.md --context-files prd.json,progress.txt,revenue_log.md,stripe_metrics.txt,IMPLEMENTATION_PLAN.md
  
  git add . && git commit -m "MoneyRalph auto-iter $ITER — revenue scored" || true
  git push origin revenue-ralph-v2
  
  if grep -q "COMPLETE" <(claude-code --last-output); then
    echo "=== ALL REVENUE STORIES COMPLETE — SHIPPING TO PROD ==="
    break
  fi
  
  ITER=$((ITER+1))
  sleep 5
done
