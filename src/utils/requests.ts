import {
  PaginatedRequestParams,
  PaginatedResponse,
  RequestByEmployeeParams,
  SetTransactionApprovalParams,
  Transaction,
  Employee,
  PaginatedEmployeeRequestParams,
} from "./types";
import mockData from "../mock-data.json";

// export const TRANSACTIONS_PER_PAGE = 5

const data: { employees: Employee[]; transactions: Transaction[] } = {
  employees: mockData.employees,
  transactions: mockData.transactions,
};

export const getEmployees = (): Employee[] => data.employees;

export const getTransactionsPaginated = ({
  page,
  pageSize,
}: PaginatedRequestParams): PaginatedResponse<Transaction[]> => {
  if (page === null) {
    throw new Error("Page cannot be null");
  }

  const start = page * pageSize;
  const end = start + pageSize;

  if (start > data.transactions.length) {
    throw new Error(`Invalid page ${page}`);
  }

  const nextPage = end < data.transactions.length ? page + 1 : null;

  const totalTransactions = getTotalNumberOfTransactions();

  return {
    nextPage,
    data: data.transactions.slice(start, end),
    totalTransactions,
  };
};

export const getTransactionsByEmployee = ({
  page,
  employeeId,
  pageSize,
}: PaginatedEmployeeRequestParams): PaginatedResponse<Transaction[]> => {
  if (!employeeId) {
    throw new Error("Employee id cannot be empty");
  }

  if (page === null) {
    throw new Error("Page cannot be null");
  }

  const start = page * pageSize;
  const end = start + pageSize;

  const employeeTransactions = data.transactions.filter(
    (transaction) => transaction.employee.id === employeeId
  );

  if (start > employeeTransactions.length) {
    throw new Error(`Invalid page ${page}`);
  }

  const nextPage = end < employeeTransactions.length ? page + 1 : null;

  const totalTransactions = getTotalNumberOfTransactions({ employeeId });

  return {
    nextPage,
    data: employeeTransactions.slice(start, end),
    totalTransactions,
  };
};

export const setTransactionApproval = ({
  transactionId,
  value,
}: SetTransactionApprovalParams): void => {
  const transaction = data.transactions.find(
    (currentTransaction) => currentTransaction.id === transactionId
  );

  if (!transaction) {
    throw new Error("Invalid transaction to approve");
  }

  transaction.approved = value;
};

export const getTotalNumberOfTransactions = (
  employee?: RequestByEmployeeParams
) => {
  if (!employee) {
    const totalTransactions = data.transactions.length;
    return totalTransactions;
  } else {
    const transactionsBySpecificUser = data.transactions.filter(
      (transaction) => transaction.employee.id === employee.employeeId
    );
    const totalTransactionsBySpecificUser = transactionsBySpecificUser.length;
    return totalTransactionsBySpecificUser;
  }
};
