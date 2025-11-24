# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from app.predict import router as predict_router
from app.chat import router as chat_router
from app.utils.model_loader import load_model

APP_NAME = "agro_backend"

def create_app() -> FastAPI:
    app = FastAPI(title=APP_NAME)

    # Allow all CORS for development (tighten for production)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount routers
    app.include_router(predict_router, prefix="/api/v1")
    app.include_router(chat_router, prefix="/api/v1")

    @app.get("/health")
    async def health():
        return {"status": "ok", "app": APP_NAME}

    # Preload model at startup to avoid first-request delay
    @app.on_event("startup")
    async def startup_event():
        # Attempt to load model once (model_loader handles idempotence)
        try:
            load_model()
            print("Model loaded successfully on startup.")
        except Exception as e:
            # Print error but don't crash the server here; keeps dev loop flexible
            print("Warning: model failed to load on startup:", e)

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3030))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)