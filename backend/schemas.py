from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class FoodItemBase(BaseModel):
    name: str
    calories: float
    protein: float
    carbohydrates: float
    fats: float

class FoodItemCreate(FoodItemBase):
    pass

class FoodItemResponse(FoodItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class FoodEntryBase(BaseModel):
    category: str
    quantity: int = 1

class FoodEntryCreate(FoodEntryBase):
    food_id: int

class FoodEntryResponse(FoodEntryBase):
    id: int
    food_id: int
    updatedAt: datetime
    food_item: Optional[FoodItemResponse] = None

    model_config = ConfigDict(from_attributes=True)

class NutritionLogBase(BaseModel):
    totalNutrition: float = 0.0

class NutritionLogCreate(NutritionLogBase):
    pass

class NutritionLogResponse(NutritionLogBase):
    id: int
    user_id: int
    logDate: datetime
    updatedAt: datetime
    entries: List[FoodEntryResponse] = [] 

    model_config = ConfigDict(from_attributes=True)

class ArticleBase(BaseModel):
    title: str
    content: str

class ArticleCreate(ArticleBase):
    pass

class ArticleResponse(ArticleBase):
    id: int
    writer_id: int
    postDate: datetime

    model_config = ConfigDict(from_attributes=True)

class NutritionistBase(BaseModel):
    bio: Optional[str] = None

class NutritionistResponse(NutritionistBase):
    id: int
    user_id: int
    articles: List[ArticleResponse] = []

    model_config = ConfigDict(from_attributes=True)

class HealthProfileBase(BaseModel):
    age: int
    height: float
    weight: float

class HealthProfileCreate(HealthProfileBase):
    pass

class HealthProfileResponse(HealthProfileBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str 

class UserResponse(UserBase):
    id: int
    health_profile: Optional[HealthProfileResponse] = None
    nutritionist_profile: Optional[NutritionistResponse] = None

    model_config = ConfigDict(from_attributes=True)