import { Component, DestroyRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { DsfrHeadingLevel, DsfrModalAction, DsfrModalComponent, DsfrSize, DsfrSizeConst } from "@edugouvfr/ngx-dsfr";
import { Subject, Subscription } from "rxjs";


@Component({
    selector: 'data-qpv-modal-additional-params',
    templateUrl: './modal-additional-params.component.html',
    styleUrls: ['./modal-additional-params.component.scss'],
    standalone: false
})
export class ModalAdditionalParamsComponent<T> implements OnChanges {

  private _destroyRef = inject(DestroyRef)

  public size: DsfrSize = DsfrSizeConst.LG
  public headingLevel: DsfrHeadingLevel | undefined
  public autoCloseOnAction: boolean = true
  public actions: DsfrModalAction[] = []

  @Input()
  public title: string = ""
  @Input()
  public idModal: string = ""

  @Input()
  public checkboxes: T[] | null = [];
  public filteredCheckboxes: T[] | null = []

  private _selected: T[] | null = null;
  public get selected(): T[] | null {
    return this._selected;
  }
  @Input()
  public set selected(value: T[] | null) {
    this._selected = value ?? null;
  }
  @Output() selectedChange = new EventEmitter<T[] | null>();

  @ViewChild('modalFiltres') modalFiltres!: DsfrModalComponent;

  filterInput: string = "";
  inputFiltre: Subject<string> = new Subject<string>();
  private _subFilterGeo: Subscription | null = null;

  constructor() {
    
  }

  /**
   * Actions au changement des inputs
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges) {
    // Mise à jour des options
    if ('checkboxes' in changes) {
      this.checkboxes = changes['checkboxes'].currentValue
      this.filteredCheckboxes = this.checkboxes;
      
      if (changes['checkboxes'].firstChange) {
        const that = this
        this.actions.push({
          label: "Appliquer ce filtre",
          callback() {
            that.selectedChange.emit(that.selected ?? null);
            that.modalFiltres.close()
          }
        })
      }
    }
    if ('selected' in changes ) {
      this.selected = changes['selected'].currentValue ?? []
    }
  }

    /**
   * Fonction de filtrage par défaut, peut-être remplacée par injection
   * @param text input utilisateur utilisé pour filtrer
   */
    @Input()
    filterFunction(text: string): T[] {
      // Filtre par défaut : options considérées comme des string
      this.filteredCheckboxes = this.checkboxes ? this.checkboxes?.filter((checkbox) => {
        const optStr = checkbox ? (checkbox as string).toLowerCase() : '';
        return optStr.includes(text.toLowerCase());
      }) : [];
      return this.filteredCheckboxes;
    }
    
    /**
     * Fonction de rendu d'une option par défaut, peut-être remplacée par injection
     * @param option 
     */
    @Input()
    renderFunction(option: T): string {
      // Affichage par défaut : option telle quelle
      return option as string;
    }
  
    /**
     * Fonction de rendu des options sélectionnées par défaut, peut-être remplacée par injection
     * @param selected 
     * @returns 
     */
    @Input()
    renderLabelFunction(selected: T[] | null): string {
      // Affichage par défaut : options jointes par des virgules
      return selected != null ? (selected as string[]).join(', ') : ''
    }

    /**
   * Filtrage des option par défaut OU spécifique des options
   * @param text
   * @returns 
   */
    filter(text?: string): void {
      // Sauvegarde du texte
      this.filterInput = text === undefined ? this.filterInput : text;
      // Filtre
      const newOptions = this.filterFunction(text ? text : '');
      if (newOptions == null || newOptions.length === 0)
        return
  
      this.filteredCheckboxes = newOptions;
      // Concaténation des éléments sélectionnés avec les éléments filtrés (en supprimant les doublons éventuels)
      this.filteredCheckboxes = this.selected != null ?
        [
          ...this.selected,
          ...this.filteredCheckboxes.filter((el) => !this.selected?.includes(el))
        ]
        : this.filteredCheckboxes
    }
  
    /**
     * Affichage textuel par défaut OU spécifique d'une option
     * @param option 
     * @returns 
     */
    render(option: T): string {
      return this.renderFunction(option);
    }
  
    /**
     * Affichage textuel des options sélectionnées en label
     * @returns 
     */
     renderLabel(): string {
      return this.renderLabelFunction(this.selected);
    }

    onCheckboxChange(value: T): void {
      if (this.selected?.includes(value)) {
        this.selected = this.selected.filter((item) => item !== value);
      } else {
        this.selected?.push(value);
      }
    }


}
