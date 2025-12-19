# Manifesto — Fiscal Intelligence Platform

## 1. Propósito
Construir uma plataforma fiscal inteligente que combine regras de negócio,
automação, IA e engenharia de software madura para apoiar decisões fiscais
e reduzir erros de recolhimento tributário.

Este projeto também é um case prático de aplicação completa de SDLC.

## 2. Princípios
- API-first desde o início
- Modularidade acima de acoplamento
- Processamento pesado sempre assíncrono
- Decisões arquiteturais documentadas
- Testes como parte do design
- Escalabilidade como requisito, não como melhoria futura
- IA como ferramenta de fluxo, não como feature isolada

## 3. Stack (definida)
- Backend Core: Laravel 12 (API)
- Engines inteligentes: Python + FastAPI
- Frontend: React
- Banco de dados: PostgreSQL
- Infraestrutura: GCP
- Filas e processamento assíncrono
- Abstração de provedores de IA com fallback

## 4. SDLC adotado
- Discovery contínuo com cliente zero (Dev ERP + Contábil técnico)
- Design documentado (C4 + ADRs)
- Build incremental por versões
- Testes por camada
- Deploy automatizado
- Observabilidade mínima desde o MVP
- Evolução guiada por feedback real

## 5. Compromisso
Este projeto prioriza clareza, sustentabilidade técnica e valor real de mercado,
evitando atalhos que comprometam escalabilidade ou qualidade.
