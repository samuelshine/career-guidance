import json
import os
from models import CareerState, Branch, Skill
from typing import Optional

DB_FILE = "career_ops_db.json"

class JSONDatabase:
    def __init__(self, db_file=DB_FILE):
        self.db_file = db_file
        self._ensure_db_exists()

    def _ensure_db_exists(self):
        if not os.path.exists(self.db_file):
            # Create an empty initial state or a demo state
            initial_state = {
                "user_id": "demo-user",
                "full_name": "New User",
                "current_role": "Student",
                "skills": [],
                "branches": {
                    "main": {
                        "id": "main",
                        "name": "Main Reality",
                        "target_role": "Current Path",
                        "created_at": "2023-10-27T10:00:00",
                        "conflicts": [],
                        "is_active": True
                    }
                },
                "active_branch_id": "main"
            }
            with open(self.db_file, "w") as f:
                json.dump(initial_state, f, indent=2)

    def load_state(self) -> CareerState:
        with open(self.db_file, "r") as f:
            data = json.load(f)
        return CareerState(**data)

    def save_state(self, state: CareerState):
        with open(self.db_file, "w") as f:
            f.write(state.model_dump_json(indent=2))

    def get_branch(self, branch_id: str) -> Optional[Branch]:
        state = self.load_state()
        return state.branches.get(branch_id)

    # User Management
    def get_user(self, username: str):
        # Allow loading simple user dict from a separate file or same file
        # For MVP, let's keep it simple and assume 1 user or store in separate file
        if not os.path.exists("users_db.json"):
            return None
        with open("users_db.json", "r") as f:
            users = json.load(f)
        return users.get(username)

    def save_user(self, user_data: dict):
        users = {}
        if os.path.exists("users_db.json"):
            with open("users_db.json", "r") as f:
                users = json.load(f)
        users[user_data["username"]] = user_data
        with open("users_db.json", "w") as f:
            json.dump(users, f, indent=2)

db = JSONDatabase()
