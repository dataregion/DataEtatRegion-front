import {
  Commune,
  DomaineFonctionnel,
  GroupeMarchandise,
  LocalisationInterministerielle,
  Programme,
  Siret,
  SourceFinancialData
} from 'apps/common-lib/src/lib/models/refs/common.models';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';
import { ExportableAsJson } from 'apps/common-lib/src/lib/models/exportable-as-json.model';
import { ReferentielProgrammation } from 'apps/common-lib/src/lib/models/refs/referentiel_programmation.model';
import { CentreCouts } from 'apps/clients/v3/referentiels';


export interface FinancialDataModel extends ExportableAsJson {
  id: number;
  source: SourceFinancialData;

  n_ej: Optional<string>;
  n_poste_ej: Optional<number>;

  montant_ae: Optional<number>;
  montant_cp: Optional<number>;

  commune: Optional<Commune>;

  domaine_fonctionnel: Optional<DomaineFonctionnel>;
  programme: Optional<Programme>;
  referentiel_programmation: Optional<ReferentielProgrammation>;

  centre_couts: Optional<CentreCouts>;

  compte_budgetaire: Optional<string>;
  contrat_etat_region: Optional<string>;
  groupe_marchandise: Optional<GroupeMarchandise>;
  localisation_interministerielle: Optional<LocalisationInterministerielle>;

  annee: Optional<number>;

  siret: Optional<Siret>;
  date_cp: Optional<string>;
  date_replication: Optional<string>;

  data_source: Optional<string>;
  date_modification: Optional<string>;
}
