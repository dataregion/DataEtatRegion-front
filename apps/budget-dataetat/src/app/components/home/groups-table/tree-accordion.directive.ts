import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { Group } from "./groups-table.component";

@Directive({
  selector: '[budgetTreeAccordion]',
  standalone: true
})
export class TreeAccordionDirective {
  
  @Input('budgetTreeAccordion') nodes: Group[] = [];
  @Input('budgetTreeAccordionLevel') level = 0;

  constructor(
    private view: ViewContainerRef,
    private tpl: TemplateRef<any>
  ) {}

  ngOnChanges() {
    this.view.clear();
    for (const node of this.nodes) {
      this.view.createEmbeddedView(this.tpl, {
        $implicit: node,
        level: this.level
      });
    }
  }
}