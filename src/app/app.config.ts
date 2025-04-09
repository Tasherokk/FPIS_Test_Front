// app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // Provide the router with your app routes
    provideRouter(appRoutes),

    // Provide the HTTP client for making HTTP requests
    provideHttpClient(),

    // Provide global services and guards
    ApiService,
    // Add other global providers here
  ],
};
