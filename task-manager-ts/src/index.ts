import { seedTasks } from './seed.js';
import { TaskManager } from './task-manager.js';
import {
  CreateTaskInput,
  TaskNotFoundError,
  TaskStatus,
  UpdateTaskInput,
  isTask,
} from './task.model.js';
import {
  printError,
  printHeader,
  printInfo,
  printSuccess,
  printTasks,
  printWarn,
} from './printer.js';

const manager = new TaskManager(seedTasks);

// ─────────────────────────────────────────────────────────────────────────────
// 1. Усі задачі
// ─────────────────────────────────────────────────────────────────────────────
printHeader(`Усі задачі (${manager.count()})`);
printTasks(manager.getAll());

// ─────────────────────────────────────────────────────────────────────────────
// 2. Додавання нової задачі
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Додавання нової задачі');
const newInput: CreateTaskInput = {
  title: 'Інтегрувати фідбек з ревʼю',
  description: 'Виправити named/positional аргументи у TaskManager',
  priority: 'high',
};
printInfo(`Готую CreateTaskInput → title: "${newInput.title}", priority: ${newInput.priority}`);
const created = manager.add(newInput);
printSuccess(`Додано: ${created.title} (${created.id})`);
printInfo(`Статус за замовчуванням: ${created.status} · createdAt: ${created.createdAt.toISOString()}`);
printTasks([created]);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Оновлення задачі (Partial type)
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Оновлення задачі');
const patch: UpdateTaskInput = {
  status: TaskStatus.Done,
  description: 'Виправлено: іменовані поля у формі та сервісі',
};
printInfo(`Patch для ${created.id}: status → done, description → оновлюється`);
const updated = manager.update(created.id, patch);
printSuccess(`Оновлено. completedAt автоматично проставлено: ${updated.completedAt?.toISOString() ?? '—'}`);
printTasks([updated]);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Видалення задачі
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Видалення задачі');
const toRemove = manager.getAll().find((t) => t.status === TaskStatus.Cancelled);
if (toRemove) {
  printInfo(`Видаляю «${toRemove.title}» (${toRemove.id})`);
  manager.remove(toRemove.id);
  printSuccess(`Залишилось задач: ${manager.count()}`);
} else {
  printWarn('Скасованих задач не знайдено');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Фільтрація за статусом
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Фільтрація: status = todo');
printTasks(manager.findByStatus(TaskStatus.Todo));

printHeader('Фільтрація: status = in-progress');
printTasks(manager.findByStatus(TaskStatus.InProgress));

// ─────────────────────────────────────────────────────────────────────────────
// 6. Фільтрація за пріоритетом
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Фільтрація: priority = high');
printTasks(manager.findByPriority('high'));

printHeader('Фільтрація: priority = critical');
printTasks(manager.findByPriority('critical'));

// ─────────────────────────────────────────────────────────────────────────────
// 7. Обробка помилок
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Обробка помилок: операції над неіснуючою задачею');
const fakeId = 'task_999_nonexist';

try {
  manager.update(fakeId, { status: TaskStatus.Done });
} catch (e) {
  if (e instanceof TaskNotFoundError) {
    printError(`update(${fakeId}) → ${e.message}`);
  } else {
    throw e;
  }
}

try {
  manager.remove(fakeId);
} catch (e) {
  if (e instanceof TaskNotFoundError) {
    printError(`remove(${fakeId}) → ${e.message}`);
  } else {
    throw e;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Type guard isTask()
// ─────────────────────────────────────────────────────────────────────────────
printHeader('Type guard isTask()');
const samples: unknown[] = [
  manager.getAll()[0],
  { id: 'x', title: 'wrong', description: 'no status' },
  { ...manager.getAll()[0], status: 'random' },
  null,
  'string',
];
for (const value of samples) {
  const label =
    value === null
      ? 'null'
      : typeof value === 'string'
        ? `"${value}"`
        : typeof value === 'object' && value !== null && 'title' in (value as Record<string, unknown>)
          ? `obj(title=${String((value as Record<string, unknown>)['title'])})`
          : typeof value;

  if (isTask(value)) {
    printSuccess(`isTask(${label}) → true · ${value.status}/${value.priority}`);
  } else {
    printWarn(`isTask(${label}) → false`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Фінальний стан
// ─────────────────────────────────────────────────────────────────────────────
printHeader(`Фінальний стан (${manager.count()})`);
printTasks(manager.getAll());
console.log('');
