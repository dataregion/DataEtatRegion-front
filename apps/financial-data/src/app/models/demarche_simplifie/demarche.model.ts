import { Nullable } from "apps/common-lib/src/lib/utilities/optional.type";

export interface Demarche { 
    number: number;
    title: string;
    reconciliation: Nullable<Cadre>;
    affichage: Nullable<Affichage>;
    centre_couts: string;
    date_creation: Date;
    date_fermeture: Date;
    date_import: Date;
    domaine_fonctionnel: string;
    referentiel_programmation: string;
    state: string;
}
export interface Donnee { 
    id: number;
    label: string;
}
export interface ValeurDonnee { 
    dossier_number: number;
    donnee_id: number;
    valeur: string;
}
export interface Cadre { 
    champEJ: string | undefined;
    champDS: string | undefined;
    centreCouts: string | undefined;
    domaineFonctionnel: string | undefined;
    refProg: string | undefined;
    annee: string | undefined;
    commune: string | undefined;
    epci: string | undefined;
    departement: string | undefined;
    region: string | undefined;
    champSiret: string | undefined;
    champMontant: string | undefined;
}
export interface Affichage { 
    nomProjet: string | undefined;
    descriptionProjet: string | undefined;
    categorieProjet: string | undefined;
    coutProjet: string | undefined;
    montantDemande: string | undefined;
    montantAccorde: string | undefined;
    dateFinProjet: string | undefined;
    contact: string | undefined;
}
