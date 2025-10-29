import { Component, Input, ElementRef, AfterViewInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartConfiguration,
} from 'chart.js';

// ✅ Register required elements for bar charts
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
  selector: 'bar-chart',
  template: `<canvas></canvas>`,
})
export class BarChartComponent implements AfterViewInit, OnChanges {

  private el = inject(ElementRef)

  @Input() labels?: string[] | null;
  @Input() values?: number[] | null;
  @Input() unitTooltip: string = '€';
  @Input() title?: string;
  @Input() height: string = '250px';

  private chart?: Chart;

  uniqueId = 'chart-' + Math.random().toString(36).substring(2, 9);

  ngAfterViewInit(): void {
    this.tryRenderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['labels'] || changes['values']) {
      this.tryUpdateOrRender();
    }
  }

  // === Rendering ===
  private tryRenderChart(): void {
    if (!this.isDataValid()) return;
    this.destroyChart();

    const canvas = this.el.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    canvas.style.height = this.height;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const labels = this.labels ?? [];
    const values = this.values ?? [];

    const data = {
      labels,
      datasets: [
        {
          data: values,
          label: this.title ?? '',
          backgroundColor: 'rgba(92, 104, 229, 0.8)',      // DSFR dark blue fill
          hoverBackgroundColor: 'rgba(92, 104, 229, 1)',
          borderColor: '#5C68E5',
          borderWidth: 1,
        },
      ],
    };

    const options: ChartConfiguration<'bar'>['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label || ctx.label}: ${ctx.formattedValue} ${this.unitTooltip}`,
          },
        },
        title: this.title
          ? {
              display: true,
              text: this.title,
              font: { family: 'Marianne, Arial, sans-serif', size: 16, weight: 'bold' },
              color: '#000091',
            }
          : undefined,
      },
      scales: {
        x: {
          grid: { color: '#f0f0f0' },
          ticks: {
            color: '#161616',
            font: { family: 'Marianne, Arial, sans-serif' },
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#e5e5e5' },
          ticks: {
            color: '#161616',
            font: { family: 'Marianne, Arial, sans-serif' },
          },
        },
      },
    };

    this.chart = new Chart(ctx, { type: 'bar', data, options });
  }

  private tryUpdateOrRender(): void {
    if (!this.isDataValid()) {
      this.destroyChart();
      return;
    }
    if (!this.chart) this.tryRenderChart();
    else this.updateChart();
  }

  private updateChart(): void {
    if (!this.chart) return;
    const labels = this.labels ?? [];
    const values = this.values ?? [];
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = values;
    this.chart.update();
  }

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  private isDataValid(): boolean {
    return (
      Array.isArray(this.labels) &&
      Array.isArray(this.values) &&
      this.labels.length > 0 &&
      this.values.length > 0
    );
  }
}
