import { Injectable } from '@angular/core';


export enum Region {
  BRETAGNE = 'Bretagne',
  PDL = 'Pays de la Loire',
  HDF = 'Hauts-de-France',
  NORMANDIE = 'Normandie',
  BOURGOGNE_FRANCHE_COMTE = 'Bourgogne-Franche-Comte',
  CORSE = 'Corse',
  OCCITANIE = 'Occitanie',
  CENTRE_VALDELOIRE = 'Centre-Val de loire',
  GRAND_EST = 'Grand-Est',
  NATIONAL = 'National'
}

@Injectable({
  providedIn: 'root'
})
export class MultiregionsService {
  private _regionLabel = null;


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
    ],
    [Region.NATIONAL]: [
      "NAT",
    ]
  };

  public getRegionLabel(regionCode: string): string {

    if (this._regionLabel === null) {
      const hostname = location.host
      for (const [key, value] of Object.entries(this._synonymes)) {
        if (value.includes(hostname))
          return key;
        if (regionCode && value.includes(regionCode))
          return key
      }

      return "";
    }
    return this._regionLabel;
  }
}
