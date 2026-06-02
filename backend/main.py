from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models, os
from database import engine
from routers import auth, users
from goals import logs, foods, articles

# create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NutriCheck API",
    description="Backend API for the NutriCheck nutrition tracking system",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",
    "https://aol-nutri-check.vercel.app" 
]

# connect with frontend (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register all routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(logs.router)
app.include_router(foods.router)
app.include_router(articles.router)

@app.get("/")
def read_root():
    return {"message": "NutriCheck API is running.", "docs": "/docs"}