import {
  Commune,
  DomaineFonctionnel,
  GroupeMarchandise,
  LieuAction,
  LocalisationInterministerielle,
  Programme,
  Siret,
  SourceFinancialData,
  TypeCategorieJuridique
} from 'apps/common-lib/src/lib/models/refs/common.models';
import { BudgetFinancialDataModel } from '@models/financial/financial-data.models';
import { TagsSchema } from 'apps/clients/budget';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';
import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';
import { inject, Injectable } from '@angular/core';
import { ColonnesMapperService } from './colonnes-mapper.service';
import { EnrichedFlattenFinancialLines2, Tags } from 'apps/clients/v3/financial-data';
import { ReferentielProgrammation } from 'apps/common-lib/src/lib/models/refs/referentiel_programmation.model';
import { Tag, tag_fullname } from '@models/refs/tag.model';
import { CentreCouts } from 'apps/clients/v3/referentiels';
import { FlattenFinancialLinesDataQPV } from 'apps/clients/v3/data-qpv';
import { DataQpvFinancialDataModel } from 'apps/data-qpv/src/app/models/financial/financial-data.models';

@Injectable({
  providedIn: 'root'
})
export class SearchDataMapper {

  private _colonnesMapperService: ColonnesMapperService = inject(ColonnesMapperService)

  /**
   * Fonction de mapping structuré
   * @param object 
   * @returns 
   */
  mapToBudget(object: EnrichedFlattenFinancialLines2): BudgetFinancialDataModel {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    return {
      id: object.id!,
      source: this._sourceFinancialDataFromEnrichedFlattenBudgetSource(object.source ?? undefined),
      n_ej: object.n_ej,
      n_poste_ej: object.n_poste_ej,
      montant_ae: object.montant_ae,
      montant_cp: object.montant_cp,
      commune: this._mapBeneficiaireCommune(object),
      domaine_fonctionnel: this._mapDomaineFonctionnel(object),
      centre_couts: this._mapCentreCouts(object),
      programme: this._mapProgramme(object),
      referentiel_programmation: this._mapRefProg(object),
      compte_budgetaire: object.compte_budgetaire,
      contrat_etat_region: object.contrat_etat_region,
      groupe_marchandise: this._mapGroupeMarchandise(object),
      localisation_interministerielle: this._mapLocInterministerielle(object),
      annee: object.annee!,
      data_source: object.data_source,
      date_modification: object.date_modification,
      siret: this._mapBeneficiaireSiret(object),
      date_cp: object.dateDeDernierPaiement,
      date_replication: object.dateDeCreation,
      tags: this._mapTags(object),
      financial_cp: null,
      exportAsJson(): JSONObject {
        return {
          [that._colonnesMapperService.getColonneByKey("SOURCE").label]: this.source,
          [that._colonnesMapperService.getColonneByKey("DATE_MODIFICATION").label]: this.date_modification ?? '',
          [that._colonnesMapperService.getColonneByKey("N_EJ").label]: this.n_ej ?? '',
          [that._colonnesMapperService.getColonneByKey("POSTE_EJ").label]: this.n_poste_ej ?? '',
          [that._colonnesMapperService.getColonneByKey("MONTANT_AE").label]: this.montant_ae ?? '',
          [that._colonnesMapperService.getColonneByKey("MONTANT_CP").label]: this.montant_cp ?? '',
          [that._colonnesMapperService.getColonneByKey("THEME").label]: this.programme?.theme ?? '',
          [that._colonnesMapperService.getColonneByKey("PROGRAMME").label]: this.programme ? this.programme.code + " - " + this.programme.label : '',
          [that._colonnesMapperService.getColonneByKey("DOMAINE").label]: this.domaine_fonctionnel ? this.domaine_fonctionnel.code + " - " + this.domaine_fonctionnel.label : '',
          [that._colonnesMapperService.getColonneByKey("REF_PROGRAMMATION").label]: this.referentiel_programmation ? this.referentiel_programmation.code + " - " + this.referentiel_programmation.label : '',
          [that._colonnesMapperService.getColonneByKey("CENTRE_COUTS").label]: this.centre_couts ? this.centre_couts.code + " - " + this.centre_couts.label : '',
          [that._colonnesMapperService.getColonneByKey("COMMUNE").label]: this.commune?.label ?? '',
          [that._colonnesMapperService.getColonneByKey("CRTE").label]: this.commune?.label_crte ?? '',
          [that._colonnesMapperService.getColonneByKey("EPCI").label]: this.commune?.label_epci ?? '',
          [that._colonnesMapperService.getColonneByKey("ARRONDISSEMENT").label]: this.commune?.arrondissement?.label ?? '',
          [that._colonnesMapperService.getColonneByKey("DEPARTEMENT").label]: this.commune?.label_departement ?? '',
          [that._colonnesMapperService.getColonneByKey("REGION").label]: this.commune?.label_region ?? '',
          [that._colonnesMapperService.getColonneByKey("LOC_INTER").label]: this.localisation_interministerielle ? this.localisation_interministerielle.code + " - " + this.localisation_interministerielle.label : '',
          [that._colonnesMapperService.getColonneByKey("COMPTE_BUDGETAIRE").label]: this.compte_budgetaire ?? '',
          [that._colonnesMapperService.getColonneByKey("CPER").label]: this.contrat_etat_region && this.contrat_etat_region !== '#' ? this.contrat_etat_region : '',
          [that._colonnesMapperService.getColonneByKey("GROUPE_MARCHANDISE").label]: this.groupe_marchandise ? this.groupe_marchandise.code + " - " + this.groupe_marchandise.label : '',
          [that._colonnesMapperService.getColonneByKey("SIRET").label]: this.siret?.code ?? '',
          [that._colonnesMapperService.getColonneByKey("BENEFICIAIRE").label]: this.siret?.nom_beneficiaire ?? '',
          [that._colonnesMapperService.getColonneByKey("TYPE_ETABLISSEMENT").label]: this.siret?.categorie_juridique ?? '',
          [that._colonnesMapperService.getColonneByKey("QPV").label]: this.siret ? this.siret.code_qpv + " - " + this.siret.label_qpv : '',
          [that._colonnesMapperService.getColonneByKey("DATE_DERNIER_PAIEMENT").label]: this.date_cp ?? '',
          [that._colonnesMapperService.getColonneByKey("DATE_CREATION_EJ").label]: this.date_replication ?? '',
          [that._colonnesMapperService.getColonneByKey("ANNEE_ENGAGEMENT").label]: this.annee ?? '',
          [that._colonnesMapperService.getColonneByKey("TAGS").label]: this.tags?.map((tag) => tag_fullname(tag)).join(' ')
        };
      }
    };
  }


