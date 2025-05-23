import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ColumnsMetaData, GroupingColumn, RootGroup, TableData, VirtualGroup } from './group-utils';
import { GroupingTableContextService } from './grouping-table-context.service';
import { OutputEvents } from './output-events';
import { ProjectCellDirective } from './project-cell.directive';
import { ProjectGroupingDirective } from './project-grouping.directive';

@Component({
    selector: 'lib-grouping-table',
    templateUrl: './grouping-table.component.html',
    encapsulation: ViewEncapsulation.None,
    providers: [GroupingTableContextService],
    host: {
        class: 'grouping-table-container'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GroupingTableComponent implements OnChanges, AfterViewInit {
  @ContentChildren(ProjectCellDirective) projectedCells!: QueryList<ProjectCellDirective>;
  @ContentChildren(ProjectGroupingDirective)
  projectedGroupings!: QueryList<ProjectGroupingDirective>;

  @Input() tableData!: TableData;
  @Input() columnsMetaData!: ColumnsMetaData;
  @Input() groupingColumns: GroupingColumn[] = [];
  
  @Input() virtualGroupFn?: (_: TableData) => VirtualGroup;

  private _outputEvents: OutputEvents;
  @Output() rowClick;

  rootGroup?: RootGroup;

  context = inject(GroupingTableContextService);
  cdRef = inject(ChangeDetectorRef);

  groupLevel = 0;
  private scrollLeft?: number;

  @ViewChild('outerHtmlElement')
  public columnCssStyle: ElementRef | undefined;

  constructor() {
    this._outputEvents = {
      'click-on-row': new EventEmitter()
    };

    this.rowClick = this._outputEvents['click-on-row'];

    this.context.outputEvents = this._outputEvents;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      'tableData' in changes ||
      'columnsMetaData' in changes ||
      'groupingColumns' in changes ||
      'foldRootGroups' in changes
    ) {
      const vg = this.virtualGroupFn && this.virtualGroupFn!(this.tableData)

      // Si les paramètres en entrée changent, on les propage.
      // (on passe également ici au chargement du composant).
      const offset_group_level = this.context.initContext(
        this.tableData,
        this.columnsMetaData,
        this.groupingColumns,
        'tableData' in changes,
        vg
      );

      this.rootGroup = this.context.rootGroup;

      // Replie / Déplie les groupes
      for (const group of this.rootGroup?.groups ?? []) {
        if (group.folded) this.context.fold(group);
        else this.context.unfold(group);
      }

      if (this.columnCssStyle) {
        this.columnCssStyle.nativeElement.innerHTML = this.context.columnCssStyle;
      }
      this.groupLevel = this.groupingColumns.length + offset_group_level;
    }
  }

  ngAfterViewInit(): void {
    if (this.columnCssStyle) {
      this.columnCssStyle.nativeElement.innerHTML = this.context.columnCssStyle;
    }

    setTimeout(() => {
      // XXX: pour éviter ExpressionChangedAfterItHasBeenChecked
      this.context.cellProjections = this.projectedCells?.toArray();
      this.context.groupingProjections = this.projectedGroupings?.toArray();
      this.cdRef.markForCheck(); // XXX: Ici, les composants enfants sont déjà rendus.
      // On provoque donc manuellement un cd pour prendre en compte les projections
    });
  }

  @HostListener('scroll', ['$event.target']) onScroll(target: HTMLElement) {
    const scrollLeft = target.scrollLeft;
    // On évite de mettre à jour la propriété CSS si la position de défilement horizontal n'a pas changé.
    // Pour ce faire on garde la position sur un attribut de la classe.
    if (this.scrollLeft !== scrollLeft) {
      this.scrollLeft = scrollLeft;
      target.style.setProperty('--scroll-length', `${scrollLeft}px`);
    }
  }
}
