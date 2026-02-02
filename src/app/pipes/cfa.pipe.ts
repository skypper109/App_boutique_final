import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cfa',
  standalone: true
})
export class CfaPipe implements PipeTransform {

  transform(value: number, decimals: 0): unknown {
    const formater = value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formater} F CFA`;
  }

}
