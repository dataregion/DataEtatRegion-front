import { CentreCouts, Commune, DomaineFonctionnel, GroupeMarchandise, LieuAction, LocalisationInterministerielle, Programme, Siret, SourceFinancialData, TypeCategorieJuridique } from "../../models/financial/common.models";
import { FinancialDataModel } from "apps/data-qpv/src/app/models/financial/financial-data.models";
import { ReferentielProgrammation } from "apps/data-qpv/src/app/models/refs/referentiel_programmation.model";
import { Tag, tag_fullname } from "apps/data-qpv/src/app/models/refs/tag.model";
import { ColonneLibelles } from "../colonnes.service";
import { EnrichedFlattenFinancialLinesSchema, TagsSchema } from "apps/clients/budget";
import { Optional } from "apps/common-lib/src/lib/utilities/optional.type";
import { JSONObject } from "apps/common-lib/src/lib/models/jsonobject";

export class BudgetLineHttpMapper {

    _sourceFinancialDataFromEnrichedFlattenBudgetSource(source?: EnrichedFlattenFinancialLinesSchema.SourceEnum): SourceFinancialData {
        switch (source) {
            case "FINANCIAL_DATA_AE":
                return SourceFinancialData.FINANCIAL_AE;
            case "FINANCIAL_DATA_CP":
                return SourceFinancialData.FINANCIAL_CP;
            case "ADEME":
                return SourceFinancialData.ADEME;

            default:
                throw new Error(`${source} ne représente pas un aggregat racine (ie: ae ou ademe...)`);
        }
    }

    /** Mappe une réponse API vers un modèle générique */
    map(object: EnrichedFlattenFinancialLinesSchema): FinancialDataModel {
        return {
            id: object.id!,
            source: this._sourceFinancialDataFromEnrichedFlattenBudgetSource(object.source),

            n_ej: object.n_ej,
            n_poste_ej: object.n_poste_ej,

            montant_ae: object.montant_ae,
            montant_cp: object.montant_cp,

            commune: this._mapBeneficiaireCommune(object),

            domaine_fonctionnel: this._mapDomaineDonctionnel(object),

            centre_couts: this._mapCentreCouts(object),

            programme: this._mapProgramme(object),

            referentiel_programmation: this._mapRefProg(object),

            compte_budgetaire: object.compte_budgetaire,
            contrat_etat_region: object.contrat_etat_region,


            groupe_marchandise: this._mapGroupeMarchandise(object),

            localisation_interministerielle: this._mapLocInterministerielle(object),

            annee: object.annee!,

            siret: this._mapBeneficiaireSiret(object),
            lieu_action: this._mapLieuAction(object),

            date_cp: object.dateDeDernierPaiement,
            date_replication: object.dateDeCreation,

            tags: this._mapTags(object),

            
            data_source: object.data_source,

            exportAsJson(): JSONObject {
                return {
                    [ColonneLibelles.SOURCE]: this.source,
                    [ColonneLibelles.N_EJ]: this.n_ej ?? "",
                    [ColonneLibelles.POSTE_EJ]: this.n_poste_ej ?? "",
                    [ColonneLibelles.MONTANT_AE]: this.montant_ae ?? "",
                    [ColonneLibelles.MONTANT_CP]: this.montant_cp ?? "",
                    [ColonneLibelles.THEME]: this.programme?.theme ?? "",
                    [ColonneLibelles.CODE_PROGRAMME]: this.programme?.code ?? "",
                    [ColonneLibelles.PROGRAMME]: this.programme?.label ?? "",
                    [ColonneLibelles.CODE_DOMAINE]: this.domaine_fonctionnel?.code ?? "",
                    [ColonneLibelles.DOMAINE]: this.domaine_fonctionnel?.label ?? "",
                    [ColonneLibelles.REFERENTIEL_PROGRAMMATION]: this.referentiel_programmation?.label ?? "",
                    [ColonneLibelles.CODE_CENTRE_COUTS]: this.centre_couts?.code ?? "",
                    [ColonneLibelles.LABEL_CENTRE_COUTS]: this.centre_couts?.label ?? "",
                    [ColonneLibelles.CENTRE_COUTS]: this.centre_couts?.description ?? "",
                    [ColonneLibelles.COMMUNE]: this.commune?.label ?? "",
                    [ColonneLibelles.CRTE]: this.commune?.label_crte ?? "",
                    [ColonneLibelles.EPCI]: this.commune?.label_epci ?? "",
                    [ColonneLibelles.ARRONDISSEMENT]: this.commune?.arrondissement?.label ?? "",
                    [ColonneLibelles.DEPARTEMENT]: this.commune?.label_departement ?? "",
                    [ColonneLibelles.REGION]: this.commune?.label_region ?? "",
                    [ColonneLibelles.CODE_LOC_INTER]: this.localisation_interministerielle?.code ?? "",
                    [ColonneLibelles.LOC_INTER]: this.localisation_interministerielle?.label ?? "",
                    [ColonneLibelles.COMPTE_BUDGETAIRE]: this.compte_budgetaire ?? "",
                    [ColonneLibelles.CPER]: this.contrat_etat_region && this.contrat_etat_region !== '#' ? this.contrat_etat_region : "",
                    [ColonneLibelles.CODE_GROUPE_MARCHANDISE]: this.groupe_marchandise?.code ?? "",
                    [ColonneLibelles.GROUPE_MARCHANDISE]: this.groupe_marchandise?.label ?? "",
                    [ColonneLibelles.SIRET]: this.siret?.code ?? "",
                    [ColonneLibelles.BENEFICIAIRE]: this.siret?.nom_beneficiaire ?? "",
                    [ColonneLibelles.TYPE_ETABLISSEMENT]: this.siret?.categorie_juridique ?? "",
                    [ColonneLibelles.CODE_QPV]: this.siret?.code_qpv ?? "",
                    [ColonneLibelles.DATE_DERNIER_PAIEMENT]: this.date_cp ?? "",
                    [ColonneLibelles.DATE_CREATION_EJ]: this.date_replication ?? "",
                    [ColonneLibelles.ANNEE_ENGAGEMENT]: this.annee,
                    [ColonneLibelles.TAGS]: this.tags?.map(tag => tag_fullname(tag)).join(" "),
                }
            }
        }

    }
    private _mapBeneficiaireSiret(object: EnrichedFlattenFinancialLinesSchema): Optional<Siret> {

        if (!object.beneficiaire_code)
            return null

        return {
            code: object.beneficiaire_code,
            nom_beneficiaire: object.beneficiaire_denomination,
            categorie_juridique: this._mapBeneficiaireCategorieJuridique(object),
            code_qpv: object.beneficiaire_qpv_code,
            label_qpv: object.beneficiaire_qpv_label,
            code_qpv24: object.beneficiaire_qpv24_code,
            label_qpv24: object.beneficiaire_qpv24_label,

        };
    }
    private _mapLieuAction(object: EnrichedFlattenFinancialLinesSchema): Optional<LieuAction> {
        if (!object.lieu_action_code_qpv)
            return null
        return {
            code_qpv: object.lieu_action_code_qpv,
            label_qpv: object.lieu_action_label_qpv
        };
    }
    private _mapLocInterministerielle(object: EnrichedFlattenFinancialLinesSchema): Optional<LocalisationInterministerielle> {
        if (!object.localisationInterministerielle_code)
            return null

        let commune: Optional<Commune> = null;
        if (object.localisationInterministerielle_commune_code) {

            let arrondissement = null;
            if (object.localisationInterministerielle_commune_arrondissement_code) {
                arrondissement = {
                    code: object.localisationInterministerielle_commune_arrondissement_code,
                    label: object.localisationInterministerielle_commune_arrondissement_label!,
                }
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
                arrondissement: arrondissement,
            }
        }

        return {
            code: object.localisationInterministerielle_code,
            label: object.localisationInterministerielle_label!,
            code_departement: object.localisationInterministerielle_codeDepartement,
            commune: commune,
        }
    }

