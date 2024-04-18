import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'slugify',
  standalone: true
})
export class SlugifyPipe implements PipeTransform {
  
  transform(input: string): string {
    return input.toString().toLowerCase()
      .replace(/\s+/g, '_')           // Replace spaces with _
      .replace(/[^\w-]+/g, '')       // Remove all non-word chars
      .replace(/__+/g, '_')         // Replace multiple _ with single _
      .replace(/^_+/, '')             // Trim _ from start of text
      .replace(/_+$/, '');            // Trim _ from end of text
  }

}