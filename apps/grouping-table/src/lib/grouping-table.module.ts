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
import { PocMegaRequetesComponent } from './components/poc-mega-requetes/poc-mega-requetes.component';
import { PocGroupingDataComponent } from './components/poc-mega-requetes/poc-grouping-data.component';
import { PocDataComponent } from './components/poc-mega-requetes/poc-data.component';

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
    PocMegaRequetesComponent,
    PocGroupingDataComponent,
    PocDataComponent
  ],
  exports: [GroupingTableComponent, ProjectCellDirective, ProjectGroupingDirective, PocMegaRequetesComponent]
})
export class GroupingTableModule {}
