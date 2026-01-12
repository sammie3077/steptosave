import React from 'react';
import { SavingProject } from '../types';
import { PlusIcon } from './Icons';

interface ProjectSwitcherProps {
  projects: SavingProject[];
  activeProjectId: string | null;
  currentView: string;
  theme: any;
  onHomeClick: () => void;
  onProjectClick: (id: string) => void;
  onNewProject: () => void;
}

export const ProjectSwitcher: React.FC<ProjectSwitcherProps> = React.memo(({
  projects,
  activeProjectId,
  currentView,
  theme,
  onHomeClick,
  onProjectClick,
  onNewProject
}) => {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar sticky top-0 z-40 pt-2"
      style={{ backgroundColor: theme.bg + 'dd', backdropFilter: 'blur(8px)' }}
    >
      <button
        onClick={onHomeClick}
        className={`flex-shrink-0 px-4 py-2 rounded-2xl font-bold transition ${
          currentView === 'home' ? 'text-white shadow-sm' : 'bg-white text-gray-400 border border-gray-100'
        }`}
        style={{ backgroundColor: currentView === 'home' ? theme.primary : undefined }}
      >
        首頁
      </button>
      {projects.map(p => (
        <button
          key={p.id}
          onClick={() => onProjectClick(p.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-2xl font-bold transition whitespace-nowrap ${
            activeProjectId === p.id && currentView !== 'home'
              ? 'text-white shadow-sm'
              : 'bg-white text-gray-400 border border-gray-100'
          }`}
          style={{
            backgroundColor:
              activeProjectId === p.id && currentView !== 'home' ? theme.primary : undefined
          }}
        >
          {p.name}
        </button>
      ))}
      <button
        onClick={onNewProject}
        className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white border border-dashed border-gray-200 text-gray-300 flex items-center justify-center hover:border-gray-400 hover:text-gray-500 transition"
      >
        <PlusIcon size={20} />
      </button>
    </div>
  );
});

ProjectSwitcher.displayName = 'ProjectSwitcher';
