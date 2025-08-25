import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SettingsService } from '../../environments/settings.service';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { Ressources } from '../models/ressource/ressource.models';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
    private http = inject(HttpClient);
    readonly settings = inject<SettingsService>(SETTINGS);

  
    private _apiRessource: string;

  constructor() {
    this._apiRessource = this.settings.apiRessource;
  }

  getResources(): Observable<Ressources> {
    return this.http.get<Ressources>(this._apiRessource);
  }
}
