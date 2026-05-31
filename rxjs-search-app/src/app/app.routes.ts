import { Routes } from '@angular/router';
import { CoursesPageComponent } from './components/courses-page/courses-page.component';

export const routes: Routes = [
  { path: '', component: CoursesPageComponent },
  { path: '**', redirectTo: '' },
];
