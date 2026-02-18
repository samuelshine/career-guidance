from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from models import CareerState, MarketInsight
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

class DebateMessage(BaseModel):
    persona: str = Field(description="Name of the committee member (Technical Recruiter, HR Manager, Hiring Manager)")
    message: str = Field(description="The argument or comment made by the member")

class HiringReport(BaseModel):
    debate_log: List[DebateMessage] = Field(description="Sequential log of the committee discussion")
    final_decision: bool = Field(description="True if the candidate is HIRED, False otherwise")
    salary_offer: Optional[str] = Field(default=None, description="Salary range offered if hired, else null")
    feedback: str = Field(description="Final summary feedback for the candidate")

class HiringCommittee:
    def __init__(self):
        if not os.getenv("GOOGLE_API_KEY"):
            print("Warning: GOOGLE_API_KEY not found. Hiring Committee will fail.")
        self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.8)
        self.cache = {} # Simple in-memory cache
    
    def evaluate(self, state: CareerState, active_branch_id: str) -> HiringReport:
        branch = state.branches.get(active_branch_id)
        if not branch:
            raise ValueError("Invalid branch ID")

        # Cache Check
        cache_key = f"{active_branch_id}:{len(branch.conflicts)}"
        if cache_key in self.cache:
            print(f"HiringCommittee: Returning cached report for {active_branch_id}")
            return self.cache[cache_key]

        # Format Context
        skills_str = ", ".join([f"{s.name} ({s.proficiency})" for s in state.skills])
        
        # Recent activity (resolved conflicts)
        # We can look at State History for this, but for MVP let's look at REMAINING conflicts
        remaining_conflicts = branch.conflicts
        conflict_str = "None"
        if remaining_conflicts:
            conflict_str = ", ".join([f"{c.missing_skill} ({c.severity})" for c in remaining_conflicts])
            
        market_str = "N/A"
        if branch.market_insight:
            market_str = (f"Salary: {branch.market_insight.salary_range}, "
                          f"Demand: {branch.market_insight.demand_level}")

        profile_str = (f"Target Role: {branch.target_role}\n"
                       f"Current Skills: {skills_str}\n"
                       f"Outstanding Gaps: {conflict_str}\n"
                       f"Experience: {state.experience}")

        parser = JsonOutputParser(pydantic_object=HiringReport)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are simulating a Hiring Committee debate for a candidate applying for {target_role}. "
                       "The committee consists of 3 members who speak in order:\n"
                       "1. **Technical Recruiter**: Rigorously assesses hard skills. If there are outstanding Critical conflicts, they MUST object.\n"
                       "2. **HR Manager**: Assesses cultural fit and potential.\n"
                       "3. **Hiring Manager**: Makes the final GO/NO-GO decision based on the team's input and Market Reality.\n\n"
                       "Market Reality: {market_str}\n\n"
                       "Format your response as a JSON object containing the debate log and final decision.\n"
                       "{format_instructions}"),
            ("human", "Candidate Profile:\n{profile_str}")
        ])
        
        chain = prompt | self.llm | parser
        
        try:
            result = chain.invoke({
                "target_role": branch.target_role,
                "market_str": market_str,
                "profile_str": profile_str,
                "format_instructions": parser.get_format_instructions()
            })
            report = HiringReport(**result)
            self.cache[cache_key] = report
            return report
        except Exception as e:
            print(f"Hiring Committee Error: {e}")
            # Fallback
            return HiringReport(
                debate_log=[DebateMessage(persona="System", message="Committee unavailable due to error.")],
                final_decision=False,
                feedback="Error running simulation."
            )

# Singleton
committee = HiringCommittee()
