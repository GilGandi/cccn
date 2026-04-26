#!/bin/bash
set -e

echo "=== Iniciando migração segura ==="

# PASSO 1: Resolver qualquer migration com falha (P3009) ANTES de qualquer outra coisa
FAILED_OUTPUT=$(npx prisma migrate deploy 2>&1) || true
echo "$FAILED_OUTPUT"

if echo "$FAILED_OUTPUT" | grep -q "P3009"; then
  echo "=== P3009: migration com falha detectada — resolvendo ==="
  # Marcar a 20240105 como rolled-back (ela falhou anteriormente)
  npx prisma migrate resolve --rolled-back 20240105000000_perfis_inscricoes 2>/dev/null || true
  # Também marcar a 20240106 se existir com falha
  npx prisma migrate resolve --rolled-back 20240106000000_consolidado 2>/dev/null || true
  echo "=== Migrations com falha resolvidas ==="
fi

# PASSO 2: Tentar migrate deploy limpo
MIGRATE_OUTPUT=$(npx prisma migrate deploy 2>&1) || MIGRATE_FAILED=1
echo "$MIGRATE_OUTPUT"

if [ -z "$MIGRATE_FAILED" ]; then
  echo "=== OK: migrate deploy concluído ==="
  exit 0
fi

# PASSO 3: P3005 — banco sem histórico de migrations (primeiro deploy)
if echo "$MIGRATE_OUTPUT" | grep -q "P3005\|not empty\|baseline"; then
  echo "=== P3005: fazendo baseline ==="
  for m in \
    20240101000000_init \
    20240102000000_recorrencia_playlist \
    20240103000000_config_lider \
    20240104000000_roles \
    20240105000000_perfis_inscricoes; do
    npx prisma migrate resolve --applied "$m" 2>/dev/null \
      && echo "  baseline: $m" || echo "  skip: $m"
  done
  npx prisma migrate deploy
  echo "=== OK ==="
  exit 0
fi

# PASSO 4: P3018 — migration falhou durante este deploy
if echo "$MIGRATE_OUTPUT" | grep -q "P3018\|P3009"; then
  echo "=== P3018/P3009: resolvendo e reaplicando ==="
  npx prisma migrate resolve --rolled-back 20240105000000_perfis_inscricoes 2>/dev/null || true
  npx prisma migrate resolve --rolled-back 20240106000000_consolidado 2>/dev/null || true
  npx prisma migrate deploy
  exit 0
fi

echo "=== ERRO: $MIGRATE_OUTPUT ==="
exit 1
