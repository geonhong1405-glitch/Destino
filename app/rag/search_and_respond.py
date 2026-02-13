
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
# Pinecone, 임베딩, LLM 설정
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "touristspot")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
llm = OpenAI(api_key=OPENAI_API_KEY)

def search_rag_and_respond(question, top_k=5):
    # 1. 질문 임베딩
    q_emb = model.encode([question])[0]
    # 2. Pinecone에서 유사 명소 검색
    result = index.query(vector=q_emb.tolist(), top_k=top_k, include_metadata=True)
    # 3. 검색 결과 요약
    context = "\n".join([
        f"{m.metadata.get('title', '')}: {m.metadata.get('description', '')} (위치: {m.metadata.get('location', '')}, 평점: {m.metadata.get('rating', '')})"
        for m in result.matches
    ])
    # 4. LLM 프롬프트 생성 및 답변
    prompt = f"질문: {question}\n\n아래 명소 정보를 참고해서 여행자에게 친절하게 답변해줘.\n{context}"
    response = llm.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "너는 여행지 추천 전문가이자 친절한 여행 챗봇이야."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    q = input("여행 질문을 입력하세요: ")
    print(search_rag_and_respond(q))