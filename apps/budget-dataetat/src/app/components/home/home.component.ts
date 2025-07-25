import { Component } from '@angular/core';
import { SearchDataComponent } from '../search-data/search-data.component';
import { PreFilters } from '../../models/search/prefilters.model';
import { Preference } from 'apps/preference-users/src/lib/models/preference.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'budget-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [SearchDataComponent, CommonModule ]
})
export class HomeComponent {

  // utiliser les signaux 
  public grid_fullscreen = false;
  /**
   * Filtre retourner par le formulaire de recherche
   */
  public newFilter?: Preference;

  /**
   * Filtre à appliquer sur la recherche
   */
  public preFilter?: PreFilters;

}
