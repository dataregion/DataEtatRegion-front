import { Tag } from '@models/refs/tag.model';
import { SelectedData } from 'apps/common-lib/src/lib/components/advanced-chips-multiselect/advanced-chips-multiselect.component';

export type TagFieldData = SelectedData & Tag;
