import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'budget-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected title = 'budget-dataetat';
}
