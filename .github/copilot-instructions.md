# Copilot Instr## 🛠️ Workflows & Commandes critiques

- **Démarrage local** :  
  - `npm run start:budget-dev` pour lancer le front `budget-dataetat` en mode développement
    - Accès : http://localhost:4200
- **Build** :  
  - `npm run build:budget` (ou `build:all` pour tout builder)
- **Tests unitaires** :  
  - `ng test [app]`
- **Tests E2E** :  
  - `npx playwright test` (config dans `e2e/`)
- **Lint** :  
  - `npm run lint` (max 55 warnings)
  - ⚠️ **OBLIGATOIRE : Toujours exécuter `npm run lint` après toute modification de code pour vérifier la conformité aux règles de style et détecter les erreurs potentielles.**
- **Génération clients API** :  
  - `./generate_openapi_client.sh -p [prefix] -s [swagger-url] -t [target-dir] -n [name]` Data État en Bretagne (Frontend)

## 🏗️ Architecture & Big Picture

- **Monorepo Angular 20** multi-applications :  
  - `budget-dataetat`, `france-relance`, `data-qpv`
- **Librairies partagées** :  
  - `common-lib`, `appcommon`, `preference-users`, `grouping-table`, `shared-assets`
- **Clients API générés** (OpenAPI) dans `apps/clients/*` :  
  - Ne jamais modifier à la main, régénérer via `generate_openapi_client.sh`
- **Design System** :  
  - DSFR (`@gouvfr/dsfr`), extensions Angular (`@edugouvfr/ngx-dsfr-ext`)
- **Authentification** :  
  - Keycloak (`keycloak-angular`), voir intégration dans chaque app

## 🛠️ Workflows & Commandes critiques

- **Démarrage local** :  
  - `npm run start:budget-dev` pour lancer le front `budget-dataetat` en mode développement
    - Accès : http://localhost:4200
- **Build** :  
  - `npm run build:budget` (ou `build:all` pour tout builder)
- **Tests unitaires** :  
  - `ng test [app]`
- **Tests E2E** :  
  - `npx playwright test` (config dans `e2e/`)
- **Lint** :  
  - `npm run lint` (max 170 warnings)
- **Génération clients API** :  
  - `./generate_openapi_client.sh -p [prefix] -s [swagger-url] -t [target-dir] -n [name]`

## 📦 Patterns & conventions spécifiques

- **Structure Angular** :  
  - `apps/[app]/src/app/{components,services,models,modules,pages,shared}`
- **Imports** :  
  - Utiliser les alias (`@models`, `@services`, etc.) définis dans `tsconfig.json`
- **Composants Angular** :  
  - Toujours `OnPush`, utiliser `trackBy` pour les listes
  - **Dans `budget-dataetat` et `data-qpv`, préférer l'usage des signals Angular (Angular 17+) pour la gestion d'état local et de flux.**
  - **N'utiliser les Observables/Subject que pour la gestion des flux issus des APIs HTTP.**- **Logging** :
  - **OBLIGATOIRE : Utiliser le `LoggerService` de `apps/common-lib/src/lib/services/logger.service` pour tous les logs.**
  - **Ne jamais utiliser `console.log`, `console.error`, `console.warn` directement.**
  - **Injection : `private _logger = inject(LoggerService);`**
  - **Niveaux disponibles : `this._logger.debug()`, `this._logger.info()`, `this._logger.warn()`, `this._logger.error()`**- **Préférences utilisateurs** :  
  - Utiliser `preference-users` pour la gestion centralisée
- **Cartographie** :  
  - OpenLayers (`ol`), styles Mapbox, extensions Géoportail

## 🔗 Intégrations & points d’attention

- **Keycloak** :  
  - Injection via service, gestion des rôles et token utilisateur
- **DSFR** :  
  - Toujours préférer les composants DSFR aux composants Material
- **API** :  
  - Les clients dans `apps/clients/*` sont la seule interface pour consommer les APIs backend
- **Tests E2E** :  
  - Utiliser des `data-test-id` pour la robustesse des sélecteurs

## 📚 Fichiers clés à consulter

- `README.md` (présentation, workflows)
- `.github/copilot-instructions.md` (ce fichier)
- `angular.json` (structure, scripts, styles)
- `tsconfig.json` (alias, strict mode)
- `package.json` (scripts, dépendances)
- `apps/clients/*/README.md` (usage des clients API générés)

---

**Rappel : Respecter la séparation stricte entre les apps, utiliser les bibliothèques et clients API pour tout partage de logique ou de données.**

---
