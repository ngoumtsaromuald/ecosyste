'use client';

import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function Pagination({ currentPage, totalPages, hasNext, hasPrev }: PaginationProps) {
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `/?${params.toString()}`;
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <nav className="flex items-center justify-center space-x-2" aria-label="Pagination">
      {/* Bouton Précédent */}
      <a
        href={hasPrev ? createPageUrl(currentPage - 1) : '#'}
        className={`
          flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors
          ${
            hasPrev
              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
          }
        `}
        aria-disabled={!hasPrev}
      >
        <ChevronLeft className="w-4 h-4" />
        Précédent
      </a>

      {/* Numéros de page */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <a
              key={pageNumber}
              href={createPageUrl(pageNumber)}
              className={`
                px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber}
            </a>
          );
        })}
      </div>

      {/* Bouton Suivant */}
      <a
        href={hasNext ? createPageUrl(currentPage + 1) : '#'}
        className={`
          flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors
          ${
            hasNext
              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
          }
        `}
        aria-disabled={!hasNext}
      >
        Suivant
        <ChevronRight className="w-4 h-4" />
      </a>

      {/* Informations de pagination */}
      <div className="hidden sm:flex items-center text-sm text-gray-600 ml-4">
        Page {currentPage} sur {totalPages}
      </div>
    </nav>
  );
}