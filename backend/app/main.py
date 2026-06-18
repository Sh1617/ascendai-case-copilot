from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import cases
from app.routers import documents
from app.routers import ai
from app.routers import dashboard


app = FastAPI(
    title="AscendAI Case Copilot"
)

# ── CORS ──────────────────────────────────────────────────────────────
# Allow the React dev server (port 5173) and any production origin.
# Adjust origins list before deploying to production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ──────────────────────────────────────────────────────────────────────

app.include_router(dashboard.router)
app.include_router(cases.router)
app.include_router(documents.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {
        "message": "AscendAI Case Copilot Running"
    }