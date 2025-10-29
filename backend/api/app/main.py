from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import sys
import json
import re

from .schemas import ResearchRequest, ResearchResponse

# Import MarketResearch crew
# Try to import, and if it fails, add to sys.path and try again
try:
    from market_research.crew import MarketResearch
except ImportError:
    # Fallback: add market_research to sys.path
    import sys
    import os
    market_research_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../../market_research/src")
    )
    sys.path.insert(0, market_research_path)
    try:
        from market_research.crew import MarketResearch
    except ImportError as e:
        # If still failing, raise a helpful error
        raise ImportError(
            f"Could not import MarketResearch. "
            f"Please run 'cd {os.path.dirname(market_research_path)} && pip install -e .' "
            f"Error: {e}"
        )

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="ScoutAI Market Research API",
    description="API for running AI-powered market research on startup ideas",
    version="1.0.0"
)

# Configure CORS to allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_json_from_text(text: str) -> dict:
    """Extract JSON from markdown code blocks or raw text"""
    # Try to find JSON in code blocks first
    json_pattern = r'```(?:json)?\s*(\{[\s\S]*?\})\s*```'
    matches = re.findall(json_pattern, text)
    
    if matches:
        try:
            return json.loads(matches[0])
        except json.JSONDecodeError:
            pass
    
    # Try to find raw JSON object
    json_pattern = r'\{[\s\S]*?"series"[\s\S]*?\}'
    matches = re.findall(json_pattern, text)
    
    if matches:
        try:
            return json.loads(matches[0])
        except json.JSONDecodeError:
            pass
    
    # Return default structure
    return {
        "title": "Market Forecast",
        "unit": "USD",
        "series": [],
        "scenarios": []
    }


def extract_competitors_from_text(text: str) -> list:
    """Extract competitor names from competitive analysis text"""
    competitors = []
    
    # Look for lines that might contain competitor names
    # Typically in tables or bullet points
    lines = text.split('\n')
    
    for line in lines:
        # Skip headers and empty lines
        if '|' in line and 'Name' not in line and '---' not in line:
            # Extract from table format
            parts = [p.strip() for p in line.split('|') if p.strip()]
            if parts and len(parts[0]) > 2:
                competitors.append(parts[0])
        elif line.strip().startswith('-') or line.strip().startswith('*'):
            # Extract from bullet points
            name = line.strip().lstrip('-*').strip().split(':')[0].strip()
            if len(name) > 2 and len(name) < 50:
                competitors.append(name)
    
    # Return unique competitors, limited to top 10
    return list(dict.fromkeys(competitors))[:10]


def extract_sources_from_text(text: str) -> list:
    """Extract source URLs and citations from text"""
    sources = []
    
    # Find URLs
    url_pattern = r'https?://[^\s\)\]"]+'
    urls = re.findall(url_pattern, text)
    sources.extend(urls[:10])  # Limit to 10 sources
    
    # If no URLs found, look for citation-style references
    if not sources:
        lines = text.split('\n')
        for line in lines:
            if 'source' in line.lower() or 'citation' in line.lower() or line.strip().startswith('['):
                sources.append(line.strip())
    
    return sources[:10] if sources else ["Various market research sources"]


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "ScoutAI API is running", "status": "healthy"}


@app.post("/research/run", response_model=ResearchResponse)
async def run_research(request: ResearchRequest):
    """
    Run market research analysis on a startup idea.
    
    Args:
        request: ResearchRequest containing the startup_idea
        
    Returns:
        ResearchResponse with summary, competitors, forecast, and sources
    """
    try:
        # Instantiate the crew (import is at the top of the file now)
        market_research_crew = MarketResearch()
        
        # Run the crew with the startup idea and topic
        inputs = {
            "startup_idea": request.startup_idea,
            "topic": request.startup_idea,
            "start_year": "2025",
            "unit": "USD"
        }
        result = market_research_crew.crew().kickoff(inputs=inputs)
        
        # Access individual task outputs
        # CrewAI stores task outputs in result.tasks_output (list of TaskOutput objects)
        tasks_output = result.tasks_output if hasattr(result, 'tasks_output') else []
        
        # Extract outputs from each task
        # NEW Task order (3 tasks): research_task, forecast_task, synthesis_task
        research_output = str(tasks_output[0].raw) if len(tasks_output) > 0 else ""
        forecast_output = str(tasks_output[1].raw) if len(tasks_output) > 1 else ""
        synthesis_output = str(tasks_output[2].raw) if len(tasks_output) > 2 else str(result)
        
        # Parse forecast JSON from the forecast_task output
        forecast_data = extract_json_from_text(forecast_output)
        
        # Extract competitors from research output (competitors are now in research_task)
        competitors = extract_competitors_from_text(research_output)
        if not competitors:
            competitors = ["No competitors found"]
        
        # Extract sources from research output
        sources = extract_sources_from_text(research_output + "\n" + synthesis_output)
        
        # Use synthesis output as the main summary
        summary = synthesis_output if synthesis_output else "Market research completed successfully."
        
        # Build the response
        response = ResearchResponse(
            summary=summary,
            competitors=competitors,
            forecast=forecast_data,
            sources=sources
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error running market research: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "api_version": "1.0.0",
        "environment": "development"
    }
