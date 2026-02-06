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

# Configure CORS to allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",  # All Vercel preview deployments
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Regex for Vercel subdomains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_json_from_text(text: str) -> dict:
    """Extract JSON from markdown code blocks or raw text"""
    if not text:
        return get_default_forecast()
    
    # First, try to parse the entire text as JSON (in case it's pure JSON output)
    text_stripped = text.strip()
    if text_stripped.startswith('{') and text_stripped.endswith('}'):
        try:
            parsed = json.loads(text_stripped)
            if isinstance(parsed, dict) and "series" in parsed:
                if isinstance(parsed.get("series"), list) and len(parsed.get("series", [])) > 0:
                    return parsed
        except json.JSONDecodeError:
            pass
    
    # Try to find JSON in code blocks (legacy format)
    json_pattern = r'```(?:json)?\s*(\{[\s\S]*?\})\s*```'
    matches = re.findall(json_pattern, text, re.DOTALL)
    
    if matches:
        for match in matches:
            try:
                parsed = json.loads(match)
                # Validate it has the required structure
                if isinstance(parsed, dict) and "series" in parsed:
                    if isinstance(parsed.get("series"), list) and len(parsed.get("series", [])) > 0:
                        return parsed
            except json.JSONDecodeError:
                continue
    
    # Try to find raw JSON object with "series" key (multiline)
    json_pattern = r'\{[^{}]*"series"\s*:\s*\[[^\]]*\][^{}]*\}'
    matches = re.findall(json_pattern, text, re.DOTALL)
    
    if matches:
        for match in matches:
            try:
                parsed = json.loads(match)
                if isinstance(parsed, dict) and "series" in parsed:
                    if isinstance(parsed.get("series"), list) and len(parsed.get("series", [])) > 0:
                        return parsed
            except json.JSONDecodeError:
                continue
    
    # Try a more flexible pattern to find JSON object that might span multiple lines
    # Look for opening brace followed by content including "series" and closing brace
    start_idx = text.find('{')
    if start_idx != -1:
        # Find matching closing brace
        brace_count = 0
        for i in range(start_idx, len(text)):
            if text[i] == '{':
                brace_count += 1
            elif text[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    json_str = text[start_idx:i+1]
                    try:
                        parsed = json.loads(json_str)
                        if isinstance(parsed, dict) and "series" in parsed:
                            if isinstance(parsed.get("series"), list) and len(parsed.get("series", [])) > 0:
                                return parsed
                    except json.JSONDecodeError:
                        pass
                    break
    
    # Return default structure with at least one placeholder data point
    return get_default_forecast()


def get_default_forecast() -> dict:
    """Return a valid default forecast structure with realistic default values"""
    return {
        "title": "5-Year Growth Forecast",
        "unit": "USD",
        "series": [
            {"year": 2025, "value": 100000},
            {"year": 2026, "value": 250000},
            {"year": 2027, "value": 500000},
            {"year": 2028, "value": 850000},
            {"year": 2029, "value": 1300000}
        ],
        "scenarios": []
    }


def extract_competitors_from_text(text: str) -> list:
    """Extract competitor names from competitive analysis text"""
    competitors = []
    
    # First, try to find the Competitive Intelligence section
    comp_section_match = re.search(
        r'##\s*Competitive\s+Intelligence[\s\S]*?(?=##\s*Growth|##\s*Strategic|##\s*Sources|$)',
        text,
        re.IGNORECASE
    )
    
    if comp_section_match:
        text = comp_section_match.group(0)
    
    lines = text.split('\n')
    in_competitor_section = False
    
    for line in lines:
        line_stripped = line.strip()
        
        # Skip empty lines and headers
        if not line_stripped or '---' in line_stripped:
            continue
        
        # Look for competitor section headers
        if 'competitor' in line_stripped.lower() or 'top competitors' in line_stripped.lower():
            in_competitor_section = True
            continue
        
        # Extract from table format (markdown tables)
        if '|' in line_stripped and 'Name' not in line_stripped and '---' not in line_stripped:
            parts = [p.strip() for p in line_stripped.split('|') if p.strip()]
            if parts and len(parts[0]) > 2 and len(parts[0]) < 100:
                name = parts[0].split('—')[0].split('-')[0].strip()
                name = re.sub(r'\[.*?\]\(.*?\)', '', name).strip()
                name = re.sub(r'https?://\S+', '', name).strip()
                name = re.sub(r'\[\d+\]', '', name).strip()
                if name and len(name) > 2:
                    competitors.append(name)
        
        # Extract from bullet points (format: - Name — URL [citation])
        elif (line_stripped.startswith('-') or line_stripped.startswith('*')) and (
            'https://' in line_stripped or 'http://' in line_stripped or '—' in line_stripped
        ):
            # Remove bullet marker
            name = line_stripped.lstrip('-*').strip()
            
            # Pattern: "CompanyName — https://..." or "CompanyName - https://..."
            # Handle em dash (—) and regular dash (-)
            if '—' in name:
                name = name.split('—')[0].strip()
            elif ' - ' in name and ('https://' in name or 'http://' in name):
                name = name.split(' - ')[0].strip()
            elif 'https://' in name:
                name = name.split('https://')[0].strip()
            elif 'http://' in name:
                name = name.split('http://')[0].strip()
            
            # Remove citations [1], [2], etc.
            name = re.sub(r'\[\d+\]', '', name).strip()
            
            # Remove markdown links but preserve text
            name = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', name).strip()
            
            if name and len(name) > 2 and len(name) < 100:
                competitors.append(name)
        
        # Extract from numbered list or header format
        # Pattern: "CompanyName — URL" or just "CompanyName" followed by URL
        elif re.match(r'^[-*•]\s*[A-Z][a-zA-Z0-9\s&]+(?:—| - |:)\s*https?://', line_stripped):
            name = re.split(r'(?:—| - |:)\s*https?://', line_stripped)[0]
            name = name.lstrip('-*•').strip()
            name = re.sub(r'\[\d+\]', '', name).strip()
            if name and len(name) > 2 and len(name) < 100:
                competitors.append(name)
    
    # Also try to extract from "Top competitors (detailed)" section with headers
    # Pattern: "- CompanyName — https://..." where CompanyName is capitalized
    competitor_headers = re.findall(
        r'[-*•]\s*([A-Z][a-zA-Z0-9\s&]+?)(?:—| - |:)\s*https?://',
        text,
        re.MULTILINE
    )
    
    for comp in competitor_headers:
        comp = comp.strip()
        comp = re.sub(r'\[\d+\]', '', comp).strip()
        if comp and len(comp) > 2 and len(comp) < 100 and comp not in competitors:
            competitors.append(comp)
    
    # More aggressive pattern: Look for any line with format: "- CompanyName — URL" or "CompanyName — URL"
    # This catches formats like "HireVue — https://www.hirevue.com/"
    aggressive_pattern = re.findall(
        r'(?:^[-*•]\s*|^)([A-Z][a-zA-Z0-9\s&.]+?)\s*[—\-]\s*https?://[^\s]+',
        text,
        re.MULTILINE | re.IGNORECASE
    )
    
    for comp in aggressive_pattern:
        comp = comp.strip()
        # Skip common false positives
        if comp.lower() in ['positioning', 'strengths', 'weaknesses', 'differentiation', 'strategic']:
            continue
        if len(comp) > 2 and len(comp) < 100 and comp not in competitors:
            competitors.append(comp)
    
    # Return unique competitors, limited to top 10
    return list(dict.fromkeys(competitors))[:10]


def extract_summary_without_forecast(text: str) -> str:
    """
    Extract all sections from synthesis output EXCEPT:
    - Growth Forecast & Strategy section (displayed as graph separately)
    - Sources & Citations section (displayed separately)
    
    Note: Competitive Intelligence section is kept as-is with all competitor listings
    """
    if not text:
        return "Market research completed successfully."
    
    # Remove Growth Forecast & Strategy section completely
    # This includes "5-Year Forecast (JSON)" and the JSON block
    # Match from "## Growth Forecast" or "Growth Forecast & Strategy" or "5-Year Forecast" to next major section
    forecast_section = re.search(
        r'(##\s*Growth\s+Forecast.*?|5-Year\s+Forecast.*?)(?=##\s*Strategic|##\s*Sources|Summary\s+of\s+the\s+5-year|$)',
        text,
        re.IGNORECASE | re.DOTALL
    )
    
    if forecast_section:
        text = text.replace(forecast_section.group(1), '')
    
    # Also remove standalone "5-Year Forecast (JSON)" sections
    json_forecast_pattern = re.search(
        r'5-Year\s+Forecast\s*\(JSON\)[\s\S]*?\{[\s\S]*?"title"[\s\S]*?"series"[\s\S]*?\}[\s\S]*?(?=Summary\s+of\s+the\s+5-year|##\s*Strategic|##\s*Sources|$)',
        text,
        re.IGNORECASE | re.DOTALL
    )
    
    if json_forecast_pattern:
        text = text.replace(json_forecast_pattern.group(0), '')
    
    # Remove Sources & Citations section completely (displayed separately)
    # Match various patterns: "## Sources", "## Sources & Citations", "## 📚 Sources & Citations", etc.
    sources_patterns = [
        r'##\s*📚\s*Sources[^\#]*?$',
        r'##\s*Sources\s*&?\s*Citations?[^\#]*?$',
        r'##\s*Sources[^\#]*?$',
        r'###\s*Sources[^\#]*?$',
        r'###\s*Sources\s*&?\s*Citations?[^\#]*?$',
    ]
    
    for pattern in sources_patterns:
        sources_section = re.search(pattern, text, re.IGNORECASE | re.DOTALL | re.MULTILINE)
        if sources_section:
            text = text.replace(sources_section.group(0), '')
            break
    
    # Remove citation-style sources (lines starting with [1], [2], etc. followed by URLs)
    # This catches formatted citations like "[1] Grand View Research — ... https://..."
    # Pattern matches: [number] followed by any text and a URL, across multiple lines
    citation_block_pattern = r'(?:^|\n)(\[\d+\][^\n]*https?://[^\n]*(?:\n|$))+(?=\n\n|\n[^\[]|$)'
    text = re.sub(citation_block_pattern, '', text, flags=re.MULTILINE)
    
    # Also remove any remaining standalone citation lines
    citation_line_pattern = r'^\[\d+\][^\n]*https?://[^\n]*(?:\n|$)'
    text = re.sub(citation_line_pattern, '', text, flags=re.MULTILINE)
    
    # Keep Competitive Intelligence section as-is (no filtering)
    # The entire section including competitor listings will be displayed
    
    # Clean up extra whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip() if text.strip() else "Market research completed successfully."


def extract_sources_from_text(text: str) -> list:
    """Extract source URLs and citations from text, deduplicated"""
    sources = []
    seen_urls = set()
    
    # Find URLs - extract from markdown links and plain URLs
    # Pattern 1: Markdown links [text](url)
    markdown_link_pattern = r'\[([^\]]+)\]\(([^\)]+)\)'
    markdown_links = re.findall(markdown_link_pattern, text)
    for link_text, url in markdown_links:
        if url.startswith('http') and url not in seen_urls:
            sources.append(url)
            seen_urls.add(url)
    
    # Pattern 2: Plain URLs
    url_pattern = r'https?://[^\s\)\]"]+'
    urls = re.findall(url_pattern, text)
    for url in urls:
        # Clean URL (remove trailing punctuation)
        url = url.rstrip('.,;:!?)')
        if url not in seen_urls:
            sources.append(url)
            seen_urls.add(url)
    
    # If no URLs found, look for citation-style references
    if not sources:
        lines = text.split('\n')
        for line in lines:
            line_stripped = line.strip()
            if line_stripped and ('source' in line_stripped.lower() or 'citation' in line_stripped.lower() or line_stripped.startswith('[')):
                # Try to extract URL from the line
                url_match = re.search(url_pattern, line_stripped)
                if url_match:
                    url = url_match.group(0).rstrip('.,;:!?)')
                    if url not in seen_urls:
                        sources.append(url)
                        seen_urls.add(url)
                elif line_stripped not in seen_urls:
                    sources.append(line_stripped)
                    seen_urls.add(line_stripped)
    
    # Limit to 10 unique sources
    unique_sources = list(seen_urls) if seen_urls else sources[:10]
    return unique_sources[:10] if unique_sources else ["Various market research sources"]


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
        
          # Debug logging (can be removed in production)
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Forecast output length: {len(forecast_output)}")
        logger.debug(f"Forecast output preview: {forecast_output[:500] if forecast_output else 'Empty'}")
        
        # Parse forecast JSON - search in both forecast_output and synthesis_output
        # Sometimes the JSON is in the synthesis output instead
        forecast_data = extract_json_from_text(forecast_output)
        
        # If extraction failed or series is empty, try synthesis output
        if not forecast_data.get("series") or len(forecast_data.get("series", [])) == 0:
            logger.debug("Forecast not found in forecast_output, trying synthesis_output")
            forecast_data = extract_json_from_text(synthesis_output)
        
        # If still no valid forecast, use default
        if not forecast_data.get("series") or len(forecast_data.get("series", [])) == 0:
            logger.warning("No valid forecast found, using default forecast")
            forecast_data = get_default_forecast()
        
        logger.debug(f"Final forecast_data: {forecast_data}")
        
        # Extract competitors from synthesis output (Competitive Intelligence section)
        # Also check research_output as fallback
        competitors = extract_competitors_from_text(synthesis_output)
        if not competitors or len(competitors) == 0:
            competitors = extract_competitors_from_text(research_output)
        if not competitors or len(competitors) == 0:
            competitors = ["No competitors found"]
        
        # Extract sources from synthesis output (Sources & Citations section)
        sources = extract_sources_from_text(synthesis_output)
        if not sources or len(sources) == 0:
            sources = extract_sources_from_text(research_output)
        if not sources or len(sources) == 0:
            sources = ["Various market research sources"]
        
        # Extract all sections EXCEPT forecast, explicit competitors, and sources
        summary = extract_summary_without_forecast(synthesis_output)
        
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
