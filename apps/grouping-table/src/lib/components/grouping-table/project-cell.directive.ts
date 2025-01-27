import { Directive, Input, TemplateRef } from '@angular/core';

/* eslint no-unused-vars: 0 */ // --> OFF

@Directive({
    selector: '[libProjectCell]',
    standalone: false
})
export class ProjectCellDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}

  @Input('libProjectCell')
  projectCell = '';
}
