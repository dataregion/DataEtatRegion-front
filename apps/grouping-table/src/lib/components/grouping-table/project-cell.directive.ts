import { Directive, Input, TemplateRef } from "@angular/core";

@Directive({
    selector: 'ng-template[projectCell]'
})
export class ProjectCellDirective {

    constructor(public templateRef: TemplateRef<unknown>) { }

    @Input()
    projectCell = '';
}