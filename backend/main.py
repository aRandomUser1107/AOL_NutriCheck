from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Nutrition API is running"}

@app.get("/api/food-entries")
def get_food_entries():
    # Placeholder data
    return [
        {"id": 1, "food": "Apple", "calories": 95, "protein": 0.5},
        {"id": 2, "food": "Chicken Breast", "calories": 165, "protein": 31}
    ]
