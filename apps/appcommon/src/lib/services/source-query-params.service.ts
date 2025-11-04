import { Injectable } from "@angular/core";
import { SourceQueryParams, SourceSanitizedParams } from "../models/source-query-params.model";
import { V3QueryParamsService } from "./query-params.service";


@Injectable({
  providedIn: 'root'
})
export class SourceQueryParamsService extends V3QueryParamsService {

  override getEmpty(): SourceQueryParams {
    return {
      ...super.getEmpty(),
      source_region: undefined,
      data_source: undefined,
      source: undefined,
    };
  }

  override isEmpty(params: SourceQueryParams): boolean {
    return (
      super.isEmpty(params) &&
      params.source_region === undefined &&
      params.data_source === undefined &&
      params.source === undefined
    );
  }

  getSanitizedSourceParams(params: SourceQueryParams): SourceSanitizedParams {
    return [
      params.source_region,
      params.data_source,
      params.source,
      ...super.getSanitizedParams(params),
    ] as const;
  }
}