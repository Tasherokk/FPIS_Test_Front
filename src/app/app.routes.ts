import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SubjectSelectionComponent } from './subject-selection/subject-selection.component';
import { TestComponent } from './test/test.component';
import { ResultComponent } from './result/result.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'select',
    component: SubjectSelectionComponent,
  },
  {
    path: 'test',
    component: TestComponent,
  },
  {
    path: 'result',
    component: ResultComponent,
  },
  // Wildcard route for a 404 page (optional)
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
