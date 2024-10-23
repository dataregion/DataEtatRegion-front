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

  private currentMap: Map | undefined;
  private zoomByLevel: { [key: string]: number } = {
    'region': 7,
    'departement': 9,
    'epci': 11,
    'qpv': 13,
  };

  private currentCenter: Point | undefined;

  private selectMapLevel: HTMLSelectElement;
  private zoomToCurrentElementBtn: HTMLButtonElement;
  private titleElement: HTMLDivElement;

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

    this.titleElement = title;
    this.selectMapLevel = selectElement;
    this.zoomToCurrentElementBtn = zoomToCurrentBtn;
  }

  initCurrentMap(map: Map): void {
    this.currentMap = map;

    this.selectMapLevel.addEventListener('change', this.handleSelectChange.bind(this), false);
    this.zoomToCurrentElementBtn.addEventListener('click', this.gotoCurrentCenter.bind(this), false);

    // Add currentZoom listener to update the MapLevel dynamically
    this.currentMap?.getView().on('change:resolution', () => this.onZoomChange());
  }


  onDestroy(): void {
    this.currentMap?.getView().un('change:resolution', () => {});
    this.selectMapLevel.removeEventListener('change', this.handleSelectChange.bind(this), false);
    this.zoomToCurrentElementBtn.removeEventListener('click', this.gotoCurrentCenter.bind(this), false);
  }

  onZoomChange(): void {
    const newZoomLevel = this.currentMap?.getView().getZoom();
    let selectedLevel: string | undefined = undefined;

    if(newZoomLevel && newZoomLevel < (this.zoomByLevel['departement']) - 1) {
      selectedLevel = 'region';
    } else if(newZoomLevel && newZoomLevel < (this.zoomByLevel['epci'] - 1)) {
      selectedLevel = 'departement';
    } else if(newZoomLevel && newZoomLevel < (this.zoomByLevel['qpv'] - 1 )) {
      selectedLevel = 'epci';
    } else if(newZoomLevel && newZoomLevel >= (this.zoomByLevel['qpv'] - 1)) {
      selectedLevel = 'qpv';
    }

    if (selectedLevel !== undefined) {
      this.selectMapLevel.value = selectedLevel;
    }
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

  updateSelectedQpv(
    searchedNames: string[] | null | undefined,
    searchedYears: number[] | null | undefined,
    searchedCenter: Point | undefined
  ) {
    this.updateTitle(searchedNames, searchedYears);
    this.currentCenter = searchedCenter;
    this.gotoCurrentCenter();
  }

  updateTitle(searchedQpvNames: string[] | null | undefined, searchedYears: number[] | null | undefined) {
    let yearsString = "/";
    let namesString = "/";

    if (searchedYears) {
      yearsString = `${searchedYears.join(', ')}`;
    }

    if (searchedQpvNames) {
      namesString = `${searchedQpvNames.join(', ')}`;
    }

    this.titleElement.innerHTML = `${namesString} - ${yearsString}`;
  }
}
