from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List
from models import Conflict, Patch

BRANCHING_SYSTEM_PROMPT = """
You are the CareerOps Branching Engine. 
Compare the User Profile against the Target Job Description to identify gaps.

Analyis Rules:
1. SEMANTIC DIFFING: Do not just look for exact keyword matches. If a user has "scikit-learn" and the job asks for "Machine Learning", treat it as a MATCH (or low severity gap). If they have "React" and job asks for "Angular", that is a CONFLICT.
2. CONFLICT CLASSIFICATION:
   - CRITICAL: Missing hard skills required for the core role (e.g., Python for Data Science).
   - WARNING: Missing soft skills or nice-to-haves.
3. PATCH GENERATION:
   - For every gap, generate a specific 'Patch' plan.
   - RESOURCES: You MUST include at least 2 specific, real-world resources (e.g., "Coursera: Deep Learning Specialization", "Official React Documentation").
   - TIME: Estimate realistic hours to bridge the gap.
"""

class BranchingAnalysis(BaseModel):
    conflicts: List[Conflict]
    feasibility_score: float = Field(..., description="0.0 to 1.0 score of how realistic this path is")

class BranchingEngine:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.2)
        self.parser = PydanticOutputParser(pydantic_object=BranchingAnalysis)
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", BRANCHING_SYSTEM_PROMPT),
            ("human", "User Profile:\n{user_profile}\n\nTarget Role:\n{target_role}\n\nJob Description:\n{job_description}\n\nFormat Instructions:\n{format_instructions}")
        ])
        
        self.chain = self.prompt | self.llm | self.parser

    def analyze(self, user_profile_str: str, target_role: str, job_description: str) -> BranchingAnalysis:
        return self.chain.invoke({
            "user_profile": user_profile_str,
            "target_role": target_role,
            "job_description": job_description,
            "format_instructions": self.parser.get_format_instructions()
        })

    def merge_branches(self, branch_a_name: str, branch_b_name: str, conflicts_a: List[Conflict], conflicts_b: List[Conflict]) -> str:
        # Simple heuristic merge for MVP:
        # 1. Union of conflicts (deduplicated by missing_skill)
        # 2. Identify collision (same skill, different severity?)
        
        merged_conflicts = []
        seen_skills = set()
        
        all_conflicts = conflicts_a + conflicts_b
        
        for c in all_conflicts:
            if c.missing_skill not in seen_skills:
                merged_conflicts.append(c)
                seen_skills.add(c.missing_skill)
                
        return f"Merged '{branch_a_name}' and '{branch_b_name}'. Resulting path has {len(merged_conflicts)} total conflicts to resolve."
