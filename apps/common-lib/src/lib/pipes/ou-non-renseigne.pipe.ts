import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ouNonRenseigne',
  standalone: true
})
export class OuNonRenseignePipe implements PipeTransform {
  // eslint-disable-next-line
  transform(value: unknown, ...args: unknown[]): unknown {
    if (value === undefined || value === null) {
      return `Non renseigné`;
    } else {
      return value;
    }
  }
}
