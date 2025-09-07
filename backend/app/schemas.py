from pydantic import BaseModel
from typing import List, Optional
from .models import Profile, Skill

class SkillDetectionRequest(BaseModel):
    profile: Profile
    resume_text: str
    ui_settings: Optional[dict] = {}

class RoleFitRequest(BaseModel):
    profile: Profile
    skills: List[Skill]
    top_n: int = 5