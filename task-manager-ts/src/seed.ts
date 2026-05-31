import { Task, TaskStatus } from './task.model.js';
import { generateId } from './utils.js';

const day = (n: number): Date => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export const seedTasks: readonly Task[] = [
  {
    id: generateId(),
    title: 'Налаштувати проєкт',
    description: 'Створити репозиторій, конфіги, базовий tsconfig',
    status: TaskStatus.Done,
    priority: 'high',
    createdAt: day(7),
    completedAt: day(6),
  },
  {
    id: generateId(),
    title: 'Розробити модель Task',
    description: 'Описати інтерфейси, enum, utility types',
    status: TaskStatus.Done,
    priority: 'high',
    createdAt: day(6),
    completedAt: day(5),
  },
  {
    id: generateId(),
    title: 'Імплементувати TaskManager',
    description: 'CRUD + пошук за статусом і пріоритетом',
    status: TaskStatus.InProgress,
    priority: 'critical',
    createdAt: day(4),
  },
  {
    id: generateId(),
    title: 'Додати валідацію через type guard',
    description: 'Перевіряти, що зовнішні дані відповідають типу Task',
    status: TaskStatus.InProgress,
    priority: 'medium',
    createdAt: day(3),
  },
  {
    id: generateId(),
    title: 'Написати демонстрацію',
    description: 'Скрипт, що демонструє додавання, оновлення, видалення',
    status: TaskStatus.Todo,
    priority: 'medium',
    createdAt: day(2),
  },
  {
    id: generateId(),
    title: 'Покрити edge cases',
    description: 'Що відбувається при оновленні неіснуючої задачі',
    status: TaskStatus.Todo,
    priority: 'low',
    createdAt: day(2),
  },
  {
    id: generateId(),
    title: 'Зробити скріншоти роботи',
    description: 'Кадри виводу для звітності лабораторної',
    status: TaskStatus.Todo,
    priority: 'low',
    createdAt: day(1),
  },
  {
    id: generateId(),
    title: 'Скасована: переписати на класи замість enum',
    description: 'Більше не потрібно — enum підходить ідеально',
    status: TaskStatus.Cancelled,
    priority: 'low',
    createdAt: day(5),
  },
];
