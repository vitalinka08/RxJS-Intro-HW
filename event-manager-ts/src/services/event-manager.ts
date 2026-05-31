import {
  AppEvent,
  CreateEventInput,
  EventByType,
  EventNotFoundError,
  EventType,
  EventsByTypeMap,
  InvalidEventError,
  UpdateEventInput,
  isMeetingEvent,
  isReminderEvent,
  isTaskEvent,
} from '../models/event.model.js';
import { findById, generateId } from '../utils.js';

/**
 * EventManager — центральний сервіс над списком подій.
 * Зберігає події у внутрішньому масиві, але назовні віддає readonly-проекції.
 */
export class EventManager {
  private events: AppEvent[];

  constructor(initial: ReadonlyArray<AppEvent> = []) {
    this.events = [...initial];
  }

  // ───────── Read ─────────

  getAll(): ReadonlyArray<AppEvent> {
    return this.events;
  }

  count(): number {
    return this.events.length;
  }

  findById(id: string): AppEvent | undefined {
    return findById(this.events, id);
  }

  /**
   * Generic метод: за дискримінатором повертає тільки події відповідного підтипу.
   * Тип результату обчислюється conditional-типом EventByType<T>.
   */
  getByType<T extends EventType>(type: T): ReadonlyArray<EventByType<T>> {
    return this.events.filter((e): e is EventByType<T> => e.type === type);
  }

  /**
   * Фільтрація за довільною предикатною функцією.
   */
  filter(predicate: (event: AppEvent) => boolean): ReadonlyArray<AppEvent> {
    return this.events.filter(predicate);
  }

  /**
   * Mapped-type словник: групує події за `type`.
   * Результат — `{ meeting: MeetingEvent[], task: TaskEvent[], reminder: ReminderEvent[] }`.
   */
  groupedByType(): EventsByTypeMap {
    return {
      meeting: this.getByType('meeting'),
      task: this.getByType('task'),
      reminder: this.getByType('reminder'),
    };
  }

  // ───────── Mutations ─────────

  /**
   * Створення події. `id` та `createdAt` генеруються тут, тому користувач їх не передає.
   * Перед збереженням викликається відповідний type guard — InvalidEventError якщо дані ламані.
   */
  add<T extends EventType>(type: T, input: CreateEventInput<T>): EventByType<T> {
    const candidate = {
      ...input,
      type,
      id: generateId(`evt_${type}`),
      createdAt: new Date(),
    } as unknown;

    if (!this.validate(candidate)) {
      throw new InvalidEventError(`payload does not satisfy ${type} event schema`);
    }
    // After validate() the type narrows to AppEvent — звужуємо ще раз до EventByType<T>.
    const validated = candidate as EventByType<T>;
    this.events = [...this.events, validated];
    return validated;
  }

  /**
   * Часткове оновлення. Тип T задає, який підвид події ми очікуємо знайти.
   * Кидає EventNotFoundError якщо id невідомий, та InvalidEventError якщо id не того типу.
   */
  update<T extends EventType>(id: string, type: T, patch: UpdateEventInput<T>): EventByType<T> {
    const existing = findById(this.events, id);
    if (!existing) {
      throw new EventNotFoundError(id);
    }
    if (existing.type !== type) {
      throw new InvalidEventError(`event ${id} is of type "${existing.type}", not "${type}"`);
    }

    const merged = { ...existing, ...patch } as AppEvent;

    if (!this.validate(merged)) {
      throw new InvalidEventError(`update would produce an invalid ${type} event`);
    }
    const updated = merged as EventByType<T>;
    this.events = this.events.map((e) => (e.id === id ? updated : e));
    return updated;
  }

  remove(id: string): AppEvent {
    const existing = findById(this.events, id);
    if (!existing) {
      throw new EventNotFoundError(id);
    }
    this.events = this.events.filter((e) => e.id !== id);
    return existing;
  }

  // ───────── Validation ─────────

  /**
   * Top-level guard, що делегує на per-type guards.
   */
  private validate(value: unknown): value is AppEvent {
    return isMeetingEvent(value) || isTaskEvent(value) || isReminderEvent(value);
  }
}
