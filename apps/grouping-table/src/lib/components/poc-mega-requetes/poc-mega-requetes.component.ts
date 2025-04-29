import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GroupingTableContextService } from 'apps/grouping-table/src/lib/components/grouping-table/grouping-table-context.service';
import { ColumnsMetaData, Group, GroupingColumn, RootGroup, TableData } from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';

@Component({
    selector: 'poc-mega-requetes',
    templateUrl: './poc-mega-requetes.component.html',
    providers: [GroupingTableContextService],
    standalone: false
})
export class PocMegaRequetesComponent implements OnChanges {

  consultingGrouping: boolean = true;

  context = inject(GroupingTableContextService);

  @Input() tableData!: TableData;
  @Input() columnsMetaData!: ColumnsMetaData;
  @Input() groupingColumns: GroupingColumn[] = [];
  rootGroup!: RootGroup;
  currentGroup!: Group;
  groupsPassed: Group[] = [];

  checkForLastGroup() {
    this.consultingGrouping = this.currentGroup.groups.length !== 0
    this.groupsPassed.push(this.currentGroup)
  }

  goBackToGroupBefore(group: Group) {
    const newGroups: Group[] = []
    for (const element of this.groupsPassed) {
      if (element === group) {
        break;
      }
      newGroups.push(element)
    }
    this.groupsPassed = newGroups
    this.currentGroup = newGroups.length > 0 ? this.groupsPassed[this.groupsPassed.length - 1] : this.rootGroup
    this.consultingGrouping = this.currentGroup.groups.length !== 0
  }

  ngOnChanges(changes: SimpleChanges) {
      if (
        'tableData' in changes ||
        'columnsMetaData' in changes ||
        'groupingColumns' in changes ||
        'foldRootGroups' in changes
      ) {
        // const vg = this.virtualGroupFn && this.virtualGroupFn!(this.tableData)
  
        // Si les paramètres en entrée changent, on les propage.
        // (on passe également ici au chargement du composant).
        this.context.initContext(
          this.tableData,
          this.columnsMetaData,
          this.groupingColumns,
          'tableData' in changes,
        );
  
        this.rootGroup = this.context.rootGroup;
        this.currentGroup = this.rootGroup;
      }
    }

}
