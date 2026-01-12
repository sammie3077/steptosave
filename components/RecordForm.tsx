import React from 'react';
import { SavingProject } from '../types';
import { BackIcon, CameraIcon, TrashIcon } from './Icons';

interface RecordFormProps {
  project: SavingProject;
  theme: any;
  isEditing: boolean;
  recordAmount: string;
  recordNote: string;
  recordImage: string | null;
  selectedTaskId: string;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onTaskChange: (taskId: string, taskAmount: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export const RecordForm: React.FC<RecordFormProps> = React.memo(({
  project,
  theme,
  isEditing,
  recordAmount,
  recordNote,
  recordImage,
  selectedTaskId,
  onAmountChange,
  onNoteChange,
  onTaskChange,
  onImageChange,
  onSave,
  onDelete,
  onBack
}) => {
  return (
    <div className="bg-white p-8 cute-card space-y-6 max-w-xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 bg-gray-50 rounded-xl text-gray-400 shadow-sm transition"
        >
          <BackIcon size={20} />
        </button>
        <h2 className="text-2xl font-black text-gray-700">
          {isEditing ? '修改成果紀錄' : '記錄新成果'}
        </h2>
      </div>

      <div className="space-y-5">
        <label className="w-full h-48 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition hover:border-gray-300">
          {recordImage ? (
            <img src={recordImage} className="w-full h-full object-cover" alt="Achievement" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <CameraIcon size={32} className="text-gray-300" />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                點擊上傳照片
              </span>
            </div>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={onImageChange} />
        </label>

        <div>
          <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-wider">
            關聯規則 (選填)
          </label>
          <select
            value={selectedTaskId}
            onChange={e => {
              const task = project.tasks.find(t => t.id === e.target.value);
              onTaskChange(e.target.value, task?.amount.toString() || '');
            }}
            className="w-full px-5 py-4 bg-gray-50 text-gray-700 border-none rounded-2xl outline-none focus:ring-2 transition shadow-sm"
            style={{ '--tw-ring-color': theme.primary } as any}
          >
            <option value="">-- 無關聯規則 --</option>
            {project.tasks.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} (${t.amount})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-wider">
              金額
            </label>
            <input
              type="number"
              value={recordAmount}
              onChange={e => onAmountChange(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 text-gray-700 border-none rounded-2xl outline-none focus:ring-2 transition shadow-sm"
              style={{ '--tw-ring-color': theme.primary } as any}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={onSave}
              className="w-full py-4 text-white rounded-2xl font-black shadow-lg transition hover:opacity-90"
              style={{ backgroundColor: theme.primary }}
            >
              {isEditing ? '更新紀錄' : '確認存入'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-wider">
            心得備註
          </label>
          <textarea
            rows={4}
            value={recordNote}
            onChange={e => onNoteChange(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 text-gray-700 border-none rounded-2xl outline-none focus:ring-2 transition shadow-sm"
            style={{ '--tw-ring-color': theme.primary } as any}
            placeholder="今天又努力了一點，感覺如何呢？"
          />
        </div>

        {isEditing && (
          <button
            onClick={onDelete}
            className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition"
          >
            <TrashIcon size={18} />
            刪除此筆成果紀錄
          </button>
        )}
      </div>
    </div>
  );
});

RecordForm.displayName = 'RecordForm';
