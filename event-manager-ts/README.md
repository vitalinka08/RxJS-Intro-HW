# Event Manager TS — Лабораторна №5 (Advanced)

Консольний менеджер подій на TypeScript із наголосом на advanced-фічі мови: discriminated unions, conditional types, mapped types, generic constraints, type guards, readonly-поля. Без `any`, увімкнено `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.

## Що використано з TypeScript

| Вимога | Де у коді |
|---|---|
| `interface` | `BaseEvent`, `MeetingEvent`, `TaskEvent`, `ReminderEvent` |
| `type` | `EventType`, `EventPriority`, `AppEvent`, `CreateEventInput`, `UpdateEventInput` |
| **discriminated union** | `AppEvent = MeetingEvent \| TaskEvent \| ReminderEvent` через дискримінатор `type` |
| `generic` | `findById<T extends { id: string }>`, `EventManager.add<T>()`, `getByType<T>()`, `update<T>()` |
| **generic constraints** | `T extends EventType` у `EventByType<T>`, `add<T>`, `update<T>`, `getByType<T>` |
| `Partial` | `UpdateEventInput<T> = Partial<Omit<EventByType<T>, ...>>` |
| `Omit` | `CreateEventInput<T> = Omit<EventByType<T>, 'id' \| 'createdAt'>` |
| `Record / mapped type` | `EventsByTypeMap = { readonly [K in EventType]: ReadonlyArray<EventByType<K>> }` |
| **conditional type** | `EventByType<T extends EventType> = Extract<AppEvent, { type: T }>` |
| **type guard** | `isMeetingEvent`, `isTaskEvent`, `isReminderEvent`, `isAppEvent` |
| `readonly` | `BaseEvent.id`, `BaseEvent.createdAt`, `MeetingEvent.participants`, типи Readonly arrays у API |
| без `any` | `strict: true` + `noImplicitAny` + `noUncheckedIndexedAccess` у `tsconfig.json` |

## Архітектура

```
src/
├── models/
│   └── event.model.ts     # типи, union, conditional/mapped types, type guards, помилки
├── services/
│   └── event-manager.ts   # CRUD + getByType<T> + filter + groupedByType
├── utils.ts               # generic findById<T>, generateId
├── seed.ts                # 9 стартових подій (3 meeting + 3 task + 3 reminder)
├── printer.ts             # ANSI-форматування для термінала
└── index.ts               # демонстрація: усі 10 кроків
```

## Модель

```ts
interface BaseEvent {
  readonly id: string;
  readonly createdAt: Date;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface MeetingEvent extends BaseEvent {
  readonly type: 'meeting';
  startsAt: Date; endsAt: Date;
  location: string;
  participants: readonly string[];
}

interface TaskEvent extends BaseEvent {
  readonly type: 'task';
  dueDate: Date;
  status: 'todo' | 'in-progress' | 'done';
  assignee: string;
}

interface ReminderEvent extends BaseEvent {
  readonly type: 'reminder';
  remindAt: Date;
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly';
}

type AppEvent = MeetingEvent | TaskEvent | ReminderEvent;
```

### Ключові advanced-типи

```ts
// Conditional: за дискримінатором дістає підтип
type EventByType<T extends EventType> = Extract<AppEvent, { type: T }>;

// Mapped: словник {meeting: MeetingEvent[], task: TaskEvent[], reminder: ReminderEvent[]}
type EventsByTypeMap = { readonly [K in EventType]: ReadonlyArray<EventByType<K>> };

// Input-типи: користувач не передає `id` і `createdAt`
type CreateEventInput<T extends EventType> = Omit<EventByType<T>, 'id' | 'createdAt'>;
type UpdateEventInput<T extends EventType> = Partial<Omit<EventByType<T>, 'id' | 'createdAt' | 'type'>>;
```

## EventManager API

- `getAll(): ReadonlyArray<AppEvent>`
- `count(): number`
- `findById(id): AppEvent | undefined`
- `getByType<T extends EventType>(type: T): ReadonlyArray<EventByType<T>>`
- `filter(predicate): ReadonlyArray<AppEvent>`
- `groupedByType(): EventsByTypeMap` — mapped type
- `add<T extends EventType>(type: T, input: CreateEventInput<T>): EventByType<T>` — кидає `InvalidEventError`
- `update<T extends EventType>(id, type, patch: UpdateEventInput<T>): EventByType<T>` — кидає `EventNotFoundError` або `InvalidEventError`
- `remove(id): AppEvent` — кидає `EventNotFoundError`

Generic-метод `getByType<T>` автоматично звужує тип результату: `getByType('meeting')` повертає `ReadonlyArray<MeetingEvent>`, а не `AppEvent[]`.

## Запуск

```bash
npm install
npm start          # запускає демонстрацію через tsx
npm run typecheck  # tsc --noEmit
npm run build      # компіляція у dist/
```

## Скріншоти роботи у терміналі (`screenshots/`)

- `01-all-events.png` — список усіх 9 стартових подій
- `02-events-by-type.png` — `getByType<T>()` для `meeting / task / reminder` + `groupedByType()` зі словником
- `03-filter-events.png` — фільтрація: `priority = critical`, `status = todo`, `recurrence = daily`
- `04-update-and-delete.png` — додавання нового мітингу, оновлення таски (status → done), видалення нагадування
- `05-errors-and-guards.png` — `EventNotFoundError`, `InvalidEventError` (включно зі спробою створити невалідну подію), перевірка type guards на «диких» даних

## Рішення є самостійним

Не пов'язане з попередніми лабораторними. Тільки Node + TypeScript + tsx як runner.