  /**
   * Fonction de mapping structuré
   * @param object 
   * @returns 
   */
  mapToDataQpv(object: FlattenFinancialLinesDataQPV): DataQpvFinancialDataModel {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    return {
      id: object.id!,
      source: this._sourceFinancialDataFromEnrichedFlattenBudgetSource(object.source ?? undefined),
      n_ej: object.n_ej,
      n_poste_ej: object.n_poste_ej,
      montant_ae: object.montant_ae,
      montant_cp: object.montant_cp,
      commune: this._mapBeneficiaireCommune(object),
      domaine_fonctionnel: this._mapDomaineFonctionnel(object),
      centre_couts: this._mapCentreCouts(object),
      programme: this._mapProgramme(object),
      referentiel_programmation: this._mapRefProg(object),
      compte_budgetaire: object.compte_budgetaire,
      contrat_etat_region: object.contrat_etat_region,
      groupe_marchandise: this._mapGroupeMarchandise(object),
      localisation_interministerielle: this._mapLocInterministerielle(object),
      annee: object.annee!,
      data_source: object.data_source,
      date_modification: object.date_modification,
      siret: this._mapBeneficiaireSiret(object),
      lieu_action: this._mapLieuAction(object),
      date_cp: object.dateDeDernierPaiement,
      date_replication: object.dateDeCreation,
      exportAsJson(): JSONObject {
        return {
          [that._colonnesMapperService.getColonneByKey("SOURCE").label]: this.source,
          [that._colonnesMapperService.getColonneByKey("DATE_MODIFICATION").label]: this.date_modification ?? '',
          [that._colonnesMapperService.getColonneByKey("N_EJ").label]: this.n_ej ?? '',
          [that._colonnesMapperService.getColonneByKey("POSTE_EJ").label]: this.n_poste_ej ?? '',
          [that._colonnesMapperService.getColonneByKey("MONTANT_AE").label]: this.montant_ae ?? '',
          [that._colonnesMapperService.getColonneByKey("MONTANT_CP").label]: this.montant_cp ?? '',
          [that._colonnesMapperService.getColonneByKey("THEME").label]: this.programme?.theme ?? '',
          [that._colonnesMapperService.getColonneByKey("PROGRAMME").label]: this.programme ? this.programme.code + " - " + this.programme.label : '',
          [that._colonnesMapperService.getColonneByKey("DOMAINE").label]: this.domaine_fonctionnel ? this.domaine_fonctionnel.code + " - " + this.domaine_fonctionnel.label : '',
          [that._colonnesMapperService.getColonneByKey("REF_PROGRAMMATION").label]: this.referentiel_programmation ? this.referentiel_programmation.code + " - " + this.referentiel_programmation.label : '',
          [that._colonnesMapperService.getColonneByKey("CENTRE_COUTS").label]: this.centre_couts ? this.centre_couts.code + " - " + this.centre_couts.label : '',
          [that._colonnesMapperService.getColonneByKey("COMMUNE").label]: this.commune?.label ?? '',
          [that._colonnesMapperService.getColonneByKey("CRTE").label]: this.commune?.label_crte ?? '',
          [that._colonnesMapperService.getColonneByKey("EPCI").label]: this.commune?.label_epci ?? '',
          [that._colonnesMapperService.getColonneByKey("ARRONDISSEMENT").label]: this.commune?.arrondissement?.label ?? '',
          [that._colonnesMapperService.getColonneByKey("DEPARTEMENT").label]: this.commune?.label_departement ?? '',
          [that._colonnesMapperService.getColonneByKey("REGION").label]: this.commune?.label_region ?? '',
          [that._colonnesMapperService.getColonneByKey("LOC_INTER").label]: this.localisation_interministerielle ? this.localisation_interministerielle.code + " - " + this.localisation_interministerielle.label : '',
          [that._colonnesMapperService.getColonneByKey("COMPTE_BUDGETAIRE").label]: this.compte_budgetaire ?? '',
          [that._colonnesMapperService.getColonneByKey("CPER").label]: this.contrat_etat_region && this.contrat_etat_region !== '#' ? this.contrat_etat_region : '',
          [that._colonnesMapperService.getColonneByKey("GROUPE_MARCHANDISE").label]: this.groupe_marchandise ? this.groupe_marchandise.code + " - " + this.groupe_marchandise.label : '',
          [that._colonnesMapperService.getColonneByKey("SIRET").label]: this.siret?.code ?? '',
          [that._colonnesMapperService.getColonneByKey("BENEFICIAIRE").label]: this.siret?.nom_beneficiaire ?? '',
          [that._colonnesMapperService.getColonneByKey("TYPE_ETABLISSEMENT").label]: this.siret?.categorie_juridique ?? '',
          [that._colonnesMapperService.getColonneByKey("QPV").label]: this.siret ? this.siret.code_qpv + " - " + this.siret.label_qpv : '',
          [that._colonnesMapperService.getColonneByKey("DATE_DERNIER_PAIEMENT").label]: this.date_cp ?? '',
          [that._colonnesMapperService.getColonneByKey("DATE_CREATION_EJ").label]: this.date_replication ?? '',
          [that._colonnesMapperService.getColonneByKey("ANNEE_ENGAGEMENT").label]: this.annee ?? '',
        };
      }
    };
  }

