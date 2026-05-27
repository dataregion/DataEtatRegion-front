# france-relance

> ⚠️ **LEGACY — maintenance minimale uniquement.**
>
> Cette app doit toujours builder dans la CI (`npm run build:france-relance`) et fonctionner en production, mais :
> - **Pas de nouvelle fonctionnalité.**
> - **Pas de refonte UI/DSFR.**
> - **Bugfix critique uniquement** (régression bloquante, faille sécu), et seulement sur demande explicite.
>
> Pour toute nouvelle feature data financière, voir `apps/budget-dataetat` (principal) ou `apps/data-qpv`.

## Démarrer (debug local)

```bash
npm run start:france-relance-dev   # http://localhost:5006 (proxy activé)
```

## Build

```bash
npm run build:france-relance
```

## Stack

Même que le monorepo (Angular 21, DSFR, Keycloak). Voir [`../../README.md`](../../README.md) et [`../../CLAUDE.md`](../../CLAUDE.md).
