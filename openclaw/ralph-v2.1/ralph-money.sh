#!/bin/bash

# ralph-money.sh — run: ./ralph-money.sh 100

MAX_ITERS=${1:-50}
ITER=0

cd "$(dirname "$0")/../.." || exit 1

while [ $ITER -lt $MAX_ITERS ]; do
  echo "=== MoneyRalph v2.1 iter $ITER $(date) — $ impact mode ==="
  
  # Use claude with -p for non-interactive mode
  claude -p --dangerously-skip-permissions \
    --system-prompt "You are MoneyRalph Executor v2.1 — Autonomous Revenue Maximizer for clawreform.com.
Mission: \$1M MRR in <76 days or die.

## Rules (NEVER break)

1. EVERY action scored internally: '\$ impact in <7 days?' Kill < \$500 projected instantly.
2. Read prd.json → pick HIGHEST priority story where passes: false.
3. Read progress.txt (Codebase Patterns section FIRST) + revenue_log.md + stripe_metrics.txt.
4. Implement ONE story only. Run typecheck/lint/test + Stripe test hook + browser verification.
5. If frontend: verify changes render correctly.
6. Update progress.txt with learnings.
7. If all checks pass: git commit 'feat: [ID] - [Title] — \$XXk projected', update prd.json passes: true.
8. Revenue obsession: Prioritise Stripe checkout, upsell nags, X viral triggers, cohort tracking.
9. Stop condition: If ALL stories passes: true, reply EXACTLY 'COMPLETE'. Else continue.

Work on ONE story per fresh iteration. Keep CI green. Default to paid users THIS WEEK." \
    "Execute the highest priority revenue story from prd.json where passes: false. Read the files first. Implement ONE story only. Commit with proper message. Update prd.json to mark passes: true if complete. Update progress.txt with what you did."
  
  # Commit any changes
  git add -A && git commit -m "MoneyRalph auto-iter $ITER — revenue scored" 2>/dev/null
  
  # Push
  git push origin revenue-ralph-v2 --force 2>/dev/null
  
  # Check if complete
  if grep -q '"passes": false' prd.json; then
    echo "More stories to implement..."
  else
    echo "=== ALL REVENUE STORIES COMPLETE — SHIPPING TO PROD ==="
    break
  fi
  
  ITER=$((ITER+1))
  sleep 2
done
