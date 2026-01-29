from __future__ import annotations

from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

from ...core.constants import TRANSITION_YEARS


class Revenue(BaseModel):
    goods_annual: float = Field(..., ge=0)
    services_annual: float = Field(..., ge=0)


class LastYearTaxesPaid(BaseModel):
    icms: float = Field(..., ge=0)
    iss: float = Field(..., ge=0)
    pis_cofins: float = Field(..., ge=0)


class GrowthRates(BaseModel):
    optimistic: float = Field(..., ge=-1.0, le=5.0)
    conservative: float = Field(..., ge=-1.0, le=5.0)
    pessimistic: float = Field(..., ge=-1.0, le=5.0)


class Policy(BaseModel):
    transition_years: List[int]
    icms_iss_reduction: Dict[str, float]
    ibs_increase: Dict[str, float]

    @model_validator(mode="after")
    def validate_policy(self) -> "Policy":
        if self.transition_years != TRANSITION_YEARS:
            raise ValueError(f"transition_years must be {TRANSITION_YEARS}")

        for field_name in ("icms_iss_reduction", "ibs_increase"):
            values = getattr(self, field_name)
            for year in TRANSITION_YEARS:
                year_key = str(year)
                if year_key not in values:
                    raise ValueError(f"{field_name} must include year {year_key}")
                value = values[year_key]
                if value < 0 or value > 1:
                    raise ValueError(f"{field_name}[{year_key}] must be between 0 and 1")
        return self


class RatesOverride(BaseModel):
    ibs_rate: float = Field(..., ge=0, le=1)
    cbs_rate: float = Field(..., ge=0, le=1)


class TaxReformRequest(BaseModel):
    base_year: int
    revenue: Revenue
    last_year_taxes_paid: LastYearTaxesPaid
    growth_rates: GrowthRates
    policy: Policy
    calculation_mode: Literal["neutral", "rate_based"] = "neutral"
    rates_override: Optional[RatesOverride] = None

    @field_validator("base_year")
    @classmethod
    def validate_base_year(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("base_year must be a positive integer")
        return value

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "summary": "Neutral mode (default)",
                    "value": {
                        "base_year": 2028,
                        "revenue": {"goods_annual": 2_500_000, "services_annual": 1_500_000},
                        "last_year_taxes_paid": {
                            "icms": 180_000,
                            "iss": 120_000,
                            "pis_cofins": 90_000,
                        },
                        "growth_rates": {
                            "optimistic": 0.08,
                            "conservative": 0.05,
                            "pessimistic": 0.02,
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
                        "calculation_mode": "neutral",
                    },
                },
                {
                    "summary": "Rate-based mode with overrides",
                    "value": {
                        "base_year": 2028,
                        "revenue": {"goods_annual": 3_000_000, "services_annual": 2_000_000},
                        "last_year_taxes_paid": {
                            "icms": 200_000,
                            "iss": 150_000,
                            "pis_cofins": 110_000,
                        },
                        "growth_rates": {
                            "optimistic": 0.1,
                            "conservative": 0.06,
                            "pessimistic": 0.03,
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
                        "calculation_mode": "rate_based",
                        "rates_override": {"ibs_rate": 0.18, "cbs_rate": 0.095},
                    },
                },
            ]
        }
    }


class TaxReformResponse(BaseModel):
    assumptions: dict
    projection_2033: dict
    transition_2029_2032: List[dict]
    series: dict
