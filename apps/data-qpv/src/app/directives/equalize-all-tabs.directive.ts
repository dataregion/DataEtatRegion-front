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
  private destroyed = false;

  ngAfterViewInit() {
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
    window.removeEventListener('resize', this.equalize);
  }

  private getAllPanels(): HTMLElement[] {
    // In your DOM, dsfr-tab is the right selector
    return Array.from(
      this.host.nativeElement.querySelectorAll('dsfr-tab')
    ) as HTMLElement[];
  }

  private equalize = () => {
    const panels = this.getAllPanels();
    if (!panels.length) return;

    // Reset any previous heights
    panels.forEach(p => (p.style.height = 'auto'));

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
      panels.forEach(p => (p.style.height = `${maxHeight}px`));
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
