import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, startWith } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-courses-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './courses-page.component.html',
  styleUrls: ['./courses-page.component.scss'],
})
export class CoursesPageComponent {
  private readonly courseService = inject(CourseService);

  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  readonly courses$: Observable<Course[]> = this.searchControl.valueChanges.pipe(
    startWith(''),
    map((value) => value ?? ''),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((query) => this.courseService.searchCourses(query))
  );

  clear(): void {
    this.searchControl.setValue('');
  }
}
