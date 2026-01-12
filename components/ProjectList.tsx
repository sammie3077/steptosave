import React from 'react';
import { SavingProject } from '../types';
import { EditIcon, TrashIcon, UploadIcon, DownloadIcon } from './Icons';

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

interface ProjectListProps {
  projects: SavingProject[];
  theme: any;
  onProjectClick: (id: string) => void;
  onEditProject: (project: SavingProject) => void;
  onDeleteProject: (id: string) => void;
  onNewProject: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = React.memo(({
  projects,
  theme,
  onProjectClick,
  onEditProject,
  onDeleteProject,
  onNewProject,
  onImport,
  onExport
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: theme.dark }}>
          探索存錢計畫
        </h2>
        <div className="flex gap-2">
          <label className="p-2 bg-white text-gray-400 rounded-xl cursor-pointer hover:text-blue-400 border border-gray-100 transition shadow-sm">
            <UploadIcon size={20} />
            <input type="file" className="hidden" accept=".json" onChange={onImport} />
          </label>
          <button
            onClick={onExport}
            className="p-2 bg-white text-gray-400 rounded-xl hover:text-green-500 border border-gray-100 transition shadow-sm"
          >
            <DownloadIcon size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold mb-4">開始您的第一步吧！</p>
            <button
              onClick={onNewProject}
              className="px-8 py-3 text-white rounded-full font-bold shadow-md transition hover:opacity-90"
              style={{ backgroundColor: theme.primary }}
            >
              建立新專案
            </button>
          </div>
        ) : (
          projects.map(p => (
            <div
              key={p.id}
              onClick={() => onProjectClick(p.id)}
              className="cute-card bg-white p-6 cursor-pointer relative group border border-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black text-gray-700">{p.name}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onEditProject(p);
                    }}
                    className="text-blue-300 hover:text-blue-500"
                  >
                    <EditIcon size={18} />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteProject(p.id);
                    }}
                    className="text-red-300 hover:text-red-500"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4 line-clamp-1">
                {p.description || '加油存錢中...'}
              </p>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span style={{ color: theme.dark }}>已存 ${p.currentAmount.toLocaleString()}</span>
                <span className="text-gray-300">目標 ${p.targetAmount.toLocaleString()}</span>
              </div>
              <ProgressBar current={p.currentAmount} total={p.targetAmount} theme={theme} />
            </div>
          ))
        )}
      </div>
    </div>
  );
});

ProjectList.displayName = 'ProjectList';
