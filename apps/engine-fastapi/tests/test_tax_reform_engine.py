from app.domain.simulations.tax_reform_engine import simulate_tax_reform


def _base_payload():
    return {
        "base_year": 2028,
        "revenue": {"goods_annual": 1_000_000, "services_annual": 1_000_000},
        "last_year_taxes_paid": {"icms": 120_000, "iss": 80_000, "pis_cofins": 60_000},
        "growth_rates": {
            "optimistic": 0.1,
            "conservative": 0.05,
            "pessimistic": 0.0,
        },
        "policy": {
            "transition_years": [2029, 2030, 2031, 2032],
            "icms_iss_reduction": {
                "2029": 0.25,
                "2030": 0.5,
                "2031": 0.75,
                "2032": 1.0,
            },
            "ibs_increase": {
                "2029": 0.25,
                "2030": 0.5,
                "2031": 0.75,
                "2032": 1.0,
            },
        },
    }


def test_neutral_mode_totals_constant():
    payload = _base_payload()
    result = simulate_tax_reform(
        base_year=payload["base_year"],
        revenue=payload["revenue"],
        last_year_taxes_paid=payload["last_year_taxes_paid"],
        growth_rates=payload["growth_rates"],
        policy=payload["policy"],
        calculation_mode="neutral",
    )

    totals = result["series"]["totals"]["conservative"]
    assert all(total == totals[0] for total in totals)


def test_rate_based_mode_totals_increase_and_differ():
    payload = _base_payload()
    result = simulate_tax_reform(
        base_year=payload["base_year"],
        revenue=payload["revenue"],
        last_year_taxes_paid=payload["last_year_taxes_paid"],
        growth_rates=payload["growth_rates"],
        policy=payload["policy"],
        calculation_mode="rate_based",
    )

    totals = result["series"]["totals"]
    assert totals["optimistic"][-1] > totals["conservative"][-1] > totals["pessimistic"][-1]
    assert totals["optimistic"][-1] > totals["optimistic"][0]
