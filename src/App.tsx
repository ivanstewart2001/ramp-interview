import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee } from "./utils/types";
import Pagination from "./components/Pagination";

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees();
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } =
    usePaginatedTransactions();
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } =
    useTransactionsByEmployee();
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<"ALL" | "EMPLOYEE">("ALL");
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(5);
  const [finalPageSize, setFinalPageSize] = useState(5);
  const [pageSizeSubmit, setPageSizeSubmit] = useState(false);

  const transactions = useMemo(
    () => paginatedTransactions ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  );

  const loadAllTransactions = useCallback(
    async ({ page }: { page?: number }) => {
      setIsLoading(true);
      transactionsByEmployeeUtils.invalidateData();
      await employeeUtils.fetchAll();

      paginatedTransactionsUtils.invalidateData();
      await paginatedTransactionsUtils.fetchAll({
        pageSize,
        page,
      });

      setIsLoading(false);
    },
    [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]
  );

  const loadTransactionsByEmployee = useCallback(
    async ({ page, employeeId }: { page?: number; employeeId: string }) => {
      paginatedTransactionsUtils.invalidateData();
      // await transactionsByEmployeeUtils.fetchById(employeeId)
      await transactionsByEmployeeUtils.fetchAll({
        employeeId,
        pageSize,
        page,
      });
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  );

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions({ page: 1 });
    }
  }, [employeeUtils.loading, employees, loadAllTransactions]);

  useEffect(() => {
    if (pageSizeSubmit) {
      if (pageSize < 1) {
        window.alert("Page size must be greater than or equal to 1");

        setPageSize(5);
      }

      if (type === "ALL") {
        loadAllTransactions({ page: 1 });
      } else if (type === "EMPLOYEE" && employeeId) {
        loadTransactionsByEmployee({ page: 1, employeeId });
      }

      setPageSizeSubmit(false);
    }
  }, [pageSizeSubmit]);

  function getNextPage() {
    if (transactions!.nextPage) {
      return transactions!.nextPage as number;
    }

    return Math.ceil(transactions!.totalTransactions / pageSize);
  }

  const loading =
    paginatedTransactionsUtils.loading ||
    employeeUtils.loading ||
    transactionsByEmployeeUtils.loading ||
    isLoading;

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return;
            }

            if (newValue.id) {
              setType("EMPLOYEE");
              setEmployeeId(newValue.id);

              await loadTransactionsByEmployee({
                page: 1,
                employeeId: newValue.id,
              });
            } else {
              setType("ALL");
              setEmployeeId(null);

              await loadAllTransactions({ page: 1 });
            }
          }}
        />

        <div className="RampBreak--l" />

        {loading ? (
          <p>Loading ...</p>
        ) : (
          <div className="RampGrid">
            {transactions && transactions.data.length > 0 ? (
              <Transactions transactions={transactions.data} />
            ) : (
              <p>No transactions found</p>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <label style={{ marginRight: "1vw" }}>Page Size</label>
              <input
                style={{ marginRight: "1vw" }}
                type="number"
                min={1}
                value={pageSize}
                onChange={(e) => {
                  const newPageSize = Number(e.target.value);
                  setPageSize(newPageSize);
                }}
              />

              <button
                onClick={() => {
                  setPageSizeSubmit(true);
                  setFinalPageSize(pageSize);
                }}
              >
                Submit
              </button>
            </div>

            {transactions !== null && (
              <Pagination
                itemsPerPage={transactions.data.length}
                onPageChange={async (page: number) => {
                  if (type === "ALL") {
                    await loadAllTransactions({ page });
                  } else if (type === "EMPLOYEE" && employeeId) {
                    await loadTransactionsByEmployee({ page, employeeId });
                  }
                }}
                totalItems={transactions.totalTransactions}
                nextPage={getNextPage()}
                pageSize={finalPageSize}
                disabled={loading}
              />
            )}
          </div>
        )}
      </main>
    </Fragment>
  );
}
