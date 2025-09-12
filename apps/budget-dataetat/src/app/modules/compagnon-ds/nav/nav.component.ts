import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'budget-nav-compagnon-ds',
  templateUrl: './nav.component.html',
  imports: [CommonModule]
})
export class NavCompagnonDSComponent {
  public readonly title = input<string>('');
  public readonly currentStep = input<number>(1);
  public readonly totalStep = input<number>(3);

}
