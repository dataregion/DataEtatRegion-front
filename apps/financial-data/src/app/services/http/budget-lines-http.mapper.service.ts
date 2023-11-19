import { Commune, DomaineFonctionnel, GroupeMarchandise, LocalisationInterministerielle, Programme, Siret, SourceFinancialData, TypeCategorieJuridique } from "@models/financial/common.models";
import { FinancialDataModel } from "@models/financial/financial-data.models";
import { ReferentielProgrammation } from "@models/refs/referentiel_programmation.model";
import { Tag } from "@models/refs/tag.model";
import { EnrichedFlattenFinancialLinesSchema, TagsSchema } from "apps/clients/budget";
import { Optional } from "apps/common-lib/src/lib/utilities/optional.type";

export class BudgetLineHttpMapper {

    _sourceFinancialDataFromEnrichedFlattenBudgetSource(source?: EnrichedFlattenFinancialLinesSchema.SourceEnum): SourceFinancialData {
        switch (source) {
            case "FINANCIAL_DATA_AE":
                return SourceFinancialData.CHORUS;
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

            commune: this._map_beneficiaire_commune(object),

            domaine_fonctionnel: this._map_domaine_fonctionnel(object),

            programme: this._map_programme(object),

            referentiel_programmation: this._map_ref_prog(object),

            compte_budgetaire: object.compte_budgetaire,
            contrat_etat_region: object.contrat_etat_region,


            groupe_marchandise: this._map_groupe_marchandise(object),

            localisation_interministerielle: this._map_loc_interministerielle(object),

            annee: object.annee!,

            siret: this._map_beneficiaire_siret(object),

            date_cp: object.dateDeDernierPaiement,
            date_replication: object.dateDeCreation,

            tags: this._map_tags(object),

            financial_cp: null, // XXX: On ne résoud pas les CPs ici. C'est fait dans un appel séparé. 
        }

    }
    private _map_beneficiaire_siret(object: EnrichedFlattenFinancialLinesSchema): Optional<Siret> {
        
        if (! object.beneficiaire_code)
            return null

        return {
            code: object.beneficiaire_code,
            nom_beneficiaire: object.beneficiaire_denomination,
            categorie_juridique: this._map_beneficiaire_categorie_juridique(object),
            code_qpv: object.beneficiaire_qpv_code,
        };
    }
    private _map_loc_interministerielle(object: EnrichedFlattenFinancialLinesSchema): Optional<LocalisationInterministerielle> {
        if (! object.localisationInterministerielle_code)
            return null
        return {
            code: object.localisationInterministerielle_code,
            label: object.localisationInterministerielle_label!,
        }
    }
    private _map_groupe_marchandise(object: EnrichedFlattenFinancialLinesSchema): Optional<GroupeMarchandise> {
        if (! object.groupeMarchandise_code)
            return null;
        return {
            code: object.groupeMarchandise_code,
            label: object.groupeMarchandise_label!,
        }
    }

    private _map_ref_prog(object: EnrichedFlattenFinancialLinesSchema): Optional<ReferentielProgrammation> {

        if (!object.referentielProgrammation_code)
            return null
        return {
            code: object.referentielProgrammation_code,
            label: object.referentielProgrammation_label!
        }
    }
    private _map_programme(object: EnrichedFlattenFinancialLinesSchema): Optional<Programme> {

        if (!object.programme_code)
            return null;
        return {
            code: object.programme_code,
            label: object.programme_label!,
            theme: object.programme_theme,
        }
    }
    private _map_domaine_fonctionnel(object: EnrichedFlattenFinancialLinesSchema): Optional<DomaineFonctionnel> {

        if (!object.domaineFonctionnel_code)
            return undefined
        return {
            code: object.domaineFonctionnel_code,
            label: object.domaineFonctionnel_label!,
        }
    }


    _map_beneficiaire_categorie_juridique(object: EnrichedFlattenFinancialLinesSchema): TypeCategorieJuridique {
        return object.beneficiaire_categorieJuridique_type as TypeCategorieJuridique;
    }

    _map_tags(object: EnrichedFlattenFinancialLinesSchema): Tag[] {

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

    _map_beneficiaire_commune(object: EnrichedFlattenFinancialLinesSchema): Commune | undefined {
        if (!object.beneficiaire_commune_code)
            return undefined;

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