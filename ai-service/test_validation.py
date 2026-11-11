import sys
from services.pdf_extractor import PDFExtractor

certificate_text = """
Certificate of Completion
This is to certify that Rahul Sharma has successfully completed the course
Introduction to Cloud Computing on Coursera with honors.
Issued on November 10, 2026.
"""

resume_text = """
Rahul Sharma
Email: rahul.sharma@vit.ac.in | Phone: +91 9876543210 | GitHub: github.com/rahul
B.Tech in Computer Science & Engineering - VIT Vellore (CGPA: 8.9)

EDUCATION:
Vellore Institute of Technology - 2022 to 2026

TECHNICAL SKILLS:
Languages: C++, Python, Java, JavaScript, TypeScript
Frameworks: React, Node.js, Express, FastAPI
Databases: PostgreSQL, Redis, MongoDB

EXPERIENCE:
Software Engineering Intern at Tech Corp (May 2025 - July 2025)
- Built high-throughput REST APIs handling 5,000 req/sec using Node.js and Redis caching.

PROJECTS:
AI Career Copilot
- Architected full-stack recruitment platform with PyPDF2 and Scikit-learn TF-IDF matching.
"""

print("Testing Certificate validation:")
is_valid_cert, reason_cert = PDFExtractor.validate_resume_document(certificate_text)
print(f"Certificate Result: valid={is_valid_cert}, reason={reason_cert}")

print("\nTesting Resume validation:")
is_valid_res, reason_res = PDFExtractor.validate_resume_document(resume_text)
print(f"Resume Result: valid={is_valid_res}, reason={reason_res}")

assert not is_valid_cert, "Certificate should fail validation!"
assert is_valid_res, "Resume should pass validation!"

# Test Unicode & Zero-Width Space Cleaning
print("\nTesting Unicode & Zero-Width Space Cleaning:")
dirty_text = "Software\u200b Engineer\ufeff at\u200c Google\x00\n\n\nProjects"
cleaned = PDFExtractor.clean_text(dirty_text)
print(f"Cleaned result: {repr(cleaned)}")
assert "\u200b" not in cleaned, "Zero-width space should be stripped!"
assert "\ufeff" not in cleaned, "BOM should be stripped!"
assert "\x00" not in cleaned, "Null byte should be stripped!"

# Test Short Text Guardrail (<50 chars)
short_text = "John Doe SDE\u200b"
cleaned_short = PDFExtractor.clean_text(short_text)
assert len(cleaned_short) < 50, "Short text should be < 50 chars"
print(f"Short text test: length={len(cleaned_short)} (<50 chars)")

print("\n[SUCCESS] All Python Resume Extraction & Guardrail Tests PASSED!")
