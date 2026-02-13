from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.rag.search_and_respond import search_rag_and_respond

router = APIRouter()

@router.post("/rag/ask")
async def rag_ask(request: Request):
    data = await request.json()
    question = data.get("question")
    if not question:
        return JSONResponse({"error": "No question provided."}, status_code=400)
    answer = search_rag_and_respond(question)
    return {"answer": answer}
