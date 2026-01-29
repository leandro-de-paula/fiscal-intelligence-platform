from __future__ import annotations

from typing import Dict, List

from ...core.constants import (
    ESTIMATED_CBS_RATE_2033,
    ESTIMATED_IBS_RATE_2033,
    FINAL_YEAR,
    TRANSITION_YEARS,
)


def simulate_tax_reform(
    *,
    base_year: int,
    revenue: Dict[str, float],
    last_year_taxes_paid: Dict[str, float],
    growth_rates: Dict[str, float],
    policy: Dict,
    calculation_mode: str = "neutral",
    rates_override: Dict[str, float] | None = None,
) -> Dict:
    if calculation_mode == "neutral":
        return _simulate_neutral(
            base_year=base_year,
            revenue=revenue,
            last_year_taxes_paid=last_year_taxes_paid,
            growth_rates=growth_rates,
            policy=policy,
        )
    if calculation_mode == "rate_based":
        return _simulate_rate_based(
            base_year=base_year,
            revenue=revenue,
            last_year_taxes_paid=last_year_taxes_paid,
            growth_rates=growth_rates,
            policy=policy,
            rates_override=rates_override,
        )
    raise ValueError(f"Unsupported calculation_mode: {calculation_mode}")


def _simulate_neutral(
    *,
    base_year: int,
    revenue: Dict[str, float],
    last_year_taxes_paid: Dict[str, float],
    growth_rates: Dict[str, float],
    policy: Dict,
) -> Dict:
    icms_base = float(last_year_taxes_paid["icms"])
    iss_base = float(last_year_taxes_paid["iss"])
    pis_cofins_base = float(last_year_taxes_paid["pis_cofins"])

    transition_rows: List[Dict] = []
    labels: List[str] = []
    totals: List[float] = []
    breakdown = {"icms": [], "iss": [], "ibs": [], "cbs": []}

    for year in TRANSITION_YEARS:
        reduction = float(policy["icms_iss_reduction"][str(year)])
        ibs_increase = float(policy["ibs_increase"][str(year)])

        icms_y = icms_base * (1 - reduction)
        iss_y = iss_base * (1 - reduction)
        ibs_y = (icms_base + iss_base) * ibs_increase
        cbs_y = pis_cofins_base
        total = icms_y + iss_y + ibs_y + cbs_y

        transition_rows.append(
            {
                "year": year,
                "icms": icms_y,
                "iss": iss_y,
                "ibs": ibs_y,
                "cbs": cbs_y,
                "total_tax": total,
            }
        )

        labels.append(str(year))
        totals.append(total)
        breakdown["icms"].append(icms_y)
        breakdown["iss"].append(iss_y)
        breakdown["ibs"].append(ibs_y)
        breakdown["cbs"].append(cbs_y)

    icms_2033 = 0.0
    iss_2033 = 0.0
    ibs_2033 = icms_base + iss_base
    cbs_2033 = pis_cofins_base
    total_2033 = ibs_2033 + cbs_2033

    labels.append(str(FINAL_YEAR))
    totals.append(total_2033)
    breakdown["icms"].append(icms_2033)
    breakdown["iss"].append(iss_2033)
    breakdown["ibs"].append(ibs_2033)
    breakdown["cbs"].append(cbs_2033)

    base_revenue = float(revenue["goods_annual"]) + float(revenue["services_annual"])
    years_to_2033 = max(0, FINAL_YEAR - int(base_year))

    def project_revenue(rate: float) -> float:
        return base_revenue * ((1 + rate) ** years_to_2033)

    projection_2033 = {
        "optimistic": {
            "year": FINAL_YEAR,
            "revenue_projected": project_revenue(float(growth_rates["optimistic"])),
            "icms": icms_2033,
            "iss": iss_2033,
            "ibs": ibs_2033,
            "cbs": cbs_2033,
            "total_tax": total_2033,
        },
        "conservative": {
            "year": FINAL_YEAR,
            "revenue_projected": project_revenue(float(growth_rates["conservative"])),
            "icms": icms_2033,
            "iss": iss_2033,
            "ibs": ibs_2033,
            "cbs": cbs_2033,
            "total_tax": total_2033,
        },
        "pessimistic": {
            "year": FINAL_YEAR,
            "revenue_projected": project_revenue(float(growth_rates["pessimistic"])),
            "icms": icms_2033,
            "iss": iss_2033,
            "ibs": ibs_2033,
            "cbs": cbs_2033,
            "total_tax": total_2033,
        },
    }

    return {
        "assumptions": {
            "base_year": base_year,
            "policy": policy,
        },
        "projection_2033": projection_2033,
        "transition_2029_2032": transition_rows,
        "series": {
            "labels": labels,
            "totals": {
                "optimistic": totals,
                "conservative": totals,
                "pessimistic": totals,
            },
            "breakdown": breakdown,
        },
    }


