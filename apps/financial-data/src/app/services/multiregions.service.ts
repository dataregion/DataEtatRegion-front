import { Injectable } from '@angular/core';
import { SessionService } from 'apps/common-lib/src/public-api';

/* eslint-disable no-unused-vars */

export enum Region {
  BRETAGNE = 'Bretagne',
  PDL = 'Pays de la Loire',
  HDF = 'Hauts-de-France'
}

@Injectable({
  providedIn: 'root',
})
export class MultiregionsService {
  
  private _region = ""

  constructor(private _sessionService: SessionService) { 
    
    this._sessionService.authenticated$.subscribe(() => {
      this._region = this._findRegion()
    })
  }

  private _synonymes: { [key in Region]: string[] } = {
    [Region.BRETAGNE]: [
      "053",
    ],
    [Region.PDL]: [
      "052",
    ],
    [Region.HDF]: [
      "032",
    ]
  };
  
  private _findRegion(): string {
      const region_code = this._sessionService.region_code

      const hostname = location.host
      for (const [key, value] of Object.entries(this._synonymes)) {
        if (value.includes(hostname))
          return key;
        if (region_code && value.includes(region_code))
          return key
      }

      return "Error";
  }

  public getRegionLabel(): string {
    return this._region;
  }

}