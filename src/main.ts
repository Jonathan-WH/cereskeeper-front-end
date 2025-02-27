import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { environment } from './environnements/environment';
import { enableProdMode } from '@angular/core';

defineCustomElements(window);
if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    ...appConfig,  // 🔥 Fusionne appConfig ici
    providers: [
        ...appConfig.providers,  // 🔥 Garde les providers existants
        provideHttpClient(),  // ✅ Ajoute HttpClient
    ]
}).catch((err) => console.error(err));