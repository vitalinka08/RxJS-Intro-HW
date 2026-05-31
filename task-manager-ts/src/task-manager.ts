import {
  CreateTaskInput,
  Task,
  TaskNotFoundError,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from './task.model.js';
import { findById, generateId } from './utils.js';

export class TaskManager {
  private tasks: Task[] = [];

  constructor(initial: readonly Task[] = []) {
    this.tasks = [...initial];
  }

  getAll(): readonly Task[] {
    return this.tasks;
  }

  add(input: CreateTaskInput): Task {
    const task: Task = {
      id: generateId(),
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: input.status ?? TaskStatus.Todo,
      createdAt: new Date(),
    };
    this.tasks = [...this.tasks, task];
    return task;
  }

  update(id: string, patch: UpdateTaskInput): Task {
    const existing = findById(this.tasks, id);
    if (!existing) {
      throw new TaskNotFoundError(id);
    }

    const nextStatus = patch.status ?? existing.status;
    const justCompleted =
      nextStatus === TaskStatus.Done && existing.status !== TaskStatus.Done;

    const updated: Task = {
      ...existing,
      ...patch,
      status: nextStatus,
      ...(justCompleted ? { completedAt: new Date() } : {}),
    };

    this.tasks = this.tasks.map((t) => (t.id === id ? updated : t));
    return updated;
  }

  remove(id: string): Task {
    const existing = findById(this.tasks, id);
    if (!existing) {
      throw new TaskNotFoundError(id);
    }
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return existing;
  }

  findByStatus(status: TaskStatus): readonly Task[] {
    return this.tasks.filter((t) => t.status === status);
  }

  findByPriority(priority: TaskPriority): readonly Task[] {
    return this.tasks.filter((t) => t.priority === priority);
  }

  findById(id: string): Task | undefined {
    return findById(this.tasks, id);
  }

  count(): number {
    return this.tasks.length;
  }
}
