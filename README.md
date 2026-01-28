# Fiscal Intelligence Platform

A modular platform for intelligent fiscal analysis based on electronic invoice (XML) data,
tax reform simulation, and ERP integrations — built with a strong focus on
mature SDLC practices, scalability, and strategic use of AI.

## 🎯 Purpose
Build a real-world market product that:
- Helps companies reduce incorrect tax payments
- Provides intelligent analysis of fiscal XML files and SEFAZ rejections
- Simulates the impact of the Brazilian Tax Reform through 2033
- Serves as a complete case study of Software Engineering with end-to-end SDLC

## 👥 Target Audience
- ERP developers
- Technical accountants
- Companies seeking fiscal predictability and efficiency

## 🧩 Architecture Vision (High Level)
- API-first and modular
- Asynchronous processing for heavy workloads
- Decoupled AI integration
- Ready for ERP integration via APIs and Webhooks

## 🧭 Roadmap (High Level)
- V1: Tax Reform Simulator
- V2: Intelligent XML Validator (SEFAZ Rejections)
- V3: Fiscal Calendar + Technical Notes
- V4: ERP Integrations and Public API

## 🧠 SDLC
This project follows formal SDLC practices:
- Discovery driven by real problems
- Design with documented architectural decisions (ADRs)
- Modular and testable build
- CI/CD from the first commits
- Observability and continuous evolution

See `docs/manifesto.md` for more details.

## 🚀 Local development (Docker)

Spin up the full stack locally with Docker Compose:

```bash
docker compose up --build
```

Services and health checks:
- PostgreSQL: `localhost:5432` (db: `fiscal`, user: `fiscal`, password: `fiscal`)
- Laravel API placeholder: `http://localhost:8001/health`
- FastAPI engine placeholder: `http://localhost:8002/health`
- React web placeholder: `http://localhost:5173`

Shut everything down:

```bash
docker compose down -v
```
