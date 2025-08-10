'use client';

import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const getVisiblePages = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

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
      <Button
        variant="outline"
        size="sm"
        asChild={hasPrev}
        disabled={!hasPrev}
        className="flex items-center gap-2"
      >
        {hasPrev ? (
          <a href={createPageUrl(currentPage - 1)}>
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </a>
        ) : (
          <span>
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </span>
        )}
      </Button>

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
            <Button
              key={pageNumber}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              asChild={!isActive}
              className="min-w-[40px]"
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive ? (
                <span>{pageNumber}</span>
              ) : (
                <a href={createPageUrl(pageNumber)}>{pageNumber}</a>
              )}
            </Button>
          );
        })}
      </div>

      {/* Bouton Suivant */}
      <Button
        variant="outline"
        size="sm"
        asChild={hasNext}
        disabled={!hasNext}
        className="flex items-center gap-2"
      >
        {hasNext ? (
          <a href={createPageUrl(currentPage + 1)}>
            Suivant
            <ChevronRight className="w-4 h-4" />
          </a>
        ) : (
          <span>
            Suivant
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </Button>

      {/* Informations de pagination */}
      <div className="hidden sm:flex items-center text-sm text-muted-foreground ml-4">
        Page {currentPage} sur {totalPages}
      </div>
    </nav>
  );
}