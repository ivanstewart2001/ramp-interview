import { Employee, PaginatedResponse, Transaction } from "../utils/types"

type UseTypeBaseResult<TValue> = {
  data: TValue
  loading: boolean
  invalidateData: () => void
}

type UseTypeBaseAllEmployeeResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchAll: () => Promise<void>
}

type UseTypeBaseAllTransactionsResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchAll: ({ pageSize, page }: { pageSize: number; page?: number }) => Promise<void>
}

type UseTypeBaseEmployeeTransactionsResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchAll: ({
    employeeId,
    pageSize,
    page,
  }: {
    employeeId: string
    pageSize: number
    page?: number
  }) => Promise<void>
}

export type EmployeeResult = UseTypeBaseAllEmployeeResult<Employee[] | null>

export type PaginatedTransactionsResult = UseTypeBaseAllTransactionsResult<PaginatedResponse<
  Transaction[]
> | null>

export type TransactionsByEmployeeResult = UseTypeBaseEmployeeTransactionsResult<PaginatedResponse<
  Transaction[]
> | null>
