# Scripts — Utility Scripts

> Cross-platform (Bash + PowerShell) utility scripts for search and validation.

---

## Available Scripts

### Search Scripts

| Script | Platform | Description |
|---|---|---|
| `search_repo.sh` | Bash | Search the repository for patterns using grep/ripgrep |
| `search_repo.ps1` | PowerShell | Search the repository for patterns using Select-String |
| `setup_search.sh` | Bash | Set up search tools and indexes |
| `setup_search.ps1` | PowerShell | Set up search tools and indexes |

### Validation Scripts

| Script | Platform | Description |
|---|---|---|
| `validate-all.sh` | Bash | Run all validation checks |
| `validate-all.ps1` | PowerShell | Run all validation checks |
| `validate-skills.sh` | Bash | Validate GSD skill definitions |
| `validate-skills.ps1` | PowerShell | Validate GSD skill definitions |
| `validate-templates.sh` | Bash | Validate GSD document templates |
| `validate-templates.ps1` | PowerShell | Validate GSD document templates |
| `validate-workflows.sh` | Bash | Validate GSD workflow definitions |
| `validate-workflows.ps1` | PowerShell | Validate GSD workflow definitions |

---

## Usage

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run all validations
./scripts/validate-all.sh

# Search the repo
./scripts/search_repo.sh "pattern"
```

All scripts have both `.sh` (macOS/Linux) and `.ps1` (Windows/PowerShell) variants for cross-platform compatibility.
