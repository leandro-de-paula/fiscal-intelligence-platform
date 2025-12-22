# ADR-001 — Stack and Responsibility Separation

## Status
Accepted

## Context
The Fiscal Intelligence Platform aims to be both a real market product
and a technical case study demonstrating mature SDLC practices.

The problem domain involves:
- Fiscal XML processing
- Complex tax rules
- Future scenario simulations
- Use of AI for interpretation and explanation
- High scalability and resilience requirements

A single-stack approach could lead to excessive coupling,
limited evolution, and technical constraints.

## Decision
Adopt a hybrid, modular, API-first architecture composed of:

- **Laravel 12 (API Core)**  
  Responsible for:
  - Authentication and authorization (RBAC)
  - User management and multi-tenancy
  - Flow orchestration and job management
  - Public and private API exposure
  - Product lifecycle governance

- **Python + FastAPI (Intelligent Engines)**  
  Responsible for:
  - Fiscal XML parsing and normalization
  - Tax Reform simulation by phases
  - Intelligent validation of SEFAZ rejections
  - Complex fiscal rule processing
  - Integration with AI providers

- **React (Web Frontend)**  
  Responsible for:
  - User interface
  - Result and report visualization
  - Backend API consumption

- **PostgreSQL**  
  Used as the primary relational database.

- **Cloud Infrastructure (GCP)**  
  Used for:
  - Scalable service execution
  - Asynchronous processing
  - File storage
  - Observability and security

## Consequences
### Positive
- Clear separation of responsibilities
- Improved horizontal scalability
- Independent evolution of engines
- Easier layered testing
- Alignment with modern SDLC practices

### Negative
- Initial increase in architectural complexity
- Need for well-defined API contracts
- Requirement for discipline in observability and versioning

These consequences are considered acceptable given the project goals.
