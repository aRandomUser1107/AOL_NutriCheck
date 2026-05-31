from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, create_engine
from sqlalchemy.orm import relationship, declarative_base
import datetime
from database import SQLALCHEMY_DATABASE_URL, Base

Base = declarative_base()

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"charset": "utf8mb4"}
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)

    health_profile = relationship("HealthProfile", back_populates="user", uselist=False)
    nutrition_logs = relationship("NutritionLog", back_populates="user")
    
    nutritionist_profile = relationship("Nutritionist", back_populates="user", uselist=False)

class Nutritionist(Base):
    __tablename__ = "nutritionists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    bio = Column(Text)

    user = relationship("User", back_populates="nutritionist_profile")
    articles = relationship("Article", back_populates="author")

class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    age = Column(Integer)
    height = Column(Float)
    weight = Column(Float)

    user = relationship("User", back_populates="health_profile")
    goals = relationship("NutritionGoal", back_populates="health_profile")

class NutritionGoal(Base):
    __tablename__ = "nutrition_goals"

    id = Column(Integer, primary_key=True, index=True)
    health_profile_id = Column(Integer, ForeignKey("health_profiles.id"))
    goalType = Column(String(50))
    targetValue = Column(Float)
    unit = Column(String(20))

    health_profile = relationship("HealthProfile", back_populates="goals")

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    writer_id = Column(Integer, ForeignKey("nutritionists.id"))
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    postDate = Column(DateTime, default=datetime.datetime.utcnow)

    author = relationship("Nutritionist", back_populates="articles")

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    calories = Column(Float)
    protein = Column(Float)
    carbohydrates = Column(Float)
    fats = Column(Float)

    entries = relationship("FoodEntry", back_populates="food_item")

class NutritionLog(Base):
    __tablename__ = "nutrition_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    logDate = Column(DateTime, default=datetime.datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    totalNutrition = Column(Float, default=0.0)

    user = relationship("User", back_populates="nutrition_logs")
    entries = relationship("FoodEntry", back_populates="log")

class FoodEntry(Base):
    __tablename__ = "food_entries"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("nutrition_logs.id"))
    food_id = Column(Integer, ForeignKey("food_items.id"))
    category = Column(String(50))
    quantity = Column(Integer, default=1)
    updatedAt = Column(DateTime, default=datetime.datetime.utcnow)

    log = relationship("NutritionLog", back_populates="entries")
    food_item = relationship("FoodItem", back_populates="entries")