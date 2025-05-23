import { Component, inject, Input } from '@angular/core';
import { RowData } from './group-utils';
import { GroupingTableContextService } from './grouping-table-context.service';

@Component({
    selector: 'lib-table-rows',
    templateUrl: './table-rows.component.html',
    styleUrls: ['./table-rows.component.scss'],
    standalone: false
})
export class TableRowsComponent {
  @Input() rows!: RowData[];

  context = inject(GroupingTableContextService);

  onclick(row: RowData) {
    this.context.clickOnRow(row);
  }

  cellCustomProjection(cellName: string) {
    return this.context.projectionForCell(cellName);
  }
}
