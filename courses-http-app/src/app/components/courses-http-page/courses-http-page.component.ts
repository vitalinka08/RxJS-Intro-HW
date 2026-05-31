import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, delay, finalize, of } from 'rxjs';
import { Course } from '../../models/course.model';
import { CourseHttpService } from '../../services/course-http.service';

type CoursesState =
  | { status: 'loading' }
  | { status: 'success'; courses: Course[] }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-courses-http-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './courses-http-page.component.html',
  styleUrls: ['./courses-http-page.component.scss'],
})
export class CoursesHttpPageComponent {
  private readonly svc = inject(CourseHttpService);

  readonly state = signal<CoursesState>({ status: 'loading' });

  constructor() {
    this.load();
  }

  load(): void {
    this.state.set({ status: 'loading' });
    this.svc
      .getCourses()
      .pipe(
        delay(700),
        catchError((err: HttpErrorResponse) => {
          const message =
            err.status === 0
              ? 'Не вдалося зв\'язатися з API. Перевірте, чи запущено json-server (порт 3000).'
              : `Помилка ${err.status}: ${err.statusText || 'невідома'}`;
          this.state.set({ status: 'error', message });
          return of<Course[] | null>(null);
        }),
        finalize(() => {})
      )
      .subscribe((courses) => {
        if (courses) {
          this.state.set({ status: 'success', courses });
        }
      });
  }
}
