export interface PageSize {
  totalRows: number;
  page: number;
  pageSize: number;
  isFirstPage?: boolean;
  isLastPage?: boolean;
}

export interface HasNext {
  hasNext: boolean;
}