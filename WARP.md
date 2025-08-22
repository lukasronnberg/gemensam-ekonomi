# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Gemensam Ekonomi is a Swedish household expense sharing web application built with FastAPI and SQLModel. It tracks shared expenses between household members (primarily Lukas and Annie), manages expense splitting calculations, and maintains a shared savings account.

## Development Commands

### Environment Setup
```bash
# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Application
```bash
# Start development server with auto-reload
python -m uvicorn backend.app:app --reload

# Start on specific host/port
python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8080
```

### Testing
```bash
# Run all tests
python -m pytest backend/tests/

# Run specific test file
python -m pytest backend/tests/test_splits.py

# Run with verbose output
python -m pytest backend/tests/ -v

# Run specific test function
python -m pytest backend/tests/test_splits.py::test_equal_split
```

### Code Quality
```bash
# Format code with Black
black . --line-length 100

# Lint with Ruff
ruff check .

# Fix auto-fixable issues
ruff check . --fix
```

## Architecture

### Core Data Models (`backend/models.py`)
- **Account**: Represents a household account container
- **Member**: Individual household members (Lukas, Annie)
- **Transaction**: Expense records with configurable splitting logic
- **SharedSavingsTx**: Shared savings account deposits/payouts
- **Budget**: Monthly budget tracking (not actively used)

### Expense Splitting System (`backend/services/splits.py`)
The application implements three splitting methods:
- **Equal**: 50/50 split between members
- **Percent**: Custom percentage split (stored as Lukas percentage)
- **Fixed**: Fixed amount for one member, remainder for the other

Key functions:
- `compute_shares()`: Calculates individual shares based on split method
- `net_for_member()`: Computes net balance (paid minus owed)

### Database Layer (`backend/db.py`)
- Uses SQLModel with SQLite by default (`data.db`)
- PostgreSQL support via `DATABASE_URL` environment variable
- Database initialization handled on startup

### Web Interface
- **FastAPI** backend with Jinja2 templates
- **TailwindCSS** for styling
- **Progressive Web App** (PWA) support with service worker
- Swedish language interface

## Key Business Logic

### Member Balance Calculation
The home page calculates member balances by:
1. Summing all payments made by each member
2. Computing each member's share of shared expenses using splitting rules
3. Calculating net balance (paid - share)
4. Generating payout suggestions from shared savings

### Data Persistence
- Hardcoded member seeding on startup (Lukas, Annie)
- Single household account ("Hushållet") created automatically
- SQLite database file (`data.db`) contains all transaction history

### URL Structure
- `/` - Home dashboard with balances and payout suggestions
- `/transactions` - Expense entry and history
- `/shared` - Shared savings account management

## Configuration

### Environment Variables
- `DATABASE_URL`: Database connection string (defaults to SQLite)

### Development Settings
- Black line length: 100 characters
- Ruff target: Python 3.11
- Selected linting rules: E, F, I (errors, Flakes, imports)
