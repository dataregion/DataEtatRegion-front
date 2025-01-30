import { HasNext, PageSize } from './pagesize.models';

export interface DataPagination<T> {
  items: T[];
  pageInfo?: PageSize;
}

export interface DataIncrementalPagination<T> {
  items: T[]
  pagination: HasNext;
}

export function to_incremental<T>(data_pagination: DataPagination<T>) : DataIncrementalPagination<T> {
  return {
    items: data_pagination.items,
    pagination: {
      hasNext: !(data_pagination.pageInfo?.isLastPage)
    }
  }
}