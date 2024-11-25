export interface IApi {}

export interface HostnameClientIdMappings {
  [key: string]: string;
}

export class Keycloak {
  url = '';
  realm = '';
  clientId? = null;
  multi_region = false;
  hostname_client_id_mappings: HostnameClientIdMappings = {}
}

export class Ressources {
  visuterritoire = '';
  graphiques = '';
  relance = '';
  api_swagger = '';
  documentation = '';
  suivi_usage = '';
}

export interface DashboardsSlugsMappings {
  [key: string]: string
}

export class Superset {
  baseDashboardUrl = '';
  dashboardsSlugs : DashboardsSlugsMappings = {};
}

export class Features {
  integration_ds = true;
}

export class Matomo {
  disabled = true;
  tracker_url = '';
  site_id = 0;
}

export interface NocodbViews {
  [k: string]: string;
}

export interface TableNocodb<V extends NocodbViews> {
  table: string;
  views: V;
}

export interface NocodbProject<V extends NocodbViews> {
  [k: string]: TableNocodb<V>;
}

export interface NocodApiProxy<P extends NocodbProject<V>, V extends NocodbViews> {
  base_uri: string;
  projects: P;
}

export class Settings {
  production = false;
  apis: IApi | undefined = undefined;
  keycloak: Keycloak = new Keycloak();
  features: Features = new Features();
  matomo: Matomo = new Matomo();
  superset: Superset = new Superset();
  ressources: Ressources = new Ressources();
  contact: string | undefined = undefined;
  url_github: string | undefined = undefined;
  url_dossier_ds: string | undefined = undefined;
}
