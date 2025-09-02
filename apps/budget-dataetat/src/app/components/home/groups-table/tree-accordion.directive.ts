import { Directive, inject, Input, OnChanges, TemplateRef, ViewContainerRef } from "@angular/core";
import { Group } from "./groups-table.component";

@Directive({
  selector: '[budgetTreeAccordion]',
  standalone: true
})
export class TreeAccordionDirective implements OnChanges {

  private view: ViewContainerRef = inject(ViewContainerRef)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tpl: TemplateRef<any> = inject(TemplateRef<any>)
  
  @Input('budgetTreeAccordion') nodes: Group[] = [];
  @Input('budgetTreeAccordionLevel') level = 0;

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