import { useState, useMemo } from 'react';
import { SavingRecord } from '../types';

export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export interface FilterState {
  searchText: string;
  selectedTaskId: string;
  dateFrom: string;
  dateTo: string;
  sortBy: SortOption;
}

export function useRecordFilters(records: SavingRecord[]) {
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    selectedTaskId: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date-desc'
  });

  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    // Filter by search text (in note)
    if (filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(r =>
        r.note.toLowerCase().includes(searchLower) ||
        r.taskName?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by task
    if (filters.selectedTaskId) {
      result = result.filter(r => r.taskId === filters.selectedTaskId);
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(r => {
        const recordDate = new Date(r.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate <= toDate;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return result;
  }, [records, filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchText: '',
      selectedTaskId: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date-desc'
    });
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.searchText ||
      filters.selectedTaskId ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.sortBy !== 'date-desc'
    );
  }, [filters]);

  return {
    filters,
    filteredRecords: filteredAndSortedRecords,
    updateFilter,
    resetFilters,
    hasActiveFilters
  };
}
