from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from typing import List, Dict, Any
import json
from datetime import datetime, timedelta
from collections import defaultdict

from . import models, schemas, services
from .utils import parse_pdf, normalize_skills

app = FastAPI(title="Smart Career Advisor API", version="1.0.0")

# Simple rate limiting storage
request_times = defaultdict(list)
RATE_LIMIT = 10  # requests per minute
RATE_LIMIT_WINDOW = 60  # seconds

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Only apply rate limiting to specific endpoints
    if request.url.path in ["/api/role-fit", "/api/detect-skills"]:
        client_ip = request.client.host
        current_time = datetime.now()
        
        # Clean up old requests
        request_times[client_ip] = [
            time for time in request_times[client_ip] 
            if current_time - time < timedelta(seconds=RATE_LIMIT_WINDOW)
        ]
        
        # Check if rate limit exceeded
        if len(request_times[client_ip]) >= RATE_LIMIT:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please try again later."}
            )
        
        # Add current request time
        request_times[client_ip].append(current_time)
    
    return await call_next(request)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load seed data
with open("app/data/degrees.json", "r") as f:
    DEGREES = json.load(f)

with open("app/data/roles.json", "r") as f:
    ROLES = json.load(f)

with open("app/data/skill_taxonomy.json", "r") as f:
    SKILL_TAXONOMY = json.load(f)

@app.get("/")
async def root():
    return {"message": "Smart Career Advisor API"}

@app.get("/api/degrees")
async def get_degrees():
    return DEGREES

@app.post("/api/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Check file size (max 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    
    try:
        text = parse_pdf(contents)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing PDF: {str(e)}")

@app.post("/api/detect-skills")
async def detect_skills(request: schemas.SkillDetectionRequest):
    try:
        # Use LLM to detect and normalize skills
        result = await services.detect_skills_with_llm(
            request.profile.dict(),
            request.resume_text,
            SKILL_TAXONOMY
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting skills: {str(e)}")

@app.post("/api/role-fit")
async def calculate_role_fit(request: schemas.RoleFitRequest):
    try:
        # Convert skills to dict for easier processing
        user_skills = {skill.name: skill.level for skill in request.skills}
        
        # Calculate fit for each role with error handling
        role_results = []
        for role_data in ROLES:
            role = models.Role(**role_data)
            fit_result = services.safe_calculate_role_fit(
                role, 
                user_skills, 
                request.profile.dict()
            )
            role_results.append(fit_result)
        
        # Sort by fit percentage and get top N
        role_results.sort(key=lambda x: x["fit_percentage"], reverse=True)
        top_roles = role_results[:request.top_n]
        
        # Generate visualization data only if we have results
        donut_data = services.generate_donut_data(top_roles[0], user_skills) if top_roles else []
        radar_data = services.generate_radar_data(top_roles[0], user_skills) if top_roles else {"skills": [], "user_levels": [], "required_levels": []}
        
        return {
            "roles": top_roles,
            "donut_data": donut_data,
            "radar_data": radar_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating role fit: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)