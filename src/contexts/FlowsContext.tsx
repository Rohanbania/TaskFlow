'use client';

import { createContext, useState, useEffect, useCallback, type ReactNode, useContext } from 'react';
import type { Flow, Task } from '@/lib/types';
import { AuthContext } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, writeBatch, query, orderBy } from 'firebase/firestore';

interface FlowsContextType {
  flows: Flow[];
  loading: boolean;
  addFlow: (title: string, generatedTasks?: string[]) => Promise<string>;
  updateFlow: (flowId: string, updates: Partial<Omit<Flow, 'id' | 'tasks'>>) => void;
  deleteFlow: (flowId: string) => void;
  getFlowById: (flowId: string) => Flow | undefined;
  addTask: (flowId: string, taskTitle: string, taskDescription: string, startDate?: string, endDate?: string, startTime?: string, endTime?: string, recurringDays?: number[]) => void;
  updateTask: (flowId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (flowId: string, taskId: string) => void;
  reorderTasks: (flowId: string, sourceIndex: number, destinationIndex: number) => void;
}

export const FlowsContext = createContext<FlowsContextType>({
  flows: [],
  loading: true,
  addFlow: async () => { throw new Error('addFlow function not implemented'); },
  updateFlow: () => {},
  deleteFlow: () => {},
  getFlowById: () => undefined,
  addTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  reorderTasks: () => {},
});

export function FlowsProvider({ children }: { children: ReactNode }) {
  const { user } = useContext(AuthContext);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFlows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, `users/${user.uid}/flows`), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userFlows: Flow[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            userFlows.push({
                id: doc.id,
                title: data.title,
                tasks: data.tasks || [],
                createdAt: data.createdAt
            } as Flow);
        });
        setFlows(userFlows);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching flows:", error);
        setLoading(false);
    });

    return () => unsubscribe();
}, [user]);

  const commitBatch = async (batch: any) => {
    try {
      await batch.commit();
    } catch (error) {
      console.error("Error committing batch:", error);
    }
  };

  const addFlow = useCallback(async (title: string, generatedTasks: string[] = []) => {
    if (!user) throw new Error('User not authenticated');
    
    const batch = writeBatch(db);
    const newFlowRef = doc(collection(db, `users/${user.uid}/flows`));
    
    const tasks = generatedTasks.map(taskTitle => ({
      id: doc(collection(db, `users/${user.uid}/flows/${newFlowRef.id}/tasks`)).id,
      title: taskTitle,
      description: '',
      completed: false,
      recurringDays: [],
    }));

    batch.set(newFlowRef, { 
        title, 
        tasks,
        createdAt: new Date().toISOString()
    });

    await commitBatch(batch);
    return newFlowRef.id;
  }, [user]);
  
  const updateFlow = useCallback(async (flowId: string, updates: Partial<Omit<Flow, 'id' | 'tasks'>>) => {
    if (!user) return;
    const batch = writeBatch(db);
    const flowRef = doc(db, `users/${user.uid}/flows`, flowId);
    batch.update(flowRef, updates);
    await commitBatch(batch);
  }, [user]);

  const deleteFlow = useCallback(async (flowId: string) => {
    if (!user) return;
    const batch = writeBatch(db);
    const flowRef = doc(db, `users/${user.uid}/flows`, flowId);
    batch.delete(flowRef);
    await commitBatch(batch);
  }, [user]);

  const getFlowById = useCallback((flowId: string) => {
    return flows.find((flow) => flow.id === flowId);
  }, [flows]);

  const updateFlowTasks = useCallback(async (flowId: string, newTasks: Task[] | ((tasks: Task[]) => Task[])) => {
    if (!user) return;
    const flow = flows.find(f => f.id === flowId);
    if (!flow) return;
    
    const updatedTasks = typeof newTasks === 'function' ? newTasks(flow.tasks) : newTasks;
    
    const batch = writeBatch(db);
    const flowRef = doc(db, `users/${user.uid}/flows`, flowId);
    batch.update(flowRef, { tasks: updatedTasks });
    await commitBatch(batch);
  }, [user, flows]);

  const addTask = useCallback((flowId: string, taskTitle: string, taskDescription: string, startDate?: string, endDate?: string, startTime?: string, endTime?: string, recurringDays?: number[]) => {
    const newTask: Task = {
      id: doc(collection(db, `users/${user?.uid}/flows/${flowId}/tasks`)).id,
      title: taskTitle,
      description: taskDescription,
      completed: false,
      startDate,
      endDate,
      startTime,
      endTime,
      recurringDays,
    };
    updateFlowTasks(flowId, (tasks) => [...tasks, newTask]);
  }, [updateFlowTasks, user]);

  const updateTask = useCallback((flowId: string, taskId: string, updates: Partial<Task>) => {
    updateFlowTasks(flowId, (tasks) =>
      tasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, ...updates };
          if (updates.completed === true && !task.completed) {
            updatedTask.completionDate = new Date().toISOString();
          } else if (updates.completed === false) {
            delete updatedTask.completionDate;
          }
          return updatedTask;
        }
        return task;
      })
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
    updateFlow,
    deleteFlow,
    getFlowById,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
  };

  return <FlowsContext.Provider value={value}>{children}</FlowsContext.Provider>;
}
