import { TOrError } from 'apps/common-lib/src/lib/models/marqueblanche/t-or-error.model';
import { Preference } from 'apps/preference-users/src/lib/models/preference.models';

export type PreferenceResolverModel = TOrError<Preference>;
