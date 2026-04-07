import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  inject
} from '@angular/core';

@Directive({
  selector: '[appEqualizeAllTabs]'
})
export class EqualizeAllTabsDirective implements AfterViewInit, OnDestroy {

  private host = inject(ElementRef<HTMLElement>)
  private zone = inject(NgZone)

  private resizeObservers: ResizeObserver[] = [];
  private mutationObserver?: MutationObserver;
  private styleElement?: HTMLStyleElement;
  private destroyed = false;
  private scopeId = `equalize-tabs-${Math.random().toString(36).slice(2, 9)}`;

  ngAfterViewInit() {
    this.host.nativeElement.dataset['equalizeTabsId'] = this.scopeId;
    this.zone.runOutsideAngular(() => {
      // Just wait a bit for dsfr-tabs to render
      // #TODO Voir si meilleur moyen
      setTimeout(() => this.initialize(), 100);
    });
  }

  private initialize() {
    if (this.destroyed) return;

    this.equalize();

    // Re-observe whenever DOM changes (tab switch, async load)
    this.mutationObserver = new MutationObserver(() => this.equalize());
    this.mutationObserver.observe(this.host.nativeElement, {
      childList: true,
      subtree: true,
    });

    window.addEventListener('resize', this.equalize);
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.resizeObservers.forEach(o => o.disconnect());
    this.mutationObserver?.disconnect();
    this.styleElement?.remove();
    delete this.host.nativeElement.dataset['equalizeTabsId'];
    window.removeEventListener('resize', this.equalize);
  }

  private getAllPanels(): HTMLElement[] {
    // In your DOM, dsfr-tab is the right selector
    return Array.from(
      this.host.nativeElement.querySelectorAll('dsfr-tab')
    ) as HTMLElement[];
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

    if (nonce) {
      styleElement.setAttribute('nonce', nonce);
    }

    document.head.appendChild(styleElement);
    this.styleElement = styleElement;
    return styleElement;
  }

  private updatePanelHeights(height: number | null): void {
    const styleElement = this.ensureStyleElement();
    const cssHeight = height && height > 0 ? `${height}px` : 'auto';

    styleElement.textContent = `
      [data-equalize-tabs-id="${this.scopeId}"] dsfr-tab {
        height: ${cssHeight};
      }
    `;
  }

  private equalize = () => {
    const panels = this.getAllPanels();
    if (!panels.length) return;

    this.updatePanelHeights(null);

    // Only consider visible tabs (Angular hides others)
    const visible = panels.filter(p => {
      const style = getComputedStyle(p);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        p.offsetParent !== null
      );
    });

    if (!visible.length) return;

    // Compute max height among all visible tabs
    const maxHeight = Math.max(...visible.map(p => p.offsetHeight));

    if (maxHeight > 0) {
      this.updatePanelHeights(maxHeight);
    }

    // Observe resizes to re-equalize dynamically
    this.resizeObservers.forEach(o => o.disconnect());
    this.resizeObservers = [];
    panels.forEach(p => {
      const ro = new ResizeObserver(() => {
        // debounce / defer the update to next frame
        requestAnimationFrame(() => this.equalize());
      });
      ro.observe(p);
      this.resizeObservers.push(ro);
    });
  };
}
