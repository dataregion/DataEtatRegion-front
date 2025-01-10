import { KeycloakProfile } from 'keycloak-js';
import { PageSize } from './pagination/pagesize.models';


export type User = KeycloakProfile & {
  roles: string[];
  softEnabled: boolean;
};

export interface UsersPagination {
  users: User[];
  pageInfo?: PageSize;
}

