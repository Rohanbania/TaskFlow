
export interface Task {
  id: string;
  title: string;
  description: string;
  completedDates: string[]; // e.g., ["2024-07-29", "2024-07-30"]
}

export interface Flow {
  id:string;
  title: string;
  tasks: Task[];
  createdAt: string;
}
