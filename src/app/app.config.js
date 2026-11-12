import { provideHttpClient } from '@angular/common/http';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
export const appConfig = {
    providers: [provideBrowserGlobalErrorListeners(), provideHttpClient()],
};
