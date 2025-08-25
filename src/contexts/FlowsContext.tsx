'use client';

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Flow, Task } from '@/lib/types';

interface FlowsContextType {
  flows: Flow[];
  loading: boolean;
  addFlow: (title: string, generatedTasks?: string[]) => Flow;
  deleteFlow: (flowId: string) => void;
  getFlowById: (flowId: string) => Flow | undefined;
  addTask: (flowId: string, taskTitle: string, taskDescription: string) => void;
  updateTask: (flowId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (flowId: string, taskId: string) => void;
  reorderTasks: (flowId: string, sourceIndex: number, destinationIndex: number) => void;
}

export const FlowsContext = createContext<FlowsContextType>({
  flows: [],
  loading: true,
  addFlow: () => { throw new Error('addFlow function not implemented'); },
  deleteFlow: () => {},
  getFlowById: () => undefined,
  addTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  reorderTasks: () => {},
});

const STORAGE_KEY = 'taskflow-data';

export function FlowsProvider({ children }: { children: ReactNode }) {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setFlows(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Failed to parse flows from localStorage', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
    }
  }, [flows, loading]);

  const addFlow = useCallback((title: string, generatedTasks: string[] = []) => {
    const newFlow: Flow = {
      id: crypto.randomUUID(),
      title,
      tasks: generatedTasks.map(taskTitle => ({
        id: crypto.randomUUID(),
        title: taskTitle,
        description: '',
        completed: false,
      })),
    };
    setFlows((prevFlows) => [...prevFlows, newFlow]);
    return newFlow;
  }, []);

  const deleteFlow = useCallback((flowId: string) => {
    setFlows((prevFlows) => prevFlows.filter((flow) => flow.id !== flowId));
  }, []);

  const getFlowById = useCallback((flowId: string) => {
    return flows.find((flow) => flow.id === flowId);
  }, [flows]);

  const updateFlowTasks = useCallback((flowId: string, newTasks: Task[] | ((tasks: Task[]) => Task[])) => {
    setFlows((prevFlows) =>
      prevFlows.map((flow) => {
        if (flow.id === flowId) {
          const updatedTasks = typeof newTasks === 'function' ? newTasks(flow.tasks) : newTasks;
          return { ...flow, tasks: updatedTasks };
        }
        return flow;
      })
    );
  }, []);

  const addTask = useCallback((flowId: string, taskTitle: string, taskDescription: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskTitle,
      description: taskDescription,
      completed: false,
    };
    updateFlowTasks(flowId, (tasks) => [...tasks, newTask]);
  }, [updateFlowTasks]);

  const updateTask = useCallback((flowId: string, taskId: string, updates: Partial<Task>) => {
    updateFlowTasks(flowId, (tasks) =>
      tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  }, [updateFlowTasks]);

  const deleteTask = useCallback((flowId: string, taskId: string) => {
    updateFlowTasks(flowId, (tasks) => tasks.filter((task) => task.id !== taskId));
  }, [updateFlowTasks]);

  const reorderTasks = useCallback((flowId: string, sourceIndex: number, destinationIndex: number) => {
    updateFlowTasks(flowId, (tasks) => {
      const result = Array.from(tasks);
      const [removed] = result.splice(sourceIndex, 1);
      result.splice(destinationIndex, 0, removed);
      return result;
    });
  }, [updateFlowTasks]);

  const value = {
    flows,
    loading,
    addFlow,
    deleteFlow,
    getFlowById,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
  };

  return <FlowsContext.Provider value={value}>{children}</FlowsContext.Provider>;
}
