import { Injectable } from "@angular/core";
import { V3QueryParams, V3SanitizedParams } from "../models/query-params.model";

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

  getSanitizedParams(params: V3QueryParams): V3SanitizedParams {
    return [
      params.colonnes?.join(','),
      params.page,
      params.page_size,
      params.sort_by,
      params.sort_order,
      params.search,
      params.fields_search?.join(','),
    ] as const;
  }

}