#!/bin/bash
set -e

echo "=== Iniciando migração segura ==="

# Captura saída e código de retorno separadamente
MIGRATE_OUTPUT=$(npx prisma migrate deploy 2>&1) || MIGRATE_FAILED=1

echo "$MIGRATE_OUTPUT"

if [ -z "$MIGRATE_FAILED" ]; then
  echo "=== OK: migrate deploy concluído ==="
  exit 0
fi

# Falhou — verificar se é P3005 (banco não vazio sem histórico de migrations)
if echo "$MIGRATE_OUTPUT" | grep -q "P3005\|not empty\|baseline"; then
  echo "=== P3005 detectado: fazendo baseline das migrations existentes ==="
  
  for m in \
    20240101000000_init \
    20240102000000_recorrencia_playlist \
    20240103000000_config_lider \
    20240104000000_roles; do
    npx prisma migrate resolve --applied "$m" 2>/dev/null && echo "  baseline: $m" || echo "  skipped: $m"
  done

  echo "=== Aplicando migrations pendentes ==="
  npx prisma migrate deploy
  echo "=== OK: migrations pendentes aplicadas ==="
  exit 0
fi

# Qualquer outro erro — falha real
echo "=== ERRO na migração: $MIGRATE_OUTPUT ==="
exit 1
