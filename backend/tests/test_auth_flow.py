from fastapi.testclient import TestClient

def test_user_isolation(client: TestClient):
    # 1. Register Alice
    res = client.post("/register", json={"username": "alice", "password": "password123"})
    assert res.status_code == 200
    
    # 2. Register Bob
    res = client.post("/register", json={"username": "bob", "password": "password123"})
    assert res.status_code == 200
    
    # 3. Login Alice
    res = client.post("/token", data={"username": "alice", "password": "password123"})
    assert res.status_code == 200
    token_alice = res.json()["access_token"]
    headers_alice = {"Authorization": f"Bearer {token_alice}"}
    
    # 4. Login Bob
    res = client.post("/token", data={"username": "bob", "password": "password123"})
    assert res.status_code == 200
    token_bob = res.json()["access_token"]
    headers_bob = {"Authorization": f"Bearer {token_bob}"}
    
    # 5. Alice creates a branch
    res = client.post(
        "/branch/create", 
        json={"target_role": "AliceRole", "job_description": "Alice job"},
        headers=headers_alice
    )
    assert res.status_code == 200
    branch_alice = res.json()
    assert branch_alice["target_role"] == "AliceRole"
    
    # 6. Bob checks state
    res = client.get("/state", headers=headers_bob)
    assert res.status_code == 200
    state_bob = res.json()
    
    # ASSERT: Bob should not see Alice's branch
    # Alice's branch ID should not be in Bob's branches
    assert branch_alice["id"] not in state_bob["branches"]
    
    # Also verify Bob has his own initial 'main' branch or empty
    # Register initializes empty state with 'main' usually?
    # Let's check if Bob can create his own branch
    res = client.post(
        "/branch/create", 
        json={"target_role": "BobRole", "job_description": "Bob job"},
        headers=headers_bob
    )
    assert res.status_code == 200
    branch_bob = res.json()
    assert branch_bob["target_role"] == "BobRole"
    
    # Verify Alice doesn't see Bob's branch
    res = client.get("/state", headers=headers_alice)
    state_alice = res.json()
    assert branch_bob["id"] not in state_alice["branches"]
    assert branch_alice["id"] in state_alice["branches"]

def test_unauthorized_access(client: TestClient):
    # Try to access protected route without token
    res = client.get("/state")
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"

def test_invalid_login(client: TestClient):
    res = client.post("/token", data={"username": "nonexistent", "password": "wrong"})
    assert res.status_code == 401
