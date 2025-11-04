import { V3QueryParams, V3SanitizedParams } from "./query-params.model";

export interface SourceQueryParams extends V3QueryParams {
  source_region: string | undefined;
  data_source: string | undefined;
  source: string | undefined;
}

export type SourceSanitizedParams = [
  string | undefined,               // source_region
  string | undefined,               // data_source
  string | undefined,               // source
  ...V3SanitizedParams,
];