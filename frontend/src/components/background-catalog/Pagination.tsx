import React, { useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const PAGE_GROUP_SIZE = 3; // Setiap grup berisi 3 halaman
  const [currentGroup, setCurrentGroup] = useState(0);

  // Hitung total grup
  const totalGroups = Math.ceil(totalPages / PAGE_GROUP_SIZE);
  
  // Generate page numbers untuk grup saat ini
  const getPageNumbers = () => {
    const startPage = currentGroup * PAGE_GROUP_SIZE + 1;
    const endPage = Math.min((currentGroup + 1) * PAGE_GROUP_SIZE, totalPages);
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const handleEllipsisClick = () => {
    if (currentGroup < totalGroups - 1) {
      setCurrentGroup(currentGroup + 1);
      const nextPage = (currentGroup + 1) * PAGE_GROUP_SIZE + 1;
      onPageChange(nextPage);
    }
  };

  const showEllipsis = currentGroup < totalGroups - 1;

  return (
    <div className="w-full flex justify-center mt-8">
      <div className="flex items-center gap-4 font-bold">
        {/* Previous page arrow button */}
        <button
          className="bg-none border-none text-black cursor-pointer text-xl font-normal disabled:opacity-50"
          onClick={() => {
            if (currentPage === 1) return;
            if (currentPage - 1 <= currentGroup * PAGE_GROUP_SIZE) {
              setCurrentGroup(currentGroup - 1);
            }
            onPageChange(currentPage - 1);
          }}
          disabled={currentPage === 1}
        >
          &lt;
        </button>

        {/* Display page numbers */}
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`cursor-pointer text-base font-semibold px-0 w-10 h-10 flex items-center justify-center transition-colors duration-300 
              ${page === currentPage 
                ? "bg-black text-white rounded-full" 
                : "bg-none text-black hover:bg-gray-100 rounded-full"
              }`}
          >
            {page}
          </button>
        ))}

        {/* Ellipsis button */}
        {showEllipsis && (
          <button
            onClick={handleEllipsisClick}
            className="cursor-pointer text-base font-semibold px-0 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full"
          >
            ...
          </button>
        )}

        {/* Next page arrow button */}
        <button
          className="bg-none border-none text-black cursor-pointer text-xl font-normal disabled:opacity-50"
          onClick={() => {
            if (currentPage === totalPages) return;
            if (currentPage + 1 > (currentGroup + 1) * PAGE_GROUP_SIZE) {
              setCurrentGroup(currentGroup + 1);
            }
            onPageChange(currentPage + 1);
          }}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;