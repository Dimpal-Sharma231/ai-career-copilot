"""
Self-Test Verification Script for AI Career Copilot NLP Engine
"""
import sys
import io
from pathlib import Path

# Force UTF-8 stdout if needed
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from services.pdf_extractor import PDFExtractor
from services.matcher_service import JobMatcherService

SAMPLE_RESUME = """
Alex Chen
Computer Science Senior at UC Berkeley
Email: alex.chen@berkeley.edu | GitHub: github.com/alexchen-swe

SUMMARY:
Results-driven software engineering student with experience building full-stack web applications,
RESTful APIs, and scalable backend microservices. Skilled in Python, TypeScript, React, Node.js,
and PostgreSQL.

TECHNICAL SKILLS:
- Languages: Python, TypeScript, JavaScript, SQL, C++, Go
- Frameworks & Libraries: React, Node.js, Express, FastAPI, Next.js, Tailwind CSS
- Cloud & Infrastructure: Docker, AWS (S3, EC2), PostgreSQL, Redis, Git, CI/CD
- AI & Data: PyTorch, scikit-learn, Pandas, TF-IDF, Vector Databases

EXPERIENCE:
Software Engineering Intern - Cloud Labs (Summer 2025)
- Developed responsive React and TypeScript dashboards with real-time WebSocket state management.
- Built microservice backend with Node.js and Express, orchestrating PostgreSQL databases with Prisma ORM.
- Containerized applications using Docker and automated CI/CD deployments on AWS.
"""

SAMPLE_JOB_DESCRIPTION = """
Stripe — Frontend Engineer (Core Dashboard)
Location: San Francisco, CA / Remote

About the Role:
We are looking for a Frontend Engineer to build high-performance web applications using React, TypeScript,
and modern CSS/Tailwind.

Requirements:
- Strong proficiency in TypeScript, React, and modern JavaScript.
- Experience with REST APIs, GraphQL, and client-side performance optimization.
- Hands-on experience with Docker, Git, CI/CD, and automated testing frameworks like Jest or Cypress.
- Solid understanding of System Design and microservices architecture.
"""

def run_tests():
    print("=" * 60)
    print("[RUNNING] NLP & TF-IDF ENGINE VERIFICATION SUITE")
    print("=" * 60)

    # Test 1: Skill Extraction
    skills, categorized = PDFExtractor.identify_skills(SAMPLE_RESUME)
    print(f"\n1. Skill Extraction Test:")
    print(f"   [OK] Identified {len(skills)} skills:")
    print(f"   {skills[:10]}... (truncated)")
    assert len(skills) > 5, "Expected at least 5 skills extracted"

    # Test 2: ATS Scoring
    ats = PDFExtractor.calculate_ats_score(SAMPLE_RESUME, len(skills))
    print(f"\n2. ATS Friendly Heuristic Score:")
    print(f"   [OK] Score: {ats}/100")
    assert ats >= 70, "Expected ATS score >= 70"

    # Test 3: TF-IDF & Cosine Similarity Matcher
    print(f"\n3. TF-IDF Cosine Similarity Calculation:")
    match_result = JobMatcherService.match(SAMPLE_RESUME, SAMPLE_JOB_DESCRIPTION)

    score = match_result["match_score"]
    cosine = match_result["raw_cosine_similarity"]
    matched = match_result["matched_skills"]
    missing = match_result["missing_skills"]

    print(f"   [OK] Final Match Score: {score}%")
    print(f"   [OK] Raw Cosine Similarity: {cosine}")
    print(f"   [OK] Skills Matched ({len(matched)}): {matched}")
    print(f"   [OK] Skills Gap / Missing ({len(missing)}): {[m['skill'] for m in missing]}")
    print(f"   [OK] AI Advisory: {match_result['ai_recommendation']}")

    assert score > 50, f"Expected match score > 50%, got {score}%"
    assert "React" in matched, "Expected React in matched skills"
    assert "TypeScript" in matched, "Expected TypeScript in matched skills"
    
    print("\n" + "=" * 60)
    print("[SUCCESS] ALL TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
