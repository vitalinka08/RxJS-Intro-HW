import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Course } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly courses: Course[] = [
    { id: 1, title: 'Angular для початківців', category: 'Frontend', duration: '8 годин' },
    { id: 2, title: 'RxJS: реактивне програмування', category: 'Frontend', duration: '6 годин' },
    { id: 3, title: 'Node.js та Express', category: 'Backend', duration: '10 годин' },
    { id: 4, title: 'TypeScript з нуля', category: 'Мова програмування', duration: '5 годин' },
    { id: 5, title: 'Docker та контейнеризація', category: 'DevOps', duration: '7 годин' },
    { id: 6, title: 'CSS Grid та Flexbox', category: 'Frontend', duration: '4 години' },
    { id: 7, title: 'PostgreSQL для розробників', category: 'Backend', duration: '9 годин' },
    { id: 8, title: 'React Hooks глибоко', category: 'Frontend', duration: '6 годин' },
  ];

  searchCourses(query: string): Observable<Course[]> {
    const q = query.trim().toLowerCase();
    const result = q
      ? this.courses.filter((c) => c.title.toLowerCase().includes(q))
      : this.courses;
    return of(result).pipe(delay(120));
  }
}
