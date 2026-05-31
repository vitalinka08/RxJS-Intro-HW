import { Routes } from '@angular/router';
import { CoursesHttpPageComponent } from './components/courses-http-page/courses-http-page.component';

export const routes: Routes = [
  { path: '', component: CoursesHttpPageComponent },
  { path: '**', redirectTo: '' },
];
