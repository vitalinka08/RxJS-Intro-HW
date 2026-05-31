// ─────────────────────────────────────────────────────────────────────────────
// Базова модель
// ─────────────────────────────────────────────────────────────────────────────

export type EventType = 'meeting' | 'task' | 'reminder';

export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * BaseEvent — спільні поля для всіх подій.
 * `id` та `createdAt` мають бути незмінними після створення → readonly.
 */
export interface BaseEvent {
  readonly id: string;
  readonly createdAt: Date;
  title: string;
  description: string;
  priority: EventPriority;
}

// ─────────────────────────────────────────────────────────────────────────────
// Спеціалізовані типи подій
// ─────────────────────────────────────────────────────────────────────────────

export interface MeetingEvent extends BaseEvent {
  readonly type: 'meeting';
  startsAt: Date;
  endsAt: Date;
  location: string;
  participants: readonly string[];
}

export interface TaskEvent extends BaseEvent {
  readonly type: 'task';
  dueDate: Date;
  status: 'todo' | 'in-progress' | 'done';
  assignee: string;
}

export interface ReminderEvent extends BaseEvent {
  readonly type: 'reminder';
  remindAt: Date;
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly';
}

// ─────────────────────────────────────────────────────────────────────────────
// Discriminated union — об'єднання всіх подій
// ─────────────────────────────────────────────────────────────────────────────

export type AppEvent = MeetingEvent | TaskEvent | ReminderEvent;

// ─────────────────────────────────────────────────────────────────────────────
// Conditional + mapped types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Conditional type: за дискримінатором `type` дістає відповідний підтип з AppEvent.
 * Приклад: EventByType<'meeting'> ≡ MeetingEvent.
 */
export type EventByType<T extends EventType> = Extract<AppEvent, { type: T }>;

/**
 * Mapped type: словник {meeting: MeetingEvent[], task: TaskEvent[], reminder: ReminderEvent[]}.
 */
export type EventsByTypeMap = {
  readonly [K in EventType]: ReadonlyArray<EventByType<K>>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Input-типи для створення та оновлення
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CreateEventInput — поля, які користувач передає при створенні події.
 * `id` та `createdAt` генеруються автоматично EventManager'ом.
 * Працює з конкретним підтипом через generic constraint.
 */
export type CreateEventInput<T extends EventType> = Omit<EventByType<T>, 'id' | 'createdAt'>;

/**
 * UpdateEventInput — часткове оновлення. Дискримінатор `type` та readonly-поля міняти не можна.
 */
export type UpdateEventInput<T extends EventType> = Partial<
  Omit<EventByType<T>, 'id' | 'createdAt' | 'type'>
>;

// ─────────────────────────────────────────────────────────────────────────────
// Помилки
// ─────────────────────────────────────────────────────────────────────────────

export class EventNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Event with id "${id}" was not found`);
    this.name = 'EventNotFoundError';
  }
}

export class InvalidEventError extends Error {
  constructor(public readonly reason: string) {
    super(`Invalid event data: ${reason}`);
    this.name = 'InvalidEventError';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Type guards
// ─────────────────────────────────────────────────────────────────────────────

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function hasBaseFields(o: Record<string, unknown>): boolean {
  return (
    typeof o['id'] === 'string' &&
    typeof o['title'] === 'string' &&
    typeof o['description'] === 'string' &&
    typeof o['priority'] === 'string' &&
    (['low', 'medium', 'high', 'critical'] as const).includes(o['priority'] as EventPriority) &&
    o['createdAt'] instanceof Date
  );
}

export function isMeetingEvent(value: unknown): value is MeetingEvent {
  if (!isObject(value) || !hasBaseFields(value)) return false;
  if (value['type'] !== 'meeting') return false;
  return (
    value['startsAt'] instanceof Date &&
    value['endsAt'] instanceof Date &&
    typeof value['location'] === 'string' &&
    Array.isArray(value['participants']) &&
    value['participants'].every((p: unknown) => typeof p === 'string')
  );
}

export function isTaskEvent(value: unknown): value is TaskEvent {
  if (!isObject(value) || !hasBaseFields(value)) return false;
  if (value['type'] !== 'task') return false;
  const status = value['status'];
  return (
    value['dueDate'] instanceof Date &&
    typeof status === 'string' &&
    (['todo', 'in-progress', 'done'] as const).includes(status as TaskEvent['status']) &&
    typeof value['assignee'] === 'string'
  );
}

export function isReminderEvent(value: unknown): value is ReminderEvent {
  if (!isObject(value) || !hasBaseFields(value)) return false;
  if (value['type'] !== 'reminder') return false;
  const recurrence = value['recurrence'];
  return (
    value['remindAt'] instanceof Date &&
    typeof recurrence === 'string' &&
    (['once', 'daily', 'weekly', 'monthly'] as const).includes(
      recurrence as ReminderEvent['recurrence']
    )
  );
}

export function isAppEvent(value: unknown): value is AppEvent {
  return isMeetingEvent(value) || isTaskEvent(value) || isReminderEvent(value);
}
