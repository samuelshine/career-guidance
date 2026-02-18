import pytest
from models import CareerState, Branch, Skill, Conflict, Patch
from agents.hiring_committee import committee, HiringReport
import os

def test_hiring_committee_flow():
    if not os.getenv("GOOGLE_API_KEY"):
        pytest.skip("No Google API Key")
        
    state = CareerState(
        user_id="test",
        full_name="Test User",
        current_role="Student",
        experience=["Intern at Tech Corp"],
        skills=[Skill(name="Java", category="Hard", proficiency=0.8)],
        active_branch_id="b1",
        branches={
            "b1": Branch(
                id="b1",
                name="Path to SDE",
                target_role="Senior Software Engineer",
                job_description="Lead development",
                conflicts=[
                    Conflict(
                        id="c1", 
                        missing_skill="System Design", 
                        severity="CRITICAL", 
                        description="Must know distributed systems", 
                        suggested_patch=Patch(title="Learn SD", action_items=["Read DDIA"], estimated_hours=20, status="OPEN")
                    ),
                    Conflict(
                        id="c2", 
                        missing_skill="Leadership", 
                        severity="WARNING", 
                        description="Team lead experience", 
                        suggested_patch=Patch(title="Lead a project", action_items=["Volunteer for team lead"], estimated_hours=40, status="OPEN")
                    )
                ],
                is_active=True
            )
        },
        history=[]
    )
    
    print("Running Hiring Committee Simulation...")
    try:
        report = committee.evaluate(state, "b1")
    except Exception as e:
        import traceback
        traceback.print_exc()
        pytest.fail(f"Evaluate failed: {e}")
    
    print(f"Decision: {report.final_decision}")
    print(f"Feedback: {report.feedback}")
    for msg in report.debate_log:
        print(f"[{msg.persona}]: {msg.message}")
        
    assert isinstance(report, HiringReport)
    assert len(report.debate_log) > 0
    # Expect NO_HIRE due to CRITICAL conflict
    # LLM behavior is probabilistic but system prompt is strong
