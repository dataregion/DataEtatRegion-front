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
      "qpv-bretagne.nocode.csm.ovh",
      "qpv-bretagne.preprod.dataregion.fr",
      "qpv-bretagne.dataregion.fr",
    ],
    [Region.PDL]: [
      "qpv-pdl.nocode.csm.ovh",
      "qpv-paysdelaloire.dataregion.fr",
      "qpv-paysdelaloire.preprod.dataregion.fr",
    ],
    [Region.HDF]: []
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