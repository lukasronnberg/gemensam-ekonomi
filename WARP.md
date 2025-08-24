# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Gemensam Ekonomi is a Swedish household expense sharing web application built with React, TypeScript, and Vite. It tracks shared expenses between household members (primarily Lukas and Annie), manages expense splitting calculations, and maintains a shared savings account using Supabase as the backend.

## Development Commands

### Environment Setup
```bash
# Install dependencies
npm install
```

### Running the Application
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Code Quality
```bash
# Format code with Prettier
npm run format

# Lint with ESLint
npm run lint

# Type checking with TypeScript
npm run typecheck

# Run all checks (CI pipeline)
npm run ci:check
```

## Architecture

### Frontend Stack
- **React 19** - Modern React with latest features
- **TypeScript 5.8** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **TailwindCSS 4** - Utility-first CSS framework
- **React Router DOM 7** - Client-side routing

### Core Components (`src/pages/`)
- **App.tsx**: Main application component with routing
- **Home.tsx**: Dashboard showing member balances and payout suggestions
- **Transactions.tsx**: Expense entry and transaction history
- **Shared.tsx**: Shared savings account management
- **Login.tsx**: Authentication interface

### Business Logic (`src/lib/`)
- **split.ts**: Expense splitting calculations
  - `computeShares()`: Calculates individual shares based on split method
  - `netForMember()`: Computes net balance (paid minus owed)
- **supabase.ts**: Database connection and configuration

### Data Types (`src/types.ts`)
- **Member**: Individual household members
- **Transaction**: Expense records with configurable splitting logic
- **SharedSavingsTx**: Shared savings account transactions
- **SplitMethod**: Splitting calculation methods (equal, percent, fixed)

### Backend Integration
- **Supabase** - PostgreSQL database with real-time features
- **Authentication** - Supabase Auth for user management
- **Real-time updates** - Live data synchronization

## Key Business Logic

### Expense Splitting System
The application implements three splitting methods:
- **Equal**: 50/50 split between members
- **Percent**: Custom percentage split (configurable per member)
- **Fixed**: Fixed amount for one member, remainder for the other

### Member Balance Calculation
The home page calculates member balances by:
1. Summing all payments made by each member
2. Computing each member's share of shared expenses using splitting rules
3. Calculating net balance (paid - share)
4. Generating payout suggestions from shared savings

### Progressive Web App (PWA)
- Service worker for offline functionality
- Responsive design optimized for mobile use
- Swedish language interface

## Configuration

### Environment Variables
Create a `.env` file with:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development Settings
- **ESLint**: React and TypeScript rules
- **Prettier**: Code formatting with 2-space indentation
- **TypeScript**: Strict mode enabled
- **Tailwind**: Utility-first styling approach
