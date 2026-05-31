export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in-progress',
  Done = 'done',
  Cancelled = 'cancelled',
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  completedAt?: Date;
}

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'status'> & {
  status?: TaskStatus;
};

export type UpdateTaskInput = Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'>>;

export class TaskNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Task with id "${id}" was not found`);
    this.name = 'TaskNotFoundError';
  }
}

export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;

  const validStatus =
    typeof o['status'] === 'string' &&
    (Object.values(TaskStatus) as string[]).includes(o['status']);

  const validPriority =
    typeof o['priority'] === 'string' &&
    (['low', 'medium', 'high', 'critical'] as const).includes(o['priority'] as TaskPriority);

  return (
    typeof o['id'] === 'string' &&
    typeof o['title'] === 'string' &&
    typeof o['description'] === 'string' &&
    validStatus &&
    validPriority &&
    o['createdAt'] instanceof Date &&
    (o['completedAt'] === undefined || o['completedAt'] instanceof Date)
  );
}
