import React from 'react';
import { SavingTask } from '../types';
import { FilterState, SortOption } from '../hooks/useRecordFilters';

interface RecordFiltersProps {
  filters: FilterState;
  tasks: SavingTask[];
  theme: any;
  resultCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
}

export const RecordFilters: React.FC<RecordFiltersProps> = React.memo(({
  filters,
  tasks,
  theme,
  resultCount,
  totalCount,
  hasActiveFilters,
  onFilterChange,
  onReset
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-black text-gray-600 uppercase tracking-wider">
          篩選與排序
        </h4>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition"
          >
            清除篩選
          </button>
        )}
      </div>

      {/* Results Count */}
      {hasActiveFilters && (
        <div className="text-xs text-gray-400 font-bold">
          顯示 {resultCount} / {totalCount} 筆紀錄
        </div>
      )}

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Text */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1.5">搜尋</label>
          <input
            type="text"
            placeholder="搜尋備註或任務..."
            value={filters.searchText}
            onChange={e => onFilterChange('searchText', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 text-gray-700 text-sm border-none rounded-xl outline-none focus:ring-2 transition"
            style={{ '--tw-ring-color': theme.primary } as any}
          />
        </div>

        {/* Task Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1.5">任務</label>
          <select
            value={filters.selectedTaskId}
            onChange={e => onFilterChange('selectedTaskId', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 text-gray-700 text-sm border-none rounded-xl outline-none focus:ring-2 transition"
            style={{ '--tw-ring-color': theme.primary } as any}
          >
            <option value="">全部任務</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1.5">開始日期</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => onFilterChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 text-gray-700 text-sm border-none rounded-xl outline-none focus:ring-2 transition"
            style={{ '--tw-ring-color': theme.primary } as any}
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1.5">結束日期</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => onFilterChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 text-gray-700 text-sm border-none rounded-xl outline-none focus:ring-2 transition"
            style={{ '--tw-ring-color': theme.primary } as any}
          />
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-2">排序方式</label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'date-desc', label: '日期 (新→舊)' },
            { value: 'date-asc', label: '日期 (舊→新)' },
            { value: 'amount-desc', label: '金額 (高→低)' },
            { value: 'amount-asc', label: '金額 (低→高)' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => onFilterChange('sortBy', option.value as SortOption)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filters.sortBy === option.value
                  ? 'text-white shadow-sm'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
              style={{
                backgroundColor:
                  filters.sortBy === option.value ? theme.primary : undefined
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

RecordFilters.displayName = 'RecordFilters';
