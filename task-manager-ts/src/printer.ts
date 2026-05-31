import { Task, TaskStatus } from './task.model.js';

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  blue: '\x1b[34m',
} as const;

const STATUS_COLOR: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: ANSI.yellow,
  [TaskStatus.InProgress]: ANSI.cyan,
  [TaskStatus.Done]: ANSI.green,
  [TaskStatus.Cancelled]: ANSI.gray,
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'TODO',
  [TaskStatus.InProgress]: 'IN PROGRESS',
  [TaskStatus.Done]: 'DONE',
  [TaskStatus.Cancelled]: 'CANCELLED',
};

const PRIORITY_COLOR = {
  low: ANSI.gray,
  medium: ANSI.blue,
  high: ANSI.magenta,
  critical: ANSI.red,
} as const;

function colorize(text: string, color: string): string {
  return `${color}${text}${ANSI.reset}`;
}

function fmtDate(d: Date | undefined): string {
  if (!d) return '—';
  return d.toISOString().slice(0, 10);
}

function shortId(id: string): string {
  const parts = id.split('_');
  return parts.length >= 2 ? `${parts[0]}_${parts[1]}` : id;
}

export function printHeader(title: string): void {
  const line = '─'.repeat(60);
  console.log('');
  console.log(colorize(line, ANSI.dim));
  console.log(colorize(`▸ ${title}`, ANSI.bold));
  console.log(colorize(line, ANSI.dim));
}

export function printTasks(tasks: readonly Task[], emptyMessage = '(порожній список)'): void {
  if (tasks.length === 0) {
    console.log(colorize(`  ${emptyMessage}`, ANSI.dim));
    return;
  }
  for (const t of tasks) {
    const statusLabel = colorize(`[${STATUS_LABEL[t.status]}]`, STATUS_COLOR[t.status]);
    const prioLabel = colorize(`!${t.priority}`, PRIORITY_COLOR[t.priority]);
    const idLabel = colorize(shortId(t.id), ANSI.dim);
    console.log(`  ${statusLabel} ${colorize(t.title, ANSI.bold)} ${prioLabel} ${idLabel}`);
    console.log(`     ${colorize(t.description, ANSI.dim)}`);
    console.log(
      `     ${colorize(`created ${fmtDate(t.createdAt)}`, ANSI.dim)}` +
        (t.completedAt ? colorize(`  ·  completed ${fmtDate(t.completedAt)}`, ANSI.dim) : '')
    );
  }
}

export function printInfo(message: string): void {
  console.log(`  ${colorize('●', ANSI.cyan)} ${message}`);
}

export function printSuccess(message: string): void {
  console.log(`  ${colorize('✓', ANSI.green)} ${message}`);
}

export function printWarn(message: string): void {
  console.log(`  ${colorize('!', ANSI.yellow)} ${message}`);
}

export function printError(message: string): void {
  console.log(`  ${colorize('✕', ANSI.red)} ${message}`);
}
