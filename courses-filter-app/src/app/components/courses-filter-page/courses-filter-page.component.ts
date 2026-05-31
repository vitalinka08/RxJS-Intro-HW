import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';

import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';

const ALL_CATEGORIES = '__all__';

@Component({
  selector: 'app-courses-filter-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './courses-filter-page.component.html',
  styleUrls: ['./courses-filter-page.component.scss'],
})
export class CoursesFilterPageComponent {
  private readonly courseService = inject(CourseService);

  readonly ALL_CATEGORIES = ALL_CATEGORIES;

  readonly titleControl = new FormControl<string>('', { nonNullable: true });
  readonly categoryControl = new FormControl<string>(ALL_CATEGORIES, { nonNullable: true });

  readonly categories$: Observable<string[]> = this.courseService.getCategories();

  private readonly titleQuery$ = this.titleControl.valueChanges.pipe(
    startWith(''),
    debounceTime(200),
    map((v) => (v ?? '').trim().toLowerCase())
  );

  private readonly categoryFilter$ = this.categoryControl.valueChanges.pipe(
    startWith(ALL_CATEGORIES),
    map((v) => v ?? ALL_CATEGORIES)
  );

  readonly courses$: Observable<Course[]> = combineLatest([
    this.courseService.getCourses(),
    this.titleQuery$,
    this.categoryFilter$,
  ]).pipe(
    map(([courses, title, category]) =>
      courses.filter((c) => {
        const matchesTitle = title === '' || c.title.toLowerCase().includes(title);
        const matchesCategory = category === ALL_CATEGORIES || c.category === category;
        return matchesTitle && matchesCategory;
      })
    )
  );

  clearTitle(): void {
    this.titleControl.setValue('');
  }

  resetFilters(): void {
    this.titleControl.setValue('');
    this.categoryControl.setValue(ALL_CATEGORIES);
  }
}
