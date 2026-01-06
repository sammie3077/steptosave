
export enum TaskLevel {
  BASIC = '基礎任務',
  INTERMEDIATE = '中階任務',
  ADVANCED = '進階任務'
}

export type ThemeName = 'yellow' | 'pink' | 'blue' | 'green' | 'purple';

export interface SavingTask {
  id: string;
  name: string;
  amount: number;
  level: TaskLevel;
  completions: number;
}

export interface SavingRecord {
  id: string;
  taskId?: string;
  taskName?: string;
  amount: number;
  note: string;
  imageUrl?: string;
  date: string;
}

export interface SavingProject {
  id: string;
  name: string;
  targetAmount: number;
  description: string;
  currentAmount: number;
  tasks: SavingTask[];
  records: SavingRecord[];
  createdAt: string;
}

export interface AppData {
  projects: SavingProject[];
  theme?: ThemeName;
}
