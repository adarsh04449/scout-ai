// Zod validation schemas

import { z } from "zod";

export const startupIdeaSchema = z.string()
  .min(10, "Startup idea must be at least 10 characters")
  .max(500, "Startup idea must be less than 500 characters")
  .trim();

export const forecastSeriesSchema = z.object({
  year: z.coerce.number().int(),
  value: z.coerce.number().nonnegative(),
});

export const forecastSchema = z.object({
  title: z.string(),
  unit: z.string(),
  series: z.array(forecastSeriesSchema).min(1, "Forecast must include at least one data point"),
  scenarios: z.array(z.string()).optional(),
});

export const researchResponseSchema = z.object({
  summary: z.string(),
  competitors: z.array(z.string()),
  forecast: forecastSchema,
  sources: z.array(z.string()),
});

// Infer TypeScript types from schemas
export type ForecastSeries = z.infer<typeof forecastSeriesSchema>;
export type Forecast = z.infer<typeof forecastSchema>;
export type ResearchResponse = z.infer<typeof researchResponseSchema>;

