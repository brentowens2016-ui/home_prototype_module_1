# Membership Website: mappedhome.com

## Overview
A multi-page membership website with a FastAPI backend (Python, Rust FFI) and static HTML/CSS/JS frontend.

### Frontend Pages
- **index.html**: Landing page
- **auth.html**: Signup/Login (tabbed)
- **tier-selection.html**: Store/tier selection
- **onboarding.html**: Questionnaire
- **dashboard-download.html**: Download/welcome dashboard

### Backend
- **FastAPI**: Endpoints for signup, login, tier selection, onboarding, dashboard download
- **Rust FFI**: Agent logic via Python FFI

### Navigation
- Navigation links between all pages

### Structure
- Modular, expandable for future features

## Setup Steps
- Python 3.10+
- Rust toolchain (for FFI)
- FastAPI, Uvicorn, and FFI dependencies

## Run Backend
```sh
uvicorn backend.main:app --reload
```

## Frontend
Open HTML files in browser (or serve statically).

---

*Replace placeholders and expand as needed for your project.*
