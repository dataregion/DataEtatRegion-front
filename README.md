<h1 align="center" style="border-bottom: none">
    <div>
        Front plateforme état en bretagne
    </div>
</h1>

<p align="center">
    Contient les différents front pour la plateforme data état en bretagne<br/>
</p>

<div align="center">
 
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-green.svg)](https://conventionalcommits.org)
[![Angular](https://img.shields.io/badge/angular-15-blue)](https://angular.io/)
[![Docker build](https://img.shields.io/badge/docker-automated-informational)](https://docs.docker.com/compose/)

</div>


# Liste des fronts

* [France relance](./apps/france-relance/README.md)

* [Budget DataEtat](./apps/budget-dataetat/README.md)

## Démarrer le front budget-dataetat en mode développement

Pour lancer l'application budget-dataetat en mode développement :

```bash
npm run start:budget-dev
```

L'application sera accessible sur http://localhost:4200

> **Note** : Assurez-vous d'avoir fait `npm install` à la racine du monorepo.

## 

# Comment mettre à jour les dépendances

```bash
# Mettre à jour storybook
npx storybook@latest upgrade --config-dir=<DIRECTORY_STORYBOOK> # par ex. apps/common-lib/.storybook
# Mettre à jour les composants angular
npx ng update # suivre les instructions

```

    Aussi, pour mettre à jour angular entre versions majeures, se fier à https://angular.dev/update-guide
    !!!! Attention, vérifier que les différentes dépendences supportent bien les dernières versions d'angular
    ex: storybook ne supporte pas forcement les versions fraiches d'angular (délai)

# Test e2e

Créer un fichier '.env' à la racine du projet [e2e](./e2e) et mettre les identifiants d'un utilisateur pour passer l'authentification :  

```
TEST_USERNAME=<USERNAME>
TEST_PASSWORD=<PASSWORD>
```

Pour lancer les tests sur l'environnement d'intégration
```
npx playwright test
```

En mode debug avec ui
``` 
npx playwright test --ui
```


# Clients générés automatiquement

Le dossier [apps/clients](./apps/clients/) contient des clients d'api, ces derniers peuvent être générées automatiquement.

**Les exemples sont données avec les URL de l'environnement de production**

## APIs externes

*endpoint qui intègre les APIs externes comme data subvention*

 - url api: [https://api.databretagne.fr/apis-externes/swagger.json](https://api.databretagne.fr/apis-externes/swagger.json)

```
./generate_openapi_client.sh -p ae -s "https://api.databretagne.fr/apis-externes/swagger.json" -t $(pwd)/apps/clients/ -n apis-externes
./generate_openapi_client.sh -p aev3 -s "https://api.databretagne.fr/apis-externes/v3/admin/openapi.json" -t $(pwd)/apps/clients/ -n apis-externes-v3
```

## API des lignes budgetaires

*Endpoint qui expose les lignes budgetaires*

  - url api: [http://api.databretagne.fr/financial-data/api/v2/swagger.json](http://api.databretagne.fr/financial-data/api/v2/swagger.json)

```
./generate_openapi_client.sh -p budget -s "https://api.databretagne.fr/financial-data/api/v2/swagger.json" -t $(pwd)/apps/clients/ -n budget
```

## API v3

```
DO_USE_SINGLE_REQUEST_PARAMETER=true ./generate_openapi_client.sh -p referentielsV3 -s "https://api.databretagne.fr/referentiels/api/v3/admin/openapi.json" -t $(pwd)/apps/clients/v3/ -n referentiels
DO_USE_SINGLE_REQUEST_PARAMETER=true ./generate_openapi_client.sh -p financialDataV3 -s "https://api.databretagne.fr/financial-data/api/v3/admin/openapi.json" -t $(pwd)/apps/clients/v3/ -n financial-data
DO_USE_SINGLE_REQUEST_PARAMETER=true ./generate_openapi_client.sh -p dataQpvV3 -s "https://api.databretagne.fr/data-qpv/api/v3/admin/openapi.json" -t $(pwd)/apps/clients/v3/ -n data-qpv
```