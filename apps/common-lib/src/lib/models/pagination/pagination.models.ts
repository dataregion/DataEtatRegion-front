import { EnrichedFlattenFinancialLinesSchema, PaginatedBudgetLines } from 'apps/clients/budget';
import { Optional } from '../../utilities/optional.type';
import { HasNext, PageSize } from './pagesize.models';

export interface DataPagination<T> {
  items: T[];
  pageInfo?: PageSize;
}

export interface DataIncrementalPagination<T> {
  items: T[]
  pagination: HasNext;
}

export function from_page_of_budget_lines(payload: PaginatedBudgetLines): DataIncrementalPagination<EnrichedFlattenFinancialLinesSchema> {
  return {
    items: payload.items ?? [],
    pagination: payload.pagination ?? { hasNext: false }
  }
}

export function to_incremental<T>(data_pagination: Optional<DataPagination<T>>) : DataIncrementalPagination<T> {
  if (!data_pagination) {
    return {
      items: [],
      pagination: {
        hasNext: false
      }
    }
  }

  return {
    items: data_pagination.items,
    pagination: {
      hasNext: !(data_pagination.pageInfo?.isLastPage)
    }
  }
}