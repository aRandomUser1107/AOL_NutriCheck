from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv() 

SERVER_NAME   = os.getenv("DB_SERVER", "localhost")
DATABASE_NAME = os.getenv("DB_NAME", "nutricheckdb")
DB_USER       = os.getenv("DB_USER", "")
DB_PASSWORD   = os.getenv("DB_PASSWORD", "")
DB_PORT       = os.getenv("DB_PORT", "3306")

SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{SERVER_NAME}:{DB_PORT}/{DATABASE_NAME}"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()