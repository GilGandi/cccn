#!/bin/bash
echo "=== Iniciando migração ==="

PRISMA="./node_modules/.bin/prisma"

run_deploy() {
  $PRISMA migrate deploy 2>&1
  return $?
}

OUTPUT=$(run_deploy)
CODE=$?
echo "$OUTPUT"

if [ $CODE -eq 0 ]; then
  echo "=== OK ==="
  exit 0
fi

if echo "$OUTPUT" | grep -q "P3009"; then
  echo "=== P3009: resolvendo migration com falha ==="
  $PRISMA migrate resolve --rolled-back 20240201000000_baseline_completo 2>/dev/null || true
  OUTPUT2=$(run_deploy); echo "$OUTPUT2"
  [ $? -eq 0 ] && echo "=== OK ===" && exit 0
fi

if echo "$OUTPUT" | grep -q "P3005"; then
  echo "=== P3005: baseline do banco existente ==="
  $PRISMA migrate resolve --applied 20240201000000_baseline_completo 2>/dev/null || true
  echo "=== OK (baseline aplicada) ==="
  exit 0
fi

echo "=== ERRO ==="
exit 1
