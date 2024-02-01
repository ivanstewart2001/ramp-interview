import React, { MouseEvent, useEffect, useState } from "react";

const Pagination = ({
  totalItems,
  itemsPerPage,
  onPageChange,
  nextPage,
  disabled,
  pageSize,
}: {
  totalItems: number;
  pageSize: number;
  itemsPerPage: number;
  onPageChange: (page: number) => Promise<void>;
  nextPage: number;
  disabled: boolean;
}) => {
  if (pageSize < 1) {
    pageSize = 1;
  } else if (pageSize > totalItems) {
    pageSize = totalItems;
  }

  const totalPages = Math.ceil(totalItems / pageSize);

  const [currentPage, setCurrentPage] = useState(nextPage);
  const [isDisabled, setIsDisabled] = useState(disabled);

  async function handlePageChange(page: number) {
    setIsDisabled(true);

    setCurrentPage(page);
    await onPageChange(page);

    setIsDisabled(false);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        style={{
          marginRight: "10px",
          cursor: `${currentPage === 1 || isDisabled ? "" : "pointer"}`,
        }}
        disabled={!currentPage || currentPage === 1 || isDisabled}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        Previous
      </button>
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          disabled={isDisabled}
          style={{
            border: "1px solid #ccc",
            padding: "5px 10px",
            margin: "0 5px",
            background: currentPage === index + 1 ? "#007bff" : "white",
            color: currentPage === index + 1 ? "white" : "#007bff",
            cursor: `${isDisabled ? "" : "pointer"}`,
          }}
          onClick={() => handlePageChange(index + 1)}
        >
          {index + 1}
        </button>
      ))}
      <button
        style={{
          marginLeft: "10px",
          cursor: `${
            currentPage === totalPages || isDisabled ? "" : "pointer"
          }`,
        }}
        disabled={!currentPage || currentPage === totalPages || isDisabled}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
