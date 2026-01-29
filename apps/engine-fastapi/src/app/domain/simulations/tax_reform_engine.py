from __future__ import annotations

from typing import Dict, List

from ...core.constants import FINAL_YEAR, TRANSITION_YEARS


def simulate_tax_reform(
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
