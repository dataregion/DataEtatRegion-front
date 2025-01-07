import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'data-qpv-help',
    templateUrl: './help.component.html',
    standalone: false
})
export class HelpComponent {

  constructor(private _router: Router) {}

}
