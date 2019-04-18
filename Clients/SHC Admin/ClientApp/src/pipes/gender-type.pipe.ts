import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'genderType'
})
export class GenderTypePipe implements PipeTransform {
    _genderTypes: Array<{ id: number, name: string }> = [{ id: 1, name: 'Nam' }, { id: 2, name: 'Nữ' }, { id: 3, name: 'Không xác định' }];

    transform(value: any, args?: any): any {
        return this._genderTypes.find(a => a.id === value).name;
    }

}
