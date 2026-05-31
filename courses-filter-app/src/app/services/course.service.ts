import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Course } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly courses: Course[] = [
    { id: 1, title: 'Основи Angular', category: 'Frontend', duration: '20 годин' },
    { id: 2, title: 'RxJS реактивні потоки', category: 'Frontend', duration: '12 годин' },
    { id: 3, title: 'Node.js та REST API', category: 'Backend', duration: '18 годин' },
    { id: 4, title: 'PostgreSQL для розробників', category: 'Backend', duration: '14 годин' },
    { id: 5, title: 'TypeScript з нуля', category: 'Мова програмування', duration: '8 годин' },
    { id: 6, title: 'Docker та контейнеризація', category: 'DevOps', duration: '10 годин' },
    { id: 7, title: 'CI/CD з GitHub Actions', category: 'DevOps', duration: '6 годин' },
    { id: 8, title: 'React Hooks глибоко', category: 'Frontend', duration: '7 годин' },
    { id: 9, title: 'Чистий код TypeScript', category: 'Мова програмування', duration: '5 годин' },
  ];

  getCourses(): Observable<Course[]> {
    return of(this.courses);
  }

  getCategories(): Observable<string[]> {
    const set = new Set(this.courses.map((c) => c.category));
    return of(Array.from(set));
  }
}
