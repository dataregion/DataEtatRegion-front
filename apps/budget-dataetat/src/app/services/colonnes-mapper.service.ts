import { Injectable } from '@angular/core';
import { LocalisationInterministerielle } from '@models/financial/common.models';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { Colonne, EnrichedFlattenFinancialLines } from 'apps/clients/v3/financial-data';
import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';


export interface ColonneFromPreference {
  columnName?: string;
  columnLabel?: string;
  displayed?: boolean;
}

export type Format = Intl.NumberFormat | Intl.DateTimeFormat;
export interface ColonneTableau<T> {
  colonne: string;
  label: string;
  back: Colonne[];
  grouping?: Colonne;
  style?: JSONObject;
  render: (row: T) => string;
}

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

  public colonnes: ColonneTableau<FinancialDataModel>[] = [
];

  private _printCodeLabel(c: Optional<string>, l: Optional<string>): string {
    const code = c ?? '';
    const label = l ?? '';
    return code !== '' ? `${code} - ${label}` : label;
  }

  private _printLocalisationInterministerielle(loc: Optional<LocalisationInterministerielle>): string {
    let text = '';
    if (loc) {
      const code = loc.code;
      const label = loc.label;
      const commune = (loc.commune && `${loc.commune.code} - ${loc.commune.label}`) || '';
      const codeLabel = label !== '' ? `${code} - ${label}` : code;
      text = commune !== '' ? `${codeLabel} (${commune})` : codeLabel;
    }
    return text;
  }

  getColonneByKey(key: keyof typeof this._colonnesTableau) {
    return this._colonnesTableau[key]
  }

  colNameOfEnriched(key: keyof EnrichedFlattenFinancialLines): string {
    return key;
  }
  
  initService(colonnesTable: Colonne[], colonnesGrouping: Colonne[]): void {
    this.colonnes = [
      {
        colonne: this._colonnesTableau.BENEFICIAIRE.code,
        label: this._colonnesTableau.BENEFICIAIRE.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_code'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_denomination'))[0]
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('beneficiaire_denomination'))[0],
        render: (row: FinancialDataModel) => {
          return row.siret?.nom_beneficiaire ?? this.NON_RENSEIGNE
        }
      },
      {
        colonne: this._colonnesTableau.MONTANT_AE.code,
        label: this._colonnesTableau.MONTANT_AE.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('montant_ae'))[0]
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('montant_ae'))[0],
        render: (row: FinancialDataModel) => row.montant_ae ? '<div class="fr-mr-2v fr-badge fr-badge--success badge-no-icon">' + this._moneyFormat.format(row.montant_ae) + "</div>" : "",
        style: { 'text-align': 'center' }
      },
      {
        colonne: this._colonnesTableau.MONTANT_CP.code,
        label: this._colonnesTableau.MONTANT_CP.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('montant_cp'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('montant_cp'))[0],
        render: (row: FinancialDataModel) => row.montant_cp ? '<div class="fr-mr-2v fr-badge fr-badge--success badge-no-icon">' + this._moneyFormat.format(row.montant_cp) + "</div>" : "",
        style: { 'text-align': 'center' }
      },
      {
        colonne: this._colonnesTableau.ANNEE_ENGAGEMENT.code,
        label: this._colonnesTableau.ANNEE_ENGAGEMENT.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('annee'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('annee'))[0],
        render: (row: FinancialDataModel) => '<div class="fr-mr-2v fr-badge fr-badge--info badge-no-icon">' + row.annee + "</div>",
        style: { 'min-width': '22ex', 'flex-grow': '0' }
      },
      {
        colonne: this._colonnesTableau.DOMAINE.code,
        label: this._colonnesTableau.DOMAINE.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('domaineFonctionnel_code'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('domaineFonctionnel_label'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('domaineFonctionnel_code'))[0],
        render: (row: FinancialDataModel) => row.domaine_fonctionnel ? this._printCodeLabel(row.domaine_fonctionnel.code, row.domaine_fonctionnel.label) : ""
      },
      {
        colonne: this._colonnesTableau.COMMUNE.code,
        label: this._colonnesTableau.COMMUNE.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_code'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_label'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_code'))[0],
        render: (row: FinancialDataModel) => row.commune?.label ?? this.NON_RENSEIGNE
      },
      {
        colonne: this._colonnesTableau.CRTE.code,
        label: this._colonnesTableau.CRTE.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_codeCrte'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_labelCrte'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_codeCrte'))[0],
        render: (row: FinancialDataModel) => row.commune?.label_crte ?? this.NON_RENSEIGNE
      },
      {
        colonne: this._colonnesTableau.EPCI.code,
        label: this._colonnesTableau.EPCI.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_codeEpci'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_labelEpci'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_codeEpci'))[0],
        render: (row: FinancialDataModel) => row.commune?.label_epci ?? this.NON_RENSEIGNE
      },
      {
        colonne: this._colonnesTableau.ARRONDISSEMENT.code,
        label: this._colonnesTableau.ARRONDISSEMENT.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_arrondissement_code'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_arrondissement_label'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_arrondissement_code'))[0],
        render: (row: FinancialDataModel) => row.commune?.arrondissement?.label ?? this.NON_RENSEIGNE
      },
      {
        colonne: this._colonnesTableau.DEPARTEMENT.code,
        label: this._colonnesTableau.DEPARTEMENT.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_codeDepartement'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_labelDepartement'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_codeDepartement'))[0],
        render: (row: FinancialDataModel) => row.commune?.label_departement ?? this.NON_RENSEIGNE
      },
      {
        colonne: this._colonnesTableau.REGION.code,
        label: this._colonnesTableau.REGION.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_codeRegion'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_labelRegion'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('beneficiaire_commune_codeRegion'))[0],
        render: (row: FinancialDataModel) => row.commune?.label_region ?? this.NON_RENSEIGNE
      },
      {
        colonne: this._colonnesTableau.LOC_INTER.code,
        label: this._colonnesTableau.LOC_INTER.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('localisationInterministerielle_code'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('localisationInterministerielle_label'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('localisationInterministerielle_code'))[0],
        render: (row: FinancialDataModel) => this._printLocalisationInterministerielle(row.localisation_interministerielle)
      },
      {
        colonne: this._colonnesTableau.N_EJ.code,
        label: this._colonnesTableau.N_EJ.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('n_ej'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('n_ej'))[0],
        render: (row: FinancialDataModel) => row.n_ej ?? "",
      },
      {
        colonne: this._colonnesTableau.TAGS.code,
        label: this._colonnesTableau.TAGS.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('tags'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('tags'))[0],
        render: (row: FinancialDataModel) => {
          let html = '<ul class="fr-tags-group">';
          for (const tag of row.tags || []) {
            if (tag) {
              html += '<li>';
                html += `<p class="fr-tag" style="margin-right: 0.5rem;" title="${tag.description}">${tag.display_name}`;
                html += `</p> `;
              html += '</li>';
            }
          }
          html += '</ul>';
          return html;
        },
      },
      {
        colonne: this._colonnesTableau.THEME.code,
        label: this._colonnesTableau.THEME.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('programme_theme'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('programme_theme'))[0],
        render: (row: FinancialDataModel) => row.programme?.theme ?? ''
      },
      {
        colonne: this._colonnesTableau.PROGRAMME.code,
        label: this._colonnesTableau.PROGRAMME.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('programme_code'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('programme_label'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('programme_code'))[0],
        render: (row: FinancialDataModel) => this._printCodeLabel(row.programme?.code, row.programme?.label)
      },
      {
        colonne: this._colonnesTableau.REF_PROGRAMMATION.code,
        label: this._colonnesTableau.REF_PROGRAMMATION.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('referentielProgrammation_code'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('referentielProgrammation_label'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('referentielProgrammation_code'))[0],
        render: (row: FinancialDataModel) => this._printCodeLabel(row.referentiel_programmation?.code, row.referentiel_programmation?.label)
      },
      {
        colonne: this._colonnesTableau.CENTRE_COUTS.code,
        label: this._colonnesTableau.CENTRE_COUTS.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('centreCouts_code'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('centreCouts_label'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('centreCouts_code'))[0],
        render: (row: FinancialDataModel) => this._printCodeLabel(row.centre_couts?.code, row.centre_couts?.description)
      },
      {
        colonne: this._colonnesTableau.SIRET.code,
        label: this._colonnesTableau.SIRET.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_code'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('beneficiaire_code'))[0],
        render: (row: FinancialDataModel) => row.siret?.code ?? this.NON_RENSEIGNE,
        style: { 'min-width': '16ex', 'flex-grow': '0' },
      },
      {
        colonne: this._colonnesTableau.QPV.code,
        label: this._colonnesTableau.QPV.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_qpv_code'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_qpv_label'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('beneficiaire_qpv_code'))[0],
        render: (row: FinancialDataModel) => this._printCodeLabel(row.siret?.code_qpv, row.siret?.label_qpv)
      },
      {
        colonne: this._colonnesTableau.TYPE_ETABLISSEMENT.code,
        label: this._colonnesTableau.TYPE_ETABLISSEMENT.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('beneficiaire_categorieJuridique_type'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('beneficiaire_categorieJuridique_type'))[0],
        render: (row: FinancialDataModel) =>  row.siret?.categorie_juridique ?? this.NON_RENSEIGNE
      },
      {
        colonne: this._colonnesTableau.COMPTE_BUDGETAIRE.code,
        label: this._colonnesTableau.COMPTE_BUDGETAIRE.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('compte_budgetaire'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('compte_budgetaire'))[0],
        render: (row: FinancialDataModel) => row.compte_budgetaire ?? this.NON_RENSEIGNE
      },
      {
        colonne: this._colonnesTableau.CPER.code,
        label: this._colonnesTableau.CPER.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('contrat_etat_region'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('contrat_etat_region'))[0],
        render: (row: FinancialDataModel) => row.contrat_etat_region ?? this.NON_RENSEIGNE
      },
      {
        colonne: this._colonnesTableau.GROUPE_MARCHANDISE.code,
        label: this._colonnesTableau.GROUPE_MARCHANDISE.label,
        back: [
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('groupeMarchandise_code'))[0],
          colonnesTable.filter(c => c.code == this.colNameOfEnriched('groupeMarchandise_label'))[0],
        ],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('groupeMarchandise_code'))[0],
        render: (row: FinancialDataModel) => this._printCodeLabel(row.groupe_marchandise?.code, row.groupe_marchandise?.label)
      },
      {
        colonne: this._colonnesTableau.DATE_DERNIER_PAIEMENT.code,
        label: this._colonnesTableau.DATE_DERNIER_PAIEMENT.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('dateDeDernierPaiement'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('dateDeDernierPaiement'))[0],
        render: (row: FinancialDataModel) => row.date_cp ? this._dateFormat.format(new Date(row.date_cp)) : this.EMPTY
      },
      {
        colonne: this._colonnesTableau.DATE_CREATION_EJ.code,
        label: this._colonnesTableau.DATE_CREATION_EJ.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('dateDeCreation'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('dateDeCreation'))[0],
        render: (row: FinancialDataModel) => row.date_replication ? this._dateFormat.format(new Date(row.date_replication)) : this.EMPTY
      },
      {
        colonne: this._colonnesTableau.DATE_MODIFICATION.code,
        label: this._colonnesTableau.DATE_MODIFICATION.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('date_modification'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('date_modification'))[0],
        render: (row: FinancialDataModel) => row.date_modification ? this._dateFormat.format(new Date(row.date_modification)) : this.EMPTY
      },
      {
        colonne: this._colonnesTableau.DATA_SOURCE.code,
        label: this._colonnesTableau.DATA_SOURCE.label,
        back: [colonnesTable.filter(c => c.code == this.colNameOfEnriched('data_source'))[0]],
        grouping: colonnesGrouping.filter(c => c.code == this.colNameOfEnriched('data_source'))[0],
        render: (row: FinancialDataModel) => row.data_source ?? ""
      },
    ];
  }

  public getDefaults(): ColonneTableau<FinancialDataModel>[] {
    return this.colonnes.filter(c => c.back.some(b => b.default  === true))
  }

  public mapNamesFromPreferences(preferences: ColonneFromPreference[]): ColonneTableau<FinancialDataModel>[] {
    const filteredPrefs = preferences.filter(p => p.displayed !== false);
    return filteredPrefs
      .map(pref => this.colonnes.find(c => c.colonne === pref.columnName))
      .filter((c): c is ColonneTableau<FinancialDataModel> => !!c); 
  }

  public mapLabelsFromPreferences(preferences: ColonneFromPreference[]): ColonneTableau<FinancialDataModel>[] {
    const filteredPrefs = preferences.filter(p => p.displayed !== false);
    return filteredPrefs
      .map(pref => this.colonnes.find(c => c.label === pref.columnLabel))
      .filter((c): c is ColonneTableau<FinancialDataModel> => !!c); 
  }

}
