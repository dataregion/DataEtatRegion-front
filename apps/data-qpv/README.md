# Description

Front permettant de faire des recherches sur les données financières de l'état dans les QPV

## Utiliser l'application données financières depuis une autre application

Il est possible de diriger un utilisateur vers des données financières filtrèes en utilisant des paramètres d'url, exemple:

[https://qpv-bretagne.dataregion.fr/?annee_min=2023&annee_max=2023&niveau_geo=commune&code_geo=29232&code_qpv=QN02902M](https://qpv-bretagne.dataregion.fr/?annee_min=2023&annee_max=2023&niveau_geo=commune&code_geo=29232&code_qpv=QN02902M)

Voici les paramètres pris en charge:

- Années

*Par défaut, si aucun filtre n'est spécifié, on utilise l'année courante.*

| Paramètre     | Description | Valeurs acceptées       | Exemple                                                                           |
| ------------- | ----------- | ----------------------- | --------------------------------------------------------------------------------- |
| Année minimum | A partir de | Une année. (ie: `2019`) | [`annee_min=2019`](https://qpv-bretagne.dataregion.fr/?annee_min=2019&annee_max=2019) |
| Année maximum | jusqu'à     | Une année. (ie: `2020`) | [`annee_max=2023`](https://qpv-bretagne.dataregion.fr/?annee_min=2023&annee_max=2023) |


- Emplacement géographique

| Paramètre           | Description         | Valeurs acceptées                                                                                                                                                                                          | Exemple                                                                                    |
| ------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Niveau géographique | Niveau géographique | `region`,`departement`,`epci`, `commune` | [`niveau_geo=epci`](https://qpv-bretagne.dataregion.fr/?niveau_geo=epci&code_geo=200000172)    |
| code_geo            | Code géographique   | [COG](https://www.insee.fr/fr/recherche/recherche-geographique?debut=0) | [`code_geo=200000172`](https://qpv-bretagne.dataregion.fr/?niveau_geo=epci&code_geo=200000172) |


- Code QPV

| Paramètre           | Description         | Valeurs acceptées                                                                                                                                                                                          | Exemple                                                                                    |
| ------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| code_qpv            | Code QPV   | [Référentiel 2024](https://www.data.gouv.fr/fr/datasets/quartiers-prioritaires-de-la-politique-de-la-ville-qpv/#/resources) | [`code_geo=200000172`](https://budget.databretagne.fr/?niveau_geo=epci&code_geo=200000172) |

##### A écrire : financeurs & thématiques

- Porteurs de projet

| Paramètre     | Description                             | Valeurs acceptées          | Exemple                                                                                                                    |
| ------------- | --------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Bénéficiaires | Les sirets à inclure dans la rechercher | siret du/des bénéficiaires | [beneficiaires=19141687400011,34305956400959](https://budget.databretagne.fr/?beneficiaires=19141687400011,34305956400959) |

- Types de porteur de projet

| Paramètre             | Description                      | Valeurs acceptées                                             | Exemple                                                                                                                  |
| --------------------- | -------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Type de bénéficiaires | Le(s) type(s) de bénéficiaire(s) | `entreprise`, `association`, `etat`, `collectivite`, `autres` | [types_beneficiaires=entreprise,association](https://budget.databretagne.fr/?types_beneficiaires=entreprise,association) |