  private _sourceFinancialDataFromEnrichedFlattenBudgetSource(
    source?: EnrichedFlattenFinancialLines2.SourceEnum
  ): SourceFinancialData {
    switch (source) {
      case 'FINANCIAL_DATA_AE':
        return SourceFinancialData.FINANCIAL_AE;
      case 'FINANCIAL_DATA_CP':
        return SourceFinancialData.FINANCIAL_CP;
      case 'ADEME':
        return SourceFinancialData.ADEME;

      default:
        throw new Error(`${source} ne représente pas un aggregat racine (ie: ae ou ademe...)`);
    }
  }

  private _mapBeneficiaireSiret(object: EnrichedFlattenFinancialLines2): Optional<Siret> {
    if (!object.beneficiaire_code) return null;

    return {
      code: object.beneficiaire_code,
      nom_beneficiaire: object.beneficiaire_denomination,
      categorie_juridique: this._mapBeneficiaireCategorieJuridique(object),
      code_qpv: object.beneficiaire_qpv_code,
      label_qpv: object.beneficiaire_qpv_label,
      code_qpv24: object.beneficiaire_qpv24_code,
      label_qpv24: object.beneficiaire_qpv24_label
    };
  }

  private _mapLocInterministerielle(
    object: EnrichedFlattenFinancialLines2
  ): Optional<LocalisationInterministerielle> {
    if (!object.localisationInterministerielle_code) return null;

    let commune: Optional<Commune> = null;
    if (object.localisationInterministerielle_commune_code) {
      let arrondissement = null;
      if (object.localisationInterministerielle_commune_arrondissement_code) {
        arrondissement = {
          code: object.localisationInterministerielle_commune_arrondissement_code,
          label: object.localisationInterministerielle_commune_arrondissement_label!
        };
      }

      commune = {
        code: object.localisationInterministerielle_commune_code,
        label: object.localisationInterministerielle_commune_label!,
        code_crte: object.localisationInterministerielle_commune_codeCrte,
        label_crte: object.localisationInterministerielle_commune_labelCrte,
        code_departement: object.localisationInterministerielle_commune_codeDepartement,
        label_departement: object.localisationInterministerielle_commune_labelDepartement,
        code_epci: object.localisationInterministerielle_commune_codeEpci,
        label_epci: object.localisationInterministerielle_commune_labelEpci,
        code_region: object.localisationInterministerielle_commune_codeRegion,
        label_region: object.localisationInterministerielle_commune_labelRegion,
        arrondissement: arrondissement
      };
    }

    return {
      code: object.localisationInterministerielle_code,
      label: object.localisationInterministerielle_label!,
      code_departement: object.localisationInterministerielle_codeDepartement,
      commune: commune
    };
  }

