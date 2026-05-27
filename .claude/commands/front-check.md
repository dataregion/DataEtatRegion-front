---
description: Lance la check qualité front-end complète (miroir CI GitLab + knip). Lint, build des 3 apps, détection dead code.
---

# /front-check

Reproduit localement le job CI `🔨 build angular apps` (`.gitlab-templates/build.gitlab-ci.yml`) et ajoute une analyse statique `knip` pour détecter le code mort.

## Étapes (séquentielles, stop on first fail)

Exécute dans cet ordre, en affichant à la fin un résumé `✅/❌` par étape avec durées :

1. **Install deps** (conditionnel) :
   ```bash
   if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then npm ci; fi
   ```

2. **Lint** :
   ```bash
   npm run lint
   ```
   Échoue si > 55 warnings (config CI).

3. **Build matrice complète** (parallèle si possible, sinon séquentiel) :
   ```bash
   npm run build:budget-dev
   npm run build:budget
   npm run build:france-relance
   npm run build:data-qpv
   ```
   France-relance inclus : legacy mais doit toujours builder.

4. **Dead code** :
   ```bash
   npm run knip
   ```
   Liste exports/deps/fichiers non utilisés. N'échoue pas le check (informationnel), mais signale.

## Sortie attendue

Tableau final type :

```
Étape                  Statut    Durée
─────────────────────────────────────────
1. Install             ✅        12s
2. Lint                ✅         4s
3. Build budget-dev    ✅        45s
3. Build budget        ✅        48s
3. Build france-relance✅        30s
3. Build data-qpv      ✅        35s
4. Knip                ⚠️  3 unused exports (voir détail)
─────────────────────────────────────────
TOTAL                  ✅      ~3min
```

## Règles

- Stop immédiat sur échec étape 2 (lint) ou 3 (build).
- Étape 4 (knip) : ne bloque pas, mais expose le rapport pour action.
- Si `node_modules` désynchronisé : `npm ci` (pas `npm install`).
