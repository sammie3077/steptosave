import React, { useState, useEffect, useMemo } from 'react';
import { PiggyIcon, PaletteIcon } from './components/Icons';
import { TaskLevel, SavingProject, SavingRecord, ThemeName } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProjectManager } from './hooks/useProjectManager';
import { compressImage, getBase64Size } from './utils/helpers';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { ProjectForm } from './components/ProjectForm';
import { TaskManager } from './components/TaskManager';
import { RecordForm } from './components/RecordForm';
import { ProjectSwitcher } from './components/ProjectSwitcher';
import { ConfirmDialog, ImageCropper } from './components/Shared';

// --- Theme Configurations ---

const THEMES: Record<ThemeName, { primary: string; light: string; dark: string; secondary: string; secondaryDark: string; bg: string; text: string }> = {
  yellow: {
    primary: '#eacaa2',
    light: '#fdf6ec',
    dark: '#c29a70',
    secondary: '#e4b4a1',
    secondaryDark: '#c08a76',
    bg: '#fffefa',
    text: '#5c4a36'
  },
  pink: {
    primary: '#e6c4c4',
    light: '#fcf6f6',
    dark: '#ba8c8c',
    secondary: '#ebddd5',
    secondaryDark: '#bfaea4',
    bg: '#fffcfc',
    text: '#5e4a4a'
  },
  blue: {
    primary: '#859dc0',
    light: '#f0f7fa',
    dark: '#5b7699',
    secondary: '#8fb1b4',
    secondaryDark: '#6a8a8d',
    bg: '#fcfdfd',
    text: '#3a4a5e'
  },
  green: {
    primary: '#c1d7ad',
    light: '#f4f8f2',
    dark: '#90c4b7',
    secondary: '#c2d9d2',
    secondaryDark: '#8ba39c',
    bg: '#fdfffe',
    text: '#4a5e4a'
  },
  purple: {
    primary: '#cab2d1',
    light: '#f8f4f9',
    dark: '#afa8cd',
    secondary: '#e2d9e6',
    secondaryDark: '#988db0',
    bg: '#fdfcff',
    text: '#5e4a5e'
  }
};

// --- Main App Component ---

