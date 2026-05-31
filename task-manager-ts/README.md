# Task Manager TS — Лабораторна №4

Консольний менеджер задач на чистому TypeScript (Node + tsx). Демонструє типобезпечну модель даних, generics, utility types, union types, type guards. Заборонено `any`, увімкнено `strict: true` та `noUncheckedIndexedAccess`.

## Що використано з TypeScript

| Вимога | Де у коді |
|---|---|
| `interface` | `Task` у `src/task.model.ts` |
| `type` | `TaskPriority`, `CreateTaskInput`, `UpdateTaskInput` |
| `enum` | `TaskStatus` (`todo`, `in-progress`, `done`, `cancelled`) |
| `string literal types` | `TaskPriority = 'low' \| 'medium' \| 'high' \| 'critical'` |
| `Partial` | `UpdateTaskInput = Partial<Pick<Task, ...>>` |
| `Pick / Omit` | `Omit<Task, 'id' \| 'createdAt' \| ...>` для `CreateTaskInput`, `Pick<Task, ...>` для `UpdateTaskInput` |
| `generic` | `findById<T extends { id: string }>(items, id)` у `src/utils.ts` |
| `type guard` | `isTask(value: unknown): value is Task` у `src/task.model.ts` |
| без `any` | у `tsconfig.json` ввімкнено `strict: true`, `noImplicitAny`, `noUncheckedIndexedAccess` |

## Модель задачі

```ts
interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;       // enum
  priority: TaskPriority;   // 'low' | 'medium' | 'high' | 'critical'
  createdAt: Date;
  completedAt?: Date;       // опціонально
}
```

- При додаванні передається лише `title`, `description`, `priority` (і опційно `status`). `id` та `createdAt` генеруються автоматично в `TaskManager.add()`.
- При оновленні передається `Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'>>` — будь-яке підмножина полів.
- Якщо статус змінився на `done`, `completedAt` проставляється автоматично.

## TaskManager

`src/task-manager.ts` — клас з методами:
- `getAll(): readonly Task[]`
- `add(input: CreateTaskInput): Task`
- `update(id: string, patch: UpdateTaskInput): Task` — кидає `TaskNotFoundError`
- `remove(id: string): Task` — кидає `TaskNotFoundError`
- `findByStatus(status: TaskStatus): readonly Task[]`
- `findByPriority(priority: TaskPriority): readonly Task[]`
- `findById(id: string): Task | undefined` (через generic-функцію)
- `count(): number`

## Запуск

```bash
npm install
npm start          # запускає демонстрацію через tsx
npm run typecheck  # перевірка типів tsc --noEmit
npm run build      # компіляція у dist/
```

## Скріншоти роботи у терміналі (`screenshots/`)

- `01-all-tasks.png` — вивід усіх 8 стартових задач (різні статуси і пріоритети, кольорове форматування)
- `02-task-added.png` — додавання нової задачі через `manager.add({...})`
- `03-task-updated.png` — оновлення задачі через `manager.update(id, patch)` + автоматичне видалення задачі
- `04-task-filtered.png` — фільтрація: за статусом (`todo`, `in-progress`) і за пріоритетом (`high`, `critical`)
- `05-errors-and-guard.png` — `TaskNotFoundError` при операціях над неіснуючим id + перевірка `isTask()` на різних значеннях
- `06-full-run.png` — повний прогон демонстрації

## Структура

```
src/
├── task.model.ts     # Task, TaskStatus, TaskPriority, CreateTaskInput, UpdateTaskInput, isTask, TaskNotFoundError
├── task-manager.ts   # клас TaskManager: CRUD + пошук
├── utils.ts          # generic findById<T>, generateId
├── seed.ts           # 8 стартових задач
├── printer.ts        # ANSI-форматування для термінала
└── index.ts          # демонстрація: усі 8 кроків
```

## Рішення є самостійним

Цей проєкт не має залежностей від Angular чи RxJS, не пов'язаний з попередніми лабораторними роботами. Технологічно — лише Node + TypeScript (+ tsx як runner).
