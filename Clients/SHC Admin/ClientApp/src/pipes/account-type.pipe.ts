import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'accountType'
})
export class AccountTypePipe implements PipeTransform {
    _accountTypes: Array<{ id: number, name: string }> = [{ id: 1, name: 'Quản trị' }, { id: 2, name: 'Bác sĩ / Chuyên gia / Điều dưỡng' }, { id: 3, name: 'Cơ sở y tế / Doanh nghiệp' }];

    transform(value: any, args?: any): any {
        return this._accountTypes.find(a => a.id === value).name;
    }

}
