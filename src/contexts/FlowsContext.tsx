
'use client';

import { createContext, useState, useEffect, useCallback, type ReactNode, useContext } from 'react';
import type { Flow, Task } from '@/lib/types';
import { AuthContext } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, writeBatch, query, orderBy, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { format, startOfDay } from 'date-fns';

interface FlowsContextType {
  flows: Flow[];
  loading: boolean;
  addFlow: (title: string, generatedTasks?: string[]) => Promise<string>;
  updateFlow: (flowId: string, updates: Partial<Omit<Flow, 'id' | 'tasks'>>) => Promise<void>;
  deleteFlow: (flowId: string) => Promise<void>;
  getFlowById: (flowId: string) => Flow | undefined;
  addTask: (flowId: string, taskTitle: string, taskDescription?: string, startTime?: string, endTime?: string) => Promise<void>;
  updateTask: (flowId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (flowId: string, taskId: string) => Promise<void>;
  reorderTasks: (flowId: string, sourceIndex: number, destinationIndex: number) => Promise<void>;
  toggleTaskCompletion: (flowId: string, taskId: string) => Promise<void>;
}

export const FlowsContext = createContext<FlowsContextType>({
  flows: [],
  loading: true,
  addFlow: async () => { throw new Error('addFlow function not implemented'); },
  updateFlow: async () => {},
  deleteFlow: async () => {},
  getFlowById: () => undefined,
  addTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  reorderTasks: async () => {},
  toggleTaskCompletion: async () => {},
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
                tasks: (data.tasks || []).map((task: any) => ({
                    ...task,
                    completedDates: task.completedDates || [], // Ensure completedDates is always an array
                })),
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

  const addFlow = useCallback(async (title: string, generatedTasks: string[] = []) => {
    if (!user) throw new Error('User not authenticated');

    const newFlowRef = doc(collection(db, `users/${user.uid}/flows`));
    
    const tasks = generatedTasks.map(taskTitle => ({
      id: doc(collection(db, `users/${user.uid}/flows/${newFlowRef.id}/tasks`)).id,
      title: taskTitle,
      description: '',
      completedDates: [],
    }));

    const newFlowData = {
      id: newFlowRef.id,
      title,
      tasks,
      createdAt: new Date().toISOString(),
    };

    await setDoc(newFlowRef, newFlowData);

    return newFlowRef.id;
  }, [user]);
  
  const updateFlow = useCallback(async (flowId: string, updates: Partial<Omit<Flow, 'id' | 'tasks'>>) => {
    if (!user) return;
    const flowRef = doc(db, `users/${user.uid}/flows`, flowId);
    await updateDoc(flowRef, updates);
  }, [user]);

  const deleteFlow = useCallback(async (flowId: string) => {
    if (!user) return;
    const flowRef = doc(db, `users/${user.uid}/flows`, flowId);
    await deleteDoc(flowRef);
  }, [user]);

  const getFlowById = useCallback((flowId: string) => {
    return flows.find((flow) => flow.id === flowId);
  }, [flows]);

  const updateFlowTasks = useCallback(async (flowId: string, newTasks: Task[] | ((tasks: Task[]) => Task[])) => {
    if (!user) return Promise.reject(new Error('User not authenticated'));
    const flow = flows.find(f => f.id === flowId);
    if (!flow) return Promise.reject(new Error('Flow not found'));
    
    const updatedTasks = typeof newTasks === 'function' ? newTasks(flow.tasks) : newTasks;
    
    const flowRef = doc(db, `users/${user.uid}/flows`, flowId);
    await updateDoc(flowRef, { tasks: updatedTasks });
  }, [user, flows]);

  const addTask = useCallback(async (flowId: string, taskTitle: string, taskDescription?: string, startTime?: string, endTime?: string) => {
    const newTask: Task = {
      id: doc(collection(db, `users/${user?.uid}/flows/${flowId}/tasks`)).id,
      title: taskTitle,
      description: taskDescription,
      completedDates: [],
      startTime,
      endTime,
    };
    await updateFlowTasks(flowId, (tasks) => [...tasks, newTask]);
  }, [updateFlowTasks, user]);

  const updateTask = useCallback(async (flowId: string, taskId: string, updates: Partial<Task>) => {
    await updateFlowTasks(flowId, (tasks) =>
      tasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, ...updates };
           // Ensure undefined fields are handled correctly by converting them to "delete" operations for firestore
          Object.keys(updatedTask).forEach(key => {
            const taskKey = key as keyof Partial<Task>;
            if (updatedTask[taskKey] === undefined) {
              delete (updatedTask as any)[taskKey];
            }
          });
          return updatedTask;
        }
        return task;
      })
    );
  }, [updateFlowTasks]);
  
  const toggleTaskCompletion = useCallback(async (flowId: string, taskId: string) => {
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    await updateFlowTasks(flowId, (tasks) => 
       tasks.map(task => {
         if (task.id === taskId) {
           const completedDates = task.completedDates || [];
           const isCompletedToday = completedDates.includes(todayStr);
           let newCompletedDates;
           if(isCompletedToday) {
             newCompletedDates = completedDates.filter(d => d !== todayStr);
           } else {
             newCompletedDates = [...completedDates, todayStr];
           }
           return { ...task, completedDates: newCompletedDates };
         }
         return task;
       })
    );

  }, [updateFlowTasks]);


  const deleteTask = useCallback(async (flowId: string, taskId: string) => {
    await updateFlowTasks(flowId, (tasks) => tasks.filter((task) => task.id !== taskId));
  }, [updateFlowTasks]);

  const reorderTasks = useCallback(async (flowId: string, sourceIndex: number, destinationIndex: number) => {
    await updateFlowTasks(flowId, (tasks) => {
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
    toggleTaskCompletion,
  };

  return <FlowsContext.Provider value={value}>{children}</FlowsContext.Provider>;
}
