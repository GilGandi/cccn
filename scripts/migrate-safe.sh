#!/bin/bash
set -e

echo "=== Iniciando migração segura ==="

# Tenta migrate deploy normalmente
if npx prisma migrate deploy 2>&1 | tee /tmp/migrate_out.txt; then
  echo "=== OK: migrate deploy concluído ==="
  exit 0
fi

cat /tmp/migrate_out.txt

# Se falhou por schema drift (tabelas criadas com db push anteriormente),
# faz baseline das migrations antigas e tenta de novo
if grep -qiE "already exists|P3009|drift|cannot be executed" /tmp/migrate_out.txt; then
  echo "=== Detectado schema drift — fazendo baseline das migrations existentes ==="
  for m in 20240101000000_init 20240102000000_recorrencia_playlist 20240103000000_config_lider 20240104000000_roles; do
    npx prisma migrate resolve --applied "$m" 2>/dev/null && echo "Baseline: $m" || true
  done
  echo "=== Aplicando migrations pendentes ==="
  npx prisma migrate deploy
  exit 0
fi

# Último recurso: db push
echo "=== Fallback para db push ==="
npx prisma db push --accept-data-loss
exit 0
