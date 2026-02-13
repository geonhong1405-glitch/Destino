import os
import requests
from dotenv import load_dotenv

load_dotenv()
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")

def get_google_places(lat, lon, radius=5000, keyword=None, type=None):
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lon}",
        "radius": radius,
        "key": GOOGLE_PLACES_API_KEY
    }
    if keyword:
        params["keyword"] = keyword
    if type:
        params["type"] = type
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.text}
