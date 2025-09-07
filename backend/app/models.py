from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any

class Profile(BaseModel):
    name: str
    age: int = Field(..., ge=14, le=100)
    years_of_experience: int = Field(..., ge=0, le=60)
    interest_areas: List[str] = []
    education: str

class Skill(BaseModel):
    name: str
    level: int = Field(..., ge=0, le=10)

class RequiredSkill(BaseModel):
    skill: str
    required_level: int = Field(..., ge=0, le=10)
    weight: float = Field(..., ge=0, le=1)

class Role(BaseModel):
    title: str
    required_skills: List[RequiredSkill]
    min_years_experience: int
    preferred_education: List[str]
    aliases: Optional[List[str]] = []
    industry: Optional[str] = ""
    remote_friendly: Optional[bool] = False

class RoleFitResult(BaseModel):
    title: str
    fit_percentage: float
    matching_skills: List[Dict[str, Any]]
    missing_skills: List[Dict[str, Any]]
    reason: str