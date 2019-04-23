import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'CustomCurrency' })

export class CustomCurrencyPipe implements PipeTransform {

   constructor() { }

   transform(value: number, args?: any): any {
      if (value != null)
         return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,"$1,");
   }
}
