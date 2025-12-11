import { Injectable } from "@angular/core";
import { SourceQueryParams } from "../models/source-query-params.model";
import { V3QueryParamsService } from "./query-params.service";
import { GetLignesFinancieresLignesGetRequestParams } from "apps/clients/v3/financial-data/api/api";


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

  getSanitizedFullSourceParams(params: SourceQueryParams): GetLignesFinancieresLignesGetRequestParams {
    return {
      sourceRegion: params.source_region?.join(','),
      dataSource: params.data_source,
      source: params.source,
      ...this.getSanitizedV3Params(params)
     };
  }
  
  getSanitizedSourceParams(params: SourceQueryParams): GetLignesFinancieresLignesGetRequestParams {
    return { 
      sourceRegion: params.source_region?.join(','),
      dataSource: params.data_source,
      source: params.source,
    };
  }

}