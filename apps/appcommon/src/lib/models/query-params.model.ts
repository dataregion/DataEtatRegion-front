import { SortDirection } from "@models/financial/colonnes.models";

export interface V3QueryParams {
  colonnes: string[] | undefined;
  page: number;
  page_size: number;
  sort_by: string | undefined;
  sort_order: SortDirection | undefined;
  search: string | undefined;
  fields_search: string[] | undefined;
}
