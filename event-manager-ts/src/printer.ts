import { AppEvent, EventPriority, EventType } from './models/event.model.js';

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

const TYPE_COLOR: Record<EventType, string> = {
  meeting: ANSI.cyan,
  task: ANSI.magenta,
  reminder: ANSI.yellow,
};

const TYPE_LABEL: Record<EventType, string> = {
  meeting: 'MEETING ',
  task: 'TASK    ',
  reminder: 'REMINDER',
};

const PRIORITY_COLOR: Record<EventPriority, string> = {
  low: ANSI.gray,
  medium: ANSI.blue,
  high: ANSI.magenta,
  critical: ANSI.red,
};

function color(text: string, c: string): string {
  return `${c}${text}${ANSI.reset}`;
}

function fmtDate(d: Date | undefined): string {
  if (!d) return '—';
  return d.toISOString().slice(0, 10);
}

function shortId(id: string): string {
  const parts = id.split('_');
  return parts.length >= 3 ? `${parts[0]}_${parts[1]}_${parts[2]}` : id;
}

export function printHeader(title: string): void {
  const line = '─'.repeat(64);
  console.log('');
  console.log(color(line, ANSI.dim));
  console.log(color(`▸ ${title}`, ANSI.bold));
  console.log(color(line, ANSI.dim));
}

export function printEvent(event: AppEvent): void {
  const typeLabel = color(`[${TYPE_LABEL[event.type]}]`, TYPE_COLOR[event.type]);
  const prio = color(`!${event.priority}`, PRIORITY_COLOR[event.priority]);
  const idLabel = color(shortId(event.id), ANSI.dim);
  console.log(`  ${typeLabel} ${color(event.title, ANSI.bold)} ${prio} ${idLabel}`);
  console.log(`     ${color(event.description, ANSI.dim)}`);

  switch (event.type) {
    case 'meeting':
      console.log(
        `     ${color(`◴ ${fmtDate(event.startsAt)} → ${fmtDate(event.endsAt)}`, ANSI.dim)}` +
          color(`  ·  ${event.location}`, ANSI.dim) +
          color(`  ·  ${event.participants.length} учасн.`, ANSI.dim)
      );
      break;
    case 'task':
      console.log(
        `     ${color(`due ${fmtDate(event.dueDate)}`, ANSI.dim)}` +
          color(`  ·  status: ${event.status}`, ANSI.dim) +
          color(`  ·  assignee: ${event.assignee}`, ANSI.dim)
      );
      break;
    case 'reminder':
      console.log(
        `     ${color(`remind ${fmtDate(event.remindAt)}`, ANSI.dim)}` +
          color(`  ·  ${event.recurrence}`, ANSI.dim)
      );
      break;
  }
}

export function printEvents(events: ReadonlyArray<AppEvent>, emptyMsg = '(порожній список)'): void {
  if (events.length === 0) {
    console.log(color(`  ${emptyMsg}`, ANSI.dim));
    return;
  }
  for (const e of events) printEvent(e);
}

export function printInfo(msg: string): void {
  console.log(`  ${color('●', ANSI.cyan)} ${msg}`);
}

export function printSuccess(msg: string): void {
  console.log(`  ${color('✓', ANSI.green)} ${msg}`);
}

export function printWarn(msg: string): void {
  console.log(`  ${color('!', ANSI.yellow)} ${msg}`);
}

export function printError(msg: string): void {
  console.log(`  ${color('✕', ANSI.red)} ${msg}`);
}
