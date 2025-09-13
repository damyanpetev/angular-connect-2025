import { Component, EventEmitter, Output, model, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IGX_SELECT_DIRECTIVES } from 'igniteui-angular';

type WeatherData = { temperature: number; description: string } | null;

@Component({
  selector: 'weather-widget',
  standalone: true,
  imports: [FormsModule, IGX_SELECT_DIRECTIVES],
  templateUrl: './weather-widget.html',
  styleUrl: './weather-widget.scss'
})
export class WeatherWidget {
  public selectedLocationName = model<string>('Sofia');

  @Output() dataError = new EventEmitter<string>();

  protected locations = [
    { name: 'Sofia', lat: 42.6977, lon: 23.3219 },
    { name: 'London', lat: 51.5072, lon: -0.1276 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 }
  ];

  selectedLocation = this.locations[0];
  weather = resource<WeatherData | null, any>({
    params: () => ({ name: this.selectedLocationName() }),
    loader: async ({ params }) => {
      const loc = this.locations.find(l => l.name.toLowerCase() === params.name.toLowerCase());
      if (!loc) {
        this.dataError.emit(`Unknown location: ${params.name}`);
        return null;
      }
      return this.fetchWeather(loc.lat, loc.lon) as unknown as Promise<WeatherData | null>;
    },
  });

  constructor(private http: HttpClient) {}

  private fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
    return new Promise((resolve) => {
      this.http.get<any>(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode`
      ).subscribe({
        next: (data) => {
          const temp = data.current.temperature_2m;
          const code = data.current.weathercode;
          resolve({
            temperature: temp,
            description: this.mapWeatherCode(code)
          });
        },
        error: () => {
          this.dataError.emit('Failed to get weather data');
          resolve(null);
        }
      });
    });
  }

  private mapWeatherCode(code: number): string {
    const map: Record<number, string> = {
      0: '☀️ Clear sky',
      1: '☀️ Mainly clear',
      2: '🌤️ Partly cloudy',
      3: '☁️ Overcast',
      45: '🌫️ Fog',
      48: '🌫️ Depositing rime fog',
      51: '🌧️ Light drizzle',
      53: '🌧️ Drizzle',
      55: '🌧️ Heavy drizzle',
      61: '🌧️ Slight rain',
      63: '🌧️ Rain',
      65: '☔ Heavy Rain',
      71: '🌨️ Slight snow',
      80: '☔ Rain showers',
      82: '☔ Heavy showers',
      95: '⛈️ Thunderstorm'
    };
    return map[code] || 'Unknown';
  }
}
