import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone
} from '@angular/core';

@Directive({
  selector: '[appMatchDashboardHeight]'
})
export class MatchDashboardHeightDirective implements AfterViewInit, OnDestroy {
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private lastHeight = 0;

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngAfterViewInit() {
    // Run outside Angular for performance
    this.zone.runOutsideAngular(() => {
      // Give charts a bit of time to render
      setTimeout(() => this.initialize(), 600);
    });
  }

  private initialize() {
    this.resizeObserver = new ResizeObserver(() => this.syncHeight());
    this.mutationObserver = new MutationObserver(() => this.syncHeight());
    this.mutationObserver.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    window.addEventListener('resize', this.syncHeight);
    this.syncHeight(); // initial pass
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    window.removeEventListener('resize', this.syncHeight);
  }

  /** Get the currently visible dashboard (active DSFR tab) */
  private getVisibleDashboard(): HTMLElement | null {
    const dashboards = Array.from(document.querySelectorAll<HTMLElement>('data-qpv-dashboard'));
    return dashboards.find(d => {
      const style = getComputedStyle(d);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        d.offsetParent !== null
      );
    }) || null;
  }

  private syncHeight = () => {
    const dashboard = this.getVisibleDashboard();
    if (!dashboard) return;

    const height = dashboard.offsetHeight;
    if (!height || height === this.lastHeight) return;
    this.lastHeight = height;

    // Apply to datatable
    const tableContent = this.host.nativeElement.querySelector(
      '.fr-table__content'
    ) as HTMLElement | null;
    if (tableContent) {
      const scrollbarY = tableContent.offsetWidth - tableContent.clientWidth;
      tableContent.style.maxHeight = `${height - scrollbarY}px`;
      tableContent.style.overflowY = 'auto';
    }

    // Apply to map
    const mapContainer = this.host.nativeElement.querySelector('data-qpv-map') as HTMLElement | null;
    if (mapContainer) {
      const scrollbarY = mapContainer.offsetWidth - mapContainer.clientWidth;
      mapContainer.style.height = `${height - 20}px`;

      const mapTarget = mapContainer.querySelector('.map-container') as HTMLElement | null;
      if (mapTarget) {
        mapTarget.style.height = `${height - 20}px`;
        // Force a layout flush so the internal ResizeObserver fires
        void mapTarget.offsetHeight;
      }
    }

    console.debug('[MatchDashboardHeight] Visible dashboard height:', height);
  };
}
