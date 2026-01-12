import React from 'react';

interface ProjectFormProps {
  theme: any;
  isEditing: boolean;
  projectName: string;
  projectTarget: string;
  projectDesc: string;
  onNameChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onDescChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = React.memo(({
  theme,
  isEditing,
  projectName,
  projectTarget,
  projectDesc,
  onNameChange,
  onTargetChange,
  onDescChange,
  onSave,
  onCancel
}) => {
  return (
    <div className="bg-white p-8 cute-card space-y-6 max-w-xl mx-auto shadow-xl">
      <h2 className="text-2xl font-black text-center" style={{ color: theme.dark }}>
        {isEditing ? '編輯存錢專案' : '建立新專案'}
      </h2>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">計畫名稱</label>
          <input
            type="text"
            value={projectName}
            onChange={e => onNameChange(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 text-gray-700 border-none rounded-2xl outline-none focus:ring-2 transition"
            style={{ '--tw-ring-color': theme.primary } as any}
            placeholder="例如：日本旅遊、買新的相機"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">目標金額</label>
          <input
            type="number"
            value={projectTarget}
            onChange={e => onTargetChange(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 text-gray-700 border-none rounded-2xl outline-none focus:ring-2 transition"
            style={{ '--tw-ring-color': theme.primary } as any}
            placeholder="請輸入數字"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">計畫描述</label>
          <textarea
            rows={4}
            value={projectDesc}
            onChange={e => onDescChange(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 text-gray-700 border-none rounded-2xl outline-none focus:ring-2 transition"
            style={{ '--tw-ring-color': theme.primary } as any}
            placeholder="寫下你的目標，更有動力！"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            onClick={onCancel}
            className="py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold transition hover:bg-gray-100"
          >
            取消
          </button>
          <button
            onClick={onSave}
            className="py-4 text-white rounded-2xl font-black shadow-lg transition hover:opacity-90"
            style={{ backgroundColor: theme.primary }}
          >
            確認保存
          </button>
        </div>
      </div>
    </div>
  );
});

ProjectForm.displayName = 'ProjectForm';
