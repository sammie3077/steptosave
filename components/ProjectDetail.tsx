import React, { useMemo } from 'react';
import { SavingProject, SavingRecord } from '../types';
import { PlusIcon, EditIcon, CheckIcon, PiggyIcon } from './Icons';
import { useRecordFilters } from '../hooks/useRecordFilters';
import { RecordFilters } from './RecordFilters';

const ProgressBar: React.FC<{ current: number; total: number; theme: any }> = React.memo(
  ({ current, total, theme }) => {
    const percentage = Math.min(100, Math.floor((current / total) * 100)) || 0;
    return (
      <div className="w-full rounded-full h-4 relative overflow-hidden" style={{ backgroundColor: theme.light }}>
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: theme.primary }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: theme.text }}>
          {percentage}%
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

interface ProjectDetailProps {
  project: SavingProject;
  theme: any;
  onNewRecord: () => void;
  onEditTasks: () => void;
  onEditRecord: (record: SavingRecord) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = React.memo(({
  project,
  theme,
  onNewRecord,
  onEditTasks,
  onEditRecord
}) => {
  // Memoize tasks and records to avoid unnecessary re-renders
  const tasksList = useMemo(() => project.tasks, [project.tasks]);
  const recordsList = useMemo(() => project.records, [project.records]);

  // Use record filters hook
  const {
    filters,
    filteredRecords,
    updateFilter,
    resetFilters,
    hasActiveFilters
  } = useRecordFilters(recordsList);

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 cute-card shadow-sm border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black text-gray-800">{project.name}</h2>
            <p className="text-gray-400 mt-1">{project.description || '持續存錢中...'}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black" style={{ color: theme.dark }}>
              ${project.currentAmount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-300 font-bold uppercase tracking-wider">
              進度：目標 ${project.targetAmount.toLocaleString()}
            </div>
          </div>
        </div>
        <ProgressBar current={project.currentAmount} total={project.targetAmount} theme={theme} />
      </div>

      <div className="flex gap-4">
        <button
          onClick={onNewRecord}
          className="flex-1 py-4 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.02]"
          style={{ backgroundColor: theme.primary }}
        >
          <PlusIcon /> 新增成果
        </button>
        <button
          onClick={onEditTasks}
          className="px-6 py-4 bg-white text-gray-500 border border-gray-100 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm"
        >
          <EditIcon size={20} /> 編輯規則
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-600 px-2">任務進度</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasksList.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400 italic">
              尚未設定存錢規則，點擊上方編輯規則。
            </div>
          ) : (
            tasksList.map(t => (
              <div
                key={t.id}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex justify-between items-center group"
              >
                <div>
                  <div className="font-bold text-gray-700">{t.name}</div>
                  <div className="text-xs text-gray-400 font-bold">每次獎勵 ${t.amount}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black" style={{ color: theme.dark }}>
                    {t.completions} 次
                  </div>
                  <div className="text-[10px] text-gray-300 font-bold uppercase">累計完成</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-600 px-2">存錢腳印 ✨</h3>

        {/* Filter Controls */}
        {recordsList.length > 0 && (
          <RecordFilters
            filters={filters}
            tasks={tasksList}
            theme={theme}
            resultCount={filteredRecords.length}
            totalCount={recordsList.length}
            hasActiveFilters={hasActiveFilters}
            onFilterChange={updateFilter}
            onReset={resetFilters}
          />
        )}

        {recordsList.length === 0 ? (
          <div className="text-center py-12 text-gray-300 italic">還沒留下任何足跡呢。</div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="font-bold mb-2">沒有符合條件的紀錄</p>
            <button
              onClick={resetFilters}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              清除篩選條件
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pb-12">
            {filteredRecords.map(r => (
              <div
                key={r.id}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition hover:shadow-md cursor-pointer flex flex-col"
                onClick={() => onEditRecord(r)}
              >
                {/* Image Section */}
                <div className="relative w-full p-2">
                  {r.imageUrl ? (
                    <img src={r.imageUrl} className="w-full aspect-square object-cover rounded-xl" alt="Achievement" />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-gray-50 text-gray-200 rounded-xl">
                      <PiggyIcon size={48} />
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-3 space-y-2 flex-1 flex flex-col">
                  {r.taskName && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 w-fit">
                      <CheckIcon size={10} />
                      <span className="truncate max-w-[120px]">{r.taskName}</span>
                    </div>
                  )}

                  <div className="text-lg font-black" style={{ color: theme.primary }}>
                    ${r.amount.toLocaleString()}
                  </div>

                  {r.note && <p className="text-xs text-gray-400 line-clamp-2 flex-1">{r.note}</p>}

                  <div className="text-[10px] text-gray-300 font-bold">
                    {new Date(r.date || '').toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ProjectDetail.displayName = 'ProjectDetail';
