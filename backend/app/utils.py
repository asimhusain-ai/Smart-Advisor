import PyPDF2
from io import BytesIO
import re
from typing import Dict, List

def parse_pdf(pdf_content: bytes) -> str:
    """Parse PDF content and extract text"""
    try:
        pdf_file = BytesIO(pdf_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
            
        return text.strip()
    except Exception as e:
        raise Exception(f"PDF parsing failed: {str(e)}")

def normalize_skills(skills: List[str], taxonomy: Dict) -> List[str]:
    """Normalize skill names using taxonomy"""
    normalized = []
    
    for skill in skills:
        skill_lower = skill.lower().strip()
        found = False
        
        for canonical, variants in taxonomy.items():
            if (skill_lower == canonical.lower() or 
                any(skill_lower == v.lower() for v in variants)):
                normalized.append(canonical)
                found = True
                break
        
        if not found:
            normalized.append(skill)  # Keep original if not found in taxonomy
    
    return list(set(normalized))  # Remove duplicates