def _simulate_rate_based(
    *,
    base_year: int,
    revenue: Dict[str, float],
    last_year_taxes_paid: Dict[str, float],
    growth_rates: Dict[str, float],
    policy: Dict,
    rates_override: Dict[str, float] | None,
) -> Dict:
    icms_base = float(last_year_taxes_paid["icms"])
    iss_base = float(last_year_taxes_paid["iss"])
    base_revenue = float(revenue["goods_annual"]) + float(revenue["services_annual"])

    ibs_rate = (
        float(rates_override["ibs_rate"])
        if rates_override and "ibs_rate" in rates_override
        else ESTIMATED_IBS_RATE_2033
    )
    cbs_rate = (
        float(rates_override["cbs_rate"])
        if rates_override and "cbs_rate" in rates_override
        else ESTIMATED_CBS_RATE_2033
    )

    def project_revenue(rate: float, year: int) -> float:
        years = max(0, year - int(base_year))
        return base_revenue * ((1 + rate) ** years)

    scenario_rates = {
        "optimistic": float(growth_rates["optimistic"]),
        "conservative": float(growth_rates["conservative"]),
        "pessimistic": float(growth_rates["pessimistic"]),
    }

    labels = [str(year) for year in TRANSITION_YEARS] + [str(FINAL_YEAR)]
    totals_by_scenario = {key: [] for key in scenario_rates}

    def compute_year_values(revenue_year: float, reduction: float, ibs_increase: float) -> Dict:
        scaling = revenue_year / base_revenue if base_revenue > 0 else 0.0
        icms_y = icms_base * (1 - reduction) * scaling
        iss_y = iss_base * (1 - reduction) * scaling
        ibs_y = revenue_year * ibs_rate * ibs_increase
        cbs_y = revenue_year * cbs_rate
        total = icms_y + iss_y + ibs_y + cbs_y
        return {
            "icms": icms_y,
            "iss": iss_y,
            "ibs": ibs_y,
            "cbs": cbs_y,
            "total_tax": total,
        }

    transition_rows: List[Dict] = []
    breakdown = {"icms": [], "iss": [], "ibs": [], "cbs": []}
    projection_2033: Dict[str, Dict] = {}

    for scenario, rate in scenario_rates.items():
        for year in TRANSITION_YEARS:
            revenue_year = project_revenue(rate, year)
            reduction = float(policy["icms_iss_reduction"][str(year)])
            ibs_increase = float(policy["ibs_increase"][str(year)])

            values = compute_year_values(revenue_year, reduction, ibs_increase)
            totals_by_scenario[scenario].append(values["total_tax"])

            if scenario == "conservative":
                transition_rows.append({"year": year, **values})
                breakdown["icms"].append(values["icms"])
                breakdown["iss"].append(values["iss"])
                breakdown["ibs"].append(values["ibs"])
                breakdown["cbs"].append(values["cbs"])

        revenue_2033 = project_revenue(rate, FINAL_YEAR)
        icms_2033 = 0.0
        iss_2033 = 0.0
        ibs_2033 = revenue_2033 * ibs_rate
        cbs_2033 = revenue_2033 * cbs_rate
        total_2033 = ibs_2033 + cbs_2033

        totals_by_scenario[scenario].append(total_2033)
        projection_2033[scenario] = {
            "year": FINAL_YEAR,
            "revenue_projected": revenue_2033,
            "icms": icms_2033,
            "iss": iss_2033,
            "ibs": ibs_2033,
            "cbs": cbs_2033,
            "total_tax": total_2033,
        }

        if scenario == "conservative":
            breakdown["icms"].append(icms_2033)
            breakdown["iss"].append(iss_2033)
            breakdown["ibs"].append(ibs_2033)
            breakdown["cbs"].append(cbs_2033)

    return {
        "assumptions": {
            "base_year": base_year,
            "policy": policy,
        },
        "projection_2033": projection_2033,
        "transition_2029_2032": transition_rows,
        "series": {
            "labels": labels,
            "totals": totals_by_scenario,
            "breakdown": breakdown,
        },
    }
