from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel

RECRUITER_SYSTEM_PROMPT = """
You are a Senior Technical Recruiter at a top-tier tech company (e.g., Google, Amazon, or a high-growth startup).
Your goal is to evaluate a candidate's profile for a specific role.

Context:
- Role: {target_role}
- Candidate Readiness Score: {score}%
- Remaining Gaps: {gaps}

Instructions:
1. If the score is high (>80%), write a personalized, exciting "Headhunt Message" inviting them to an interview. Mention specific skills they have that caught your eye.
2. If the score is medium (50-80%), write a "Keep in Touch" message encouraging them to close specific gaps (mention the gaps) and re-apply soon.
3. If the score is low (<50%), write a polite rejection noting that they need more experience, but be constructive.

Tone: Professional, encouraging, but realistic.
"""

class RecruiterAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.7)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", RECRUITER_SYSTEM_PROMPT),
            ("human", "Draft a message for this candidate.")
        ])
        self.chain = self.prompt | self.llm | StrOutputParser()

    def evaluate_and_outreach(self, target_role: str, acquired_skills: list, conflicts: list) -> dict:
        # Simple scoring heuristic
        total_factors = len(acquired_skills) + len(conflicts)
        if total_factors == 0:
            score = 50  # Default score if no data
        else:
            score = int((len(acquired_skills) / total_factors) * 100)
            
        gaps_list = ", ".join([c.missing_skill for c in conflicts]) if conflicts else "None"
        
        # Fallback for missing target_role
        role = target_role if target_role else "Software Engineer"
        
        try:
            message = self.chain.invoke({
                "target_role": role,
                "score": score,
                "gaps": gaps_list
            })
        except Exception as e:
            print(f"LLM Error: {e}")
            # Fallback message
            if score > 80:
                message = f"Congratulations! Your profile looks strong for {role}. We'd love to schedule an interview."
            elif score > 50:
                message = f"You're making great progress! Consider working on: {gaps_list}. We'll keep in touch."
            else:
                message = f"Thank you for your interest in {role}. We recommend gaining more experience in: {gaps_list}."
        
        return {
            "score": score,
            "message": message,
            "decision": "HIRE" if score > 80 else ("WAITLIST" if score > 50 else "REJECT")
        }
