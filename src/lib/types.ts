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
  recurringDays?: number[]; // 0 for Sunday, 1 for Monday, etc.
}

export interface Flow {
  id:string;
  title: string;
  tasks: Task[];
}
