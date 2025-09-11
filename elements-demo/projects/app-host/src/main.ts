import { createApplication } from '@angular/platform-browser';
import { WeatherWidget } from './app/weather-widget';
import { provideHttpClient } from '@angular/common/http';
import { createCustomElement } from '@angular/elements';

createApplication({
  providers: [provideHttpClient()]
}).then(appRef => {
  const injector = appRef.injector;
  const el = createCustomElement(WeatherWidget, { injector });
  if (!customElements.get('weather-widget'))
    customElements.define('weather-widget', el);
});
