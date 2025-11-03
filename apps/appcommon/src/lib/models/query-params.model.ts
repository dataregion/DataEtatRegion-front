export interface V3QueryParams {
  colonnes: string[] | undefined;
  page: number;
  page_size: number;
  sort_by: string | undefined;
  sort_order: "asc" | "desc" | undefined;
  search: string | undefined;
  fields_search: string[] | undefined;
}