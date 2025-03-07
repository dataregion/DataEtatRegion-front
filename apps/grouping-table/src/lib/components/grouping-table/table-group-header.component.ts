import { Component, inject, Input } from '@angular/core';
import { Group } from './group-utils';
import { GroupingTableContextService } from './grouping-table-context.service';

@Component({
    selector: 'lib-table-group-header',
    templateUrl: './table-group-header.component.html',
    host: {
        class: 'header clickable'
    },
    standalone: false
})
export class TableGroupHeaderComponent {
  @Input() group!: Group;
  @Input() groupLevel = 0;
  @Input() folded = false;

  context = inject(GroupingTableContextService);

  groupingCustomProjection(columnName: string) {
    const projection = this.context.projectionForGrouping(columnName);
    return projection;
  }
  
  groupingTableCellStyles(isFirst: boolean) {
    return {
      'justify-content': ( this.group.isVirtual && isFirst )? 'right': 'left',
      'color': this.group.isVirtual? '#00008B': 'inherit'
    }
  }
}
