import { Injectable } from '@angular/core';

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
    [Region.BRETAGNE]: ['bretagne'],
    [Region.PDL]: ['pdl', 'paysdelaloire', 'pays-de-la-loire'],
    [Region.HDF]: ['hdf', 'hautsdefrance', 'hauts-de-france']
  };

  public getRegionByHostname(): string {
    const hostname = location.host
    if (hostname.includes('localhost'))
      return "Localhost";
    for (const [key, value] of Object.entries(this._synonymes)) {
      if (value.includes(hostname.split(".")[0]))
        return key;
    }
    return "Error";
  }

}