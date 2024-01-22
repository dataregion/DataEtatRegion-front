import { Injectable } from '@angular/core';

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

  private _synonymes: { [key in Region]: string[] } = {
    [Region.BRETAGNE]: [
      "bretagne.nocode.csm.ovh",
      "budget.bretagne.preprod.dataregion.fr",
      "budget.bretagne.dataregion.fr",
      "budget.preprod.databretagne.fr",
      "budget.databretagne.fr",
    ],
    [Region.PDL]: [
      "pdl.nocode.csm.ovh",
      "budget.paysdelaloire.dataregion.fr",
      "budget.paysdelaloire.preprod.dataregion.fr",
    ],
    [Region.HDF]: [
      "hdf.nocode.csm.ovh",
      "budget.hautsdefrance.dataregion.fr",
      "budget.hautsdefrance.preprod.dataregion.fr",
    ]
  };

  public getRegionByHostname(): string {
    const hostname = location.host
    if (hostname.includes('localhost'))
      return "Localhost";
    for (const [key, value] of Object.entries(this._synonymes)) {
      if (value.includes(hostname))
        return key;
    }
    return "Error";
  }

}