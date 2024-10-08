import { PageSize } from 'apps/common-lib/src/lib/models/pagination/pagesize.models';
import { KeycloakProfile } from 'keycloak-js';

export type User = KeycloakProfile & {
  roles: string[];
  softEnabled: boolean;
};

export interface UsersPagination {
  users: User[];
  pageInfo?: PageSize;
}
