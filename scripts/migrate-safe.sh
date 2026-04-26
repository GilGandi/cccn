#!/bin/bash
echo "=== Iniciando migração ==="

run_deploy() {
  npx prisma migrate deploy 2>&1
  return $?
}

# Primeira tentativa
OUTPUT=$(run_deploy)
CODE=$?
echo "$OUTPUT"

if [ $CODE -eq 0 ]; then
  echo "=== OK ==="
  exit 0
fi

# P3009: migration com falha registrada
if echo "$OUTPUT" | grep -q "P3009"; then
  echo "=== P3009: resolvendo migration com falha ==="
  npx prisma migrate resolve --rolled-back 20240105000000_perfis_inscricoes 2>/dev/null || true
  OUTPUT2=$(run_deploy)
  CODE2=$?
  echo "$OUTPUT2"
  [ $CODE2 -eq 0 ] && echo "=== OK ===" && exit 0
fi

# P3005: banco sem histórico (primeiro deploy com db push anterior)
if echo "$OUTPUT" | grep -q "P3005"; then
  echo "=== P3005: fazendo baseline ==="
  for m in 20240101000000_init 20240102000000_recorrencia_playlist \
            20240103000000_config_lider 20240104000000_roles \
            20240105000000_perfis_inscricoes; do
    npx prisma migrate resolve --applied "$m" 2>/dev/null && echo "  baseline: $m" || true
  done
  OUTPUT2=$(run_deploy)
  CODE2=$?
  echo "$OUTPUT2"
  [ $CODE2 -eq 0 ] && echo "=== OK ===" && exit 0
fi

echo "=== ERRO FATAL na migração ==="
echo "$OUTPUT"
exit 1
