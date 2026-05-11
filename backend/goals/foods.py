from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/foods", tags=["Food Items"])

# browse all food
@router.get("/", response_model=list[schemas.FoodItemResponse])
def get_all_foods(db: Session = Depends(get_db)):
    return db.query(models.FoodItem).all()

# search food
@router.get("/search", response_model=list[schemas.FoodItemResponse])
def search_foods(name: str, db: Session = Depends(get_db)):
    return db.query(models.FoodItem).filter(
        models.FoodItem.name.ilike(f"%{name}%")
    ).all()

# add food
@router.get("/{food_id}", response_model=schemas.FoodItemResponse)
def get_food(food_id: int, db: Session = Depends(get_db)):
    food = db.query(models.FoodItem).filter(models.FoodItem.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
    return food

# add food (nutritionist)
@router.post("/", response_model=schemas.FoodItemResponse, status_code=status.HTTP_201_CREATED)
def add_food_item(food_data: schemas.FoodItemCreate, db: Session = Depends(get_db)):
    # AUTH NOT YET
    existing = db.query(models.FoodItem).filter(
        models.FoodItem.name.ilike(food_data.name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Food item with this name already exists")

    food = models.FoodItem(**food_data.model_dump())
    db.add(food)
    db.commit()
    db.refresh(food)
    return food

# update food (nutritionist)
@router.put("/{food_id}", response_model=schemas.FoodItemResponse)
def update_food_info(food_id: int, food_data: schemas.FoodItemCreate, db: Session = Depends(get_db)):
    # note: In production, add role-based auth check here to restrict to nutritionists.
    food = db.query(models.FoodItem).filter(models.FoodItem.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    for key, value in food_data.model_dump().items():
        setattr(food, key, value)

    db.commit()
    db.refresh(food)
    return food

# delete food (nutritionist)
@router.delete("/{food_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food_item(food_id: int, db: Session = Depends(get_db)):
    food = db.query(models.FoodItem).filter(models.FoodItem.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
    db.delete(food)
    db.commit()