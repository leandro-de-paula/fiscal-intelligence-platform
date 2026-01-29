from fastapi import FastAPI

from .api.router import api_router


def create_app() -> FastAPI:
    app = FastAPI(title="Engine FastAPI")
    app.include_router(api_router)

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "engine-fastapi"}
    
    @app.get("/")
    def root():
        return {"message": "FastAPI engine placeholder", "health": "/health"}

    return app


app = create_app()
