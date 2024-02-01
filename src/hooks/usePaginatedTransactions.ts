import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(
    async ({ page, pageSize }: { page?: number; pageSize: number }) => {
      let currentPage = 0

      if (page) {
        currentPage = page - 1
      } else if (paginatedTransactions && paginatedTransactions.nextPage) {
        currentPage = paginatedTransactions.nextPage
      }

      // console.log(
      //   "PASSED IN page: ",
      //   page,
      //   "paginatedTransactions.nextPage",
      //   paginatedTransactions?.nextPage,
      //   "CURRENT PAGE fetchAll: ",
      //   currentPage
      // )

      const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
        "paginatedTransactions",
        {
          page: currentPage,
          pageSize,
        }
      )

      console.log("RESPONSE: ", response)

      setPaginatedTransactions((previousResponse) => {
        if (response === null || previousResponse === null) {
          console.log("!!!!!!!!!!!!")
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
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
