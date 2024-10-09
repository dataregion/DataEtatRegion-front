/**
 * API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { TrancheEffectifSalarie } from './trancheEffectifSalarie';
import { ActivitePrincipale } from './activitePrincipale';
import { FormeJuridique } from './formeJuridique';
import { PersonneMoraleAttributs } from './personneMoraleAttributs';
import { PersonnePhysiqueAttributs } from './personnePhysiqueAttributs';


export interface UniteLegale { 
    activite_principale: ActivitePrincipale;
    economie_sociale_et_solidaire?: boolean;
    forme_juridique: FormeJuridique;
    personne_morale_attributs: PersonneMoraleAttributs;
    personne_physique_attributs: PersonnePhysiqueAttributs;
    tranche_effectif_salarie: TrancheEffectifSalarie;
}

