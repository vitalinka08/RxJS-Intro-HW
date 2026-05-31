# Courses Filter — Лабораторна №3

Сторінка `CoursesFilterPage` з комбінованим фільтром курсів за назвою та категорією. Обидва фільтри застосовуються одночасно через `combineLatest`.

## Що використано

Три окремих потоки в `CoursesFilterPageComponent`:

1. **Дані курсів** — `courseService.getCourses(): Observable<Course[]>`.
2. **Текст пошуку** — `titleControl.valueChanges` з `startWith('')`, `debounceTime(200)` і нормалізацією до lower-case.
3. **Обрана категорія** — `categoryControl.valueChanges` з `startWith(ALL_CATEGORIES)`. Для опції «Усі категорії» — sentinel-значення `__all__`.

Усі три об'єднуються через `combineLatest([courses$, title$, category$])`, далі `map` фільтрує:

```ts
courses.filter((c) => {
  const matchesTitle = !title || c.title.toLowerCase().includes(title);
  const matchesCategory = category === ALL_CATEGORIES || c.category === category;
  return matchesTitle && matchesCategory;
})
```

При зміні будь-якого фільтра `combineLatest` емітить нову трійку, `map` перераховує список, шаблон оновлюється через `async pipe`. Якщо обидва фільтри порожні — показуємо весь список.

## Дані

```ts
interface Course {
  id: number;
  title: string;
  category: string;
  duration: string;
}
```

- 9 курсів у тестових даних (вимога — мінімум 6)
- 4 різні категорії: `Frontend`, `Backend`, `Мова програмування`, `DevOps` (вимога — мінімум 3)
- список категорій для `<select>` обчислюється з даних: `getCategories()` повертає `Observable<string[]>` з унікальних значень

## Запуск

```bash
npm install
npm start          # http://localhost:4200/
```

## Скріншоти (`screenshots/`)

- `01-full-list.png` — повний список курсів (фільтри порожні, 9 карток)
- `02-filter-by-title.png` — фільтр тільки за назвою (`TypeScript` → 2 курси)
- `03-filter-by-category.png` — фільтр тільки за категорією (`Backend` → 2 курси)
- `04-filter-combined.png` — комбінований фільтр (`rest` + `Backend` → 1 курс)
- `05-no-results.png` — порожній стан при незнайденому запиті
- `06-after-reset.png` — стан після натискання «Скинути»

## Структура

```
src/app/
├── components/courses-filter-page/
│   ├── courses-filter-page.component.ts   # combineLatest + два FormControl
│   ├── courses-filter-page.component.html # input для назви, select для категорії
│   └── courses-filter-page.component.scss
├── models/course.model.ts
├── services/course.service.ts             # getCourses(), getCategories()
├── app.config.ts
├── app.routes.ts
└── app.ts
```
