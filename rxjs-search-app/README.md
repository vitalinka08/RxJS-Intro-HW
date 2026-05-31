# RxJS Search — Лабораторна №1

Сторінка зі списком курсів і реактивним пошуком за назвою через RxJS.

## Що використано

- `BehaviorSubject` не потрібен — джерело потоку формує `FormControl.valueChanges` (Reactive Forms).
- Ланцюжок операторів:
  - `startWith('')` — щоб одразу показати всі курси без введення;
  - `debounceTime(300)` — щоб не дьоргати фільтр на кожен натиск клавіші;
  - `distinctUntilChanged()` — щоб не повторювати запит за тим самим значенням;
  - `switchMap` — переключаємось на новий результат, скасовуючи попередній.
- `CourseService.searchCourses(query)` повертає `Observable<Course[]>` зі штучною затримкою 120 мс через `delay(...)`, щоб імітувати асинхронність.
- Якщо рядок пошуку порожній — повертається весь список.
- Пошук тільки за полем `title` (case-insensitive).

## Курс

```ts
interface Course {
  id: number;
  title: string;
  category: string;
  duration: string;
}
```

У тестових даних 8 курсів (вимога — мінімум 5).

## Запуск

```bash
npm install
npm start          # http://localhost:4200/
```

## Скріншоти (`screenshots/`)

- `01-courses-list.png` — повний список курсів (порожнє поле)
- `02-search-rx.png` — пошук за «rx» → 1 курс
- `03-search-multiple.png` — пошук за «для» → 2 курси
- `04-no-results.png` — пошук за «zzz» → нічого не знайдено
- `05-cleared.png` — після очищення поля повертаються всі курси

## Структура

```
src/app/
├── components/courses-page/
│   ├── courses-page.component.ts    # FormControl + RxJS-пайплайн
│   ├── courses-page.component.html
│   └── courses-page.component.scss
├── models/course.model.ts
├── services/course.service.ts       # searchCourses(query): Observable<Course[]>
├── app.config.ts
├── app.routes.ts
└── app.ts
```
