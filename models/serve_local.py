#!/usr/bin/env python3
"""
Local inference server for DataThai-QwenStyle-smoke-qwen2.

Exposes an OpenAI-compatible /v1/chat/completions endpoint on port 8000
so the SvelteKit web app can call it with LLM_API_MODE=real and
DEFAULT_BACKEND=local (LOCAL_ENDPOINT_URL=http://localhost:8000).

Usage:
    cd models/
    pip install fastapi uvicorn transformers torch safetensors
    python serve_local.py
"""

import asyncio
import json
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_DIR = Path(__file__).parent / "DataThai-QwenStyle-smoke-qwen2"
MODEL_ID = "DataThai-QwenStyle-smoke-qwen2"

tokenizer = None
model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global tokenizer, model
    print(f"Loading model from {MODEL_DIR} …")
    tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR), local_files_only=True)
    model = AutoModelForCausalLM.from_pretrained(
        str(MODEL_DIR),
        dtype=torch.float32,
        local_files_only=True,
    )
    model.eval()
    print("Model ready on CPU.")
    yield


app = FastAPI(title="Local Thai LLM Server", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: Optional[str] = MODEL_ID
    messages: list[Message]
    temperature: float = 0.7
    top_p: float = 0.95
    max_tokens: int = 256
    repetition_penalty: float = 1.1
    stream: bool = True


def build_prompt(messages: list[Message]) -> str:
    """Format messages as ChatML used by Qwen2 instruct models."""
    parts = []
    for msg in messages:
        parts.append(f"<|im_start|>{msg.role}\n{msg.content}<|im_end|>")
    parts.append("<|im_start|>assistant\n")
    return "\n".join(parts)


def _run_inference(prompt: str, req: ChatRequest) -> str:
    inputs = tokenizer(prompt, return_tensors="pt")
    input_ids = inputs["input_ids"]

    with torch.no_grad():
        output = model.generate(
            input_ids,
            max_new_tokens=req.max_tokens,
            temperature=max(req.temperature, 1e-6),
            top_p=req.top_p,
            repetition_penalty=req.repetition_penalty,
            do_sample=req.temperature > 0,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.pad_token_id,
        )

    new_ids = output[0][input_ids.shape[-1]:]
    return tokenizer.decode(new_ids, skip_special_tokens=True)


async def _sse_stream(request_id: str, req: ChatRequest):
    prompt = build_prompt(req.messages)
    loop = asyncio.get_event_loop()
    text = await loop.run_in_executor(None, _run_inference, prompt, req)

    chunk_size = 3
    for i in range(0, len(text), chunk_size):
        chunk = text[i : i + chunk_size]
        data = {
            "id": request_id,
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": req.model,
            "choices": [{"index": 0, "delta": {"content": chunk}, "finish_reason": None}],
        }
        yield f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.01)

    done = {
        "id": request_id,
        "object": "chat.completion.chunk",
        "created": int(time.time()),
        "model": req.model,
        "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
    }
    yield f"data: {json.dumps(done)}\n\n"
    yield "data: [DONE]\n\n"


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatRequest):
    if tokenizer is None or model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    request_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"

    if req.stream:
        return StreamingResponse(
            _sse_stream(request_id, req),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    prompt = build_prompt(req.messages)
    loop = asyncio.get_event_loop()
    text = await loop.run_in_executor(None, _run_inference, prompt, req)

    return {
        "id": request_id,
        "object": "chat.completion",
        "created": int(time.time()),
        "model": req.model,
        "choices": [{"index": 0, "message": {"role": "assistant", "content": text}, "finish_reason": "stop"}],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    }


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_ID, "loaded": model is not None}


def main():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
