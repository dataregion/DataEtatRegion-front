<h1 align="center" style="border-bottom: none">
    <div>Front plateforme data État en Bretagne</div>
</h1>

<p align="center">Monorepo Angular regroupant les frontends de la plateforme data État Bretagne.</p>

<div align="center">

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-green.svg)](https://conventionalcommits.org)
[![Angular](https://img.shields.io/badge/angular-21-dd0031)](https://angular.dev/)
[![Node](https://img.shields.io/badge/node-24.14-339933)](https://nodejs.org/)
[![DSFR](https://img.shields.io/badge/DSFR-1.14-000091)](https://www.systeme-de-design.gouv.fr/)
[![Docker build](https://img.shields.io/badge/docker-automated-informational)](https://docs.docker.com/compose/)

</div>

---

## 🚀 Quickstart

```bash
git clone <repo>
cd front-data
npm ci
npm run start:budget-dev    # → http://localhost:4200
```

## 📦 Apps

| App | Port (dev) | Statut | Description |
|---|---|---|---|
| [budget-dataetat](./apps/budget-dataetat/) | 4200 | ✅ **principal** | Recherche données financières État |
| [data-qpv](./apps/data-qpv/) | 4200 | ✅ actif | Données QPV (quartiers prioritaires) |
| [france-relance](./apps/france-relance/) | 5006 | ⚠️ **legacy** | Maintenance minimale, pas d'évolution |

## 📚 Libs partagées (`apps/`)

- `common-lib` — composants de base, `LoggerService`, Storybook (port 6006)
- `appcommon` — utilitaires app
- `preference-users` — préférences utilisateur centralisées
- `grouping-table` — composant table avec groupement
- `shared-assets` — images, fonts, statiques
- `clients/*` — clients API générés via OpenAPI (**ne pas éditer**)

## 🛠 Commandes principales

```bash
# Dev
npm run start:budget-dev          # budget-dataetat (proxy activé)
npm run start:data-qpv-dev        # data-qpv
npm run start:france-relance-dev  # france-relance (port 5006)

# Build
npm run build:budget              # prod budget
npm run build:budget-dev          # variant dev
npm run build:data-qpv
npm run build:france-relance
npm run build:all                 # france-relance + data-qpv

# Qualité
npm run lint                      # ESLint (max 55 warnings, CI bloque sinon)
npm run knip                      # détection code mort / deps inutilisées
ng test <project>                 # tests unitaires Karma+Jasmine
npx playwright test               # E2E (cf. section dédiée)
npm run storybook:common-lib      # Storybook common-lib (port 6006)
```

## 🤖 IA / Claude Code

Le dossier [.claude/](./.claude/) configure Claude Code pour ce projet :

- **CLAUDE.md** ([./CLAUDE.md](./CLAUDE.md)) — règles essentielles (stack, conventions, à éviter)
- **Agents** ([.claude/agents/](./.claude/agents/)) :
  - `angular-dev` — expert Angular 21 (Signals, OnPush, DSFR uniquement)
  - `dsfr-designer` — expert design DSFR + accessibilité RGAA
- **Commande** : `/front-check` — reproduit la CI localement (lint + build + knip)
- **Skills** — installés via la CLI standard [`npx skills`](https://github.com/vercel-labs/skills) :

  | Skill | Source | Install | Versioning |
  |---|---|---|---|
  | `angular-developer` + `angular-new-app` | [angular/skills](https://github.com/angular/skills) | `npx skills add angular/skills -a claude-code -s '*' -y` | Symlink (gitignored) — chaque dev `npx skills update` |
  | `dsfr-skill` | [numerique-gouv/dsfr-skill](https://github.com/numerique-gouv/dsfr-skill) | `npx skills add numerique-gouv/dsfr-skill -a claude-code --copy -y` | **Vendoré** (commité dans `.claude/skills/dsfr-skill/`) — maj manuelle puis commit |

  Le hook `SessionStart` ([.claude/settings.json](./.claude/settings.json)) installe Angular auto au 1ᵉʳ lancement si absent.
  Maj : `npx skills update` (Angular) ou `npx skills update dsfr-skill` + commit (DSFR).

## 🎨 Design : DSFR uniquement

Règle dure : **tout nouveau composant utilise le DSFR** (`@edugouvfr/ngx-dsfr-ext` ou classes `fr-*`).
Angular Material reste présent pour le thème legacy mais est **interdit** en code neuf.
Pour du design ou de l'accessibilité, déléguer à l'agent `dsfr-designer`.

## 🔐 Auth

Keycloak 25 via `keycloak-angular` 21. La config (realm, client-id) est dans `apps/<app>/src/config/settings.json` (gitignored, voir variables d'environnement de déploiement).

## 🧪 Tests E2E

```bash
# Créer e2e/.env :
TEST_USERNAME=<USERNAME>
TEST_PASSWORD=<PASSWORD>

npx playwright test          # contre env intégration
npx playwright test --ui     # mode debug UI
```

## 🔄 Mise à jour des dépendances

```bash
npx storybook@latest upgrade --config-dir=apps/common-lib/.storybook
npx ng update
```

> Pour les majeures Angular : suivre https://angular.dev/update-guide. Vérifier que Storybook supporte la version cible (souvent en retard).

## 🤝 Clients API générés (OpenAPI)

Dossier [apps/clients/](./apps/clients/) — généré, à ne pas éditer. Pour régénérer :

### APIs externes
- Swagger : https://api.databretagne.fr/apis-externes/swagger.json

```bash
./generate_openapi_client.sh -p ae -s "https://api.databretagne.fr/apis-externes/swagger.json" -t $(pwd)/apps/clients/ -n apis-externes
./generate_openapi_client.sh -p aev3 -s "https://api.databretagne.fr/apis-externes/v3/admin/openapi.json" -t $(pwd)/apps/clients/ -n apis-externes-v3
```

### API lignes budgétaires
- Swagger : https://api.databretagne.fr/financial-data/api/v2/swagger.json

```bash
./generate_openapi_client.sh -p budget -s "https://api.databretagne.fr/financial-data/api/v2/swagger.json" -t $(pwd)/apps/clients/ -n budget
```

### API v3

```bash
DO_USE_SINGLE_REQUEST_PARAMETER=true ./generate_openapi_client.sh -p referentielsV3      -s "https://api.databretagne.fr/referentiels/api/v3/admin/openapi.json"     -t $(pwd)/apps/clients/v3/ -n referentiels
DO_USE_SINGLE_REQUEST_PARAMETER=true ./generate_openapi_client.sh -p financialDataV3     -s "https://api.databretagne.fr/financial-data/api/v3/admin/openapi.json"   -t $(pwd)/apps/clients/v3/ -n financial-data
DO_USE_SINGLE_REQUEST_PARAMETER=true ./generate_openapi_client.sh -p dataQpvV3           -s "https://api.databretagne.fr/data-qpv/api/v3/admin/openapi.json"         -t $(pwd)/apps/clients/v3/ -n data-qpv
DO_USE_SINGLE_REQUEST_PARAMETER=true ./generate_openapi_client.sh -p administrationV3    -s "https://api.databretagne.fr/administration/api/v3/admin/openapi.json"   -t $(pwd)/apps/clients/v3/ -n administration
```
