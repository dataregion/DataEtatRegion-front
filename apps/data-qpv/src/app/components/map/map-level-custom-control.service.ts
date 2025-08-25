import { Injectable } from '@angular/core';
import { Control} from 'ol/control';
import Map from "ol/Map";
import {Feature} from "ol";
import { extend as olExtend, createEmpty as olCreateEmptyExtend } from 'ol/extent';
import {Coordinate} from "ol/coordinate";
import { TypeLocalisation } from 'apps/common-lib/src/lib/models/geo.models';

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
  departement = 'Département',
  epci = 'Epci',
  commune = 'Commune',
  qpv = 'Qpv',
}

export class LevelControl extends Control {

  private currentMap: Map | undefined;
  private zoomByLevel: { [key: string]: number } = {
    'département': 9,
    'epci': 11,
    'commune': 13,
    'qpv': 15,
  };

  private currentCenter: Coordinate | undefined;

  private selectMapLevel: HTMLSelectElement;
  private zoomToCurrentElementBtn: HTMLButtonElement;
  private titleElement: HTMLDivElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const option = document.createElement('option');
      option.value = level;
      option.textContent = `${MapLevel[level as keyof typeof MapLevel]}`;
      selectElement.appendChild(option);
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
    let newZoomLevel = this.currentMap?.getView().getZoom();
    if (!newZoomLevel)
      return

    newZoomLevel = Math.min(newZoomLevel, 16);

    if(newZoomLevel && newZoomLevel < (this.zoomByLevel['epci'] - 1)) {
      this.selectMapLevel.value = 'departement';
    } else if(newZoomLevel && newZoomLevel < (this.zoomByLevel['commune'] - 1 )) {
      this.selectMapLevel.value = 'epci';
    } else if(newZoomLevel && newZoomLevel < (this.zoomByLevel['qpv'] - 1 )) {
      this.selectMapLevel.value = 'commune';
    } else if(newZoomLevel && newZoomLevel >= (this.zoomByLevel['qpv'] - 1)) {
      this.selectMapLevel.value = 'qpv';
    }
  }

  handleSelectChange(event: Event): void {
    const selectedValue: string = (event.target as HTMLSelectElement).value;
    this.updateLevel(selectedValue as TypeLocalisation);
  }

  gotoCurrentCenter() {
    if (this.currentCenter) {
      this.currentMap?.getView()?.setCenter(this.currentCenter);
    }
  }

  updateControl(
    searchedNames: string[] | null | undefined,
    searchedYears: number[] | null | undefined,
    localisation: TypeLocalisation | null | undefined,
    searchedFeatures: Feature[] | null | undefined,
  ) {
    this.updateTitle(searchedNames, searchedYears, localisation);
    this.fitViewForFeatures(searchedFeatures, localisation);
  }

  fitViewForFeatures(searchedFeatures: Feature[] | null | undefined, localisation: TypeLocalisation | null | undefined): void {
    if (searchedFeatures && searchedFeatures?.length > 0) {
      const selectedExtent = olCreateEmptyExtend();
      searchedFeatures.forEach(function(feature) {
        const geom = feature?.getGeometry();
        if (geom) {
          olExtend(selectedExtent, geom.getExtent());
        }
      });
      // On zoom sur le niveau QPV
      this.currentMap?.getView().fit(selectedExtent, { size: this.currentMap?.getSize(), padding: [100, 100, 100, 100] });
      if (localisation) {
        this.updateLevel(localisation);
      }
      this.currentCenter = this.currentMap?.getView().getCenter();
    }
  }

  updateLevel(localisation: TypeLocalisation | null | undefined): void {
    if (localisation) {
      this.selectMapLevel.value = localisation.toLowerCase();
      this.currentMap?.getView()?.setZoom(this.zoomByLevel[localisation.toLowerCase()]);
    }
  }

  updateTitle(searchedQpvNames: string[] | null | undefined, searchedYears: number[] | null | undefined,  localisation: TypeLocalisation | null | undefined,): void {
    let title = "";

    if (localisation) {
      title = localisation + ": ";
    }
   
    if (searchedQpvNames) {
      title += `${searchedQpvNames.join(', ')}`;
    }

     if (searchedYears) {
      title +=   ` Années :  ${searchedYears.join(', ')}`;
    }

    this.titleElement.innerHTML = title;
  }
}
