import os
from duckduckgo_search import DDGS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from models import MarketInsight

class MarketAnalyst:
    def __init__(self):
        # self.search = DuckDuckGoSearchRun() removed due to import issues
        # Using a cost-effective fast model for analysis
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash", 
            temperature=0.1,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        self.parser = PydanticOutputParser(pydantic_object=MarketInsight)
        self.cache = {} # Simple in-memory cache
        from datetime import timedelta
        self.cache_ttl = timedelta(hours=24)

    def analyze_role(self, role: str, location: str = "Remote") -> MarketInsight:
        from datetime import datetime
        cache_key = f"{role.lower()}:{location.lower()}"
        
        if cache_key in self.cache:
            insight, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < self.cache_ttl:
                print(f"MarketAnalyst: Returning cached insight for {role}")
                return insight

        try:
            # 1. Search for data
            # Queries are specific to get recent data
            query = f"Salary for {role} 2025 {location} and job market demand trends"
            try:
                # Use DDGS directly as langchain wrapper is flaky
                results = DDGS().text(query, max_results=3)
                if results:
                    search_results = "\n".join([r.get('body', '') for r in results])
                else:
                    search_results = "No search results found."
            except Exception as e:
                print(f"MarketAnalyst Search Error: {e}")
                search_results = "Search failed. Please check internet connection or rate limits."

            # 2. Analyze with LLM
            prompt = PromptTemplate(
                template="""
                You are a Market Analyst expert.
                Analyze the following search results for the role '{role}' in '{location}'.
                
                Search Results:
                {search_results}
                
                Using the search results (and your knowledge to fill gaps if search is thin), extract:
                - Salary Range (e.g. "$100k - $150k")
                - Demand Level (High, Medium, or Low)
                - Key Trends (list of 3-5 brief points)
                - Top Skills (list of 5 key skills mentioned or implied)
                
                {format_instructions}
                """,
                input_variables=["role", "location", "search_results"],
                partial_variables={"format_instructions": self.parser.get_format_instructions()}
            )
            
            chain = prompt | self.llm | self.parser
            
            insight = chain.invoke({
                "role": role, 
                "location": location, 
                "search_results": search_results
            })
            
            self.cache[cache_key] = (insight, datetime.now())
            return insight
            
        except Exception as e:
            print(f"MarketAnalyst Error: {e}")
            # Return resilient fallback
            return MarketInsight(
                salary_range="Unavailable",
                demand_level="Unknown",
                trends=["Could not fetch live market data"],
                top_skills=[]
            )
