const API_URL = "http://localhost:8000";

export interface Skill {
    name: string;
    category: string;
    proficiency: number;
}

export interface Conflict {
    id: string;
    description: string;
    severity: "CRITICAL" | "WARNING";
    missing_skill: string;
    suggested_patch: any;
}

export interface User {
    username: string;
    email?: string;
    full_name?: string;
}

export interface Commit {
    id: string;
    timestamp: string;
    message: string;
    parent_hash: string | null;
    merge_parent_hash?: string | null;
    branch_id?: string | null;
    snapshot?: any;
}

export interface MarketInsight {
    salary_range: string;
    demand_level: string;
    trends: string[];
    top_skills: string[];
    last_updated: string;
}

export interface Branch {
    id: string;
    name: string;
    target_role: string;
    job_description: string;
    market_insight?: MarketInsight;
    created_at: string;
    conflicts: Conflict[];
    is_active: boolean;
}

export interface CareerState {
    user_id: string;
    full_name: string;
    current_role: string;
    experience: string[];
    skills: Skill[];
    active_branch_id: string;
    branches: Record<string, Branch>;
    history: Commit[];
}

export const api = {
    // Helper to get headers
    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    },

    // Auth
    async login(username: string, password: string) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        const res = await fetch(`${API_URL}/token`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        return data;
    },

    async register(username: string, password: string, full_name?: string) {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, full_name }),
        });
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
    },

    async getState(): Promise<CareerState> {
        const res = await fetch(`${API_URL}/state`, {
            headers: this.getHeaders()
        });
        if (res.status === 401) {
            localStorage.removeItem('token');
            throw new Error('Unauthorized');
        }
        return res.json();
    },

    async uploadResume(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/upload-resume`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData,
        });
        return res.json();
    },

    async createBranch(target_role: string, job_description: string) {
        const res = await fetch(`${API_URL}/branch/create`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ target_role, job_description }),
        });
        return res.json();
    },

    async chatCoach(branch_id: string, conflict_id: string, message: string) {
        const res = await fetch(`${API_URL}/coach/chat`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ branch_id, conflict_id, message }),
        });
        return res.json();
    },

    async resolveConflict(branch_id: string, conflict_id: string) {
        const res = await fetch(`${API_URL}/conflict/resolve`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ branch_id, conflict_id }),
        });
        return res.json();
    },

    async startInterview(target_role: string, company_name: string, topic: string = "General") {
        const res = await fetch(`${API_URL}/interview/start`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ target_role, company_name, topic }),
        });
        return res.json();
    },

    async submitInterview(target_role: string, question: string, answer: string) {
        const res = await fetch(`${API_URL}/interview/submit`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ target_role, question, answer }),
        });
        return res.json();
    },

    async rollbackState(commit_id: string) {
        const res = await fetch(`${API_URL}/state/rollback`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ commit_id }),
        });
        return res.json();
    },

    async mergeBranches(branch_a_id: string, branch_b_id: string, target_role_name: string) {
        const res = await fetch(`${API_URL}/branch/merge`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ branch_a_id, branch_b_id, target_role_name }),
        });
        return res.json();
    },

    async checkHeadhuntStatus(branch_id: string): Promise<HiringReport> {
        const res = await fetch(`${API_URL}/recruiter/headhunt`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ branch_id }),
        });
        return res.json();
    }
};

export interface DebateMessage {
    persona: string;
    message: string;
}

export interface HiringReport {
    debate_log: DebateMessage[];
    final_decision: boolean;
    salary_offer: string | null;
    feedback: string;
}


