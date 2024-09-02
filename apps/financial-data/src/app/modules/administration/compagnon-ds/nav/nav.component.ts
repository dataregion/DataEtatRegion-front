import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'financial-nav-compagnon-ds',
    templateUrl: './nav.component.html',
    standalone: true,
    imports: [CommonModule],
})
export class NavCompagnonDSComponent {

    @Input()
    public title: string = ""
    @Input()
    public currentStep: number = 1
    @Input()
    public totalStep: number = 3
  
    constructor() {
    }
  
  }