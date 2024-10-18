import { Directive, Input, TemplateRef } from '@angular/core';

/* eslint no-unused-vars: 0 */ // --> OFF

@Directive({
  selector: '[libProjectGrouping]'
})
export class ProjectGroupingDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}

  @Input('libProjectGrouping')
  projectGrouping = '';
}
