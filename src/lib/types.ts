export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  completionDate?: string;
}

export interface Flow {
  id:string;
  title: string;
  tasks: Task[];
}
