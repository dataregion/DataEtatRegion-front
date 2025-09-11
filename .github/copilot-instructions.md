# Copilot Instr## 🛠️ Workflows & Commandes critiques

- **Démarrage local** :  
  - `npm run start:budget-dev` pour lancer le front `budget-dataetat` en mode développement
    - Accès : http://localhost:4200
  - `npm run start:financial-dev` pour lancer le front `financial-data` en mode développement _(déprécié)_
    - Accès : http://localhost:4200
    - ⚠️ Ce front est déprécié. Privilégier l'usage de `budget-dataetat` pour les nouveaux développements.
- **Build** :  
  - `npm run build:budget` (ou `build:all` pour tout builder)
- **Tests unitaires** :  
  - `ng test [app]`
- **Tests E2E** :  
  - `npx playwright test` (config dans `e2e/`)
- **Lint** :  
  - `npm run lint` (max 170 warnings)
  - ⚠️ **OBLIGATOIRE : Toujours exécuter `npm run lint` après toute modification de code pour vérifier la conformité aux règles de style et détecter les erreurs potentielles.**
- **Storybook** :  
  - `npm run storybook:common-lib`
- **Génération clients API** :  
  - `./generate_openapi_client.sh -p [prefix] -s [swagger-url] -t [target-dir] -n [name]` Data État en Bretagne (Frontend)

## 🏗️ Architecture & Big Picture

- **Monorepo Angular 20** multi-applications :  
  - `budget-dataetat`, `financial-data`, `france-relance`, `data-qpv`
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
  - `npm run start:financial-dev` pour lancer le front `financial-data` en mode développement _(déprécié)_
    - Accès : http://localhost:4200
    - ⚠️ Ce front est déprécié. Privilégier l'usage de `budget-dataetat` pour les nouveaux développements.
- **Build** :  
  - `npm run build:budget` (ou `build:all` pour tout builder)
- **Tests unitaires** :  
  - `ng test [app]`
- **Tests E2E** :  
  - `npx playwright test` (config dans `e2e/`)
- **Lint** :  
  - `npm run lint` (max 170 warnings)
- **Storybook** :  
  - `npm run storybook:common-lib`
- **Génération clients API** :  
  - `./generate_openapi_client.sh -p [prefix] -s [swagger-url] -t [target-dir] -n [name]`

## 📦 Patterns & conventions spécifiques

- **Structure Angular** :  
  - `apps/[app]/src/app/{components,services,models,modules,pages,shared}`
- **Imports** :  
  - Utiliser les alias (`@models`, `@services`, etc.) définis dans `tsconfig.json`
- **Pas de dépendance croisée** :  
  - `budget-dataetat` et `financial-data` ne doivent pas importer de code source l’un de l’autre (seuls les clients API générés sont partagés)
- **Composants Angular** :  
  - Toujours `OnPush`, utiliser `trackBy` pour les listes
  - **Dans `budget-dataetat` et `data-qpv`, préférer l'usage des signals Angular (Angular 17+) pour la gestion d'état local et de flux.**
  - **N'utiliser les Observables/Subject que pour la gestion des flux issus des APIs HTTP.**
- **Préférences utilisateurs** :  
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
  - Utiliser des `data-testid` pour la robustesse des sélecteurs

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
