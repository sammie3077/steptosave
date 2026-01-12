import { useState, useCallback, useMemo } from 'react';
import { SavingProject, SavingTask, SavingRecord, TaskLevel } from '../types';

export function useProjectManager(
  projects: SavingProject[],
  setProjects: (projects: SavingProject[]) => void
) {
  // Save or update project
  const saveProject = useCallback(
    (name: string, targetAmount: number, description: string, editProjectId: string | null) => {
      if (!name.trim() || !targetAmount) return null;

      const id = editProjectId || crypto.randomUUID();

      if (editProjectId) {
        setProjects(
          projects.map(p =>
            p.id === id
              ? { ...p, name, targetAmount, description }
              : p
          )
        );
        return null;
      } else {
        const newProject: SavingProject = {
          id,
          name,
          targetAmount,
          description,
          currentAmount: 0,
          tasks: [],
          records: [],
          createdAt: new Date().toISOString()
        };
        setProjects([...projects, newProject]);
        return id;
      }
    },
    [projects, setProjects]
  );

  // Delete project
  const deleteProject = useCallback(
    (id: string) => {
      setProjects(projects.filter(p => p.id !== id));
    },
    [projects, setProjects]
  );

  // Save or update task
  const saveTask = useCallback(
    (projectId: string, name: string, amount: number, level: TaskLevel, editTaskId: string | null) => {
      if (!name.trim() || !amount) return;

      const id = editTaskId || crypto.randomUUID();

      setProjects(
        projects.map(p => {
          if (p.id !== projectId) return p;

          const tasks = editTaskId
            ? p.tasks.map(t =>
                t.id === id ? { ...t, name, amount, level } : t
              )
            : [...p.tasks, { id, name, amount, level, completions: 0 }];

          return { ...p, tasks };
        })
      );
    },
    [projects, setProjects]
  );

  // Delete task
  const deleteTask = useCallback(
    (projectId: string, taskId: string) => {
      setProjects(
        projects.map(p => {
          if (p.id !== projectId) return p;
          return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
        })
      );
    },
    [projects, setProjects]
  );

  // Save or update record
  const saveRecord = useCallback(
    (
      projectId: string,
      amount: number,
      note: string,
      imageUrl: string | null,
      taskId: string | null,
      taskName: string | undefined,
      editRecordId: string | null
    ) => {
      if (!amount) return;

      const id = editRecordId || crypto.randomUUID();

      setProjects(
        projects.map(p => {
          if (p.id !== projectId) return p;

          let updatedRecords: SavingRecord[];
          let diff = amount;

          if (editRecordId) {
            const old = p.records.find(r => r.id === editRecordId);
            diff = amount - (old?.amount || 0);
            updatedRecords = p.records.map(r =>
              r.id === editRecordId
                ? {
                    ...r,
                    amount,
                    note,
                    imageUrl: imageUrl || undefined,
                    taskId: taskId || undefined,
                    taskName: taskName || undefined
                  }
                : r
            );
          } else {
            updatedRecords = [
              {
                id,
                amount,
                note,
                imageUrl: imageUrl || undefined,
                taskId: taskId || undefined,
                taskName: taskName || undefined,
                date: new Date().toISOString()
              },
              ...p.records
            ];
          }

          const tasks = p.tasks.map(t => {
            if (!editRecordId && t.id === taskId) {
              return { ...t, completions: t.completions + 1 };
            }
            return t;
          });

          return {
            ...p,
            currentAmount: p.currentAmount + diff,
            records: updatedRecords,
            tasks
          };
        })
      );
    },
    [projects, setProjects]
  );

  // Delete record
  const deleteRecord = useCallback(
    (projectId: string, recordId: string) => {
      setProjects(
        projects.map(p => {
          if (p.id !== projectId) return p;

          const rec = p.records.find(r => r.id === recordId);
          if (!rec) return p;

          return {
            ...p,
            currentAmount: p.currentAmount - rec.amount,
            records: p.records.filter(r => r.id !== recordId),
            tasks: rec.taskId
              ? p.tasks.map(t =>
                  t.id === rec.taskId
                    ? { ...t, completions: Math.max(0, t.completions - 1) }
                    : t
                )
              : p.tasks
          };
        })
      );
    },
    [projects, setProjects]
  );

  return {
    saveProject,
    deleteProject,
    saveTask,
    deleteTask,
    saveRecord,
    deleteRecord
  };
}
