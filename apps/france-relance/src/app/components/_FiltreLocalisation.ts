import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { JSONObject } from "apps/common-lib/src/lib/models/jsonobject";
import { Nullable } from 'apps/common-lib/src/lib/utilities/optional.type';
import { SearchParameters } from '../services/abstract-laureats.http.service';

/** Modele du filtre de localisation pour le search component */
export class _FiltreLocalisation {

  private _niveau_k = 'niveau';
  private _location_k = 'location';

  constructor(
    private _formGroup: FormGroup | null = null
  ) { }

  private _niveau: Nullable<TypeLocalisation> = null;
  public get niveau(): Nullable<TypeLocalisation> {
    return this._niveau;
  }
  public set niveau(value: Nullable<TypeLocalisation>) {
    this._niveau = value;
    this._synchronizeFormGroup();
  }

  private _geoModels: Nullable<GeoModel[]> = null;
  public get location(): Nullable<GeoModel[]> {
    return this._geoModels;
  }
  public set location(value: Nullable<GeoModel[]>) {
    this._geoModels = value;
    this._synchronizeFormGroup();
  }

  /** Initialize the formGroup and update it as the filter is updated*/
  public initAndSynchonizeFormGroup(formGroup: FormGroup) {
    this._formGroup = formGroup;

    this._formGroup.addControl(this._niveau_k, new FormControl(null));
    this._formGroup.addControl(this._location_k, new FormArray([]));
  }

  /** Initialise le modele d'apres le pre filtre */
  public fromPreFilter(preFilter: JSONObject | null) {
    // TODO lors du refactoring de france relance, réconcilier avec l'api geo
    if (preFilter && preFilter[this._niveau_k])
      this.niveau = preFilter[this._niveau_k] as TypeLocalisation;

    if (preFilter && preFilter[this._location_k])
      this.location = preFilter[this._location_k] as unknown as GeoModel[];
  }
  
  /** Update search parameters structure */
  public updateSearchParams(sp: SearchParameters) {
    sp.niveau = this.niveau
    sp.territoires = this.location
  }
  
  public reset() {
    this.niveau = null;
    this.location = null;
  }

  private _synchronizeFormGroup() {
    this._formGroup?.get(this._niveau_k)?.setValue(this.niveau);

    const farr = this._formGroup?.get(this._location_k) as FormArray;
    farr.clear();
    for (const geo of this.location ?? []) {
      farr.push(new FormControl(geo));
    }
  }
}
