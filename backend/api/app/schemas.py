from pydantic import BaseModel, Field
from typing import List, Optional


class ResearchRequest(BaseModel):
    startup_idea: str = Field(..., min_length=10, description="The startup idea to research")


class ForecastSeries(BaseModel):
    year: int = Field(..., description="Year for the forecast data point")
    value: float = Field(..., description="Forecast value for the year")


class Forecast(BaseModel):
    title: str = Field(..., description="Title of the forecast")
    unit: str = Field(..., description="Unit of measurement (e.g., 'USD Billions', 'Million Users')")
    series: List[ForecastSeries] = Field(..., description="List of forecast data points")
    scenarios: Optional[List[str]] = Field(None, description="Optional list of forecast scenarios")


class ResearchResponse(BaseModel):
    summary: str = Field(..., description="Executive summary of the market research")
    competitors: List[str] = Field(..., description="List of key competitors")
    forecast: Forecast = Field(..., description="Market forecast data")
    sources: List[str] = Field(..., description="List of sources used in the research")

