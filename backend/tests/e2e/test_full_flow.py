from fastapi.testclient import TestClient
from main import app
import os
import pytest

# Ensure a fresh potential user
TEST_USER = "e2e_verifier_user"
TEST_PASS = "securepassword123"

client = TestClient(app)

def test_full_application_flow():
    print("1. Registering...")
    # 1. Register
    # Cleanup logic is hard without direct DB access, so we rely on unique username or ignore 400
    reg_res = client.post("/register", json={"username": TEST_USER, "password": TEST_PASS})
    if reg_res.status_code != 200:
        assert reg_res.status_code == 400 # Already registered
    
    print("2. Logging in...")
    # 2. Login
    login_res = client.post("/token", data={"username": TEST_USER, "password": TEST_PASS})
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print("3. Getting State...")
    # 3. Get Initial State
    state_res = client.get("/state", headers=headers)
    assert state_res.status_code == 200
    state = state_res.json()
    assert state["user_id"] == TEST_USER
    
    print("4. Creating Branch...")
    # 4. Fork/Create Branch
    # Use a unique role to trigger fresh analysis
    target_role = f"Senior Python Dev {os.urandom(4).hex()}"
    fork_res = client.post(
        "/branch", 
        headers=headers, 
        json={"target_role": target_role, "description": "Backend focus"}
    )
    assert fork_res.status_code == 200
    new_state = fork_res.json()
    assert new_state["active_branch_id"] != state.get("active_branch_id")
    branch_id = new_state["active_branch_id"]
    
    print("5. Checking Headhunt Status...")
    # 5. Check Hiring Status (Committee)
    # Takes time, so increase timeout if needed in real client, TestClient is sync/infinite?
    committee_res = client.post(
        "/recruiter/headhunt",
        headers=headers,
        json={"branch_id": branch_id}
    )
    assert committee_res.status_code == 200
    report = committee_res.json()
    assert "debate_log" in report
    assert isinstance(report["final_decision"], bool)
    
    # 6. Check Caching (Second call should be fast)
    import time
    start = time.time()
    cached_res = client.post(
        "/recruiter/headhunt",
        headers=headers,
        json={"branch_id": branch_id}
    )
    end = time.time()
    assert cached_res.status_code == 200
    # Assert faster? Hard in CI, but we can assert caching headers if we had them or just success.
    
    # 7. Resolve Conflict (Simulate Patch)
    branch = new_state["branches"][branch_id]
    if branch["conflicts"]:
        conflict = branch["conflicts"][0]
        resolve_res = client.post(
            f"/conflict/{conflict['id']}/resolve",
            headers=headers,
            json={"branch_id": branch_id}
        )
        assert resolve_res.status_code == 200
        resolved_state = resolve_res.json()
        # Verify conflict removed
        new_conflicts = resolved_state["branches"][branch_id]["conflicts"]
        assert len(new_conflicts) == len(branch["conflicts"]) - 1
        
    print("Full E2E Flow Passed!")
