import { seedEvents } from './seed.js';
import { EventManager } from './services/event-manager.js';
import {
  CreateEventInput,
  EventNotFoundError,
  InvalidEventError,
  UpdateEventInput,
  isAppEvent,
  isMeetingEvent,
  isReminderEvent,
  isTaskEvent,
} from './models/event.model.js';
import {
  printError,
  printEvent,
  printEvents,
  printHeader,
  printInfo,
  printSuccess,
  printWarn,
} from './printer.js';

const manager = new EventManager(seedEvents);

// ─────────────────────────────────────────────────────────────────────────────
// 1. Усі події
// ─────────────────────────────────────────────────────────────────────────────
printHeader(`Усі події (${manager.count()})`);
printEvents(manager.getAll());

// ─────────────────────────────────────────────────────────────────────────────
// 2. Події різних типів — приклади через generic getByType<T>()
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Події різних типів через getByType<T>()');

printInfo("getByType('meeting') — TypeScript звужує тип результату до MeetingEvent[]");
const meetings = manager.getByType('meeting');
printEvents(meetings);

printInfo("getByType('task') — звужено до TaskEvent[]");
const tasks = manager.getByType('task');
printEvents(tasks);

printInfo("getByType('reminder') — звужено до ReminderEvent[]");
const reminders = manager.getByType('reminder');
printEvents(reminders);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Mapped-type словник
// ─────────────────────────────────────────────────────────────────────────────
printHeader('groupedByType() — Record-подібний словник через mapped type');
const grouped = manager.groupedByType();
console.log(
  `  meeting:  ${grouped.meeting.length}\n` +
    `  task:     ${grouped.task.length}\n` +
    `  reminder: ${grouped.reminder.length}`
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Фільтрація за довільною умовою
// ─────────────────────────────────────────────────────────────────────────────
printHeader('filter() — пошук за довільною умовою');

printInfo('priority = critical:');
printEvents(manager.filter((e) => e.priority === 'critical'));

printInfo('таски у статусі "todo":');
printEvents(manager.filter((e) => isTaskEvent(e) && e.status === 'todo'));

printInfo('щоденні нагадування:');
printEvents(manager.filter((e) => isReminderEvent(e) && e.recurrence === 'daily'));

// ─────────────────────────────────────────────────────────────────────────────
// 5. Додавання нової події
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Додавання події (meeting)');
const newMeetingInput: CreateEventInput<'meeting'> = {
  type: 'meeting',
  title: 'Retro Q2',
  description: 'Підсумки кварталу, що далі',
  priority: 'medium',
  startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  location: 'Zoom · #retro',
  participants: ['команда', 'PM'],
};
const created = manager.add('meeting', newMeetingInput);
printSuccess(`Додано: ${created.title} (${created.id})`);
printInfo(`createdAt згенеровано автоматично: ${created.createdAt.toISOString()}`);
printEvent(created);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Оновлення події
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Оновлення події (task)');
const firstTask = manager.getByType('task')[0];
if (firstTask) {
  const patch: UpdateEventInput<'task'> = {
    status: 'done',
    description: 'Завершено: усі сторінки на signals + регрес перевірено',
  };
  printInfo(`Patch для ${firstTask.id}: status → done`);
  const updated = manager.update(firstTask.id, 'task', patch);
  printSuccess('Оновлено');
  printEvent(updated);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Видалення події
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Видалення події (reminder)');
const lastReminder = manager.getByType('reminder').at(-1);
if (lastReminder) {
  printInfo(`Видаляю ${lastReminder.title} (${lastReminder.id})`);
  manager.remove(lastReminder.id);
  printSuccess(`Залишилось подій: ${manager.count()}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Обробка помилок
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Обробка помилок');

try {
  manager.update('evt_zzz_999', 'task', { status: 'done' });
} catch (e) {
  if (e instanceof EventNotFoundError) {
    printError(`update(невідомий id) → ${e.message}`);
  } else throw e;
}

try {
  manager.remove('evt_zzz_999');
} catch (e) {
  if (e instanceof EventNotFoundError) {
    printError(`remove(невідомий id) → ${e.message}`);
  } else throw e;
}

try {
  const someMeeting = manager.getByType('meeting')[0];
  if (someMeeting) {
    // намагаємось оновити meeting як task — повинна впасти InvalidEventError
    manager.update(someMeeting.id, 'task', { status: 'done' });
  }
} catch (e) {
  if (e instanceof InvalidEventError) {
    printError(`update(meeting як task) → ${e.message}`);
  } else throw e;
}

try {
  // невалідні дані: відсутні поля участників і startsAt
  const broken = {
    type: 'meeting',
    title: 'Битий мітинг',
    description: 'Без обовʼязкових полів',
    priority: 'high',
    // startsAt, endsAt, location, participants — відсутні
  } as unknown as CreateEventInput<'meeting'>;
  manager.add('meeting', broken);
} catch (e) {
  if (e instanceof InvalidEventError) {
    printError(`add(невалідний meeting) → ${e.message}`);
  } else throw e;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Type guards на «диких» даних
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Type guards: isMeetingEvent / isTaskEvent / isReminderEvent / isAppEvent');

const firstMeeting = manager.getByType('meeting')[0];
const samples: unknown[] = [
  firstMeeting,
  manager.getByType('task')[0],
  manager.getByType('reminder')[0],
  null,
  'not-an-event',
  { id: 'x', type: 'meeting' },
];

for (const value of samples) {
  const label =
    value === null
      ? 'null'
      : typeof value === 'string'
        ? `"${value}"`
        : typeof value === 'object' && value !== null && 'title' in (value as Record<string, unknown>)
          ? `obj("${String((value as Record<string, unknown>)['title'])}")`
          : 'obj(partial)';

  const labels: string[] = [];
  if (isMeetingEvent(value)) labels.push('meeting');
  if (isTaskEvent(value)) labels.push('task');
  if (isReminderEvent(value)) labels.push('reminder');

  if (isAppEvent(value)) {
    printSuccess(`isAppEvent(${label}) → true · matched: ${labels.join(', ')}`);
  } else {
    printWarn(`isAppEvent(${label}) → false`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Фінальний стан
// ─────────────────────────────────────────────────────────────────────────────
printHeader(`Фінальний стан (${manager.count()})`);
printEvents(manager.getAll());
console.log('');
