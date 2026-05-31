# Courses Manager — Лабораторна №2

Сторінка `CoursesManagerPage` для перегляду, додавання та видалення курсів. Стан списку зберігається у `BehaviorSubject`, UI оновлюється реактивно.

## Що використано

- `CourseService` тримає приватний `BehaviorSubject<Course[]>` (єдине джерело правди).
- Зовні виставлений `courses$: Observable<Course[]>` через `state.asObservable()` — компоненти не можуть викликати `.next()` напряму.
- Методи `addCourse({ title, category, duration })` і `deleteCourse(id)` пушать новий масив у subject — далі UI оновлюється автоматично.
- Унікальний `id` нового курсу — `max(id) + 1` від поточного списку (після видалення не «з'їжджає»).
- У компоненті використано `toSignal(courses$)` + OnPush + Reactive Forms (`FormGroup` з трьох контролів і `Validators.required`).

## Курс

```ts
interface Course {
  id: number;
  title: string;
  category: string;
  duration: string;
}
```

Стартові дані — 3 курси (вимога — мінімум 3).

## Запуск

```bash
npm install
npm start          # http://localhost:4200/
```

Сторінка працює повністю в пам'яті, без бекенду.

## Скріншоти (`screenshots/`)

- `01-courses-list.png` — стартовий список (3 курси)
- `02-form-filled.png` — заповнена форма перед додаванням
- `03-course-added.png` — після додавання нового курсу (4 у списку, тост)
- `04-course-deleted.png` — після видалення курсу (тост, оновлений список)

## Структура

```
src/app/
├── components/courses-manager-page/
│   ├── courses-manager-page.component.ts    # форма + toSignal(courses$)
│   ├── courses-manager-page.component.html
│   └── courses-manager-page.component.scss
├── models/course.model.ts
├── services/course.service.ts               # BehaviorSubject<Course[]>
├── app.config.ts
├── app.routes.ts
└── app.ts
```
