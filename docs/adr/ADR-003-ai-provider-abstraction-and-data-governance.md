# ADR-003 — AI Provider Abstraction and Data Governance

## Status
Accepted

## Context
The Fiscal Intelligence Platform relies on AI capabilities to enrich fiscal analysis,
generate explanations, and provide intelligent insights based on complex fiscal data.

Using AI providers directly from business logic introduces several risks:
- Vendor lock-in
- Uncontrolled costs
- Data exposure and privacy concerns
- Difficulty in experimenting with multiple providers
- Limited observability of AI behavior and performance

Additionally, the platform processes sensitive fiscal information,
requiring strict data governance and privacy controls.

## Decision
Introduce an internal AI abstraction layer (AI Gateway) responsible for:

- Standardizing AI requests and responses
- Supporting multiple AI providers with fallback strategies
- Centralizing prompt management and versioning
- Enforcing data redaction and anonymization rules
- Logging and monitoring AI usage, latency, and cost
- Preventing direct AI provider access from business logic

The AI Gateway will be the only component allowed to interact with external AI services.

Data governance principles adopted:
- Minimize data sent to AI providers
- Anonymize or redact sensitive fields whenever possible
- Never store raw AI prompts or responses containing sensitive data without explicit need
- Separate AI interaction logs from core business data

## Consequences
### Positive
- Reduced vendor lock-in
- Improved cost control and monitoring
- Increased data privacy and compliance readiness
- Easier experimentation with new AI providers
- Clear separation between business logic and AI concerns

### Negative
- Additional architectural complexity
- Slight increase in development effort
- Need for governance and monitoring discipline

These consequences are considered acceptable given the platform's long-term goals
and the critical nature of fiscal data.
