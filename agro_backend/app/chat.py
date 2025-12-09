# app/chat.py
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import os
import requests

router = APIRouter()

GEMINI_KEY = "API_key"
GEMINI_MODEL = "gemini-2.0-flash"
# [Unverified] Endpoint pattern - adjust if Google changes API.
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_KEY}"

class ChatRequest(BaseModel):
    message: str
    lang: str = "en"   # language code, e.g. 'hi' for Hindi, 'en' for English

@router.post("/chat")
async def chat(req: ChatRequest):
    if not GEMINI_KEY:
        raise HTTPException(status_code=500, detail="Server missing GEMINI_API_KEY env var")

    # Build a short instruction that keeps the assistant focused on Indian agriculture.
    system_prompt = (
        f"You are Kisan Mitra, an agricultural assistant specialized in Indian farming. "
        f"Answer in the user's requested language ({req.lang}). "
        "ONLY answer questions about Indian agriculture, farming practices, crop diseases, "
        "weather impacts on crops in India, and suitable agronomy advice. If the question is unrelated, "
        "politely decline and say you only handle agriculture-related queries."
    )

    body = {
        "contents": [
            {
                "parts": [
                    {"text": system_prompt},
                    {"text": f"User question: {req.message}"}
                ]
            }
        ],
        # optional: tune safety / candidate count
        "candidateCount": 1
    }

    try:
        r = requests.post(GEMINI_ENDPOINT, json=body, timeout=30)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to reach Gemini: {e}")

    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=f"Gemini error: {r.text}")

    data = r.json()
    # Try to extract reply content (matches pattern in your web code)
    try:
        candidate = data.get("candidates", [])[0]
        text = ""
        # some responses use candidate.content.parts
        if candidate and candidate.get("content") and candidate["content"].get("parts"):
            text = candidate["content"]["parts"][0].get("text", "")
        # fallback: full candidate text
        if not text:
            text = candidate.get("output", "") or candidate.get("content", {}).get("text", "")
    except Exception:
        text = data

    return {"reply": text}