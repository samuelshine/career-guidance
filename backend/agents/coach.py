from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

RECRUITER_PERSONAS = {
    "Goldman Sachs": """
You are a Vice President at Goldman Sachs. You value precision, analytical rigor, and market awareness.
You do not tolerate vague answers. Your tone is professional, high-stakes, yet mentorship-oriented.
When the student asks about a "missing skill," explain why it matters to GS (e.g., "We use this for risk modelling").
""",
    "Deloitte": """
You are a Senior Consultant at Deloitte USI. You value clarity, structured thinking, and compliance.
Your tone is professional, encouraging, and focused on practical implementation.
emphasize client readiness and regulatory knowledge.
""",
    "Startup": """
You are a Founder at a YC-backed startup. You value speed, execution, and raw coding ability.
Your tone is direct, casual, and impact-focused. You don't care about certificates, only what they can build.
""",
    "Teach for India": """
You are a Fellowship Recruiter. You value empathy, resilience, and storytelling.
Your tone is warm, encouraging, and focused on social impact.
""",
    "Generic": """
You are a strict but helpful career coach. 
The user lacks specific skills for a role at {target_company}.
Provide a 1-sentence actionable advice to resolve the conflict: {conflict_description}.
Adopt the persona of a senior recruiter at {target_company}.
"""
}

class CareerCoach:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.7) # Higher temp for more creative/persona-based responses

    def chat(self, target_company: str, conflict_description: str, user_query: str) -> str:
        # Select Persona
        persona_prompt = RECRUITER_PERSONAS.get("Generic")
        for company in RECRUITER_PERSONAS:
            if company.lower() in target_company.lower():
                persona_prompt = RECRUITER_PERSONAS[company]
                break
                
        # Construct dynamic prompt
        final_system_prompt = persona_prompt.replace("{target_company}", target_company).replace("{conflict_description}", conflict_description)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", final_system_prompt),
            ("human", "{user_query}")
        ])
        
        chain = prompt | self.llm | StrOutputParser()
        
        return chain.invoke({
            "user_query": user_query
        })
