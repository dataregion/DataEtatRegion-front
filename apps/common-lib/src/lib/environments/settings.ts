export interface IApi {}

export interface HostnameClientIdMappings {
  [key: string]: string
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

export class Features {
  integration_ds = true;
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

export interface NocodApiProxy<
  P extends NocodbProject<V>,
  V extends NocodbViews
> {
  base_uri: string;
  projects: P;
}

export class Settings {
  production = false;
  apis: IApi | undefined = undefined;
  keycloak: Keycloak = new Keycloak();
  ressources: Ressources = new Ressources();
  features: Features = new Features();
  contact: string | undefined = undefined;
  url_github: string | undefined = undefined;
}
