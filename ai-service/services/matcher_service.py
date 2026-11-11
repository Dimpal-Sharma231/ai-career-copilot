import re
from typing import Dict, List, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .pdf_extractor import PDFExtractor

class JobMatcherService:
    @staticmethod
    def preprocess_text(text: str) -> str:
        """
        Cleans text for vectorization: lowercase, remove URLs, keep alphanumerics and hyphens.
        """
        text = text.lower()
        # Remove web links
        text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
        # Normalize punctuation while preserving tech keywords like c++, c#, .net
        text = re.sub(r'[^\w\s\+\#\.-]', ' ', text)
        return re.sub(r'\s+', ' ', text).strip()

    @staticmethod
    def match(resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Calculates TF-IDF vectorization, Cosine Similarity, and skill gap analysis.
        """
        clean_resume = JobMatcherService.preprocess_text(resume_text)
        clean_jd = JobMatcherService.preprocess_text(job_description)

        if not clean_resume or not clean_jd:
            return {
                "match_score": 0,
                "raw_cosine": 0.0,
                "matched_skills": [],
                "missing_skills": [],
                "ai_recommendation": "Insufficient text provided to perform matching."
            }

        # 1. Scikit-learn TF-IDF Vectorization with unigrams & bigrams
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words='english',
            sublinear_tf=True
        )

        tfidf_matrix = vectorizer.fit_transform([clean_resume, clean_jd])
        
        # 2. Compute Cosine Similarity matrix
        raw_cosine = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])

        # 3. Extract skills using the predefined JSON dictionary
        resume_skills_set = set(PDFExtractor.identify_skills(resume_text)[0])
        jd_skills_set = set(PDFExtractor.identify_skills(job_description)[0])

        matched_skills = sorted(list(jd_skills_set.intersection(resume_skills_set)))
        missing_skills_raw = sorted(list(jd_skills_set - resume_skills_set))

        # 4. Calibrated Hybrid Score
        # For asymmetric resume-to-JD comparisons, raw TF-IDF cosine above 0.15 indicates strong topical alignment
        normalized_cosine = min(1.0, raw_cosine / 0.18) * 100

        # Hard skill overlap ratio
        total_jd_skills = len(jd_skills_set)
        if total_jd_skills > 0:
            skill_ratio = (len(matched_skills) / total_jd_skills) * 100
        else:
            skill_ratio = normalized_cosine

        # Weighted composite: 40% semantic TF-IDF + 60% explicit skill keyword overlap
        composite_score = round(0.40 * normalized_cosine + 0.60 * skill_ratio)
        final_score = int(min(98, max(20, composite_score)))

        # 5. Format Missing Skills with Actionable Remediation Guidance
        missing_skills_detailed = []
        for skill in missing_skills_raw[:6]:
            missing_skills_detailed.append({
                "skill": skill,
                "priority": "High" if skill in ["React", "TypeScript", "Python", "AWS", "Docker", "PostgreSQL", "Kubernetes", "GraphQL", "Jest"] else "Medium",
                "reason": f"Required in job posting qualifications or core tech stack.",
                "remediation": f"Include a 2-sentence project bullet demonstrating hands-on experience or coursework in {skill}."
            })

        # 6. Strategic AI Recommendation
        if final_score >= 75:
            recommendation = (
                f"Outstanding match ({final_score}%). Your technical experience closely mirrors the job requirements. "
                f"Highlight {', '.join(matched_skills[:3])} in your summary to pass recruiter phone screens."
            )
        elif final_score >= 55:
            recommendation = (
                f"Strong candidate fit ({final_score}%). You possess {len(matched_skills)} core requirements. "
                f"Address the key skill gaps ({', '.join(missing_skills_raw[:3])}) in your cover letter or GitHub links."
            )
        else:
            recommendation = (
                f"Moderate alignment ({final_score}%). The role emphasizes technologies not yet found on your profile "
                f"({', '.join(missing_skills_raw[:3])}). Consider building a targeted full-stack project incorporating them."
            )

        return {
            "match_score": final_score,
            "raw_cosine_similarity": round(raw_cosine, 4),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills_detailed,
            "missing_skills_names": missing_skills_raw,
            "total_jd_skills_found": total_jd_skills,
            "ai_recommendation": recommendation
        }
