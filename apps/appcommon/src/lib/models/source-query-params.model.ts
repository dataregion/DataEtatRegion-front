import { SanitizedV3Params, V3QueryParams } from "./query-params.model";

export interface SourceQueryParams extends V3QueryParams {
  source_region: string[] | undefined;
  data_source: string | undefined;
  source: string | undefined;
}

export type SanitizedSourceParams = [
  string | undefined,               // source_region
  string | undefined,               // data_source
  string | undefined,               // source
];

export type SanitizedSourceFullParams = [
  ...SanitizedSourceParams,
  ...SanitizedV3Params
];
