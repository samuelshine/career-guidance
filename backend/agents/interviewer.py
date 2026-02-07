from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional

class InterviewFeedback(BaseModel):
    score: int = Field(description="Score from 0-100 based on the quality of the answer")
    feedback: str = Field(description="Constructive feedback on the answer")
    improved_answer: str = Field(description="An example of a better way to answer the question")

class InterviewQuestion(BaseModel):
    question: str = Field(description="The interview question")
    context: Optional[str] = Field(description="Context or tips for the question")

INTERVIEWER_SYSTEM_PROMPT = """
You are an expert Technical Interviewer for top tier tech companies.
Your goal is to conduct a mock interview with a candidate for a specific role.

Current Context:
Target Role: {target_role}
Company Persona: {company_name} (Tone: {company_tone})

Your constraints:
1. Ask relevant, challenging but fair questions based on the role.
2. When providing feedback, be constructive but strict (bar raiser).
3. Provide a numerical score (0-100) for the candidate's answer.
4. Suggest a specific "Star Method" improvement for behavioral questions.
5. For technical questions, focus on correctness and optimization.
"""

class InterviewAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.7)
        self.feedback_parser = PydanticOutputParser(pydantic_object=InterviewFeedback)
        self.question_parser = PydanticOutputParser(pydantic_object=InterviewQuestion)

    def generate_question(self, target_role: str, company_name: str, topic: str) -> InterviewQuestion:
        # Pass format instructions as a variable to avoid curly brace conflicts
        prompt = ChatPromptTemplate.from_messages([
            ("system", INTERVIEWER_SYSTEM_PROMPT),
            ("human", "Generate a single interview question about {topic} for a {target_role} position.\n\n{format_instructions}")
        ])
        
        chain = prompt | self.llm | self.question_parser
        
        # Determine strictness/tone based on company
        tone = "Professional and Academic"
        if "Google" in company_name or "Meta" in company_name:
            tone = "Data-driven and scalable systems focused"
        elif "Startup" in company_name:
            tone = "Pragmatic, execution-focused, and fast-paced"
            
        return chain.invoke({
            "target_role": target_role,
            "company_name": company_name,
            "company_tone": tone,
            "topic": topic,
            "format_instructions": self.question_parser.get_format_instructions()
        })

    def evaluate_answer(self, question: str, answer: str, target_role: str) -> InterviewFeedback:
        prompt = ChatPromptTemplate.from_messages([
            ("system", INTERVIEWER_SYSTEM_PROMPT),
            ("human", """
            Question: {question}
            Candidate Answer: {answer}
            
            Evaluate this answer and provide structured feedback.
            \n\n{format_instructions}
            """)
        ])
        
        chain = prompt | self.llm | self.feedback_parser
        
        return chain.invoke({
            "target_role": target_role,
            "company_name": "General Tech",
            "company_tone": "Constructive",
            "question": question,
            "answer": answer,
            "format_instructions": self.feedback_parser.get_format_instructions()
        })
