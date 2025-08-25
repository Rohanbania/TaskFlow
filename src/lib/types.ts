export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface Flow {
  id: string;
  title: string;
  tasks: Task[];
}
