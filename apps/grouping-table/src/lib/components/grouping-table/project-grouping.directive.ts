import { Directive, Input, TemplateRef, inject } from '@angular/core';

/* eslint no-unused-vars: 0 */ // --> OFF

@Directive({
    selector: '[libProjectGrouping]',
    standalone: false
})
export class ProjectGroupingDirective {
  templateRef = inject<TemplateRef<unknown>>(TemplateRef);


  @Input('libProjectGrouping')
  projectGrouping = '';
}
