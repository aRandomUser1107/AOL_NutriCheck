from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime


# food items schema
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


# food entry schema
class FoodEntryBase(BaseModel):
    category: str # breakfast, dinner, lunch, snack
    quantity: int = 1

class FoodEntryCreate(FoodEntryBase):
    food_id: int

class FoodEntryResponse(FoodEntryBase):
    id: int
    food_id: int
    updatedAt: datetime
    food_item: Optional[FoodItemResponse] = None
    model_config = ConfigDict(from_attributes=True)


# nutrition log schema
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


# articles schema
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


# nutrition goals schema
class NutritionGoalBase(BaseModel):
    goalType: str # calories, protein, etc
    targetValue: float
    unit: str # kg or g

class NutritionGoalCreate(NutritionGoalBase):
    pass

class NutritionGoalResponse(NutritionGoalBase):
    id: int
    health_profile_id: int
    model_config = ConfigDict(from_attributes=True)

class HealthProfileBase(BaseModel):
    age: int
    height: float # cm
    weight: float # kg

class HealthProfileCreate(HealthProfileBase):
    pass

class HealthProfileResponse(HealthProfileBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)

# authentication and user schema
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str                   
    role: str = "user" # role: "user" or "nutritionist"
    bio: Optional[str] = None       

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    health_profile: Optional[HealthProfileResponse] = None
    nutritionist_profile: Optional[NutritionistResponse] = None
    model_config = ConfigDict(from_attributes=True)