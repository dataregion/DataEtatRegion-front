import {
  Component,
  Input,
  Output,
  EventEmitter,
  DestroyRef,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { MatTooltipModule } from '@angular/material/tooltip';
import { BopsReferentielsComponentService } from './bops-referentiels.componentservice';
import { SelectMultipleComponent } from '../select-multiple/select-multiple.component';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { debounceTime, Subscription, Subject } from 'rxjs';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';
import { BopModel } from '@models/refs/bop.models';

@Component({
  selector: 'lib-bops-referentiels',
  standalone: true,
  templateUrl: './bops-referentiels.component.html',
  styleUrls: ['./bops-referentiels.component.scss'],
  imports: [
    MatSelectModule,
    CommonModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    ReactiveFormsModule,
    SelectMultipleComponent,
  ],
  providers: [BopsReferentielsComponentService],
})
export class BopsReferentielsComponent {

  private _destroyRef = inject(DestroyRef)

  private _selectedThemes: string[] | null = null;
  private _selectedBops: BopModel[] | null = null;
  private _selectedReferentiels: ReferentielProgrammation[] | null = null;

  @Input()
  public themes: string[] = [];
  public filteredBops: BopModel[] | null = null;
  public filteredReferentiels: ReferentielProgrammation[] | null = null;

  private _bops: BopModel[] | null = null;
  get bops(): BopModel[] | null {
    return this._bops ?? null;
  }
  @Input()
  set bops(data: BopModel[] | null) {
    this._bops = data ?? null;
    this.filteredBops = this.bops;
  }

  private _referentiels: ReferentielProgrammation[] | null = null;
  get referentiels(): ReferentielProgrammation[] | null {
    return this._referentiels ?? null;
  }
  @Input()
  set referentiels(data: ReferentielProgrammation[] | null) {
    this._referentiels = data ?? null;
    this.filteredReferentiels = this._referentiels;
  }

  input: string = '';
  inputRefFilter = new Subject<string>();
  public selectedReferentielsString: string = ''

  @Output() selectedThemesChange = new EventEmitter<string[] | null>();  
  @Output() selectedBopsChange = new EventEmitter<BopModel[] | null>();
  @Output() selectedReferentielsChange = new EventEmitter<ReferentielProgrammation[] | null>();
  
  private _subFilterRef: Subscription | null = null;

  constructor(private _refs: BopsReferentielsComponentService) {
    this.inputRefFilter.pipe(
      debounceTime(300),
      takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        const term = this.input !== '' ? this.input : null;
        if (this._subFilterRef)
          this._subFilterRef.unsubscribe();
        this._subFilterRef = this._refs.filterRefs(term, this.selectedBops || null)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe((response: ReferentielProgrammation[]) => {
            this.filteredReferentiels = response;
            // TODO : Facto du filter générique pour gérer aussi les Observable  
            // Concaténation des éléments sélectionnés avec les éléments filtrés (en supprimant les doublons éventuels)
            this.filteredReferentiels = this.selectedReferentiels != null ?
            [
              ...this.selectedReferentiels,
              ...this.filteredReferentiels.filter((el) => !this.selectedReferentiels?.map(s => s.code).includes(el.code))
            ]
            : this.filteredReferentiels
            return response;
          });
      })
  }


  /**
   * Themes
   */
  get selectedThemes() : string[] | null {
    return this._selectedThemes;
  }
  @Input()
  set selectedThemes(data: string[] | null) {
    this._selectedThemes = data ?? null;
    // Filtrage des bops en fonction des thèmes sélectionnés
    this.filteredBops = [];
    if (this.selectedThemes && this.selectedThemes.length > 0)
      this.selectedThemes?.forEach((theme) => {
        const filtered = this.bops ? this.bops.filter(bop => theme !== null && theme.includes(bop.label_theme)) : [];
        if (this.filteredBops)
          this.filteredBops = this.filteredBops?.concat(filtered);
      });
    else {
      this.filteredBops = this.bops;
    }
    this.selectedBops = null

    this.selectedThemesChange.emit(this._selectedThemes);
  }

  /**
   * Bops
   */
  get selectedBops() : BopModel[] | null {
    return this._selectedBops;
  }
  @Input()
  set selectedBops(data: BopModel[] | null) {
    this._selectedBops = data ?? null;
    this.selectedBopsChange.emit(this._selectedBops);

    // Mise en place des options du select selon le niveau géographique sélectionné
    if (this.selectedBops != null) {
      if (this._subFilterRef)
        this._subFilterRef.unsubscribe();

      this._subFilterRef = this._refs.filterRefs(null, this.selectedBops)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((response: ReferentielProgrammation[]) => {
          this.referentiels = response
          this.filteredReferentiels = this.referentiels;
          // TODO : Facto du filter générique pour gérer aussi les Observable  
          // Concaténation des éléments sélectionnés avec les éléments filtrés (en supprimant les doublons éventuels)
          this.filteredReferentiels = this.selectedReferentiels != null ?
            [
              ...this.selectedReferentiels,
              ...this.filteredReferentiels.filter((el) => !this.selectedReferentiels?.map(s => s.code).includes(el.code))
            ]
            : this.filteredReferentiels
        });
    } else {
      this.referentiels = null
      this.filteredReferentiels = this.referentiels
      this.selectedReferentiels = null;
    }
  }
  // Les fonctions injectées au component DOIVENT être lambdas pour garder le contexte initial
  public renderBopOption = (bop: BopModel): string => {
    return bop.code + (bop.label === null ?  '' : ' - ' + bop.label)
  }
  public filterBop = (value: string): BopModel[] => {
    const filterValue = value ? value.toLowerCase() : '';
    const themes = this.selectedThemes;

    const filterGeo = this.bops ? this.bops.filter((option) => {
      if (themes) {
        return (
          option.label_theme != null &&
          themes.includes(option.label_theme) &&
          option.label?.toLowerCase().includes(filterValue)
        );
      }
      return (
        option.label?.toLowerCase().includes(filterValue) ||
        option.code.startsWith(filterValue)
      );
    }) : [];

    const controlBop = this.selectedBops;
    if (controlBop) {
      // si des BOPs sont déjà sélectionné
      return [
        ...controlBop,
        ...filterGeo.filter(
          (element) =>
            controlBop.findIndex(
              (valueSelected: BopModel) => valueSelected.code === element.code
            ) === -1 // on retire les doublons éventuels
        ),
      ];
    } else {
      return filterGeo;
    }
  }
  public renderBopLabel = (bops: BopModel[]) => {
    let label: string = ''
    if (bops)
      bops.forEach((bop, i) => {
        label += (bop.code + ' - ' + bop.label) + (i !== bops.length - 1 ? ', ' : '')
      })
    return label
  }

  /**
   * Référentiels programmation
   */
  get selectedReferentiels() : ReferentielProgrammation[] | null {
    return this._selectedReferentiels;
  }
  @Input()
  set selectedReferentiels(data: ReferentielProgrammation[] | null) {
    this._selectedReferentiels = data;
    this.selectedReferentielsChange.emit(this._selectedReferentiels);
  }
  // Les fonctions injectées au component DOIVENT être lambdas pour garder le contexte initial
  public renderRefOption = (ref: ReferentielProgrammation): string => {
    return ref.label + ' (' + ref.code + ')'
  }
  public filterRef = (value: string): ReferentielProgrammation[] => {
    const filterValue = value ? value.toLowerCase() : '';
    this.input = filterValue;
    this.inputRefFilter.next(filterValue);
    return this.selectedReferentiels ? this.selectedReferentiels.filter((ref) => {
      ref.code.toLowerCase().includes(filterValue) || ref.label.toLowerCase().includes(filterValue)
    }) : [];
  }
  public renderRefLabel = (bops: ReferentielProgrammation[]) => {
    let label: string = ''
    if (bops)
      bops.forEach((bop, i) => {
        label += (bop.code + ' - ' + bop.label) + (i !== bops.length - 1 ? ', ' : '')
      })
    return label
  }

}
