
import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusIcon, TrashIcon, EditIcon, CheckIcon, BackIcon, 
  CameraIcon, DownloadIcon, UploadIcon, PiggyIcon, PaletteIcon 
} from './components/Icons';
import { TaskLevel, SavingTask, SavingRecord, SavingProject, AppData, ThemeName } from './types';

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

// --- Shared Helper Components ---

const ProgressBar: React.FC<{ current: number; total: number; theme: any }> = ({ current, total, theme }) => {
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
};

const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme: any;
}> = ({ isOpen, title, message, onConfirm, onCancel, theme }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-50">
            <TrashIcon size={24} className="text-red-500" />
          </div>
          <h3 className="text-lg font-black" style={{ color: theme.dark }}>{title}</h3>
        </div>
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="py-3 px-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="py-3 px-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition shadow-lg"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
};

const ImageCropper: React.FC<{ 
  src: string; 
  onCrop: (base64: string) => void; 
  onCancel: () => void;
  theme: any;
}> = ({ src, onCrop, onCancel, theme }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (x: number, y: number) => {
    setIsDragging(true);
    setLastPos({ x, y });
  };

  const handleDragMove = (x: number, y: number) => {
    if (!isDragging) return;
    const dx = x - lastPos.x;
    const dy = y - lastPos.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPos({ x, y });
  };

  const handleDragEnd = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 4));
  };

  const handleCrop = () => {
    if (!canvasRef.current || !imgRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    const container = containerRef.current;

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Calculate source coordinates based on what is visible in the container square
    const sxRatio = (containerRect.left - imgRect.left) / imgRect.width;
    const syRatio = (containerRect.top - imgRect.top) / imgRect.height;
    const swRatio = containerRect.width / imgRect.width;
    const shRatio = containerRect.height / imgRect.height;

    const sx = sxRatio * img.naturalWidth;
    const sy = syRatio * img.naturalHeight;
    const sw = swRatio * img.naturalWidth;
    const sh = shRatio * img.naturalHeight;

    // Set canvas size to match the cropped area's original aspect ratio
    // Use high resolution while maintaining aspect ratio
    const maxSize = 1080;
    const aspectRatio = sw / sh;

    if (aspectRatio > 1) {
      // Landscape
      canvas.width = maxSize;
      canvas.height = maxSize / aspectRatio;
    } else {
      // Portrait or square
      canvas.width = maxSize * aspectRatio;
      canvas.height = maxSize;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    // Use high quality JPEG
    onCrop(canvas.toDataURL('image/jpeg', 0.95));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 select-none">
      <div className="bg-white p-6 rounded-3xl w-full max-w-md flex flex-col gap-6 shadow-2xl">
        <h3 className="text-center font-black text-lg" style={{ color: theme.dark }}>裁切與調整</h3>
        
        {/* Cropping Area */}
        <div 
          ref={containerRef}
          className="relative aspect-square w-full rounded-2xl bg-gray-100 overflow-hidden cursor-move touch-none flex items-center justify-center border-2 border-dashed border-gray-200"
          onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onWheel={handleWheel}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleDragEnd}
        >
          <img
            ref={imgRef}
            src={src}
            draggable={false}
            className="max-w-none transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              width: 'auto',
              height: 'auto',
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'contain'
            }}
            alt="To crop"
          />
          {/* Overlay Grid */}
          <div className="absolute inset-0 pointer-events-none border-2 border-white/50 flex">
            <div className="w-1/3 h-full border-r border-white/20"></div>
            <div className="w-1/3 h-full border-r border-white/20"></div>
          </div>
          <div className="absolute inset-0 pointer-events-none flex flex-col">
            <div className="h-1/3 w-full border-b border-white/20"></div>
            <div className="h-1/3 w-full border-b border-white/20"></div>
          </div>
        </div>

        {/* Zoom Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-gray-400">
            <span>縮小</span>
            <span>放大縮放 ({zoom.toFixed(1)}x)</span>
          </div>
          <input 
            type="range" min="0.5" max="4" step="0.1" value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-current"
            style={{ color: theme.primary }}
          />
        </div>

        <canvas ref={canvasRef} className="hidden" />
        
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="py-3 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 transition">取消</button>
          <button onClick={handleCrop} className="py-3 text-white rounded-2xl font-black shadow-lg hover:opacity-90 transition" style={{ backgroundColor: theme.primary }}>確認裁切</button>
        </div>
      </div>
      <p className="mt-4 text-white/50 text-xs font-bold text-center">可使用手指拖動調整位置，<br/>使用滑鼠滾輪或拉桿縮放</p>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [projects, setProjects] = useState<SavingProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'project-detail' | 'project-form' | 'edit-tasks' | 'record-form'>('home');
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>('pink');
  const [showThemePicker, setShowThemePicker] = useState(false);

  const theme = THEMES[currentThemeName];

  // Projects Form state
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectTarget, setProjectTarget] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  // Achievement (Record) Form state
  const [recordAmount, setRecordAmount] = useState('');
  const [recordNote, setRecordNote] = useState('');
  const [recordImage, setRecordImage] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [editRecordId, setEditRecordId] = useState<string | null>(null);

  // Task Form state
  const [showTaskForm, setShowTaskForm] = useState(false);
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

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('step2save_data');
    if (saved) {
      try {
        const parsed: AppData = JSON.parse(saved);
        setProjects(parsed.projects || []);
        if (parsed.theme) setCurrentThemeName(parsed.theme);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('step2save_data', JSON.stringify({ projects, theme: currentThemeName }));
    document.body.style.backgroundColor = theme.bg;
  }, [projects, currentThemeName, theme.bg]);

  // Version check, Service Worker cleanup, and auto-reload on update
  useEffect(() => {
    // 1. Unregister all Service Workers (PWA cleanup)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister().then(() => {
            console.log('Service Worker unregistered for fresh content');
          });
        });
      });
    }

    // 2. Clear all caches on mount
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    // 3. Check for updates every 5 minutes
    const checkForUpdates = () => {
      fetch('/index.html', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      }).catch(() => {
        // Silent fail - network might be down
      });
    };

    const intervalId = setInterval(checkForUpdates, 5 * 60 * 1000);

    // Initial check
    checkForUpdates();

    return () => clearInterval(intervalId);
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId);

  // --- Handlers ---

  const handleSaveProject = () => {
    if (!projectName.trim() || !projectTarget) return;
    const id = editProjectId || crypto.randomUUID();
    if (editProjectId) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: projectName, targetAmount: Number(projectTarget), description: projectDesc } : p));
    } else {
      const newP: SavingProject = {
        id, name: projectName, targetAmount: Number(projectTarget), description: projectDesc,
        currentAmount: 0, tasks: [], records: [], createdAt: new Date().toISOString()
      };
      setProjects(prev => [...prev, newP]);
      setActiveProjectId(id);
    }
    setView(editProjectId ? 'home' : 'project-detail');
    resetProjectForm();
  };

  const resetProjectForm = () => {
    setProjectName(''); setProjectTarget(''); setProjectDesc(''); setEditProjectId(null);
  };

  const handleDeleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    setConfirmDialog({
      isOpen: true,
      title: '刪除專案',
      message: `確定要刪除「${project.name}」專案嗎？此操作無法復原，所有相關的任務和成果紀錄都會被刪除。`,
      onConfirm: () => {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (activeProjectId === id) {
          setActiveProjectId(null);
          setView('home');
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const handleSaveTask = () => {
    if (!taskName.trim() || !taskAmount || !activeProjectId) return;
    const id = editTaskId || crypto.randomUUID();
    setProjects(prev => prev.map(p => {
      if (p.id !== activeProjectId) return p;
      const tasks = editTaskId 
        ? p.tasks.map(t => t.id === id ? { ...t, name: taskName, amount: Number(taskAmount), level: taskLevel } : t)
        : [...p.tasks, { id, name: taskName, amount: Number(taskAmount), level: taskLevel, completions: 0 }];
      return { ...p, tasks };
    }));
    setTaskName(''); setTaskAmount(''); setEditTaskId(null); setShowTaskForm(false);
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
        setProjects(prev => prev.map(p => {
          if (p.id !== activeProjectId) return p;
          return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
        }));
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const handleSaveAchievement = () => {
    if (!recordAmount || !activeProjectId) return;
    const id = editRecordId || crypto.randomUUID();
    const task = activeProject?.tasks.find(t => t.id === selectedTaskId);
    const amtNum = Number(recordAmount);

    setProjects(prev => prev.map(p => {
      if (p.id !== activeProjectId) return p;
      let updatedRecords;
      let diff = amtNum;
      
      if (editRecordId) {
        const old = p.records.find(r => r.id === editRecordId);
        diff = amtNum - (old?.amount || 0);
        updatedRecords = p.records.map(r => r.id === editRecordId ? { ...r, amount: amtNum, note: recordNote, imageUrl: recordImage || undefined, taskId: selectedTaskId || undefined, taskName: task?.name || undefined } : r);
      } else {
        updatedRecords = [{ id, amount: amtNum, note: recordNote, imageUrl: recordImage || undefined, taskId: selectedTaskId || undefined, taskName: task?.name || undefined, date: new Date().toISOString() }, ...p.records];
      }

      const tasks = p.tasks.map(t => {
        if (!editRecordId && t.id === selectedTaskId) return { ...t, completions: t.completions + 1 };
        return t;
      });

      return { ...p, currentAmount: p.currentAmount + diff, records: updatedRecords, tasks };
    }));
    setView('project-detail');
    resetRecordForm();
  };

  const resetRecordForm = () => {
    setRecordAmount(''); setRecordNote(''); setRecordImage(null); setEditRecordId(null); setSelectedTaskId('');
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
        setProjects(prev => prev.map(p => {
          if (p.id !== activeProjectId) return p;
          const rec = p.records.find(r => r.id === recordId);
          if (!rec) return p;
          return {
            ...p,
            currentAmount: p.currentAmount - rec.amount,
            records: p.records.filter(r => r.id !== recordId),
            tasks: rec.taskId ? p.tasks.map(t => t.id === rec.taskId ? { ...t, completions: Math.max(0, t.completions - 1) } : t) : p.tasks
          };
        }));
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImage(event.target?.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- View Rendering Logic (Functions, not Components, to avoid focus bug) ---

  const renderTopProjectSwitcher = () => (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar sticky top-0 z-40 pt-2" style={{ backgroundColor: theme.bg + 'dd', backdropFilter: 'blur(8px)' }}>
      <button 
        onClick={() => setView('home')}
        className={`flex-shrink-0 px-4 py-2 rounded-2xl font-bold transition ${view === 'home' ? 'text-white shadow-sm' : 'bg-white text-gray-400 border border-gray-100'}`}
        style={{ backgroundColor: view === 'home' ? theme.primary : undefined }}
      >
        首頁
      </button>
      {projects.map(p => (
        <button 
          key={p.id}
          onClick={() => { setActiveProjectId(p.id); setView('project-detail'); }}
          className={`flex-shrink-0 px-4 py-2 rounded-2xl font-bold transition whitespace-nowrap ${activeProjectId === p.id && view !== 'home' ? 'text-white shadow-sm' : 'bg-white text-gray-400 border border-gray-100'}`}
          style={{ backgroundColor: (activeProjectId === p.id && view !== 'home') ? theme.primary : undefined }}
        >
          {p.name}
        </button>
      ))}
      <button 
        onClick={() => { resetProjectForm(); setView('project-form'); }}
        className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white border border-dashed border-gray-200 text-gray-300 flex items-center justify-center hover:border-gray-400 hover:text-gray-500 transition"
      >
        <PlusIcon size={20} />
      </button>
    </div>
  );

  const renderHomeView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: theme.dark }}>
           探索存錢計畫
        </h2>
        <div className="flex gap-2">
          <label className="p-2 bg-white text-gray-400 rounded-xl cursor-pointer hover:text-blue-400 border border-gray-100 transition shadow-sm">
            <UploadIcon size={20} />
            <input type="file" className="hidden" accept=".json" onChange={(e) => {
               const file = e.target.files?.[0]; if (!file) return;
               const reader = new FileReader();
               reader.onload = (ev) => { try { const json = JSON.parse(ev.target?.result as string); if (json.projects) { setProjects(json.projects); alert('匯入成功！'); } } catch (e) { alert('匯入失敗'); } };
               reader.readAsText(file);
            }} />
          </label>
          <button onClick={() => {
            const dataStr = JSON.stringify({ projects }, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const link = document.createElement('a'); link.setAttribute('href', dataUri); link.setAttribute('download', 'step2save-export.json'); link.click();
          }} className="p-2 bg-white text-gray-400 rounded-xl hover:text-green-500 border border-gray-100 transition shadow-sm">
            <DownloadIcon size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold mb-4">開始您的第一步吧！</p>
            <button 
              onClick={() => { resetProjectForm(); setView('project-form'); }}
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
              onClick={() => { setActiveProjectId(p.id); setView('project-detail'); }}
              className="cute-card bg-white p-6 cursor-pointer relative group border border-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black text-gray-700">{p.name}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={(e) => { e.stopPropagation(); setEditProjectId(p.id); setProjectName(p.name); setProjectTarget(p.targetAmount.toString()); setProjectDesc(p.description); setView('project-form'); }} className="text-blue-300 hover:text-blue-500"><EditIcon size={18} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }} className="text-red-300 hover:text-red-500"><TrashIcon size={18} /></button>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4 line-clamp-1">{p.description || "加油存錢中..."}</p>
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

  const renderProjectFormView = () => (
    <div className="bg-white p-8 cute-card space-y-6 max-w-xl mx-auto shadow-xl">
      <h2 className="text-2xl font-black text-center" style={{ color: theme.dark }}>{editProjectId ? '編輯存錢專案' : '建立新專案'}</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2">計畫名稱</label>
          <input 
            type="text" 
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
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
            onChange={e => setProjectTarget(e.target.value)}
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
            onChange={e => setProjectDesc(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 text-gray-700 border-none rounded-2xl outline-none focus:ring-2 transition"
            style={{ '--tw-ring-color': theme.primary } as any}
            placeholder="寫下你的目標，更有動力！"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button onClick={() => setView('home')} className="py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold transition hover:bg-gray-100">取消</button>
          <button onClick={handleSaveProject} className="py-4 text-white rounded-2xl font-black shadow-lg transition hover:opacity-90" style={{ backgroundColor: theme.primary }}>確認保存</button>
        </div>
      </div>
    </div>
  );

  const renderProjectDetailView = () => {
    if (!activeProject) return null;
    return (
      <div className="space-y-8">
        <div className="bg-white p-8 cute-card shadow-sm border border-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-black text-gray-800">{activeProject.name}</h2>
              <p className="text-gray-400 mt-1">{activeProject.description || "持續存錢中..."}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black" style={{ color: theme.dark }}>${activeProject.currentAmount.toLocaleString()}</div>
              <div className="text-xs text-gray-300 font-bold uppercase tracking-wider">進度：目標 ${activeProject.targetAmount.toLocaleString()}</div>
            </div>
          </div>
          <ProgressBar current={activeProject.currentAmount} total={activeProject.targetAmount} theme={theme} />
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => { resetRecordForm(); setView('record-form'); }}
            className="flex-1 py-4 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.02]"
            style={{ backgroundColor: theme.primary }}
          >
            <PlusIcon /> 新增成果
          </button>
          <button 
            onClick={() => setView('edit-tasks')}
            className="px-6 py-4 bg-white text-gray-500 border border-gray-100 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm"
          >
            <EditIcon size={20} /> 編輯規則
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-black text-gray-600 px-2">任務進度</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProject.tasks.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-400 italic">尚未設定存錢規則，點擊上方編輯規則。</div>
            ) : (
              activeProject.tasks.map(t => (
                <div key={t.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex justify-between items-center group">
                  <div>
                    <div className="font-bold text-gray-700">{t.name}</div>
                    <div className="text-xs text-gray-400 font-bold">每次獎勵 ${t.amount}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black" style={{ color: theme.dark }}>{t.completions} 次</div>
                    <div className="text-[10px] text-gray-300 font-bold uppercase">累計完成</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-black text-gray-600 px-2">存錢腳印 ✨</h3>
          {activeProject.records.length === 0 ? (
            <div className="text-center py-12 text-gray-300 italic">還沒留下任何足跡呢。</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pb-12">
              {activeProject.records.map(r => (
                <div
                  key={r.id}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition hover:shadow-md cursor-pointer flex flex-col"
                  onClick={() => editRecord(r)}
                >
                  {/* Image Section - Top Half */}
                  <div className="relative w-full p-2">
                    {r.imageUrl ? (
                      <img src={r.imageUrl} className="w-full aspect-square object-cover rounded-xl" alt="Achievement" />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center bg-gray-50 text-gray-200 rounded-xl">
                        <PiggyIcon size={48} />
                      </div>
                    )}
                  </div>

                  {/* Info Section - Bottom Half */}
                  <div className="p-3 space-y-2 flex-1 flex flex-col">
                    {/* Task Tag */}
                    {r.taskName && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 w-fit">
                        <CheckIcon size={10} />
                        <span className="truncate max-w-[120px]">{r.taskName}</span>
                      </div>
                    )}

                    {/* Amount */}
                    <div className="text-lg font-black" style={{ color: theme.primary }}>
                      ${r.amount.toLocaleString()}
                    </div>

                    {/* Note */}
                    {r.note && (
                      <p className="text-xs text-gray-400 line-clamp-2 flex-1">{r.note}</p>
                    )}

                    {/* Date */}
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
  };

  const renderEditTasksView = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setView('project-detail')} className="p-2 bg-white rounded-xl text-gray-400 hover:text-gray-600 shadow-sm transition"><BackIcon size={20}/></button>
        <h2 className="text-2xl font-black text-gray-700">管理存錢規則</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-50 space-y-4">
        <h3 className="font-black text-gray-500 flex items-center gap-2">
          {editTaskId ? <EditIcon size={18}/> : <PlusIcon size={18}/>}
          {editTaskId ? '修改現有規則' : '建立新規則'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" placeholder="規則名稱 (如：少喝一杯咖啡)" value={taskName}
            onChange={e => setTaskName(e.target.value)}
            className="px-4 py-3 bg-gray-50 text-gray-700 rounded-xl border-none outline-none focus:ring-2"
            style={{ '--tw-ring-color': theme.primary } as any}
          />
          <input 
            type="number" placeholder="獎勵金額" value={taskAmount}
            onChange={e => setTaskAmount(e.target.value)}
            className="px-4 py-3 bg-gray-50 text-gray-700 rounded-xl border-none outline-none focus:ring-2"
            style={{ '--tw-ring-color': theme.primary } as any}
          />
          <select 
            value={taskLevel} onChange={e => setTaskLevel(e.target.value as TaskLevel)}
            className="px-4 py-3 bg-gray-50 text-gray-700 rounded-xl border-none outline-none focus:ring-2"
            style={{ '--tw-ring-color': theme.primary } as any}
          >
            {Object.values(TaskLevel).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <div className="flex gap-2">
            <button 
              onClick={handleSaveTask}
              className="flex-1 py-3 text-white rounded-xl font-black shadow-md transition hover:opacity-90"
              style={{ backgroundColor: theme.primary }}
            >
              {editTaskId ? '更新規則' : '新增規則'}
            </button>
            {editTaskId && (
              <button onClick={() => { setEditTaskId(null); setTaskName(''); setTaskAmount(''); }} className="px-4 bg-gray-100 text-gray-500 rounded-xl font-bold">取消</button>
            )}
          </div>
        </div>
      </div>

      {Object.values(TaskLevel).map(level => {
        const tasks = activeProject?.tasks.filter(t => t.level === level) || [];
        return (
          <div key={level} className="space-y-3">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">{level}</h4>
            <div className="grid grid-cols-1 gap-3">
              {tasks.length === 0 ? (
                <div className="text-xs text-gray-300 italic px-2">此類別尚無規則</div>
              ) : (
                tasks.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center group border border-gray-50">
                    <div>
                      <div className="font-black text-gray-700">{t.name}</div>
                      <div className="text-xs text-gray-400 font-bold">金額：${t.amount}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditTaskId(t.id); setTaskName(t.name); setTaskAmount(t.amount.toString()); setTaskLevel(t.level); }} className="p-2 text-blue-300 hover:bg-blue-50 rounded-xl transition"><EditIcon size={18}/></button>
                      <button onClick={() => handleDeleteTask(t.id)} className="p-2 text-red-300 hover:bg-red-50 rounded-xl transition"><TrashIcon size={18}/></button>
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

  const editRecord = (r: SavingRecord) => {
    setEditRecordId(r.id);
    setRecordAmount(r.amount.toString());
    setRecordNote(r.note);
    setRecordImage(r.imageUrl || null);
    setSelectedTaskId(r.taskId || '');
    setView('record-form');
  };

  const renderAchievementFormView = () => (
    <div className="bg-white p-8 cute-card space-y-6 max-w-xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => setView('project-detail')} className="p-2 bg-gray-50 rounded-xl text-gray-400 shadow-sm transition"><BackIcon size={20}/></button>
        <h2 className="text-2xl font-black text-gray-700">{editRecordId ? '修改成果紀錄' : '記錄新成果'}</h2>
      </div>
      
      <div className="space-y-5">
        <label className="w-full h-48 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition hover:border-gray-300">
          {recordImage ? (
            <img src={recordImage} className="w-full h-full object-cover" alt="Achievement" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <CameraIcon size={32} className="text-gray-300" />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">點擊上傳照片</span>
            </div>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>

        <div>
          <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-wider">關聯規則 (選填)</label>
          <select 
            value={selectedTaskId}
            onChange={e => {
              const tid = e.target.value;
              setSelectedTaskId(tid);
              const task = activeProject?.tasks.find(t => t.id === tid);
              if (task) setRecordAmount(task.amount.toString());
            }}
            className="w-full px-5 py-4 bg-gray-50 text-gray-700 border-none rounded-2xl outline-none focus:ring-2 transition shadow-sm"
            style={{ '--tw-ring-color': theme.primary } as any}
          >
            <option value="">-- 無關聯規則 --</option>
            {activeProject?.tasks.map(t => <option key={t.id} value={t.id}>{t.name} (${t.amount})</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-wider">金額</label>
            <input 
              type="number" value={recordAmount} onChange={e => setRecordAmount(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 text-gray-700 border-none rounded-2xl outline-none focus:ring-2 transition shadow-sm"
              style={{ '--tw-ring-color': theme.primary } as any}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleSaveAchievement}
              className="w-full py-4 text-white rounded-2xl font-black shadow-lg transition hover:opacity-90"
              style={{ backgroundColor: theme.primary }}
            >
              {editRecordId ? '更新紀錄' : '確認存入'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-wider">心得備註</label>
          <textarea
            rows={4} value={recordNote} onChange={e => setRecordNote(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 text-gray-700 border-none rounded-2xl outline-none focus:ring-2 transition shadow-sm"
            style={{ '--tw-ring-color': theme.primary } as any}
            placeholder="今天又努力了一點，感覺如何呢？"
          />
        </div>

        {/* Delete Button - Only show when editing existing record */}
        {editRecordId && (
          <button
            onClick={() => {
              handleDeleteRecord(editRecordId);
              setView('project-detail');
            }}
            className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition"
          >
            <TrashIcon size={18} />
            刪除此筆成果紀錄
          </button>
        )}
      </div>
    </div>
  );

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
      </header>

      {/* Project Quick Access Bar */}
      {renderTopProjectSwitcher()}

      {/* Main Container */}
      <main className="flex-1 relative">
        <div className="transition-all duration-300">
          {view === 'home' && renderHomeView()}
          {view === 'project-form' && renderProjectFormView()}
          {view === 'project-detail' && renderProjectDetailView()}
          {view === 'edit-tasks' && renderEditTasksView()}
          {view === 'record-form' && renderAchievementFormView()}
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowThemePicker(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 relative shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <h3 className="text-xl font-black text-center mb-6 text-gray-700">更換主題色調</h3>
            <div className="flex justify-center gap-4 flex-wrap">
              {(Object.keys(THEMES) as ThemeName[]).map(t => (
                <button 
                  key={t}
                  onClick={() => { setCurrentThemeName(t); setShowThemePicker(false); }}
                  className={`w-12 h-12 rounded-full border-4 transition-all hover:scale-110 ${currentThemeName === t ? 'border-gray-300 ring-4 ring-offset-2 ring-gray-100' : 'border-transparent'}`}
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
          onCrop={(b64) => { setRecordImage(b64); setShowCropper(false); }}
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
