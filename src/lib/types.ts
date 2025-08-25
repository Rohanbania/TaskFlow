export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  date?: string;
  startTime?: string;
  endTime?: string;
}

export interface Flow {
  id: string;
  title: string;
  tasks: Task[];
}
