#!/bin/bash
# Script para deployar a GitHub Pages
set -e

# 1. Build
npm run build

# 2. Crear rama gh-pages temporal
git checkout -b gh-pages-deploy

# 3. Forzar add de dist (ignorado por .gitignore)
git add dist -f

# 4. Commit
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# 5. Push
git push origin gh-pages-deploy:gh-pages --force

# 6. Volver a master
git checkout master

# 7. Limpiar rama temporal
git branch -D gh-pages-deploy

echo "✅ Deploy completo!"
echo "🔗 https://idsarweb.github.io/nico_capitales/"
