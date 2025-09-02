import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat',
  standalone: true
})
export class NumberFormatPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) {
      return String(value);
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}