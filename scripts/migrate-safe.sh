#!/bin/bash
set -e

echo "=== Iniciando migração segura ==="

MIGRATE_OUTPUT=$(npx prisma migrate deploy 2>&1) || MIGRATE_FAILED=1
echo "$MIGRATE_OUTPUT"

if [ -z "$MIGRATE_FAILED" ]; then
  echo "=== OK: migrate deploy concluído ==="
  exit 0
fi

# P3005: banco não vazio sem histórico de migrations
if echo "$MIGRATE_OUTPUT" | grep -q "P3005\|not empty\|baseline"; then
  echo "=== P3005: fazendo baseline até 20240105 ==="

  for m in \
    20240101000000_init \
    20240102000000_recorrencia_playlist \
    20240103000000_config_lider \
    20240104000000_roles \
    20240105000000_perfis_inscricoes; do
    npx prisma migrate resolve --applied "$m" 2>/dev/null \
      && echo "  baseline: $m" || echo "  skip: $m"
  done

  echo "=== Aplicando migration consolidada ==="
  npx prisma migrate deploy
  echo "=== OK ==="
  exit 0
fi

# P3018: migration anterior falhou — marcar como rolled back e tentar novamente
if echo "$MIGRATE_OUTPUT" | grep -q "P3018"; then
  FAILED_MIG=$(echo "$MIGRATE_OUTPUT" | grep "Migration name:" | awk '{print $3}')
  echo "=== P3018: resolvendo migration falha: $FAILED_MIG ==="
  npx prisma migrate resolve --rolled-back "$FAILED_MIG" 2>/dev/null || true
  echo "=== Reaplicando ==="
  npx prisma migrate deploy
  exit 0
fi

echo "=== ERRO inesperado: $MIGRATE_OUTPUT ==="
exit 1
