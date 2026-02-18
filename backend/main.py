from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File, Body, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from models import CareerState, Branch, Conflict, User, UserInDB, Token
from database import db
from agents.ingestor import SimpleResumeIngestor
from agents.branching import BranchingEngine
from agents.coach import CareerCoach
from agents.interviewer import InterviewAgent
from agents.recruiter import RecruiterAgent
from agents.market_analyst import MarketAnalyst
from auth import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from jose import JWTError, jwt
from auth import SECRET_KEY, ALGORITHM
import io
import uuid

app = FastAPI(title="CareerOps API")

# Initialize Agents
resume_ingestor = SimpleResumeIngestor()
branching_engine = BranchingEngine()
career_coach = CareerCoach()
interview_agent = InterviewAgent()
recruiter_agent = RecruiterAgent()
market_analyst = MarketAnalyst()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Cors setup
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user_dict = db.get_user(username)
    if user_dict is None:
        raise credentials_exception
    return User(**user_dict)

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user_dict = db.get_user(form_data.username)
    if not user_dict or not verify_password(form_data.password, user_dict['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_dict['username']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    email: Optional[str] = None

@app.post("/register", response_model=User)
async def register(req: RegisterRequest):
    print(f"DEBUG: Attempting to register user: {req.username}")
    existing_user = db.get_user(req.username)
    if existing_user:
        print(f"DEBUG: User {req.username} already exists!")
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(req.password)
    user_in_db = UserInDB(
        username=req.username,
        email=req.email,
        full_name=req.full_name,
        hashed_password=hashed_password
    )
    try:
        db.save_user(user_in_db.dict())
        print(f"DEBUG: User {req.username} saved successfully.")
        
        # Initialize empty state
        initial_state = CareerState(
            user_id=req.username,
            full_name=req.full_name or req.username,
            current_role="New User",
            skills=[],
            branches={},
            active_branch_id="main"
        )
        db.save_state(initial_state, req.username)
        
    except Exception as e:
        print(f"DEBUG: Failed to save user: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        
    return user_in_db

# Protected Routes
@app.get("/state", response_model=CareerState)
def get_state(current_user: User = Depends(get_current_user)):
    return db.load_state(current_user.username)

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    # In a real app we'd need PyPDF2 to extract text. 
    # For MVP hackathon, let's assume we can get text or mock it if PyPDF2 isn't installed yet.
    # We'll need to install PyPDF2.
    try:
        from pypdf import PdfReader
        content = await file.read()
        pdf_file = io.BytesIO(content)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    except ImportError:
        # Fallback for now if pypdf not installed, though we should install it
        text = "Mock resume text: Expert in Python, lacking React skills."

    extracted_profile = resume_ingestor.parse(text)
    
    # Update state
    state = db.load_state(current_user.username)
    state.full_name = extracted_profile.full_name
    state.current_role = extracted_profile.current_role
    state.experience = extracted_profile.experience
    state.skills = extracted_profile.skills
    
    # Create main branch if not exists
    if "main" not in state.branches:
        state.branches["main"] = Branch(id="main", name="Main Reality", is_active=True)
    
    # Create Commit for Resume Upload
    from models import Commit
    commit = Commit(
        message="Initial Resume Upload",
        snapshot=state.dict(exclude={'history'})
    )
    state.history.append(commit)
    
    db.save_state(state, current_user.username)
    return state

@app.post("/branch/create", response_model=Branch)
def create_branch(target_role: str = Body(...), job_description: str = Body(...), current_user: User = Depends(get_current_user)):
    state = db.load_state(current_user.username)
    
    # helper to convert skills to string for LLM
    profile_summary = f"Role: {state.current_role}, Skills: {', '.join([s.name for s in state.skills])}"
    
    analysis = branching_engine.analyze(profile_summary, target_role, job_description)
    
    new_branch = Branch(
        name=f"Path to {target_role}",
        target_role=target_role,
        job_description=job_description,
        is_active=True,
        conflicts=analysis.conflicts
    )
    
    # 4. Analyze Market Reality (Synchronous for MVP)
    print(f"Analyzing market for: {target_role}...")
    try:
        insight = market_analyst.analyze_role(target_role)
        new_branch.market_insight = insight
        print(f"Market insight added for {target_role}")
    except Exception as e:
        print(f"Market Analysis Failed: {e}")
    
    # Deactivate other branches
    for b_id in state.branches:
        state.branches[b_id].is_active = False
        
    state.branches[new_branch.id] = new_branch
    state.active_branch_id = new_branch.id
    
    # Version Control: Commit the new branch
    from models import Commit
    commit = Commit(
        message=f"Created branch: {target_role}",
        parent_hash=state.history[-1].id if state.history else None,
        branch_id=new_branch.id,
        snapshot=state.dict(exclude={'history'})
    )
    state.history.append(commit)
    
    db.save_state(state, current_user.username)
    
    return new_branch

class MergeRequest(BaseModel):
    branch_a_id: str
    branch_b_id: str
    target_role_name: str

@app.post("/branch/merge")
def merge_branches_endpoint(req: MergeRequest, current_user: User = Depends(get_current_user)):
    state = db.load_state(current_user.username)
    
    branch_a = state.branches.get(req.branch_a_id)
    branch_b = state.branches.get(req.branch_b_id)
    
    if not branch_a or not branch_b:
        raise HTTPException(status_code=404, detail="One or both branches not found")
        
    # Improved Merge Logic using the Engine
    # Note: The engine's merge_branches currently returns a string string summary, 
    # but we want actual conflict objects. 
    # upgrading the engine logic slightly here for MVP integration
    
    from models import Conflict
    merged_conflicts = []
    seen_skills = set()
    
    # Simple Union
    all_conflicts = branch_a.conflicts + branch_b.conflicts
    for c in all_conflicts:
         if c.missing_skill not in seen_skills:
            # Create a fresh conflict object to avoid reference issues
            new_c = Conflict(
                missing_skill=c.missing_skill,
                severity=c.severity,
                description=c.description,
                suggested_patch=c.suggested_patch
            )
            merged_conflicts.append(new_c)
            seen_skills.add(c.missing_skill)

    new_branch = Branch(
        name=req.target_role_name,
        target_role=req.target_role_name,
        job_description=f"Merged path of {branch_a.name} and {branch_b.name}",
        is_active=True,
        conflicts=merged_conflicts
    )
    
    # Deactivate others
    for b_id in state.branches:
        state.branches[b_id].is_active = False
        
    state.branches[new_branch.id] = new_branch
    state.active_branch_id = new_branch.id
    
    # Version Control: Commit
    # Version Control: Commit
    from models import Commit
    # Find tips for DAG
    tip_a = next((c for c in reversed(state.history) if getattr(c, 'branch_id', None) == branch_a.id), None)
    tip_b = next((c for c in reversed(state.history) if getattr(c, 'branch_id', None) == branch_b.id), None)
    
    parent_hash = tip_a.id if tip_a else (state.history[-1].id if state.history else None)
    merge_parent_hash = tip_b.id if tip_b else None

    commit = Commit(
        message=f"Merged branches: {branch_a.name} + {branch_b.name} -> {new_branch.name}",
        parent_hash=parent_hash,
        merge_parent_hash=merge_parent_hash,
        branch_id=new_branch.id,
        snapshot=state.dict(exclude={'history'})
    )
    state.history.append(commit)
    
    db.save_state(state, current_user.username)
    return new_branch

@app.post("/coach/chat")
def coach_chat(branch_id: str = Body(...), conflict_id: str = Body(...), message: str = Body(...), current_user: User = Depends(get_current_user)):
    state = db.load_state(current_user.username)
    branch = state.branches.get(branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
        
    conflict = next((c for c in branch.conflicts if c.id == conflict_id), None)
    if not conflict:
        # If no specific conflict, just use general context
        conflict_desc = "General career advice"
    else:
        conflict_desc = conflict.description
        
    target_company = branch.target_role  # In a real app we'd need a separate company field, using role for now
    
    response = career_coach.chat(target_company, conflict_desc, message)
    return {"response": response}

class HeadhuntRequest(BaseModel):
    branch_id: str

@app.post("/recruiter/headhunt")
def check_headhunt_status(req: HeadhuntRequest, current_user: User = Depends(get_current_user)):
    state = db.load_state(current_user.username)
    branch = state.branches.get(req.branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
        
    result = recruiter_agent.evaluate_and_outreach(
        target_role=branch.target_role,
        acquired_skills=state.skills,
        conflicts=branch.conflicts
    )
    
    return result

@app.post("/recruiter/headhunt")
def check_headhunt_status(branch_id: str = Body(..., embed=True), current_user: User = Depends(get_current_user)):
    state = db.load_state(current_user.username)
    if branch_id not in state.branches:
        raise HTTPException(status_code=404, detail="Branch not found")

    from agents.hiring_committee import committee
    
    print(f"Convening Hiring Committee for branch {branch_id}...")
    report = committee.evaluate(state, branch_id)
    return report

@app.post("/conflict/resolve")
def resolve_conflict(branch_id: str = Body(...), conflict_id: str = Body(...), current_user: User = Depends(get_current_user)):
    state = db.load_state(current_user.username)
    branch = state.branches.get(branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
        
    # Find the conflict
    conflict_index = next((i for i, c in enumerate(branch.conflicts) if c.id == conflict_id), -1)
    if conflict_index == -1:
        raise HTTPException(status_code=404, detail="Conflict not found")
        
    conflict = branch.conflicts[conflict_index]
    
    # "Patch" the user: Add the missing skill to their profile
    # We assume if they resolve it, they've done the work/learning
    from models import Skill
    new_skill = Skill(name=conflict.missing_skill, category="Hard", proficiency=0.8) # Default to 'competent'
    
    # Check if skill already exists to avoid dupes
    if not any(s.name.lower() == new_skill.name.lower() for s in state.skills):
        state.skills.append(new_skill)
        
    # Remove the conflict from the branch
    branch.conflicts.pop(conflict_index)
    
    # Version Control: Commit the patch
    # Version Control: Commit the patch
    from models import Commit
    commit = Commit(
        message=f"Resolved conflict: {conflict.missing_skill}",
        parent_hash=state.history[-1].id if state.history else None,
        branch_id=state.active_branch_id,
        snapshot=state.dict(exclude={'history'})
    )
    state.history.append(commit)
    
    db.save_state(state, current_user.username)
    return {"status": "resolved", "new_skill": new_skill}

@app.post("/reset")
def reset_state():
    from seed_data import seed_data
    seed_data()
    return {"status": "Reset to Golden Path start state"}

class RollbackRequest(BaseModel):
    commit_id: str

@app.post("/state/rollback")
def rollback_state(req: RollbackRequest, current_user: User = Depends(get_current_user)):
    state = db.load_state(current_user.username)
    
    # Find the commit
    target_commit = next((c for c in state.history if c.id == req.commit_id), None)
    
    if not target_commit:
        raise HTTPException(status_code=404, detail="Commit not found")
        
    # Restore snapshot (In a real app, we'd validate this snapshot against the model)
    # For MVP, we assume snapshot is valid
    # We kept history in the new state to allow "redo" or branching from past? 
    # Actually, standard git rollback (reset --hard) moves HEAD.
    # We will just replace current state with snapshot, but KEEP history to avoid losing the timeline completely for now.
    
    # Update current attributes from snapshot
    snapshot = target_commit.snapshot
    state.current_role = snapshot.get('current_role', state.current_role)
    
    # Restore skills - need to convert dicts back to objects if they are dicts in snapshot
    if 'skills' in snapshot:
        # Assuming snapshot stores skills as dicts or we need to re-parse
        from models import Skill
        state.skills = [Skill(**s) if isinstance(s, dict) else s for s in snapshot['skills']]
        
    if 'branches' in snapshot:
        from models import Branch
        restored_branches = {}
        for bid, bdata in snapshot['branches'].items():
            restored_branches[bid] = Branch(**bdata) if isinstance(bdata, dict) else bdata
        state.branches = restored_branches
        
    state.active_branch_id = snapshot.get('active_branch_id', state.active_branch_id)
    
    # Create a new commit for the rollback action itself?
    # Or just set state. 
    # Let's append a "Rollback" commit to show audit trail
    # Let's append a "Rollback" commit to show audit trail
    from models import Commit
    new_commit = Commit(
        message=f"Rolled back to commit {req.commit_id}",
        parent_hash=state.history[-1].id if state.history else None,
        branch_id=state.active_branch_id,
        snapshot=state.dict(exclude={'history'}) # Don't nest history recursively
    )
    state.history.append(new_commit)
    
    db.save_state(state, current_user.username)
    return {"status": "success", "message": f"Rolled back to {target_commit.timestamp}"}

# Mock Interview Endpoints
class InterviewStartRequest(BaseModel):
    target_role: str
    company_name: str
    topic: str = "General"

@app.post("/interview/start")
def start_interview(req: InterviewStartRequest, current_user: User = Depends(get_current_user)):
    question = interview_agent.generate_question(req.target_role, req.company_name, req.topic)
    return question

class InterviewSubmitRequest(BaseModel):
    target_role: str
    question: str
    answer: str

@app.post("/interview/submit")
def submit_answer(req: InterviewSubmitRequest, current_user: User = Depends(get_current_user)):
    feedback = interview_agent.evaluate_answer(req.question, req.answer, req.target_role)
    return feedback

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
