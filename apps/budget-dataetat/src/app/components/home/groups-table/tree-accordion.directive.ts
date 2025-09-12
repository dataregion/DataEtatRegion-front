import { Directive, inject, OnChanges, TemplateRef, ViewContainerRef, input } from "@angular/core";
import { Group } from "./groups-table.component";

@Directive({
  selector: '[budgetTreeAccordion]',
  standalone: true
})
export class TreeAccordionDirective implements OnChanges {

  private view: ViewContainerRef = inject(ViewContainerRef)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tpl: TemplateRef<any> = inject(TemplateRef<any>)
  
  readonly nodes = input<Group[]>([], { alias: "budgetTreeAccordion" });
  readonly level = input(0, { alias: "budgetTreeAccordionLevel" });

  ngOnChanges() {
    this.view.clear();
    for (const node of this.nodes()) {
      this.view.createEmbeddedView(this.tpl, {
        $implicit: node,
        level: this.level()
      });
    }
  }
}