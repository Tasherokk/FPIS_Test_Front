import { ApiService } from './app/api.service';
import {provideHttpClient} from '@angular/common/http';
import {appRoutes} from './app/app.routes';
import {provideRouter} from '@angular/router';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
    ApiService,
  ],
}).catch((err) => console.error(err));