  private _mapCentreCouts(object: EnrichedFlattenFinancialLines2): Optional<CentreCouts> {
    return {
      code: object.centreCouts_code ? object.centreCouts_code : '',
      label: object.centreCouts_label!,
      description: object.centreCouts_description!
    };
  }

  private _mapGroupeMarchandise(
    object: EnrichedFlattenFinancialLines2
  ): Optional<GroupeMarchandise> {
    if (!object.groupeMarchandise_code) return null;
    return {
      code: object.groupeMarchandise_code,
      label: object.groupeMarchandise_label!
    };
  }

  private _mapRefProg(
    object: EnrichedFlattenFinancialLines2
  ): Optional<ReferentielProgrammation> {
    return {
      code: object.referentielProgrammation_code || '',
      label: object.referentielProgrammation_label!
    };
  }

  private _mapProgramme(object: EnrichedFlattenFinancialLines2): Optional<Programme> {
    if (!object.programme_code) return null;
    return {
      code: object.programme_code,
      label: object.programme_label!,
      theme: object.programme_theme
    };
  }

  private _mapDomaineFonctionnel(
    object: EnrichedFlattenFinancialLines2
  ): Optional<DomaineFonctionnel> {
    return {
      code: object.domaineFonctionnel_code || '',
      label: object.domaineFonctionnel_label!
    };
  }

  _mapBeneficiaireCategorieJuridique(
    object: EnrichedFlattenFinancialLines2
  ): TypeCategorieJuridique {
    return object.beneficiaire_categorieJuridique_type as TypeCategorieJuridique;
  }

  _mapTags(object: EnrichedFlattenFinancialLines2): Tag[] {
    const _tags_schema: Tags[] = object.tags ?? [];
    const tags: Tag[] = [];
    for (const tag_schema of _tags_schema) {
      const _tag_schema = tag_schema as TagsSchema;
      const _tag: Tag = {
        type: _tag_schema.type,
        value: _tag_schema.value,
        description: _tag_schema.description,
        display_name: _tag_schema.display_name
      };

      tags.push(_tag);
    }

    return tags;
  }

  _mapBeneficiaireCommune(object: EnrichedFlattenFinancialLines2): Optional<Commune> {
    if (!object.beneficiaire_commune_code) return null;

    let arrondissement = null;
    if (object.beneficiaire_commune_arrondissement_code) {
      arrondissement = {
        code: object.beneficiaire_commune_arrondissement_code,
        label: object.beneficiaire_commune_arrondissement_label!
      };
    }

    return {
      code: object.beneficiaire_commune_code,
      label: object.beneficiaire_commune_label!,

      label_crte: object.beneficiaire_commune_labelCrte,
      code_crte: object.beneficiaire_commune_codeCrte,

      label_epci: object.beneficiaire_commune_labelEpci,
      code_epci: object.beneficiaire_commune_codeEpci,

      label_departement: object.beneficiaire_commune_labelDepartement,
      code_departement: object.beneficiaire_commune_codeDepartement,

      label_region: object.beneficiaire_commune_labelRegion,
      code_region: object.beneficiaire_commune_codeRegion,

      arrondissement: arrondissement
    };
  }
  
  private _mapLieuAction(object: FlattenFinancialLinesDataQPV): Optional<LieuAction> {
    if (!object.lieu_action_code_qpv) return null;

    return {
      code_qpv: object.lieu_action_code_qpv,
      label_qpv: object.lieu_action_label_qpv
    };
  }

}
