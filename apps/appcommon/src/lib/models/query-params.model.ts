export interface V3QueryParams {
  colonnes: string[] | undefined;
  page: number;
  page_size: number;
  sort_by: string | undefined;
  sort_order: "asc" | "desc" | undefined;
  search: string | undefined;
  fields_search: string[] | undefined;
}

export type V3SanitizedParams = [
  string | undefined,               // colonnes
  number,                           // page
  number,                           // page_size
  string | undefined,               // sort_by
  "asc" | "desc" | undefined,       // sort_order
  string | undefined,               // search
  string | undefined                // fields_search
];