import { Component, inject, Input } from "@angular/core";
import { Group } from "../grouping-table/group-utils";
import { GroupingTableContextService } from "../grouping-table/grouping-table-context.service";

@Component({
    selector: 'poc-data',
    templateUrl: './poc-data.component.html',
    standalone: false
})
export class PocDataComponent {
  
  context = inject(GroupingTableContextService);

  @Input() currentGroup!: Group;
  currentPage: number = 1;
  nbByPage: number = 20;
  totalPage: number = 0;

  setCurrentPage(page: number) {
    this.currentPage = page
  }

  getRows() {
    return this.currentGroup.rows ? this.currentGroup.rows.slice((this.currentPage - 1) * this.nbByPage, (this.currentPage - 1) * this.nbByPage + this.nbByPage) : []
  }

  getPages() {
    this.totalPage = this.currentGroup.rows ? Math.trunc(this.currentGroup.rows?.length / this.nbByPage) + 1 : 1
    let pages = Array(this.totalPage).fill(1).map((i) => i + 1);
    if (pages.length > 10) {
      pages = []
      if (this.currentPage - 1 >= 1)
        pages.push(this.currentPage - 1)
      pages.push(this.currentPage)
      if (this.currentPage + 1 <= this.totalPage)
        pages.push(this.currentPage + 1)
      if (!pages.includes(2)) {
        pages.unshift(2)
      }
      if (!pages.includes(1)) {
        pages.unshift(1)
      }
      if (!pages.includes(this.totalPage - 1)) {
        pages.push(this.totalPage - 1)
      }
      if (!pages.includes(this.totalPage)) {
        pages.push(this.totalPage)
      }
    }
    return pages
  }

}
