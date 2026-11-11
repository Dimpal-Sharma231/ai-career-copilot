import re
from typing import Dict, List, Any, Optional

try:
    from textblob import TextBlob
    HAS_TEXTBLOB = True
except ImportError:
    HAS_TEXTBLOB = False

class MockInterviewAnalyzer:
    """
    NLP service to evaluate candidate interview answers using:
    - STAR Method detection (Situation, Task, Action, Result)
    - Word count & answer depth
    - Confidence markers vs filler hesitation words
    - Sentiment & tone analysis
    - Domain keyword coverage
    """

    STAR_PATTERNS = {
        "situation": [
            r"\b(when I was|during my|in my project|in my college|at my internship|at\s+[A-Za-z0-9]+\b|we were building|the problem was|background|context|faced an issue)\b",
            r"\b(our team was|working on|dealing with|initial scenario)\b"
        ],
        "task": [
            r"\b(my responsibility|my task|I was tasked with|my goal was|needed to|had to|objective was|required to|challenge was|assigned to)\b",
            r"\b(expected to deliver|our target was|aimed to solve)\b"
        ],
        "action": [
            r"\b(I implemented|I designed|I built|I developed|I optimized|I analyzed|I utilized|I refactored|I integrated|I created|I researched|I configured|I wrote)\b",
            r"\b(we decided to|I initiated|I solved|I migrated|I collaborated with|I conducted)\b"
        ],
        "result": [
            r"\b(as a result|resulted in|the outcome was|achieved|improved|reduced|increased|boosted|saved|successfully delivered|learned that|eventually)\b",
            r"\b(by\s+[0-9]+%|faster|latency|efficiently|impact|accomplished)\b"
        ]
    }

    CONFIDENCE_WORDS = [
        "specifically", "definitely", "confidently", "ensured", "spearheaded",
        "architected", "systematically", "proven", "measurable", "measurable impact",
        "successfully", "proactively", "optimized", "structured"
    ]

    FILLER_WORDS = [
        "maybe", "i guess", "kind of", "sort of", "um", "uh", "like", "probably",
        "i think maybe", "not really sure", "basically just"
    ]

    ROLE_KEYWORDS = {
        "sde": ["scalability", "complexity", "data structures", "algorithms", "latency", "system design", "microservices", "testing", "clean code", "concurrency"],
        "frontend": ["react", "performance", "responsive design", "state management", "accessibility", "lighthouse", "user experience", "bundle size"],
        "backend": ["database", "sql", "indexing", "caching", "redis", "rest api", "throughput", "concurrency", "security", "docker"],
        "default": ["teamwork", "collaboration", "problem-solving", "deadline", "agile", "communication", "iteration", "mentorship"]
    }

    @classmethod
    def analyze_answer(cls, question: str, answer: str, role: str = "sde") -> Dict[str, Any]:
        cleaned_answer = answer.strip()
        word_count = len(re.findall(r"\b\w+\b", cleaned_answer))

        if word_count < 10:
            return {
                "score": 3.0,
                "feedback": "Answer is too brief. Provide a structured response using the STAR method with specific project context and actions taken.",
                "starAnalysis": {
                    "situation": False,
                    "task": False,
                    "action": False,
                    "result": False
                },
                "wordCount": word_count,
                "confidenceLevel": "Low",
                "idealAnswerKeywords": ["context", "action", "technologies", "impact", "metrics"],
                "sentimentPolarity": 0.0
            }

        lower_answer = cleaned_answer.lower()

        # 1. STAR Method Evaluation
        star_results = {}
        for component, patterns in cls.STAR_PATTERNS.items():
            found = False
            for pat in patterns:
                if re.search(pat, lower_answer, re.IGNORECASE):
                    found = True
                    break
            star_results[component] = found

        star_count = sum(1 for v in star_results.values() if v)

        # 2. Confidence and Fillers
        confidence_hits = sum(1 for word in cls.CONFIDENCE_WORDS if word in lower_answer)
        filler_hits = sum(1 for filler in cls.FILLER_WORDS if filler in lower_answer)

        if confidence_hits >= 2 and filler_hits == 0:
            confidence_level = "High"
        elif filler_hits > 2:
            confidence_level = "Hesitant / Low"
        else:
            confidence_level = "Moderate"

        # 3. TextBlob Sentiment & Tone Analysis
        polarity = 0.1
        if HAS_TEXTBLOB:
            try:
                blob = TextBlob(cleaned_answer)
                polarity = round(blob.sentiment.polarity, 2)
            except Exception:
                polarity = 0.15

        # 4. Score Calculation (1.0 to 10.0 scale)
        base_score = 4.5
        score = base_score + (star_count * 1.1)

        # Word count bonus / penalty
        if 60 <= word_count <= 250:
            score += 1.0
        elif 35 <= word_count < 60:
            score += 0.5
        elif word_count > 350:
            score -= 0.5

        # Confidence bonus
        if confidence_level == "High":
            score += 0.5
        elif confidence_level == "Hesitant / Low":
            score -= 0.8

        final_score = round(min(10.0, max(2.5, score)), 1)

        # 5. Formulate Personalized AI Feedback
        missing_components = [c.capitalize() for c, found in star_results.items() if not found]
        present_components = [c.capitalize() for c, found in star_results.items() if found]

        feedback_parts = []
        if present_components:
            feedback_parts.append(f"Good articulation of your {' and '.join(present_components)}.")
        
        if missing_components:
            feedback_parts.append(
                f"To strengthen your rating, explicitly incorporate the '{missing_components[0]}' component by stating what quantifiable impact or outcome was achieved."
            )
        else:
            feedback_parts.append("Excellent execution of the STAR framework with clear actionable delivery.")

        if filler_hits > 1:
            feedback_parts.append("Try to eliminate hedge phrases ('I guess', 'kind of') to sound more authoritative.")

        if word_count < 50:
            feedback_parts.append("Elaborate on the specific technologies, architectural trade-offs, or challenges you encountered.")

        feedback_summary = " ".join(feedback_parts)

        # 6. Role Specific Keywords recommendation
        role_key = role.lower() if role.lower() in cls.ROLE_KEYWORDS else "default"
        recommended_keywords = cls.ROLE_KEYWORDS.get(role_key, cls.ROLE_KEYWORDS["default"])[:5]

        return {
            "score": final_score,
            "feedback": feedback_summary,
            "starAnalysis": star_results,
            "wordCount": word_count,
            "confidenceLevel": confidence_level,
            "idealAnswerKeywords": recommended_keywords,
            "sentimentPolarity": polarity
        }
