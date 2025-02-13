import { Component, HostBinding, inject, Input } from '@angular/core';
import { Group } from './group-utils';
import { GroupingTableContextService } from './grouping-table-context.service';

@Component({
    selector: 'lib-table-body',
    templateUrl: './table-body.component.html',
    host: {
        class: 'table-body'
    },
    standalone: false
})
export class TableBodyComponent {
  @Input() group!: Group;
  @Input() groupLevel = 0;

  context = inject(GroupingTableContextService);

  @HostBinding('class.groups') get containsGroups() {
    return this.groupLevel > 0;
  }
}
