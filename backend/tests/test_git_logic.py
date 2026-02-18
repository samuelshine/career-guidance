
import pytest
from main import app, db
from models import Commit, Branch

def test_git_dag_structure(client):
    # Register
    client.post("/register", json={"username": "git_dag_user", "password": "password"})
    token = client.post("/token", data={"username": "git_dag_user", "password": "password"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Branch A
    res_a = client.post("/branch/create", json={"target_role": "Role A", "job_description": "JD A"}, headers=headers)
    assert res_a.status_code == 200
    branch_a_id = res_a.json()["id"]

    state = db.load_state("git_dag_user")
    commit_a = state.history[-1]
    assert commit_a.branch_id == branch_a_id
    
    # 2. Create Branch B (forks from A context)
    res_b = client.post("/branch/create", json={"target_role": "Role B", "job_description": "JD B"}, headers=headers)
    assert res_b.status_code == 200
    branch_b_id = res_b.json()["id"]

    # Reload state to see new commit
    state = db.load_state("git_dag_user")
    commit_b = state.history[-1]
    assert commit_b.branch_id == branch_b_id
    # Parent should be the commit that was HEAD when we created B (which was commit_a)
    assert commit_b.parent_hash == commit_a.id

    # 3. Merge A + B -> C
    res_c = client.post(
        "/branch/merge",
        json={
            "branch_a_id": branch_a_id,
            "branch_b_id": branch_b_id,
            "target_role_name": "Role C"
        },
        headers=headers
    )
    assert res_c.status_code == 200
    branch_c_id = res_c.json()["id"]

    state = db.load_state("git_dag_user")
    commit_c = state.history[-1]
    assert commit_c.branch_id == branch_c_id
    
    # Verify DAG Parents
    # Logic in main.py sets parent_hash to Tip of A, merge_parent_hash to Tip of B
    # Tip of A is commit_a
    # Tip of B is commit_b
    assert commit_c.parent_hash == commit_a.id
    assert commit_c.merge_parent_hash == commit_b.id
