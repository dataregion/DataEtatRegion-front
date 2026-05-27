# Front-Data — Angular monorepo

## Stack
- Angular 21.0.0, TS 5.8.3, Node 24.14.1, npm
- DSFR `@gouvfr/dsfr` 1.14, `@edugouvfr/ngx-dsfr-ext` 1.6
- Tests : Karma+Jasmine (unit), Playwright (E2E)
- Auth : Keycloak 25 via keycloak-angular 21
- Maps : OpenLayers 10 / Geoportal. Charts : chart.js 4.5

## Apps (sous `apps/`)
- `budget-dataetat` — principal (recherche données financières)
- `data-qpv` — données QPV
- `france-relance` — **legacy**, maintenance minimale (build doit passer, pas d'évolution, bugfix critique uniquement)
- `clients/*` — généré OpenAPI, ne pas modifier

## Libs partagées (sous `apps/`)
`common-lib` (LoggerService, Storybook :6006), `appcommon`, `preference-users`, `grouping-table`, `shared-assets`

## Commandes
```bash
npm run start:budget-dev          # :4200
npm run start:data-qpv-dev
npm run build:budget              # prod budget-dataetat
npm run build:all                 # france-relance + data-qpv
npm run lint                      # max 55 warnings (CI bloque sinon)
ng test <project>
npx playwright test               # .env requis : TEST_USERNAME/PASSWORD
npm run storybook:common-lib      # :6006
npm run knip                      # dead code
/front-check                      # miroir CI local complet
```

## Conventions
- Composants : `ChangeDetectionStrategy.OnPush` + `trackBy` listes
- State local : **Signals** (`signal`, `computed`, `effect`). Observables : HTTP/streams uniquement
- DI : `inject()` plutôt que constructor
- Standalone components, control flow `@if/@for/@switch`
- Logs : `LoggerService` de `common-lib` — **jamais `console.*`**
- Imports via alias tsconfig : `@models/*`, `@services/*`
- Style : SCSS
- Prettier : single quote, semi, printWidth 100, no trailing comma

## UI — règle dure
- **DSFR uniquement** pour nouveaux composants (`@edugouvfr/ngx-dsfr-ext` + classes `fr-*`)
- Angular Material présent (thème legacy `indigo-pink`) mais **interdit en neuf**
- Choix UI/accessibilité → agent `dsfr-designer`

## Agents
- `angular-dev` — code Angular (composants, services, routes, formulaires)
- `dsfr-designer` — design DSFR + accessibilité RGAA

## À éviter
- `console.*` → `LoggerService`
- Nouveau composant Angular Material
- Modifier `apps/clients/*`
- Évolution sur `apps/france-relance`
- State complexe sans Signal
- Lint > 55 warnings
