import { Routes } from '@angular/router';
import { CoursesManagerPageComponent } from './components/courses-manager-page/courses-manager-page.component';

export const routes: Routes = [
  { path: '', component: CoursesManagerPageComponent },
  { path: '**', redirectTo: '' },
];
