import React from 'react';
import { SavingProject, TaskLevel } from '../types';
import { BackIcon, PlusIcon, EditIcon, TrashIcon } from './Icons';

interface TaskManagerProps {
  project: SavingProject;
  theme: any;
  taskName: string;
  taskAmount: string;
  taskLevel: TaskLevel;
  editTaskId: string | null;
  onTaskNameChange: (value: string) => void;
  onTaskAmountChange: (value: string) => void;
  onTaskLevelChange: (value: TaskLevel) => void;
  onSaveTask: () => void;
  onEditTask: (taskId: string, name: string, amount: string, level: TaskLevel) => void;
  onDeleteTask: (taskId: string) => void;
  onCancelEdit: () => void;
  onBack: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = React.memo(({
  project,
  theme,
  taskName,
  taskAmount,
  taskLevel,
  editTaskId,
  onTaskNameChange,
  onTaskAmountChange,
  onTaskLevelChange,
  onSaveTask,
  onEditTask,
  onDeleteTask,
  onCancelEdit,
  onBack
}) => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="p-2 bg-white rounded-xl text-gray-400 hover:text-gray-600 shadow-sm transition"
        >
          <BackIcon size={20} />
        </button>
        <h2 className="text-2xl font-black text-gray-700">管理存錢規則</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-50 space-y-4">
        <h3 className="font-black text-gray-500 flex items-center gap-2">
          {editTaskId ? <EditIcon size={18} /> : <PlusIcon size={18} />}
          {editTaskId ? '修改現有規則' : '建立新規則'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="規則名稱 (如：少喝一杯咖啡)"
            value={taskName}
            onChange={e => onTaskNameChange(e.target.value)}
            className="px-4 py-3 bg-gray-50 text-gray-700 rounded-xl border-none outline-none focus:ring-2"
            style={{ '--tw-ring-color': theme.primary } as any}
          />
          <input
            type="number"
            placeholder="獎勵金額"
            value={taskAmount}
            onChange={e => onTaskAmountChange(e.target.value)}
            className="px-4 py-3 bg-gray-50 text-gray-700 rounded-xl border-none outline-none focus:ring-2"
            style={{ '--tw-ring-color': theme.primary } as any}
          />
          <select
            value={taskLevel}
            onChange={e => onTaskLevelChange(e.target.value as TaskLevel)}
            className="px-4 py-3 bg-gray-50 text-gray-700 rounded-xl border-none outline-none focus:ring-2"
            style={{ '--tw-ring-color': theme.primary } as any}
          >
            {Object.values(TaskLevel).map(l => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={onSaveTask}
              className="flex-1 py-3 text-white rounded-xl font-black shadow-md transition hover:opacity-90"
              style={{ backgroundColor: theme.primary }}
            >
              {editTaskId ? '更新規則' : '新增規則'}
            </button>
            {editTaskId && (
              <button
                onClick={onCancelEdit}
                className="px-4 bg-gray-100 text-gray-500 rounded-xl font-bold"
              >
                取消
              </button>
            )}
          </div>
        </div>
      </div>

      {Object.values(TaskLevel).map(level => {
        const tasks = project.tasks.filter(t => t.level === level);
        return (
          <div key={level} className="space-y-3">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">{level}</h4>
            <div className="grid grid-cols-1 gap-3">
              {tasks.length === 0 ? (
                <div className="text-xs text-gray-300 italic px-2">此類別尚無規則</div>
              ) : (
                tasks.map(t => (
                  <div
                    key={t.id}
                    className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center group border border-gray-50"
                  >
                    <div>
                      <div className="font-black text-gray-700">{t.name}</div>
                      <div className="text-xs text-gray-400 font-bold">金額：${t.amount}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditTask(t.id, t.name, t.amount.toString(), t.level)}
                        className="p-2 text-blue-300 hover:bg-blue-50 rounded-xl transition"
                      >
                        <EditIcon size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="p-2 text-red-300 hover:bg-red-50 rounded-xl transition"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

TaskManager.displayName = 'TaskManager';
