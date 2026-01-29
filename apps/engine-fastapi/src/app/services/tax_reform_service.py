from __future__ import annotations

from ..domain.simulations.tax_reform_engine import simulate_tax_reform


def run_tax_reform_simulation(payload) -> dict:
    return simulate_tax_reform(
        base_year=payload.base_year,
        revenue=payload.revenue.model_dump(),
        last_year_taxes_paid=payload.last_year_taxes_paid.model_dump(),
        growth_rates=payload.growth_rates.model_dump(),
        policy=payload.policy.model_dump(),
        calculation_mode=payload.calculation_mode,
        rates_override=payload.rates_override.model_dump() if payload.rates_override else None,
    )
