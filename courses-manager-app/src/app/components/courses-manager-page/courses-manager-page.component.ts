import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-courses-manager-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './courses-manager-page.component.html',
  styleUrls: ['./courses-manager-page.component.scss'],
})
export class CoursesManagerPageComponent {
  private readonly svc = inject(CourseService);

  readonly courses = toSignal(this.svc.courses$, { initialValue: [] as Course[] });

  readonly notice = signal<string | null>(null);

  readonly form = new FormGroup({
    title: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
      nonNullable: true,
    }),
    category: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    duration: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.svc.addCourse({
      title: raw.title.trim(),
      category: raw.category.trim(),
      duration: raw.duration.trim(),
    });
    this.flash(`Курс «${raw.title.trim()}» додано`);
    this.form.reset();
  }

  remove(course: Course): void {
    this.svc.deleteCourse(course.id);
    this.flash(`Курс «${course.title}» видалено`);
  }

  fieldHasError(field: 'title' | 'category' | 'duration', code: string): boolean {
    const c = this.form.get(field);
    return !!c && c.touched && c.hasError(code);
  }

  private flash(text: string): void {
    this.notice.set(text);
    setTimeout(() => this.notice.set(null), 2400);
  }
}
