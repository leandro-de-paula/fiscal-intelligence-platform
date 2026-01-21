from fastapi import FastAPI

app = FastAPI(title="Engine FastAPI Placeholder")


@app.get("/health")
def health():
    return {"status": "ok", "service": "engine-fastapi"}


@app.get("/")
def root():
    return {"message": "FastAPI engine placeholder", "health": "/health"}
