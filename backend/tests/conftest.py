import pytest
import os
import shutil
from fastapi.testclient import TestClient
from main import app
from database import db, JSONDatabase

@pytest.fixture(scope="function")
def test_db():
    # Setup: Create temp data dir
    test_data_dir = "test_data"
    if os.path.exists(test_data_dir):
        shutil.rmtree(test_data_dir)
    os.makedirs(test_data_dir)
    
    # Override global db with test config
    # We need to re-init the db singleton or patch it
    # Since 'db' is imported in main.py, patching it there is tricky.
    # But db is an instance of JSONDatabase.
    # We can modify its attributes in place.
    
    original_data_dir = db.data_dir
    original_users_dir = db.users_dir
    original_users_file = db.users_file
    
    # Point to test dir
    db.data_dir = test_data_dir
    db.users_dir = os.path.join(test_data_dir, "users")
    db.users_file = os.path.join(test_data_dir, "users.json")
    db._ensure_dirs_exist()
    
    yield db
    
    # Teardown: Restore original paths and cleanup
    db.data_dir = original_data_dir
    db.users_dir = original_users_dir
    db.users_file = original_users_file
    
    if os.path.exists(test_data_dir):
        shutil.rmtree(test_data_dir)

@pytest.fixture(scope="function")
def client(test_db):
    # Depending on implementation, we might need to override dependency
    # But since main.py uses global 'db' variable directly in endpoints,
    # the test_db fixture modifying 'db' in place should work.
    return TestClient(app)