const App: React.FC = () => {
  // Use custom hooks for state management
  const { data, setData, isSaving } = useLocalStorage();
  const [projects, setProjects] = useState(data.projects);
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>(data.theme || 'pink');

  // Sync projects with localStorage data
  useEffect(() => {
    setData({ projects, theme: currentThemeName });
  }, [projects, currentThemeName, setData]);

  const theme = useMemo(() => THEMES[currentThemeName], [currentThemeName]);

  // Project manager hook
  const projectManager = useProjectManager(projects, setProjects);

  // UI state
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'project-detail' | 'project-form' | 'edit-tasks' | 'record-form'>('home');
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Projects Form state
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectTarget, setProjectTarget] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  // Record Form state
  const [recordAmount, setRecordAmount] = useState('');
  const [recordNote, setRecordNote] = useState('');
  const [recordImage, setRecordImage] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [editRecordId, setEditRecordId] = useState<string | null>(null);

  // Task Form state
  const [taskName, setTaskName] = useState('');
  const [taskAmount, setTaskAmount] = useState('');
  const [taskLevel, setTaskLevel] = useState<TaskLevel>(TaskLevel.BASIC);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  // Image Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Update body background color
  useEffect(() => {
    document.body.style.backgroundColor = theme.bg;
  }, [theme.bg]);

  const activeProject = useMemo(
    () => projects.find(p => p.id === activeProjectId),
    [projects, activeProjectId]
  );

  // --- Handlers ---

  const resetProjectForm = () => {
    setProjectName('');
    setProjectTarget('');
    setProjectDesc('');
    setEditProjectId(null);
  };

  const resetRecordForm = () => {
    setRecordAmount('');
    setRecordNote('');
    setRecordImage(null);
    setEditRecordId(null);
    setSelectedTaskId('');
  };

  const resetTaskForm = () => {
    setTaskName('');
    setTaskAmount('');
    setTaskLevel(TaskLevel.BASIC);
    setEditTaskId(null);
  };

  const handleSaveProject = () => {
    const newProjectId = projectManager.saveProject(
      projectName,
      Number(projectTarget),
      projectDesc,
      editProjectId
    );

    if (newProjectId) {
      setActiveProjectId(newProjectId);
      setView('project-detail');
    } else {
      setView('home');
    }

    resetProjectForm();
  };

  const handleDeleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    setConfirmDialog({
      isOpen: true,
      title: '刪除專案',
      message: `確定要刪除「${project.name}」專案嗎？此操作無法復原，所有相關的任務和成果紀錄都會被刪除。`,
      onConfirm: () => {
        projectManager.deleteProject(id);
        if (activeProjectId === id) {
          setActiveProjectId(null);
          setView('home');
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const handleSaveTask = () => {
    if (!activeProjectId) return;
    projectManager.saveTask(activeProjectId, taskName, Number(taskAmount), taskLevel, editTaskId);
    resetTaskForm();
  };

  const handleDeleteTask = (taskId: string) => {
    const project = projects.find(p => p.id === activeProjectId);
    const task = project?.tasks.find(t => t.id === taskId);
    if (!task) return;

    setConfirmDialog({
      isOpen: true,
      title: '刪除任務',
      message: `確定要刪除「${task.name}」任務嗎？已完成 ${task.completions} 次。`,
      onConfirm: () => {
        if (activeProjectId) {
          projectManager.deleteTask(activeProjectId, taskId);
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const handleSaveAchievement = async () => {
    if (!activeProjectId) return;

    const task = activeProject?.tasks.find(t => t.id === selectedTaskId);
    let finalImage = recordImage;

    // Compress image if it exists and is too large
    if (recordImage) {
      const imageSize = getBase64Size(recordImage);
      if (imageSize > 500) {
        // If larger than 500KB
        try {
          finalImage = await compressImage(recordImage, 800, 800, 0.7);
          const newSize = getBase64Size(finalImage);
          console.log(`Image compressed: ${imageSize.toFixed(0)}KB -> ${newSize.toFixed(0)}KB`);
        } catch (e) {
          console.error('Image compression failed:', e);
        }
      }
    }

    projectManager.saveRecord(
      activeProjectId,
      Number(recordAmount),
      recordNote,
      finalImage,
      selectedTaskId || null,
      task?.name,
      editRecordId
    );

    setView('project-detail');
    resetRecordForm();
  };

  const handleDeleteRecord = (recordId: string) => {
    const project = projects.find(p => p.id === activeProjectId);
    const record = project?.records.find(r => r.id === recordId);
    if (!record) return;

    setConfirmDialog({
      isOpen: true,
      title: '刪除成果',
      message: `確定要刪除此筆金額 $${record.amount} 的成果紀錄嗎？刪除後目前金額將會減少。`,
      onConfirm: () => {
        if (activeProjectId) {
          projectManager.deleteRecord(activeProjectId, recordId);
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setTempImage(event.target?.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.projects) {
          setProjects(json.projects);
          alert('匯入成功！');
        }
      } catch (e) {
        alert('匯入失敗');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ projects }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'step2save-export.json');
    link.click();
  };

  // --- Render ---

  return (
    <div className="max-w-4xl mx-auto min-h-screen p-4 md:p-8 flex flex-col">
      {/* App Header */}
      <header className="mb-6 flex flex-col items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
          <div className="p-3 rounded-2xl shadow-sm bg-white" style={{ color: theme.dark }}>
            <PiggyIcon size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: theme.dark }}>
            Step2Save
          </h1>
        </div>
        {isSaving && (
          <div className="text-xs text-gray-400 mt-2">儲存中...</div>
        )}
      </header>

      {/* Project Quick Access Bar */}
      <ProjectSwitcher
        projects={projects}
        activeProjectId={activeProjectId}
        currentView={view}
        theme={theme}
        onHomeClick={() => setView('home')}
        onProjectClick={id => {
          setActiveProjectId(id);
          setView('project-detail');
        }}
        onNewProject={() => {
          resetProjectForm();
          setView('project-form');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 relative">
        <div className="transition-all duration-300">
          {view === 'home' && (
            <ProjectList
              projects={projects}
              theme={theme}
              onProjectClick={id => {
                setActiveProjectId(id);
                setView('project-detail');
              }}
              onEditProject={p => {
                setEditProjectId(p.id);
                setProjectName(p.name);
                setProjectTarget(p.targetAmount.toString());
                setProjectDesc(p.description);
                setView('project-form');
              }}
              onDeleteProject={handleDeleteProject}
              onNewProject={() => {
                resetProjectForm();
                setView('project-form');
              }}
              onImport={handleImport}
              onExport={handleExport}
            />
          )}

          {view === 'project-form' && (
            <ProjectForm
              theme={theme}
              isEditing={!!editProjectId}
              projectName={projectName}
              projectTarget={projectTarget}
              projectDesc={projectDesc}
              onNameChange={setProjectName}
              onTargetChange={setProjectTarget}
              onDescChange={setProjectDesc}
              onSave={handleSaveProject}
              onCancel={() => setView('home')}
            />
          )}

          {view === 'project-detail' && activeProject && (
            <ProjectDetail
              project={activeProject}
              theme={theme}
              onNewRecord={() => {
                resetRecordForm();
                setView('record-form');
              }}
              onEditTasks={() => setView('edit-tasks')}
              onEditRecord={r => {
                setEditRecordId(r.id);
                setRecordAmount(r.amount.toString());
                setRecordNote(r.note);
                setRecordImage(r.imageUrl || null);
                setSelectedTaskId(r.taskId || '');
                setView('record-form');
              }}
            />
          )}

          {view === 'edit-tasks' && activeProject && (
            <TaskManager
              project={activeProject}
              theme={theme}
              taskName={taskName}
              taskAmount={taskAmount}
              taskLevel={taskLevel}
              editTaskId={editTaskId}
              onTaskNameChange={setTaskName}
              onTaskAmountChange={setTaskAmount}
              onTaskLevelChange={setTaskLevel}
              onSaveTask={handleSaveTask}
              onEditTask={(id, name, amount, level) => {
                setEditTaskId(id);
                setTaskName(name);
                setTaskAmount(amount);
                setTaskLevel(level);
              }}
              onDeleteTask={handleDeleteTask}
              onCancelEdit={resetTaskForm}
              onBack={() => setView('project-detail')}
            />
          )}

          {view === 'record-form' && activeProject && (
            <RecordForm
              project={activeProject}
              theme={theme}
              isEditing={!!editRecordId}
              recordAmount={recordAmount}
              recordNote={recordNote}
              recordImage={recordImage}
              selectedTaskId={selectedTaskId}
              onAmountChange={setRecordAmount}
              onNoteChange={setRecordNote}
              onTaskChange={(taskId, amount) => {
                setSelectedTaskId(taskId);
                if (amount) setRecordAmount(amount);
              }}
              onImageChange={handleFileChange}
              onSave={handleSaveAchievement}
              onDelete={() => {
                if (editRecordId) {
                  handleDeleteRecord(editRecordId);
                  setView('project-detail');
                }
              }}
              onBack={() => setView('project-detail')}
            />
          )}
        </div>
      </main>

      {/* Floating Theme Switcher Button */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setShowThemePicker(true)}
          className="p-4 text-white rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <PaletteIcon size={24} />
        </button>
      </div>

      {/* Theme Picker Modal */}
      {showThemePicker && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowThemePicker(false)}
          ></div>
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 relative shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <h3 className="text-xl font-black text-center mb-6 text-gray-700">更換主題色調</h3>
            <div className="flex justify-center gap-4 flex-wrap">
              {(Object.keys(THEMES) as ThemeName[]).map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setCurrentThemeName(t);
                    setShowThemePicker(false);
                  }}
                  className={`w-12 h-12 rounded-full border-4 transition-all hover:scale-110 ${
                    currentThemeName === t
                      ? 'border-gray-300 ring-4 ring-offset-2 ring-gray-100'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: THEMES[t].primary }}
                  title={t}
                />
              ))}
            </div>
            <button
              onClick={() => setShowThemePicker(false)}
              className="mt-8 w-full py-3 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 transition"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {showCropper && tempImage && (
        <ImageCropper
          src={tempImage}
          theme={theme}
          onCancel={() => setShowCropper(false)}
          onCrop={b64 => {
            setRecordImage(b64);
            setShowCropper(false);
          }}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
        theme={theme}
      />

      {/* Footer */}
      <footer className="mt-16 text-center text-[10px] font-bold text-gray-300 py-8 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Step2Save • Your personal saving journey
      </footer>

    </div>
  );
};

export default App;
