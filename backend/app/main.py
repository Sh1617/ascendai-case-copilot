from fastapi import FastAPI

from app.routers import cases
from app.routers import documents
from app.routers import ai
from app.routers import dashboard


app = FastAPI(
    title="AscendAI Case Copilot"
)


app.include_router(
    dashboard.router
)

app.include_router(cases.router)
app.include_router(documents.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {
        "message": "AscendAI Case Copilot Running"
    }