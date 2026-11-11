import io
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple
from PyPDF2 import PdfReader

# Load predefined JSON dictionary of tech skills
SKILLS_FILE_PATH = Path(__file__).resolve().parent.parent / "data" / "tech_skills.json"

def load_skills_dictionary() -> Dict[str, List[str]]:
    try:
        with open(SKILLS_FILE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[Warning] Failed to load skills dictionary from {SKILLS_FILE_PATH}: {e}")
        return {
            "languages": ["Python", "TypeScript", "JavaScript", "Go", "C++", "SQL"],
            "frameworks": ["React", "Next.js", "FastAPI", "Node.js", "Express", "Tailwind CSS"],
            "cloud_devops": ["Docker", "AWS", "Kubernetes", "Git", "CI/CD"],
            "databases": ["PostgreSQL", "Redis", "MongoDB", "Prisma"],
            "ai_data": ["scikit-learn", "PyTorch", "Pandas", "TF-IDF"],
            "architecture_tools": ["Microservices", "REST APIs", "System Design", "Jest"]
        }

SKILLS_DICT = load_skills_dictionary()

class PDFExtractor:
    @staticmethod
    def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
        """
        Extract text from raw PDF bytes using PyPDF2.
        """
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            extracted_pages = []
            
            for page_idx, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    extracted_pages.append(page_text)
                    
            raw_text = "\n".join(extracted_pages)
            return PDFExtractor.clean_text(raw_text)
        except Exception as e:
            raise ValueError(f"Failed to parse PDF document: {str(e)}")

    @staticmethod
    def clean_text(text: str) -> str:
        """
        Normalizes whitespace, strips zero-width/unicode artifacts, and removes unreadable binary characters.
        """
        # Strip zero-width spaces, joiners, byte-order marks, and non-printable control chars
        cleaned = re.sub(r'[\u200B-\u200D\uFEFF\x00-\x08\x0B\x0C\x0E-\x1F]', '', text)
        cleaned = re.sub(r'[ \t]+', ' ', cleaned)
        cleaned = re.sub(r'\n\s*\n+', '\n\n', cleaned)
        return cleaned.strip()

    @staticmethod
    def validate_resume_document(text: str) -> Tuple[bool, str]:
        """
        Strict validation guardrail to ensure the document is an engineering/technical resume.
        Rejects non-resume documents such as certificates, course completions, invoices,
        or arbitrary text files missing standard candidate contact and section headers.
        """
        if not text or len(text.strip().split()) < 35:
            return False, "Invalid Document. Please upload a standard Resume."

        lower_text = text.lower()

        # 1. RegEx Check: Email and Phone Number
        email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        phone_pattern = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{3,4}|\b\d{10}\b'

        has_email = bool(re.search(email_pattern, text))
        has_phone = bool(re.search(phone_pattern, text))

        if not (has_email or has_phone):
            return False, "Invalid Document. Please upload a standard Resume."

        # 2. Structural Section Check: Must contain standard resume headers
        # Keywords: "Education", "Experience", "Projects", "Skills"
        has_education = bool(re.search(r'\b(education|academic|academics|degree|b\.tech|bachelor|master|university|college|cgpa|gpa)\b', lower_text))
        has_experience = bool(re.search(r'\b(experience|employment|work history|internship|internships|job experience)\b', lower_text))
        has_projects = bool(re.search(r'\b(projects|technical projects|academic projects|key projects)\b', lower_text))
        has_skills = bool(re.search(r'\b(skills|technical skills|technologies|competencies|proficiencies|languages)\b', lower_text))

        structural_matches = sum([has_education, has_experience, has_projects, has_skills])

        # A valid resume must have at least 2 of these essential structural sections
        if structural_matches < 2:
            return False, "Invalid Document. Please upload a standard Resume."

        # 3. Explicit Guardrail Against Course Certificates and Invoices
        certificate_markers = [
            r'\bcertificate of (completion|achievement|appreciation|participation)\b',
            r'\bthis is to certify that\b',
            r'\bhas successfully completed the (course|program|training)\b',
            r'\bawarded to\b',
            r'\bcourse certificate\b',
            r'\binvoice\b',
            r'\bbill to\b',
            r'\btax invoice\b'
        ]

        for marker in certificate_markers:
            if re.search(marker, lower_text) and structural_matches < 3:
                return False, "Invalid Document. Please upload a standard Resume."

        return True, "Valid resume document."

    @staticmethod
    def identify_skills(text: str) -> Tuple[List[str], Dict[str, List[str]]]:
        """
        Scans text against the predefined JSON skills dictionary using word boundary regex.
        Returns a flat list of skills and a categorized mapping.
        """
        found_skills = set()
        categorized_results: Dict[str, List[str]] = {
            "languages": [],
            "frameworks": [],
            "cloud_devops": [],
            "databases": [],
            "ai_data": [],
            "architecture_tools": []
        }

        # Case-insensitive boundary matching
        for category, skills_list in SKILLS_DICT.items():
            for skill in skills_list:
                escaped_skill = re.escape(skill)
                # Word boundary check
                pattern = rf"(?i)(?:\b|(?<=[^a-zA-Z0-9])){escaped_skill}(?:\b|(?=[^a-zA-Z0-9]))"
                if re.search(pattern, text):
                    canonical = skill
                    if canonical not in found_skills:
                        found_skills.add(canonical)
                        if category in categorized_results:
                            categorized_results[category].append(canonical)

        return sorted(list(found_skills)), categorized_results

    @staticmethod
    def calculate_ats_score(text: str, skills_count: int) -> int:
        """
        Scores ATS friendliness based on length, standard sections, and skill density.
        """
        score = 75
        word_count = len(text.split())

        # Length validation
        if 250 <= word_count <= 1200:
            score += 10
        elif 100 <= word_count < 250:
            score += 5
        elif word_count < 100:
            score -= 10

        # Check for standard sections
        sections = ['experience', 'education', 'projects', 'skills', 'summary']
        for sec in sections:
            if re.search(rf"(?i)\b{sec}\b", text):
                score += 3

        # Skill density bonus
        if skills_count >= 15:
            score += 8
        elif skills_count >= 8:
            score += 5

        return min(98, max(50, score))
