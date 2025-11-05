import { Injectable } from "@angular/core";
import { SourceQueryParams, SanitizedSourceParams, SanitizedSourceFullParams } from "../models/source-query-params.model";
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

  getSanitizedFullSourceParams(params: SourceQueryParams): SanitizedSourceFullParams {
    return [
      params.source_region?.join(','),
      params.data_source,
      params.source,
      ...this.getSanitizedV3Params(params)
    ] as const;
  }
  
  getSanitizedSourceParams(params: SourceQueryParams): SanitizedSourceParams {
    return [
      params.source_region?.join(','),
      params.data_source,
      params.source,
    ] as const;
  }

}