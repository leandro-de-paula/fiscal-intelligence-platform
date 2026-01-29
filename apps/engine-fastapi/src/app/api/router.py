from fastapi import APIRouter

from .simulations.routes import router as simulations_router

api_router = APIRouter()
api_router.include_router(simulations_router, prefix="/simulations", tags=["simulations"])
