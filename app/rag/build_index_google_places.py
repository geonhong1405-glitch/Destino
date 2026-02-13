import pinecone
from sentence_transformers import SentenceTransformer
import requests
import time
import os
from dotenv import load_dotenv

load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "touristspot")
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")

pinecone.init(api_key=PINECONE_API_KEY)
index = pinecone.Index(INDEX_NAME)
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

def fetch_places(city, lat, lon, keyword=None, place_type=None, max_results=20):
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lon}",
        "radius": 5000,
        "key": GOOGLE_PLACES_API_KEY
    }
    if keyword:
        params["keyword"] = keyword
    if place_type:
        params["type"] = place_type
    results = []
    next_page_token = None
    while len(results) < max_results:
        if next_page_token:
            params["pagetoken"] = next_page_token
            time.sleep(2)  # Google API 요구사항
        resp = requests.get(url, params=params)
        data = resp.json()
        results.extend(data.get("results", []))
        next_page_token = data.get("next_page_token")
        if not next_page_token:
            break
    return results[:max_results]


# 여러 도시/카테고리/키워드 확장 구조
cities = [
    {"name": "도쿄", "lat": 35.6895, "lon": 139.6917},
    {"name": "서울", "lat": 37.5665, "lon": 126.9780},
    {"name": "오사카", "lat": 34.6937, "lon": 135.5023},
    # 필요시 도시 추가
]

categories = [
    {"keyword": "맛집", "place_type": "restaurant", "category": "맛집"},
    {"keyword": "관광지", "place_type": "tourist_attraction", "category": "명소"},
    {"keyword": "호텔", "place_type": "lodging", "category": "호텔"},
    # 필요시 카테고리 추가
]

def upsert_places(city, lat, lon, keyword, place_type, category, max_results=30):
    places = fetch_places(city, lat, lon, keyword=keyword, place_type=place_type, max_results=max_results)
    for i, place in enumerate(places):
        desc = place.get("name", "") + ", " + place.get("vicinity", "")
        emb = model.encode(desc)
        meta = {
            "id": f"{city}-{category}-{i}",
            "title": place.get("name", ""),
            "description": desc,
            "location": place.get("vicinity", ""),
            "category": category,
            "rating": place.get("rating"),
            "review_count": place.get("user_ratings_total"),
            "opening_hours": place.get("opening_hours", {}).get("weekday_text", "정보 없음")
        }
        index.upsert([(meta["id"], emb, meta)])
    print(f"{city} {category} {len(places)}개 저장 완료!")

# 전체 도시/카테고리 반복 적재
if __name__ == "__main__":
    for city_info in cities:
        for cat in categories:
            upsert_places(
                city=city_info["name"],
                lat=city_info["lat"],
                lon=city_info["lon"],
                keyword=cat["keyword"],
                place_type=cat["place_type"],
                category=cat["category"],
                max_results=30
            )