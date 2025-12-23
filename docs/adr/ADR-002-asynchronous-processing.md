# ADR-002 — Asynchronous Processing Strategy

## Status
Accepted

## Context
The Fiscal Intelligence Platform performs operations that may vary significantly
in execution time and resource consumption, such as:

- Parsing and validating large fiscal XML files
- Simulating complex tax reform scenarios
- Executing fiscal rule engines
- Generating analytical reports and documents
- Integrating with external AI providers

Executing these operations synchronously within HTTP request cycles
would increase response time, degrade user experience,
and create scalability and availability risks.

## Decision
Adopt an asynchronous processing strategy for all heavy or non-deterministic workloads.

The platform will:
- Accept user requests and immediately return a job reference
- Delegate heavy processing to background workers via a queue system
- Allow users and integrations to poll or receive notifications about job status
- Ensure idempotent job execution to safely handle retries

Queue-based processing will be used for:
- XML parsing and validation
- Tax reform simulations
- Intelligent SEFAZ rejection analysis
- AI-powered analysis and summarization
- Report and PDF generation

## Consequences
### Positive
- Improved API responsiveness and user experience
- Horizontal scalability under variable workloads
- Better fault tolerance and retry mechanisms
- Cost control by scaling workers independently
- Clear separation between orchestration and execution

### Negative
- Increased system complexity
- Need for queue monitoring and observability
- Requirement for careful idempotency design

These consequences are considered acceptable and aligned with the system goals.
