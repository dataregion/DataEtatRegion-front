import { Injectable } from "@angular/core";
import { V3QueryParams } from "../models/query-params.model";
import { GetLignesFinancieresLignesGetRequestParams } from "apps/clients/v3/financial-data/api/api";

@Injectable({
  providedIn: 'root'
})
export class V3QueryParamsService {

  private _empty: V3QueryParams = {
    colonnes: undefined,
    page: 1,
    page_size: 100,
    sort_by: undefined,
    sort_order: undefined,
    search: undefined,
    fields_search: undefined,
  };

  getEmpty() {
    return this._empty;
  }

  isEmpty(params: V3QueryParams): boolean {
    return Object.entries(params).every(([key, value]) => {
      if (key === "page") return value === 1;
      if (key === "page_size") return value === 100;
      return value === undefined;
    });
  }

  getSanitizedV3Params(params: V3QueryParams): GetLignesFinancieresLignesGetRequestParams {
    return { 
      colonnes: params.colonnes?.join(','),
      page: params.page,
      pageSize: params.page_size,
      sortBy: params.sort_by,
      sortOrder: params.sort_order,
      search: params.search,
      fieldsSearch: params.fields_search?.join(','),
    };
  }

}