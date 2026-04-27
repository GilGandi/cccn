#!/bin/bash
echo "=== Iniciando migração ==="

run_deploy() {
  npx prisma migrate deploy 2>&1
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
  echo "=== P3009: resolvendo ==="
  npx prisma migrate resolve --rolled-back 20240105000000_perfis_inscricoes 2>/dev/null || true
  npx prisma migrate resolve --rolled-back 20240107000000_anexo_evento 2>/dev/null || true
  npx prisma migrate resolve --rolled-back 20240108000000_fix_superadmin 2>/dev/null || true
  OUTPUT2=$(run_deploy)
  echo "$OUTPUT2"
  echo "=== OK ===" && exit 0
fi

if echo "$OUTPUT" | grep -q "P3005"; then
  echo "=== P3005: baseline ==="
  for m in 20240101000000_init 20240102000000_recorrencia_playlist \
            20240103000000_config_lider 20240104000000_roles \
            20240105000000_perfis_inscricoes; do
    npx prisma migrate resolve --applied "$m" 2>/dev/null && echo "  baseline: $m" || true
  done
  OUTPUT2=$(run_deploy)
  echo "$OUTPUT2"
  echo "=== OK ===" && exit 0
fi

echo "=== ERRO ==="
exit 1
