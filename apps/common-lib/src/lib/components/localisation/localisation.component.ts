import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { GeoModel, TypeLocalisation } from '../../models/geo.models';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GeoLocalisationComponentService } from './geo.localisation.componentservice';
import { SelectMultipleComponent } from '../select-multiple/select-multiple.component';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subject, Subscription } from 'rxjs';


@Component({
    selector: 'lib-localisation',
    templateUrl: './localisation.component.html',
    styleUrls: ['./localisation.component.scss'],
    imports: [
        MatSelectModule,
        CommonModule,
        MatIconModule,
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule,
        ReactiveFormsModule,
        SelectMultipleComponent
    ],
    providers: [GeoLocalisationComponentService]
})
export class LocalisationComponent implements OnInit {
  private _geo = inject(GeoLocalisationComponentService);


  private readonly TypeLocalisationKeyMap: Record<TypeLocalisation, string> = {
  [TypeLocalisation.REGION]: 'region',
  [TypeLocalisation.DEPARTEMENT]: 'departement',
  [TypeLocalisation.EPCI]: 'epci',
  [TypeLocalisation.COMMUNE]: 'commune',
  [TypeLocalisation.CRTE]: 'crte',
  [TypeLocalisation.ARRONDISSEMENT]: 'arrondissement',
  [TypeLocalisation.QPV]: 'qpv'
};


  private _destroyRef = inject(DestroyRef)

  private _selectedNiveau: TypeLocalisation | null = null;
  private _selectedLocalisation: GeoModel[] | null = null;
  private _subFilterGeo: Subscription | null = null;

  public selectedNiveauString: string = '';

  @Input() niveauxExcludeFilter: string[] | null = null;

  @Input() textTooltip: string  = "";

  // Liste des niveaux de localisation
  public niveaux = Object.values(TypeLocalisation);
  @Input() wordingNiveaux: Map<TypeLocalisation, string> | null = null;
  @Input() filterRegion: boolean = false;
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() data : any | {[key: string]: GeoModel[]} | null = null;
  @Input() dataPreLoaded : boolean = false;

  // Liste des Geomodel
  public geomodels: GeoModel[] | null = null;
  public filteredGeomodels = signal<GeoModel[]>([]);// GeoModel[] | null = null;
  input: string = '';
  inputFilter = new Subject<string>();
  @Output() selectedNiveauChange = new EventEmitter<TypeLocalisation | null>();
  @Output() selectedLocalisationChange = new EventEmitter<GeoModel[] | null>();

  constructor() {
    this.inputFilter.pipe(debounceTime(300), takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      if (this.selectedNiveau != null) {
        const term = this.input !== '' ? this.input : null;

        if (this._subFilterGeo) this._subFilterGeo.unsubscribe();

        if (this.dataPreLoaded && this.data != null ) {
          const loc = this.TypeLocalisationKeyMap[this.selectedNiveau]
          this.geomodels = this.data[loc];
          if (this.geomodels != null) {
            this.filteredGeomodels.set(term != null ? this.geomodels.filter( 
              geo => geo.code.includes(term) || geo.nom.includes(term)
            ) : this.geomodels);

            if (this.selectedLocalisation != null) {
               this.filteredGeomodels.set([
                        ...this.selectedLocalisation,
                        ...this.filteredGeomodels().filter(
                          (el) => !this.selectedLocalisation?.map((s) => s.code).includes(el.code)
                        )
                      ])
            }
          }
        } else {
          this._subFilterGeo = this._geo
            .filterGeo(term, this.selectedNiveau, this.filterRegion)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe((response: GeoModel[]) => {
              this.filteredGeomodels.set(response);
              // TODO : Facto du filter générique pour gérer aussi les Observable
              // Concaténation des éléments sélectionnés avec les éléments filtrés (en supprimant les doublons éventuels)
              if (this.selectedLocalisation != null) {
                this.filteredGeomodels.set([
                      ...this.selectedLocalisation,
                      ...this.filteredGeomodels().filter(
                        (el) => !this.selectedLocalisation?.map((s) => s.code).includes(el.code)
                      )
                    ]);
              }
            });
        }
      }
    });
  }

  ngOnInit() {
    // Filtre des TypeLocalisation disponible
    this.niveaux = Object.values(TypeLocalisation);
    if (this.niveauxExcludeFilter !== null) {
      this.niveaux = this.niveaux.filter(niveau => !this.niveauxExcludeFilter?.includes(niveau));
    }
  }

  /**
   * Niveau
   */
  get selectedNiveau(): TypeLocalisation | null {
    return this._selectedNiveau;
  }

  @Input()
  set selectedNiveau(data: TypeLocalisation | null) {
    this._selectedNiveau = data ?? null;

    this.selectedNiveauString = '';
    if (this._selectedNiveau) {
      this.selectedNiveauString = this.wordingNiveaux && this.wordingNiveaux.has(this._selectedNiveau)
        ? this.wordingNiveaux.get(this._selectedNiveau) as string
        : this.selectedNiveau as string
    }

    // Mise en place des options du select selon le niveau géographique sélectionné
    // On ne rentre pas si selectedLocalisation est sélectionné (compatibilité marque blanche)
    if (this._selectedNiveau != null && this._selectedLocalisation == null) {
      if (this._subFilterGeo) this._subFilterGeo.unsubscribe();

      if (this.dataPreLoaded && this.data != null ) {
        const loc = this.TypeLocalisationKeyMap[this._selectedNiveau]
        this.geomodels = this.data[loc];
        this.filteredGeomodels.set(this.geomodels ?? []);
      } else {
        this._subFilterGeo = this._geo
          .filterGeo(null, this._selectedNiveau, this.filterRegion)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe((response) => {
            this.geomodels = response;
            this.filteredGeomodels.set(this.geomodels);
            // TODO : Facto du filter générique pour gérer aussi les Observable
          // Concaténation des éléments sélectionnés avec les éléments filtrés (en supprimant les doublons éventuels)
          if (this.selectedLocalisation != null) {
             this.filteredGeomodels.set([
                  ...this.selectedLocalisation,
                  ...this.filteredGeomodels().filter(
                    (el) => !this.selectedLocalisation?.map((s) => s.code).includes(el.code)
                  )
                ])
          }
        });
      }

    } else {
      this.geomodels = null;
      this.filteredGeomodels.set(this.geomodels ?? []);
      this.selectedLocalisation = null;
    }

    this.selectedNiveauChange.emit(this._selectedNiveau);
  }

  /**
   * Localisation
   */
  get selectedLocalisation(): GeoModel[] | null {
    return this._selectedLocalisation;
  }

  @Input()
  set selectedLocalisation(data: GeoModel[] | null) {
    this._selectedLocalisation = data != null ? data : null;
    this.selectedLocalisationChange.emit(this._selectedLocalisation);
  }

  public filterGeomodels = (value: string): GeoModel[] => {
    this.input = value;
    this.inputFilter.next(value);
    return this.filteredGeomodels();
  };

  public renderGeomodelOption = (geo: GeoModel): string => {
    return geo.code + ' - ' + geo.nom;
  };

  public renderBopLabel = (geomodels: GeoModel[]): string => {
    let label: string = '';
    if (geomodels && geomodels.length > 0) {
      label += geomodels[0].code + ' - ' + geomodels[0].nom;
      if (geomodels.length == 2) {
        label += ' (+' + (geomodels.length - 1) + ' autre)';
      } else if (geomodels.length > 2) {
        label += ' (+' + (geomodels.length - 1) + ' autres)';
      }
    }
    return label;
  };

}
