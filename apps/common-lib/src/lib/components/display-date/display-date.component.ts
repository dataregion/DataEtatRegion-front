import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';

@Component({
    selector: 'lib-display-date',
    imports: [CommonModule],
    template: '{{ formattedDate }}'
})
export class DisplayDateComponent {
  @Input() date!: string | Date; // Input pour la date au format UTC
  @Input() dateFormat: string = 'dd/MM/yyyy à HH:mm';
  private datePipe = inject(DatePipe);

  get formattedDate(): string {
    if (this.date) {
      const utcDate = new Date(this.date);
      utcDate.setUTCMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset());
      return this.datePipe.transform(utcDate, this.dateFormat) || '';
    }
    return '';
  }
}
