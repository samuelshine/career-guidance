from models import CareerState, Branch, Skill, Conflict, Patch, Commit
from database import db
from auth import get_password_hash
import datetime

def seed_data():
    now = datetime.datetime.now()
    
    # 1. Create Demo User
    demo_user = {
        "username": "demo",
        "email": "demo@careerops.ai",
        "full_name": "Alex Chen",
        "hashed_password": get_password_hash("demo123")
    }
    db.save_user(demo_user)
    print("Created demo user: demo / demo123")
    
    # 2. User Profile with Skills
    current_skills = [
        Skill(name="Python", category="Hard", proficiency=0.9),
        Skill(name="Django", category="Hard", proficiency=0.8),
        Skill(name="REST APIs", category="Hard", proficiency=0.85),
        Skill(name="SQL", category="Hard", proficiency=0.75),
        Skill(name="Git", category="Hard", proficiency=0.8),
        Skill(name="Communication", category="Soft", proficiency=0.7),
    ]
    
    # 3. Main Branch (Current Reality)
    main_branch = Branch(
        id="main",
        name="Current: Backend Dev",
        target_role="Senior Backend Engineer",
        created_at=now,
        is_active=False,
        conflicts=[]
    )
    
    # 4. Feature Branch 1: AI Engineer (ACTIVE)
    ai_branch = Branch(
        id="feature-ai-engineer",
        name="Pivot to AI",
        target_role="AI Engineer",
        job_description="Build and deploy ML models at scale. Requires PyTorch, MLOps.",
        created_at=now,
        is_active=True,  # <-- This is the active branch for demo
        conflicts=[
            Conflict(
                id="c1",
                description="Missing core ML framework knowledge.",
                severity="CRITICAL",
                missing_skill="PyTorch",
                suggested_patch=Patch(
                    title="Learn PyTorch Basics",
                    action_items=["Complete PyTorch Blitz tutorial", "Build a simple CNN"],
                    estimated_hours=20,
                    status="OPEN"
                )
            ),
             Conflict(
                id="c2",
                description="Lack of theoretical foundation in Deep Learning.",
                severity="WARNING",
                missing_skill="Neural Networks",
                suggested_patch=Patch(
                    title="Deep Learning Specialization",
                    action_items=["Watch Andrew Ng's course", "Implement backprop from scratch"],
                    estimated_hours=40,
                    status="OPEN"
                )
            ),
            Conflict(
                id="c5",
                description="No experience with ML deployment pipelines.",
                severity="CRITICAL",
                missing_skill="MLOps",
                suggested_patch=Patch(
                    title="MLOps Fundamentals",
                    action_items=["Learn MLflow", "Deploy model to AWS SageMaker"],
                    estimated_hours=30,
                    status="OPEN"
                )
            )
        ]
    )
    
    # 5. Feature Branch 2: Product Manager
    pm_branch = Branch(
        id="feature-pm",
        name="Pivot to PM",
        target_role="Product Manager",
        job_description="Lead product strategy and execution for AI products.",
        created_at=now,
        is_active=False,
        conflicts=[
            Conflict(
                id="c3",
                description="No experience with product analytics tools.",
                severity="CRITICAL",
                missing_skill="Mixpanel",
                suggested_patch=Patch(
                    title="Product Analytics 101",
                    action_items=["Learn funnel analysis", "Setup a mock dashboard"],
                    estimated_hours=10,
                    status="OPEN"
                )
            ),
             Conflict(
                id="c4",
                description="Need to improve stakeholder management.",
                severity="WARNING",
                missing_skill="Stakeholder Management",
                suggested_patch=Patch(
                    title="Leadership Skills",
                    action_items=["Read 'The Mom Test'", "Practice user interviews"],
                    estimated_hours=15,
                    status="OPEN"
                )
            )
        ]
    )
    
    # 6. Feature Branch 3: Full-Stack Engineer
    fullstack_branch = Branch(
        id="feature-fullstack",
        name="Go Full-Stack",
        target_role="Full-Stack Engineer",
        job_description="Build end-to-end features. Requires React, Node.js.",
        created_at=now,
        is_active=False,
        conflicts=[
            Conflict(
                id="c6",
                description="No frontend framework experience.",
                severity="CRITICAL",
                missing_skill="React",
                suggested_patch=Patch(
                    title="React Crash Course",
                    action_items=["Complete React official tutorial", "Build a TODO app"],
                    estimated_hours=25,
                    status="OPEN"
                )
            ),
             Conflict(
                id="c7",
                description="Limited Node.js backend experience.",
                severity="WARNING",
                missing_skill="Node.js",
                suggested_patch=Patch(
                    title="Node.js Essentials",
                    action_items=["Build Express.js API", "Learn async patterns"],
                    estimated_hours=20,
                    status="OPEN"
                )
            )
        ]
    )

    # 7. Create Commit History
    initial_commit = Commit(
        id="commit-1",
        message="Initial Resume Upload",
        timestamp=now - datetime.timedelta(hours=2),
        parent_hash=None,
        snapshot={}
    )
    
    ai_branch_commit = Commit(
        id="commit-2",
        message="Created branch: AI Engineer",
        timestamp=now - datetime.timedelta(hours=1, minutes=30),
        parent_hash="commit-1",
        snapshot={}
    )
    
    pm_branch_commit = Commit(
        id="commit-3",
        message="Created branch: Product Manager",
        timestamp=now - datetime.timedelta(hours=1),
        parent_hash="commit-2",
        snapshot={}
    )
    
    fullstack_commit = Commit(
        id="commit-4",
        message="Created branch: Full-Stack Engineer",
        timestamp=now - datetime.timedelta(minutes=30),
        parent_hash="commit-3",
        snapshot={}
    )

    state = CareerState(
        user_id="demo-user",
        full_name="Alex Chen",
        current_role="Backend Developer",
        experience=["Software Engineer Intern @ Google", "Junior Python Developer @ Startup"],
        skills=current_skills,
        active_branch_id="feature-ai-engineer",  # Active branch for demo
        branches={
            "main": main_branch,
            "feature-ai-engineer": ai_branch,
            "feature-pm": pm_branch,
            "feature-fullstack": fullstack_branch
        },
        history=[initial_commit, ai_branch_commit, pm_branch_commit, fullstack_commit]
    )
    
    db.save_state(state)
    print("Seeded comprehensive 'CareerOps' demo with 4 branches and 7 conflicts.")
    print("---")
    print("LOGIN CREDENTIALS:")
    print("  Username: demo")
    print("  Password: demo123")
    print("---")

if __name__ == "__main__":
    seed_data()

