import { Pipe, PipeTransform } from '@angular/core';
import { DataService } from '@shared/service-proxies/service-data';

@Pipe({ name: 'SpecialistPipe' })

export class SpecialistPipe implements PipeTransform {

    specialist='';
    constructor(
        private _dataService:DataService
    ) { }
    transform(value: string, args?: any): any {
        if (value != null)
            this._dataService.getAll('catcommon',"{code:"+value+"}").subscribe(resp=>this.specialist=resp.items);
            return this.specialist;
    }
}