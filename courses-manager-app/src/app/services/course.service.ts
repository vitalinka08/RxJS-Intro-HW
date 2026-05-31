import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Course } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly seed: Course[] = [
    { id: 1, title: 'Основи Angular', category: 'Frontend', duration: '20 годин' },
    { id: 2, title: 'RxJS: реактивні потоки', category: 'Frontend', duration: '12 годин' },
    { id: 3, title: 'Node.js та REST API', category: 'Backend', duration: '18 годин' },
  ];

  private readonly state = new BehaviorSubject<Course[]>([...this.seed]);

  readonly courses$: Observable<Course[]> = this.state.asObservable();

  addCourse(data: Omit<Course, 'id'>): void {
    const list = this.state.getValue();
    const nextId = list.length ? Math.max(...list.map((c) => c.id)) + 1 : 1;
    this.state.next([...list, { id: nextId, ...data }]);
  }

  deleteCourse(id: number): void {
    this.state.next(this.state.getValue().filter((c) => c.id !== id));
  }
}
