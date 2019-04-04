import { MatPaginatorIntl } from '@angular/material';

const dutchRangeLabel = (page: number, pageSize: number, length: number) => {

  const isVi = abp.utils.getCookieValue('Abp.Localization.CultureName') !== 'en';

  if (length === 0 || pageSize === 0) { return `0 tổng số ${length}`; }

  length = Math.max(length, 0);

  const startIndex = page * pageSize;

  const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

  return abp.utils.formatString(isVi ? 'bản ghi {0} - {1} trên tổng số {2}' : 'record {0} - {1} of {2}', startIndex + 1, endIndex, length);
}


export function getDutchPaginatorIntl() {
  const isVi = abp.utils.getCookieValue('Abp.Localization.CultureName') !== 'en';
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = isVi ? 'Hiển thị :' : 'Display :';
  paginatorIntl.nextPageLabel = isVi ? 'Trang sau' : 'Next';
  paginatorIntl.previousPageLabel = isVi ? 'Trang trước' : 'Previous';
  paginatorIntl.firstPageLabel = isVi ? 'Trang đầu' : 'First page';
  paginatorIntl.lastPageLabel = isVi ? 'Trang cuối' : 'Last page';
  paginatorIntl.getRangeLabel = dutchRangeLabel;

  return paginatorIntl;
}

