import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
    ...appConfig,  // 🔥 Fusionne appConfig ici
    providers: [
        ...appConfig.providers,  // 🔥 Garde les providers existants
        provideHttpClient(),  // ✅ Ajoute HttpClient
    ]
}).catch((err) => console.error(err));