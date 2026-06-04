#!/bin/bash
# Deploy a GitHub Pages usando gh-pages
set -e

npm run build
npx gh-pages -d dist

echo "✅ Deploy completo!"
echo "🔗 https://idsarweb.github.io/nico_capitales/"
