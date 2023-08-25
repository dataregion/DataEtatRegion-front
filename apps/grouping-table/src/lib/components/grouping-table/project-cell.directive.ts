import { Directive, Input, TemplateRef } from "@angular/core";

@Directive({
    selector: '[libProjectCell]'
})
export class ProjectCellDirective {

    constructor(public templateRef: TemplateRef<unknown>) { }

    @Input('libProjectCell')
    projectCell = '';
}