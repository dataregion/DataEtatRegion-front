import { Injectable } from '@angular/core';
import {Attribution, Control} from 'ol/control';
import {Tile as TileLayer, VectorTile as VectorTileLayer} from 'ol/layer';
import {VectorTile as VectorTileSource} from 'ol/source';
import {MVT} from "ol/format";
import {applyStyle} from 'ol-mapbox-style';
import {Fill, Stroke, Style} from "ol/style";
import {FeatureLike} from "ol/Feature";
import { Point } from 'ol/geom';
import Map from "ol/Map";

@Injectable({
  providedIn: 'root',
})
export class MapLevelCustomControlService {

  constructor() { }

  createLevelControl(): LevelControl {
    return new LevelControl();
  }
}

export enum MapLevel {
  region = 'Région',
  departement = 'Département',
  epci = 'Epci',
  qpv = 'Qpv',
}

export class LevelControl extends Control {

  private nodeElement: HTMLDivElement;
  private currentMap: Map | undefined;
  private zoomByLevel: { [key: string]: number } = {
    'region': 7,
    'departement': 9,
    'epci': 11,
    'qpv': 13,
  };

  private currentCenter: Point | undefined;

  constructor(opt_options?: any) {
    const options = opt_options || {};

    const title = document.createElement('div');
    title.className = 'map-level-control-title';
    title.innerHTML = '';

    const selectElement = document.createElement('select');
    selectElement.className = 'map-level-control-select';
    selectElement.name  = 'mapLevel';

    const selectLabelElement = document.createElement('label');
    selectLabelElement.setAttribute('for', selectElement.name);
    selectLabelElement.textContent = 'Échelle:';

    // Loop over the enum to create options for selectElement
    for (const level in MapLevel) {
      if (MapLevel.hasOwnProperty(level)) {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = `${MapLevel[level as keyof typeof MapLevel]}`;
        selectElement.appendChild(option);
      }
    }

    const zoomToCurrentBtn = document.createElement('button');
    zoomToCurrentBtn.className = 'map-zoom-to-current-btn fr-btn fr-icon-map-pin-2-line fr-btn--icon-left'; // Set the button's classes
    zoomToCurrentBtn.setAttribute('title', 'Aller au QPV sélectionné'); // Add the title attribute
    zoomToCurrentBtn.innerHTML = '';

    const element = document.createElement('div');
    element.className = 'map-level-control ol-unselectable ol-control';
    element.appendChild(title);
    element.appendChild(selectElement);
    element.appendChild(zoomToCurrentBtn);

    super({
      element: element,
      target: options.target,
    });

    this.nodeElement = element;

    selectElement.addEventListener('change', this.handleSelectChange.bind(this), false);
    zoomToCurrentBtn.addEventListener('click', this.gotoCurrentCenter.bind(this), false);
  }

  setCurrentMap(map: Map): void {
    this.currentMap = map;
  }

  handleSelectChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.currentMap?.getView()?.setZoom(this.zoomByLevel[selectedValue]);
  }

  gotoCurrentCenter() {
    if (this.currentCenter) {
      this.currentMap?.getView()?.setCenter(this.currentCenter.getCoordinates());
    }
  }

  updateSelectedQpv(searchedQpv: FeatureLike, searchedYears: number[] | null | undefined) {
    this.updateTitle(searchedQpv.get('name'), searchedYears);
    this.currentCenter = searchedQpv.get('geometry');
    this.gotoCurrentCenter();
  }

  updateTitle(searchedQpvName: string, searchedYears: number[] | null | undefined) {
    const titleElements = this.nodeElement.getElementsByClassName('map-level-control-title');

    if (titleElements && titleElements.length > 0) {
      const titleElement = titleElements[0];
      if (searchedYears) {
        titleElement.innerHTML = `${searchedQpvName} - ${searchedYears.join('; ')}`;
      } else {
        titleElement.innerHTML = `${searchedQpvName}`;
      }

    }
  }
}
