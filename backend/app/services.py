import os
import json
import openai
from typing import Dict, List, Any
from .models import Role, RoleFitResult

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

async def detect_skills_with_llm(profile: Dict, resume_text: str, skill_taxonomy: Dict) -> Dict:
    """Use LLM to detect and normalize skills from resume text"""
    
    system_message = """You are an expert career-advisor assistant and entity normalizer. 
    Output STRICT JSON only using the schema specified. NEVER provide commentary outside the JSON. 
    Use the 'skill taxonomy' mapping we provide. Your job: extract skills from the provided text, 
    canonicalize them, infer approximate proficiency (0-10) and confidence (0-1), and return 
    suggested missing skills for target roles. Do not compute final role-fit percentages — that 
    will be done by the server with the deterministic formula we supply."""
    
    user_message = f"""
    Profile: {json.dumps(profile)}
    Resume Text: {resume_text[:4000]}  # Limit text length
    Skill Taxonomy: {json.dumps(skill_taxonomy)}
    
    Return JSON using this schema:
    {{
        "skills": [
            {{"raw": "string matched phrase", "canonical": "Skill Name", "confidence": 0.0-1.0, "inferred_level": 0-10}}
        ],
        "normalization_map": {{"raw_phrase":"canonical_skill"}},
        "suggested_additional_skills": [{{"skill":"string","reason":"string"}}]
    }}
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.1,
            max_tokens=2000
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        # Fallback to simple keyword matching if LLM fails
        return fallback_skill_detection(resume_text, skill_taxonomy)


def safe_calculate_role_fit(role: Role, user_skills: Dict[str, int], profile: Dict) -> Dict:
    """Safe wrapper for calculate_role_fit with error handling"""
    try:
        return calculate_role_fit(role, user_skills, profile)
    except Exception as e:
        print(f"Error calculating fit for {role.title}: {str(e)}")
        return {
            "title": role.title,
            "fit_percentage": 0,
            "matching_skills": [],
            "missing_skills": [],
            "reason": f"Error calculating fit: {str(e)}"
        }


def fallback_skill_detection(resume_text: str, skill_taxonomy: Dict) -> Dict:
    """Fallback skill detection using keyword matching"""
    skills = []
    normalization_map = {}
    text_lower = resume_text.lower()
    
    for canonical, variants in skill_taxonomy.items():
        for variant in variants:
            if variant.lower() in text_lower:
                skills.append({
                    "raw": variant,
                    "canonical": canonical,
                    "confidence": 0.7,
                    "inferred_level": 5  # Default medium level
                })
                normalization_map[variant] = canonical
                break
    
    return {
        "skills": skills,
        "normalization_map": normalization_map,
        "suggested_additional_skills": []
    }

def calculate_role_fit(role: Role, user_skills: Dict[str, int], profile: Dict) -> Dict:
    """Calculate role fit using deterministic formula"""
    
    try:
        # Skill score calculation
        skill_score_total = 0
        weight_total = 0
        matching_skills = []
        missing_skills = []
        
        for req_skill in role.required_skills:
            user_level = user_skills.get(req_skill.skill, 0)
            # Handle division by zero
            if req_skill.required_level == 0:
                skill_ratio = 1 if user_level > 0 else 0
            else:
                skill_ratio = min(user_level / req_skill.required_level, 1)
            
            skill_contribution = skill_ratio * req_skill.weight
            
            skill_score_total += skill_contribution
            weight_total += req_skill.weight
            
            if user_level >= req_skill.required_level * 0.7:  # 70% threshold for matching
                matching_skills.append({
                    "skill": req_skill.skill,
                    "user_level": user_level,
                    "required_level": req_skill.required_level,
                    "weight": req_skill.weight
                })
            else:
                missing_skills.append({
                    "skill": req_skill.skill,
                    "user_level": user_level,
                    "required_level": req_skill.required_level,
                    "weight": req_skill.weight,
                    "weeks_to_learn": estimate_weeks_to_learn(req_skill.required_level, user_level)
                })
        
        # Handle case where no weights are defined
        if weight_total == 0:
            skill_score = 0
        else:
            skill_score = skill_score_total / weight_total
        
        # Experience score
        exp_score = min(profile.get("years_of_experience", 0) / (role.min_years_experience + 1), 1)
        
        # Education score
        education = profile.get("education", "")
        if education in role.preferred_education:
            edu_score = 1
        elif any(edu in education.lower() for edu in ["computer", "tech", "engineer", "science", "math"]):
            edu_score = 0.5
        else:
            edu_score = 0
        
        # Final fit percentage
        fit_percentage = 0.66 * skill_score + 0.20 * exp_score + 0.14 * edu_score
        fit_percentage = round(fit_percentage * 100, 2)
        
        # Apply keyword boost if specified in profile
        target_roles = profile.get("target_roles", [])
        if target_roles and any(keyword.lower() in role.title.lower() for keyword in target_roles):
            fit_percentage = min(fit_percentage + 8, 100)
        
        # Generate reason
        reason = generate_fit_reason(role.title, fit_percentage, matching_skills, missing_skills)
        
        return {
            "title": role.title,
            "fit_percentage": fit_percentage,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "reason": reason
        }
    
    except Exception as e:
        # Return a safe result with error information
        return {
            "title": role.title,
            "fit_percentage": 0,
            "matching_skills": [],
            "missing_skills": [],
            "reason": f"Error calculating fit: {str(e)}"
        }
def estimate_weeks_to_learn(required_level: int, current_level: int) -> int:
    """Estimate weeks needed to reach required skill level"""
    gap = max(0, required_level - current_level)
    return max(2, gap * 2)  # 2 weeks per level gap, minimum 2 weeks

def generate_fit_reason(title: str, fit_percentage: float, 
                       matching_skills: List, missing_skills: List) -> str:
    """Generate human-readable reason for fit score"""
    
    if fit_percentage >= 80:
        return f"Excellent fit for {title}! You have strong alignment with most required skills."
    elif fit_percentage >= 60:
        return f"Good potential for {title}. You have many required skills but need development in some areas."
    elif fit_percentage >= 40:
        return f"Moderate fit for {title}. You have some relevant skills but significant development needed."
    else:
        return f"Limited fit for {title}. Consider developing core skills or exploring alternative roles."

def generate_donut_data(role_result: Dict, user_skills: Dict) -> List[Dict]:
    """Generate data for donut chart showing skill importance"""
    donut_data = []
    
    for skill in role_result["matching_skills"]:
        donut_data.append({
            "name": skill["skill"],
            "value": skill["weight"] * 100,
            "user_level": user_skills.get(skill["skill"], 0),
            "required_level": skill["required_level"]
        })
    
    return donut_data

def generate_radar_data(role_result: Dict, user_skills: Dict) -> Dict:
    """Generate data for radar chart comparing user vs required skills"""
    radar_data = {
        "skills": [],
        "user_levels": [],
        "required_levels": []
    }
    
    # Get top 6-8 skills by weight
    all_skills = role_result["matching_skills"] + role_result["missing_skills"]
    all_skills.sort(key=lambda x: x["weight"], reverse=True)
    top_skills = all_skills[:min(8, len(all_skills))]
    
    for skill in top_skills:
        radar_data["skills"].append(skill["skill"])
        radar_data["user_levels"].append(user_skills.get(skill["skill"], 0))
        radar_data["required_levels"].append(skill["required_level"])
    
    return radar_data