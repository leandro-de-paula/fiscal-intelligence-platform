from fastapi import APIRouter

from .schemas import TaxReformRequest, TaxReformResponse
from ...services.tax_reform_service import run_tax_reform_simulation

router = APIRouter()


@router.post("/tax-reform", response_model=TaxReformResponse)
def simulate_tax_reform(payload: TaxReformRequest):
    return run_tax_reform_simulation(payload)
