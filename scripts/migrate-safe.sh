#!/bin/bash
set -e
echo "=== Iniciando migração ==="

# Resolver qualquer migration com falha primeiro (P3009)
PROBE=$(npx prisma migrate deploy 2>&1) || true

if echo "$PROBE" | grep -q "P3009"; then
  echo "=== Resolvendo migration com falha ==="
  npx prisma migrate resolve --rolled-back 20240105000000_perfis_inscricoes 2>/dev/null || true
  npx prisma migrate deploy
  echo "=== OK ==="
  exit 0
fi

if echo "$PROBE" | grep -q "P3005"; then
  echo "=== Baseline (primeiro deploy) ==="
  for m in 20240101000000_init 20240102000000_recorrencia_playlist \
            20240103000000_config_lider 20240104000000_roles; do
    npx prisma migrate resolve --applied "$m" 2>/dev/null || true
  done
  npx prisma migrate deploy
  echo "=== OK ==="
  exit 0
fi

if echo "$PROBE" | grep -qv "Error\|error"; then
  echo "=== OK ==="
  exit 0
fi

echo "$PROBE"
echo "=== ERRO ==="
exit 1
