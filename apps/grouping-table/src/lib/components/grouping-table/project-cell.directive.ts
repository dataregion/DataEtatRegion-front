import { Directive, Input, TemplateRef, inject } from '@angular/core';

/* eslint no-unused-vars: 0 */ // --> OFF

@Directive({
    selector: '[libProjectCell]',
    standalone: false
})
export class ProjectCellDirective {
  templateRef = inject<TemplateRef<unknown>>(TemplateRef);


  @Input('libProjectCell')
  projectCell = '';
}
