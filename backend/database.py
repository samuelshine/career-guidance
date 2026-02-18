import json
import os
from models import CareerState, Branch, Skill
from typing import Optional

DB_FILE = "career_ops_db.json"

class JSONDatabase:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        self.users_dir = os.path.join(data_dir, "users")
        self.users_file = os.path.join(data_dir, "users.json")
        self._ensure_dirs_exist()

    def _ensure_dirs_exist(self):
        if not os.path.exists(self.users_dir):
            os.makedirs(self.users_dir)

    def _get_user_file(self, username: str) -> str:
        return os.path.join(self.users_dir, f"{username}.json")

    def load_state(self, username: str) -> CareerState:
        user_file = self._get_user_file(username)
        if not os.path.exists(user_file):
            # Return a default empty state
            return CareerState(
                user_id=username,
                full_name=username,
                current_role="New User",
                skills=[],
                branches={},
                active_branch_id="main"
            )
        with open(user_file, "r") as f:
            data = json.load(f)
        return CareerState(**data)

    def save_state(self, state: CareerState, username: str):
        user_file = self._get_user_file(username)
        with open(user_file, "w") as f:
            f.write(state.model_dump_json(indent=2))

    def get_branch(self, username: str, branch_id: str) -> Optional[Branch]:
        state = self.load_state(username)
        return state.branches.get(branch_id)

    # User Management
    def get_user(self, username: str):
        if not os.path.exists(self.users_file):
            return None
        with open(self.users_file, "r") as f:
            users = json.load(f)
        return users.get(username)

    def save_user(self, user_data: dict):
        users = {}
        if os.path.exists(self.users_file):
            with open(self.users_file, "r") as f:
                users = json.load(f)
        users[user_data["username"]] = user_data
        with open(self.users_file, "w") as f:
            json.dump(users, f, indent=2)

db = JSONDatabase()
