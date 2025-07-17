import { Nullable } from 'apps/common-lib/src/lib/utilities/optional.type';

export interface DemarcheLight {
  id: number;
  title: string;
}

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

export interface AffichageDossier {
  nomDemarche: string;
  numeroDossier: number;
  nomProjet: string;
  descriptionProjet: string;
  categorieProjet: string;
  coutProjet: string;
  montantDemande: string;
  montantAccorde: string;
  dateFinProjet: string;
  contact: string;
}

export interface Donnee {
  id: number;
  label: string;
  id_ds: string;
}

export interface ValeurDonnee {
  dossier_number: number;
  donnee_id: number;
  valeur: string;
}

export interface Reconciliation {
  id: number;
  dossier_number: number;
  financial_ae_id: number;
  date_reconciliation: Date;
}

export interface Cadre {
  champEJ: string | undefined;
  champDS: string | undefined;
  centreCouts: string | undefined;
  domaineFonctionnel: string | undefined;
  refProg: string | undefined;
  annee: number | undefined;
  commune: string | undefined;
  epci: string | undefined;
  departement: string | undefined;
  region: string | undefined;
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

export interface Token {
  id: number | undefined;
  nom: string;
  token: string;
}
