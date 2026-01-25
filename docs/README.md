# Documentation

Welcome to the Nombre documentation. This guide covers everything you need to know to understand, set up, and contribute to the project.

---

## 📚 Table of Contents

### Getting Started
- [**Getting Started**](getting-started.md) - Setup guide for local development
- [**Deployment**](deployment.md) - Guide for deploying to production

### Core Documentation
- [**Architecture**](architecture.md) - System design, tech stack, and data flow
- [**API Reference**](api-reference.md) - Complete backend API documentation
- [**Database Schema**](database-schema.md) - Tables, relationships, and constraints
- [**Trading Mechanics**](trading-mechanics.md) - CPI formula, AMM bonding curve, portfolio math
- [**Design System**](design-system.md) - Colors, typography, and UI components

### Development
- [**Changelog**](development/changelog.md) - Version history and changes
- [**Scripts**](development/scripts.md) - Utility scripts documentation

### Archive
- [**Legacy Docs**](_archive/) - Archived documentation from earlier phases

---

## Quick Links

| I want to... | Go to... |
|--------------|----------|
| Set up my dev environment | [Getting Started](getting-started.md) |
| Understand the system design | [Architecture](architecture.md) |
| Find an API endpoint | [API Reference](api-reference.md) |
| Know how trading works | [Trading Mechanics](trading-mechanics.md) |
| Style a component | [Design System](design-system.md) |
| Check the database schema | [Database Schema](database-schema.md) |
| Run a maintenance script | [Scripts](development/scripts.md) |

---

## Project Overview

**Nombre** is a SocialFi trading platform where users invest in their favorite YouTubers using play money ($NMBR tokens).

### Key Features
- 🔐 Google OAuth authentication
- 💰 Faucet system (10,000 $NMBR for new users)
- 📈 Real-time trading with AMM bonding curve
- 📊 Portfolio tracking with P&L
- 🏆 ROI-based leaderboard
- 📺 YouTube API integration

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Python FastAPI
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth)

---

## Contributing to Docs

When updating documentation:

1. Edit the relevant `.md` file in this folder
2. Keep formatting consistent with existing docs
3. Update this index if adding new documents
4. Test any code examples

### Style Guidelines
- Use clear, concise language
- Include code examples where helpful
- Use tables for structured data
- Add diagrams for complex flows
