from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import uuid

def generate_id():
    return str(uuid.uuid4())

class Skill(BaseModel):
    name: str
    category: str = Field(..., description="Hard, Soft, Domain")
    proficiency: float = Field(..., ge=0.0, le=1.0)

class Patch(BaseModel):
    id: str = Field(default_factory=generate_id)
    title: str
    action_items: List[str]
    estimated_hours: int
    status: str = Field(..., description="OPEN, IN_PROGRESS, MERGED")
    resources: List[str] = []

class Conflict(BaseModel):
    id: str = Field(default_factory=generate_id)
    description: str
    severity: str = Field(..., description="CRITICAL, WARNING")
    missing_skill: str
    suggested_patch: Patch

class MarketInsight(BaseModel):
    salary_range: str
    demand_level: str = Field(..., description="High, Medium, Low")
    trends: List[str]
    top_skills: List[str]
    last_updated: datetime = Field(default_factory=datetime.now)

class Branch(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str # e.g., "Main", "Google-PM-Path"
    target_role: Optional[str] = None
    job_description: Optional[str] = None
    market_insight: Optional[MarketInsight] = None
    created_at: datetime = Field(default_factory=datetime.now)
    conflicts: List[Conflict] = []
    is_active: bool = False
    
class Commit(BaseModel):
    id: str = Field(default_factory=generate_id)
    timestamp: datetime = Field(default_factory=datetime.now)
    message: str # e.g., "Started Python course", "Resolved conflict: SQL"
    parent_hash: Optional[str] = None
    merge_parent_hash: Optional[str] = None
    branch_id: Optional[str] = None
    snapshot: Dict # Full state snapshot (simplified for MVP)

class CareerState(BaseModel):
    user_id: str
    full_name: str
    current_role: str
    experience: List[str] = [] # List of past roles
    skills: List[Skill]
    branches: Dict[str, Branch] = {} # Keyed by Branch ID
    active_branch_id: str
    history: List[Commit] = [] # Version control history
    meta: Dict[str, str] = {} # Metadata for version tracking

class MockInterviewResult(BaseModel):
    session_id: str
    question: str
    user_answer: str
    feedback: str
    score: int

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
