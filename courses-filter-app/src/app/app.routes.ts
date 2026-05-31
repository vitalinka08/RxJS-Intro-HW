import { Routes } from '@angular/router';
import { CoursesFilterPageComponent } from './components/courses-filter-page/courses-filter-page.component';

export const routes: Routes = [
  { path: '', component: CoursesFilterPageComponent },
  { path: '**', redirectTo: '' },
];
