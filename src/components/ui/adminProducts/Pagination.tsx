import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getVisiblePages = () => {
    const visiblePages = [];
    const range = 2; // Количество отображаемых страниц вокруг текущей

    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);

    if (currentPage - range <= 1) end = Math.min(totalPages, 1 + range * 2);
    if (currentPage + range >= totalPages) start = Math.max(1, totalPages - range * 2);

    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }

    if (start > 1) visiblePages.unshift(1);
    if (end < totalPages) visiblePages.push(totalPages);

    return visiblePages;
  };

  const handlePageChange = (page: number) => {
    onPageChange(page);
    scrollToTop();
  };

  const handlePrevious = () => {
    handlePageChange(Math.max(1, currentPage - 1));
  };

  const handleNext = () => {
    handlePageChange(Math.min(totalPages, currentPage + 1));
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
        >
          Попередня
        </button>

        <div className="flex gap-1">
          {getVisiblePages().map((page, index, arr) => (
            <React.Fragment key={page}>
              {index > 0 && arr[index] - arr[index - 1] > 1 && (
                <span className="px-3 py-2">...</span>
              )}
              <button
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
              >
                {page}
              </button>
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
        >
          Наступна
        </button>
      </div>

      <span className="text-sm text-gray-600">
        Сторінка {currentPage} з {totalPages}
      </span>
    </div>
  );
};
