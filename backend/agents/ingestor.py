from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from models import CareerState, Skill
from typing import List

# Define a simpler intermediate model for extraction if needed, 
# or use CareerState directly if the LLM is good enough.
# For direct mapping, we might need a wrapper since CareerState has 'branches' which are internal state.

INGRESTOR_SYSTEM_PROMPT = """
You are an expert Resume Parsing Agent for Christ University. 
Your task is to extract structured data from the resume text provided.

Checkpoint 1 (Extraction): Identify all explicit skills, education history, and roles.
Checkpoint 2 (Contextualization): Recognize Christ University specific entities. 
'CSA' refers to 'Centre for Social Action' (Volunteering), not a corporate entity.
'CUIM' is the Institute of Management. 
Checkpoint 3 (Normalization): Standardize skill names. 
'MS Excel 2013', 'Excel', and 'Spreadsheets' should all be normalized to 'Microsoft Excel'.
Checkpoint 4 (Categorization): Group skills into 'Hard', 'Soft', and 'Domain' buckets based on the placement taxonomy.
Checkpoint 5 (Formatting): Output strictly valid JSON matching the provided schema. Do not include markdown code blocks.
"""

class ResumeIngestor:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0)
        self.parser = PydanticOutputParser(pydantic_object=CareerState) # Note: CareerState is complex, might need a DTO
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", INGRESTOR_SYSTEM_PROMPT),
            ("human", "{resume_text}\n\n{format_instructions}")
        ])
        
        self.chain = self.prompt | self.llm | self.parser

    def parse(self, resume_text: str) -> CareerState:
        # returns a CareerState object
        # In a real app we might want to return a 'ResumeParsedData' DTO and then merge it into CareerState
        # For hackathon, we can ask the LLM to output a structure that matches the fields of CareerState
        # We need to handle the 'branches' field which shouldn't be extracted from resume
        
        # Simplified for now: We will just extract skills and personal info and construct CareerState manually
        # OR we define a separate Pydantic model for extraction
        pass

# Redefining a simpler Extraction Model for the Agent
from pydantic import BaseModel, Field

class ExtractedProfile(BaseModel):
    full_name: str
    current_role: str = "Student"
    experience: List[str] = Field(default=[], description="List of all previous and current job titles found in the resume")
    skills: List[Skill]

class SimpleResumeIngestor:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0)
        self.parser = PydanticOutputParser(pydantic_object=ExtractedProfile)
        
        # Updated prompt to explicitly ask for history
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", INGRESTOR_SYSTEM_PROMPT + "\n\nCRITICAL: Extract ALL job titles found in the resume into the 'experience' list, not just the most recent one."),
            ("human", "Resume Text:\n{resume_text}\n\nFormat Instructions:\n{format_instructions}")
        ])
        
        self.chain = self.prompt | self.llm | self.parser

    def parse(self, resume_text: str) -> ExtractedProfile:
        return self.chain.invoke({
            "resume_text": resume_text,
            "format_instructions": self.parser.get_format_instructions()
        })
