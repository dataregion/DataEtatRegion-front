import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FinancialGroupAggregatePipe } from './components/grouping-table/group-aggregate.pipe';
import { GroupingTableHeaderComponent } from './components/grouping-table/grouping-table-header.component';
import { GroupingTableComponent } from './components/grouping-table/grouping-table.component';
import { TableBodyComponent } from './components/grouping-table/table-body.component';
import { TableGroupHeaderComponent } from './components/grouping-table/table-group-header.component';
import { TableGroupComponent } from './components/grouping-table/table-group.component';
import { TableRowsComponent } from './components/grouping-table/table-rows.component';
import { ProjectCellDirective } from './components/grouping-table/project-cell.directive';
import { ProjectGroupingDirective } from './components/grouping-table/project-grouping.directive';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  imports: [CommonModule, MatMenuModule],
  declarations: [
    ProjectCellDirective,
    ProjectGroupingDirective,
    GroupingTableComponent,
    GroupingTableHeaderComponent,
    TableBodyComponent,
    TableGroupComponent,
    TableGroupHeaderComponent,
    TableRowsComponent,
    FinancialGroupAggregatePipe,
  ],
  exports: [GroupingTableComponent, ProjectCellDirective, ProjectGroupingDirective],
})
export class GroupingTableModule {}