    private _mapCentreCouts(object: EnrichedFlattenFinancialLinesSchema): Optional<CentreCouts> {
        return {
            code: object.centreCouts_code ? object.centreCouts_code : "",
            label: object.centreCouts_label!,
            description: object.centreCouts_description!,
        }
    }

    private _mapGroupeMarchandise(object: EnrichedFlattenFinancialLinesSchema): Optional<GroupeMarchandise> {
        if (!object.groupeMarchandise_code)
            return null;
        return {
            code: object.groupeMarchandise_code,
            label: object.groupeMarchandise_label!,
        }
    }

    private _mapRefProg(object: EnrichedFlattenFinancialLinesSchema): Optional<ReferentielProgrammation> {

        return {
            code: object.referentielProgrammation_code || '',
            label: object.referentielProgrammation_label!
        }
    }
    private _mapProgramme(object: EnrichedFlattenFinancialLinesSchema): Optional<Programme> {

        if (!object.programme_code)
            return null;
        return {
            code: object.programme_code,
            label: object.programme_label!,
            theme: object.programme_theme,
        }
    }
    private _mapDomaineDonctionnel(object: EnrichedFlattenFinancialLinesSchema): Optional<DomaineFonctionnel> {

        return {
            code: object.domaineFonctionnel_code || '',
            label: object.domaineFonctionnel_label!,
        }
    }


    _mapBeneficiaireCategorieJuridique(object: EnrichedFlattenFinancialLinesSchema): TypeCategorieJuridique {
        return object.beneficiaire_categorieJuridique_type as TypeCategorieJuridique;
    }

    _mapTags(object: EnrichedFlattenFinancialLinesSchema): Tag[] {

        const _tags_schema: TagsSchema[] = object.tags ?? []
        const tags: Tag[] = []
        for (const tag_schema of _tags_schema) {

            const _tag_schema = tag_schema as TagsSchema
            const _tag: Tag = {
                type: _tag_schema.type,
                value: _tag_schema.value,
                description: _tag_schema.description,
                display_name: _tag_schema.display_name,
            }

            tags.push(_tag)
        }

        return tags;
    }

    _mapBeneficiaireCommune(object: EnrichedFlattenFinancialLinesSchema): Optional<Commune> {
        if (!object.beneficiaire_commune_code)
            return null

        let arrondissement = null;
        if (object.beneficiaire_commune_arrondissement_code) {
            arrondissement = {
                code: object.beneficiaire_commune_arrondissement_code,
                label: object.beneficiaire_commune_arrondissement_label!,
            }
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
        }
    }
}
