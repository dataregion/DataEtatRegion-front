import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { ColumnsMetaData, Group } from "../grouping-table/group-utils";
import { GroupingTableContextService } from "../grouping-table/grouping-table-context.service";

@Component({
    selector: 'poc-grouping-data',
    templateUrl: './poc-grouping-data.component.html',
    standalone: false
})
export class PocGroupingDataComponent {

  context = inject(GroupingTableContextService);

  @Input() currentGroup!: Group
  @Input() columnsMetaData!: ColumnsMetaData;

  @Output() currentGroupChange: EventEmitter<Group> = new EventEmitter<Group>();

  onGroupClick(group: Group) {
    this.currentGroupChange.emit(group)
  }

}
