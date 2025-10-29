// TypeScript types for the application

export interface ForecastSeries {
  year: number;
  value: number;
}

export interface Forecast {
  title: string;
  unit: string;
  series: ForecastSeries[];
  scenarios?: string[];
}

export interface ResearchResponse {
  summary: string;
  competitors: string[];
  forecast: Forecast;
  sources: string[];
}

export interface StartupIdea {
  startup_idea: string;
}

