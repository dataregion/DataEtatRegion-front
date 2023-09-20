import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { Subject } from 'rxjs';
import { GeoModel, TypeLocalisation } from '../../models/geo.models';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GeoLocalisationComponentService } from './geo.localisation.componentservice';
import { SelectMultiFilterComponent } from '../select-multi-filter/select-multi-filter.component';

@Component({
  selector: 'lib-localisation',
  standalone: true,
  templateUrl: './localisation.component.html',
  imports: [
    MatSelectModule,
    CommonModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    ReactiveFormsModule,
    SelectMultiFilterComponent,
  ],
  styles: [
    `
      .location {
        margin-left: 6px;
      }
    `,
    `
      .field-100-width {
        width: 100%;
      }
    `,
  ],
  providers: [GeoLocalisationComponentService],
})
export class LocalisationComponent {

  public searchGeoChanged = new Subject<string>();

  private _selectedNiveau: TypeLocalisation[] | null = null;
  private _selectedLocalisation: GeoModel[] | null = null;

  @Input()
  public selectedNiveauString: string = ''

  // Liste des niveaux de localisation
  public niveaux = Object.values(TypeLocalisation);

  // Liste des Geomodel
  public geomodels: GeoModel[] | null = null;
  public filteredGeomodels: GeoModel[] | null = null;

  /**
   * Niveau
   */
  //@Output() selectedNiveauChange = new EventEmitter<TypeLocalisation[] | null | undefined>();
  get selectedNiveau() : TypeLocalisation[] | null | undefined {
    return this._selectedNiveau;
  }
  @Input()
  set selectedNiveau(data: TypeLocalisation[] | null | undefined) {
    this._selectedNiveau = data != null ? data : null;
    this.selectedNiveauString = data != null ? data[0] as string : '';
    // Mise en place des options du select selon le niveau géographique sélectionné
    if (this._selectedNiveau != null && this._selectedNiveau[0] != null) {
      this._selectedLocalisation = null;
      this._geo.filterGeo(null, this._selectedNiveau[0]).subscribe((response) => {
        this.geomodels = response
        this.filteredGeomodels = this.geomodels
      });
    } else {
      this.geomodels = null
      this.filteredGeomodels = this.geomodels
    }
    this.selectedNiveauChange.emit(this._selectedNiveau);
  }
  @Output() selectedNiveauChange = new EventEmitter<TypeLocalisation[] | null>();

  
  /**
   * Localisation
   */
  //@Output() selectedLocalisationChange = new EventEmitter<GeoModel[] | null | undefined>();
  get selectedLocalisation() : GeoModel[] | null | undefined {
    return this._selectedLocalisation;
  }
  @Input()
  set selectedLocalisation(data: GeoModel[] | null | undefined) {
    this._selectedLocalisation = data != null ? data : null;
    this.selectedLocalisationChange.emit(this._selectedLocalisation);
  }
  @Output() selectedLocalisationChange = new EventEmitter<GeoModel[] | null>();

  constructor(private _geo: GeoLocalisationComponentService) {}

  public filterGeomodels = (value: string): GeoModel[] | null => {
    console.log('filter')
    this.filteredGeomodels = this.geomodels ? this.geomodels?.filter((gm) => {
      return gm.code.toLowerCase().startsWith(value.toLowerCase()) || gm.nom.toLowerCase().startsWith(value.toLowerCase())
    }) : [];
    return this.filteredGeomodels;
  }

  public renderGeomodelOption = (geo: GeoModel) => {
    return geo.code + ' - ' + geo.nom
  }

  public renderTriggerLabel = (geomodels: GeoModel[]) => {
    let label: string = ''
    if (geomodels && geomodels.length > 0) {
      label += geomodels[0].code + ' - ' + geomodels[0].nom
      if (geomodels.length == 2) {
        label += ' (+' + (geomodels.length - 1) + ' autre)'
      } else if (geomodels.length > 2) {
        label += ' (+' + (geomodels.length - 1) + ' autres)'
      }
    }
    return label
  }
}
