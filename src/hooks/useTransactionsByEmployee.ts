import { useCallback, useState } from "react"
import {
  PaginatedEmployeeRequestParams,
  PaginatedRequestParams,
  PaginatedResponse,
  RequestByEmployeeParams,
  Transaction,
} from "../utils/types"
import { TransactionsByEmployeeResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function useTransactionsByEmployee(): TransactionsByEmployeeResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<Transaction[] | null>(null)
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  // const fetchById = useCallback(
  //   async (employeeId: string) => {
  //     const data = await fetchWithCache<Transaction[], RequestByEmployeeParams>(
  //       "transactionsByEmployee",
  //       {
  //         employeeId,
  //       }
  //     )

  //     setTransactionsByEmployee(data)
  //   },
  //   [fetchWithCache]
  // )

  const fetchAll = useCallback(
    async ({ employeeId, pageSize, page }: { employeeId: string; pageSize: number; page?: number }) => {
      // console.log(
      //   "\n\n\n\n\npaginatedTransactions: ",
      //   paginatedTransactions,
      //   "paginatedTransactions.nextPage: ",
      //   paginatedTransactions?.nextPage,
      //   "\n\n\n\n\n"
      // )

      let currentPage = 0

      if (page) {
        currentPage = page - 1
      } else if (paginatedTransactions && paginatedTransactions.nextPage) {
        currentPage = paginatedTransactions.nextPage
      }

      const response = await fetchWithCache<
        PaginatedResponse<Transaction[]>,
        PaginatedEmployeeRequestParams
      >("transactionsByEmployee", {
        page: currentPage,
        pageSize,
        employeeId,
      })

      setPaginatedTransactions((previousResponse) => {
        if (response === null || previousResponse === null) {
          return response
        }

        return {
          data: response.data,
          nextPage: response.nextPage,
          totalTransactions: paginatedTransactions?.totalTransactions || 0,
        }
      })
    },
    [fetchWithCache, paginatedTransactions]
  )

  const invalidateData = useCallback(() => {
    setTransactionsByEmployee(null)
  }, [])

  // return { data: paginatedTransactions, loading, fetchAll, fetchById, invalidateData }
  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
