import os
import re
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.pdf_extractor import PDFExtractor
from services.matcher_service import JobMatcherService
from services.interview_analyzer import MockInterviewAnalyzer

# Initialize FastAPI application
app = FastAPI(
    title="AI Career Copilot — NLP Microservice",
    description="Microservice providing PyPDF2 resume parsing, scikit-learn TF-IDF, and Cosine Similarity matching.",
    version="1.0.0"
)

# Robust CORS Configuration: Allow localhost:3000, localhost:5000 and any dev variants
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Pydantic Request / Response Schemas ----------------- #

class JobMatchRequest(BaseModel):
    resume_text: str = Field(..., min_length=10, description="Extracted plain text from candidate resume")
    job_description: str = Field(..., min_length=10, description="Full job description requirements")

class MissingSkillDetail(BaseModel):
    skill: str
    priority: str
    reason: str
    remediation: str

class JobMatchResponse(BaseModel):
    match_score: int
    raw_cosine_similarity: float
    matched_skills: List[str]
    missing_skills: List[MissingSkillDetail]
    missing_skills_names: List[str]
    total_jd_skills_found: int
    ai_recommendation: str

class ResumeExtractRequest(BaseModel):
    text: Optional[str] = Field(None, description="Pre-extracted plain text from candidate resume")
    fileName: Optional[str] = Field("resume.pdf", description="Original file name")

class ResumeExtractResponse(BaseModel):
    fileName: str
    extractedText: str
    skills: List[str]
    categorizedSkills: Dict[str, List[str]]
    skillsCount: int
    atsScore: int

class InterviewEvaluateRequest(BaseModel):
    question: str = Field(..., min_length=3, description="The interview question presented")
    answer: str = Field(..., min_length=3, description="The student's submitted answer")
    role: Optional[str] = Field("sde", description="Target role (sde, frontend, backend)")

class InterviewEvaluateResponse(BaseModel):
    score: float
    feedback: str
    starAnalysis: Dict[str, bool]
    wordCount: int
    confidenceLevel: str
    idealAnswerKeywords: List[str]
    sentimentPolarity: float

# ----------------- API Endpoints ----------------- #

@app.get("/health", tags=["Monitoring"])
async def health_check():
    """
    Returns service health and model status for backend gateway discovery.
    """
    return {
        "status": "healthy",
        "service": "AI Career Copilot — FastAPI Microservice",
        "version": "1.0.0",
        "port": 8000,
        "engine": "scikit-learn TF-IDF + PyPDF2"
    }

@app.post("/api/extract", response_model=ResumeExtractResponse, tags=["Resume Processing"])
async def extract_resume(
    request: Request,
    file: Optional[UploadFile] = File(None)
):
    """
    Receives either pre-extracted plain text (JSON) or an uploaded PDF file (multipart),
    cleans unicode artifacts, applies length and structure guardrails, and identifies technical skills.
    """
    content_type = request.headers.get("content-type", "")
    extracted_text = ""
    file_name = "resume.pdf"

    if "application/json" in content_type:
        try:
            body = await request.json()
            extracted_text = body.get("text", "") or ""
            file_name = body.get("fileName", "resume.pdf")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON payload: {str(e)}"
            )
    else:
        # Multipart form or direct file upload fallback
        if not file:
            try:
                form = await request.form()
                file = form.get("file")
                extracted_text = form.get("text", "") or ""
            except Exception:
                file = None

        if file:
            file_name = file.filename
            if not file.filename.lower().endswith(".pdf"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid file format. Only PDF files (.pdf) are supported."
                )
            content = await file.read()
            extracted_text = PDFExtractor.extract_text_from_pdf_bytes(content)

    # 1. Strip weird unicode characters (like \u200b zero-width space, BOM, control characters)
    if extracted_text:
        extracted_text = re.sub(r'[\u200B-\u200D\uFEFF\x00-\x08\x0B\x0C\x0E-\x1F]', '', extracted_text)
        extracted_text = extracted_text.strip()

    # 2. Guardrail: If text passed to Python is under 50 characters long
    if not extracted_text or len(extracted_text) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text too short. The document is empty or corrupted."
        )

    # 3. Strict Validation Guardrail: Ensure document is a valid engineering resume
    is_valid, validation_msg = PDFExtractor.validate_resume_document(extracted_text)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Document. Please upload a standard Resume."
        )

    skills_list, categorized_skills = PDFExtractor.identify_skills(extracted_text)
    ats_score = PDFExtractor.calculate_ats_score(extracted_text, len(skills_list))

    return ResumeExtractResponse(
        fileName=file_name,
        extractedText=extracted_text,
        skills=skills_list,
        categorizedSkills=categorized_skills,
        skillsCount=len(skills_list),
        atsScore=ats_score
    )

@app.post("/api/extract-text", response_model=ResumeExtractResponse, tags=["Resume Processing"])
async def extract_resume_text(payload: ResumeExtractRequest):
    """
    Direct JSON endpoint for pre-extracted resume text from Node.js or mobile clients.
    """
    raw_text = payload.text or ""
    
    # 1. Unicode Sanitization: Strip zero-width spaces (\u200b), BOM, control chars
    cleaned_text = re.sub(r'[\u200B-\u200D\uFEFF\x00-\x08\x0B\x0C\x0E-\x1F]', '', raw_text).strip()

    # 2. Guardrail: If text is under 50 characters long
    if not cleaned_text or len(cleaned_text) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text too short. The document is empty or corrupted."
        )

    # 3. Strict Validation Guardrail
    is_valid, validation_msg = PDFExtractor.validate_resume_document(cleaned_text)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Document. Please upload a standard Resume."
        )

    skills_list, categorized_skills = PDFExtractor.identify_skills(cleaned_text)
    ats_score = PDFExtractor.calculate_ats_score(cleaned_text, len(skills_list))

    return ResumeExtractResponse(
        fileName=payload.fileName or "resume.pdf",
        extractedText=cleaned_text,
        skills=skills_list,
        categorizedSkills=categorized_skills,
        skillsCount=len(skills_list),
        atsScore=ats_score
    )

@app.post("/api/match", response_model=JobMatchResponse, tags=["Job Matching"])
async def match_resume_to_job(payload: JobMatchRequest):
    """
    Executes TF-IDF vectorization and Cosine Similarity to compare candidate resume against job description.
    """
    try:
        result = JobMatcherService.match(
            resume_text=payload.resume_text,
            job_description=payload.job_description
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Matching calculation failed: {str(e)}"
        )

@app.post("/api/interview/evaluate", response_model=InterviewEvaluateResponse, tags=["AI Mock Interview"])
async def evaluate_interview_answer(payload: InterviewEvaluateRequest):
    """
    Evaluates candidate interview response using STAR method detection,
    word depth, confidence level, and role-based keywords.
    """
    try:
        evaluation = MockInterviewAnalyzer.analyze_answer(
            question=payload.question,
            answer=payload.answer,
            role=payload.role or "sde"
        )
        return evaluation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Interview evaluation failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting FastAPI Microservice on http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
