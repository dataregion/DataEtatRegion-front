import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  inject
} from '@angular/core';

@Directive({
  selector: '[appMatchDashboardHeight]'
})
export class MatchDashboardHeightDirective implements AfterViewInit, OnDestroy {

  private host = inject(ElementRef<HTMLElement>)
  private zone = inject(NgZone)
  
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private styleElement?: HTMLStyleElement;
  private lastHeight = 0;
  private scopeId = `match-dashboard-${Math.random().toString(36).slice(2, 9)}`;

  ngAfterViewInit() {
    this.host.nativeElement.dataset['matchDashboardId'] = this.scopeId;
    // Run outside Angular for performance
    this.zone.runOutsideAngular(() => {
      // Give charts a bit of time to render
      // #TODO Voir si meilleur moyen      
      setTimeout(() => this.initialize(), 100);
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
    this.styleElement?.remove();
    delete this.host.nativeElement.dataset['matchDashboardId'];
    window.removeEventListener('resize', this.syncHeight);
  }

  private ensureStyleElement(): HTMLStyleElement {
    if (this.styleElement) {
      return this.styleElement;
    }

    const styleElement = document.createElement('style');
    const nonce = document
      .querySelector('meta[property="csp-nonce"], meta[name="csp-nonce"]')
      ?.getAttribute('content')
      ?.trim();

    if (nonce && nonce !== '__CSP_NONCE__') {
      styleElement.setAttribute('nonce', nonce);
    }

    document.head.appendChild(styleElement);
    this.styleElement = styleElement;
    return styleElement;
  }

  private updateScopedStyles(tableMaxHeight: number | null, mapHeight: number | null): void {
    const styleElement = this.ensureStyleElement();
    const tableRules = tableMaxHeight && tableMaxHeight > 0
      ? `max-height: ${tableMaxHeight}px; overflow-y: auto;`
      : '';
    const mapRules = mapHeight && mapHeight > 0 ? `height: ${mapHeight}px;` : '';

    styleElement.textContent = `
      [data-match-dashboard-id="${this.scopeId}"] .fr-table__content {
        ${tableRules}
      }

      [data-match-dashboard-id="${this.scopeId}"] data-qpv-map,
      [data-match-dashboard-id="${this.scopeId}"] data-qpv-map .map-container {
        ${mapRules}
      }
    `;
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
    if (!dashboard) {
      this.updateScopedStyles(null, null);
      return;
    }

    const height = dashboard.offsetHeight;
    if (!height || height === this.lastHeight) return;
    this.lastHeight = height;

    // Compute scoped CSS values without mutating inline styles
    const tableContent = this.host.nativeElement.querySelector(
      '.fr-table__content'
    ) as HTMLElement | null;
    const scrollbarY = tableContent ? tableContent.offsetWidth - tableContent.clientWidth : 0;
    const tableMaxHeight = height - scrollbarY;
    const mapHeight = height - 20;

    this.updateScopedStyles(tableMaxHeight, mapHeight);

    const mapContainer = this.host.nativeElement.querySelector('data-qpv-map') as HTMLElement | null;
    const mapTarget = mapContainer?.querySelector('.map-container') as HTMLElement | null;
    if (mapTarget) {
      // Force a layout flush so the internal ResizeObserver fires
      void mapTarget.offsetHeight;
    }
  };
}
