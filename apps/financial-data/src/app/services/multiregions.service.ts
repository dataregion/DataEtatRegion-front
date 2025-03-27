import { Injectable } from '@angular/core';
import { SessionService } from 'apps/common-lib/src/public-api';

 

export enum Region {
  BRETAGNE = 'Bretagne',
  PDL = 'Pays de la Loire',
  HDF = 'Hauts-de-France',
  NORMANDIE = 'Normandie',
  BOURGOGNE_FRANCHE_COMTE = 'Bourgogne-Franche-Comte',
  CORSE = 'Corse',
  OCCITANIE = 'Occitanie',
  CENTRE_VALDELOIRE = 'Centre-Val de loire',
  GRAND_EST = 'Grand-Est'
}

@Injectable({
  providedIn: 'root'
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
    ],
    [Region.NORMANDIE]: [
      "028",
    ],
    [Region.BOURGOGNE_FRANCHE_COMTE]: [
      "027",
    ],
    [Region.CORSE]: [
      "094",
    ],
    [Region.CENTRE_VALDELOIRE]: [
      "024",
    ],
    [Region.OCCITANIE]: [
      "076",
    ],
    [Region.GRAND_EST]: [
      "044",
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
