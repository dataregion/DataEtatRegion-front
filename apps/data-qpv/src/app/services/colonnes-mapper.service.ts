import { Injectable } from '@angular/core';
import { FlattenFinancialLinesDataQPV } from 'apps/clients/v3/data-qpv';


export type Format = Intl.NumberFormat | Intl.DateTimeFormat;

/**
 * Service de mapping et configuration des colonnes pour l'affichage des données financières.
 * 
 * ## 🎯 Rôle principal
 * Ce service est le **pont entre les données brutes de l'API et l'affichage dans l'interface** pour les tableaux financiers.
 * 
 * ## 📋 Responsabilités principales
 * - **Mapping des colonnes** : Transforme les colonnes techniques de l'API en colonnes affichables
 * - **Configuration des rendus** : Définit comment chaque donnée doit être formatée (montants, dates, badges)
 * - **Gestion du grouping** : Associe chaque colonne à sa capacité de groupement
 * - **Préférences utilisateur** : Mappe les préférences sauvegardées vers les colonnes actives
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ColonnesMapperService {

  private _colonnesTableau = {
    BENEFICIAIRE:           { code: 'beneficiaire', label: 'Bénéficiaire' },
    SOURCE:                 { code: 'source', label: 'Source de données' },
    N_EJ:                   { code: 'n_ej', label: 'N° EJ' },
    POSTE_EJ:               { code: 'poste_ej', label: 'N° Poste EJ' },
    MONTANT_AE:             { code: 'montant_ae', label: 'Montant engagé' },
    MONTANT_CP:             { code: 'montant_cp', label: 'Montant payé' },
    THEME:                  { code: 'theme', label: 'Thème' },
    PROGRAMME:              { code: 'nom_programme', label: 'Programme' },
    DOMAINE:                { code: 'domaine', label: 'Domaine fonctionnel' },
    REF_PROGRAMMATION:      { code: 'ref_programmation', label: 'Ref Programmation' },
    COMMUNE:                { code: 'label_commune', label: 'Commune du SIRET' },
    CRTE:                   { code: 'label_crte', label: 'CRTE du SIRET' },
    EPCI:                   { code: 'label_epci', label: 'EPCI du SIRET' },
    ARRONDISSEMENT:         { code: 'label_arrondissement', label: 'Arrondissement du SIRET' },
    DEPARTEMENT:            { code: 'label_departement', label: 'Département du SIRET' },
    REGION:                 { code: 'label_region', label: 'Région du SIRET' },
    LOC_INTER:              { code: 'localisation_interministerielle', label: 'Localisation interministérielle' },
    COMPTE_BUDGETAIRE:      { code: 'compte_budgetaire', label: 'Compte budgétaire' },
    CPER:                   { code: 'contrat_etat_region', label: 'CPER' },
    GROUPE_MARCHANDISE:     { code: 'groupe_marchandise', label: 'Groupe marchandise' },
    SIRET:                  { code: 'siret', label: 'SIRET' },
    TYPE_ETABLISSEMENT:     { code: 'type_etablissement', label: "Type d'établissement" },
    QPV:                    { code: 'qpv', label: "QPV" },
    DATE_DERNIER_PAIEMENT:  { code: 'date_cp', label: "Date dernier paiement" },
    DATE_CREATION_EJ:       { code: 'date_replication', label: "Date création EJ" },
    ANNEE_ENGAGEMENT:       { code: 'annee', label: "Année Exercice comptable" },
    CENTRE_COUTS:           { code: 'centre_couts', label: "Centre coûts" },
    TAGS:                   { code: 'tags', label: "Tags" },
    DATA_SOURCE:            { code: 'data_source', label: "Source Chorus" },
    DATE_MODIFICATION:      { code: 'date_modification', label: 'Date modification EJ' }
  } as const;


  private _moneyFormat = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  });
  private _dateFormat = new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  private EMPTY: string = '';
  private NON_RENSEIGNE: string = 'Non renseigné';


  getColonneByKey(key: keyof typeof this._colonnesTableau) {
    return this._colonnesTableau[key]
  }

  colNameOfEnriched(key: keyof FlattenFinancialLinesDataQPV): string {
    return key;
  }

}
