import { Component, Input, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, ArcElement, Tooltip, Legend, ChartConfiguration, PieController } from 'chart.js';

Chart.register(PieController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements AfterViewInit, OnChanges {
  
  @Input() labels?: string[] | null;
  @Input() values?: number[] | null;
  @Input() unitTooltip: string = '€';
  @Input() title?: string;

  @Input() height: string = '250px';

  private chart?: Chart;

  uniqueId = 'chart-' + Math.random().toString(36).substring(2, 9);

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.tryRenderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['labels'] || changes['values']) {
      this.tryUpdateOrRender();
    }
  }

  // ---- Helpers ----

  private tryRenderChart(): void {
    // Guard against undefined or empty input data
    if (!this.isDataValid()) return;
    this.destroyChart();

    const canvas = this.el.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const labels = this.labels ?? [];
    const values = this.values ?? [];

    const data = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: this.getDSFRPalette(labels.length),
          borderWidth: 0,
          cutout: '50%'
        },
      ],
    };

    const options: ChartConfiguration<'doughnut'>['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
          // position: 'right',
          // labels: {
          //   boxWidth: 14,
          //   color: '#161616',
          //   font: { family: 'Marianne, Arial, sans-serif', size: 14 },
          // },
        },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.label}: ${context.formattedValue} ${this.unitTooltip}`,
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
    };

    this.chart = new Chart(ctx, { type: 'doughnut', data, options });
    this.renderCustomLegend();
  }

  private renderCustomLegend(): void {
    const legendContainer = this.el.nativeElement.querySelector('#chart-legend') as HTMLElement;
    if (!legendContainer || !this.chart) return;

    const data = this.chart.data;
    if (!data?.labels?.length) return;

    const html = data.labels
      .map((label, i) => {
        const color = (data.datasets[0].backgroundColor as string[])[i];
        return `
          <li>
            <div style="background-color:${color}"></div>
            ${label}
          </li>`;
      })
      .join('');

    legendContainer.innerHTML = `<ul>${html}</ul>`;
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
    this.chart.data.datasets[0].backgroundColor = this.getDSFRPalette(labels.length);
    this.chart.update();
  }

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  private isDataValid(): boolean {
    return Array.isArray(this.labels) && Array.isArray(this.values) && this.labels.length > 0 && this.values.length > 0;
  }

  private getDSFRPalette(count: number): string[] {
    const palette = [
      '#5C68E5', // Cat 1
      '#82B5F2', // Cat 2
      '#29598F', // Cat 3
      '#31A7AE', // Cat 4
      '#81EEF5', // Cat 5
      '#B478F1', // Cat 6
      '#CFB1F5', // Cat 7
      '#CECECE', // Cat 8
    ];
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }
}