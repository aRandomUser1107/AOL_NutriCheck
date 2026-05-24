from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import Date, cast
from database import get_db
from datetime import date, datetime
import models, schemas

router = APIRouter(prefix="/api/logs", tags=["Nutrition Log"])

# get/create today's log
def get_or_create_todays_log(user_id: int, db: Session) -> models.NutritionLog:
    today = date.today()
    log = db.query(models.NutritionLog).filter(
        models.NutritionLog.user_id == user_id,
        cast(models.NutritionLog.logDate, Date) == today
    ).first()

    if not log:
        log = models.NutritionLog(user_id=user_id)
        db.add(log)
        db.commit()
        db.refresh(log)
    return log

# function to validate user
def get_user_or_404(user_id: int, db: Session) -> models.User:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"User {user_id} not found. Please register first."
        )
    return user

# delete food entry
@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(models.FoodEntry).filter(models.FoodEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    # Subtract from log total
    log = entry.log
    log.totalNutrition -= entry.food_item.calories * entry.quantity
    log.totalNutrition = max(0, round(log.totalNutrition, 2))

    db.delete(entry)
    db.commit()

@router.get("/{user_id}/today", response_model=schemas.NutritionLogResponse)
def get_todays_log(user_id: int, db: Session = Depends(get_db)):
    """Returns (or creates) today's nutrition log for the user."""
    get_user_or_404(user_id, db)
    return get_or_create_todays_log(user_id, db)

# nutrition summary
@router.get("/{user_id}/summary")
def get_nutrition_summary(user_id: int, db: Session = Depends(get_db)):
    """Calculate total macronutrients consumed today."""
    get_user_or_404(user_id, db)
    log = get_or_create_todays_log(user_id, db)

    totals = {"calories": 0.0, "protein": 0.0, "carbohydrates": 0.0, "fats": 0.0, "entries_count": 0}

    for entry in log.entries:
        food = entry.food_item
        qty = entry.quantity
        totals["calories"]      += food.calories      * qty
        totals["protein"]       += food.protein       * qty
        totals["carbohydrates"] += food.carbohydrates * qty
        totals["fats"]          += food.fats          * qty
        totals["entries_count"] += 1

    # round the values
    for key in ["calories", "protein", "carbohydrates", "fats"]:
        totals[key] = round(totals[key], 2)
    
    # fetch user's goals for comparison
    profile = db.query(models.HealthProfile).filter(
        models.HealthProfile.user_id == user_id
    ).first()

    goals = {}
    if profile:
        for goal in profile.goals:
            goals[goal.goalType] = {
                "target": goal.targetValue,
                "unit": goal.unit,
                "actual": totals.get(goal.goalType, 0),
                "remaining": round(goal.targetValue - totals.get(goal.goalType, 0), 2)
            }
    
    return {"log_date": log.logDate, "summary": totals, "goals": goals}

# browse food
@router.get("/{user_id}/entries", response_model=list[schemas.FoodEntryResponse])
def browse_food_entries(user_id: int, db: Session = Depends(get_db)):
    """Browse all food entries in today's log."""
    get_user_or_404(user_id, db)
    log = get_or_create_todays_log(user_id, db)
    return log.entries

# add food entry
@router.post("/{user_id}/entries", response_model=schemas.FoodEntryResponse, status_code=status.HTTP_201_CREATED)
def add_food_entry(user_id: int, entry_data: schemas.FoodEntryCreate, db: Session = Depends(get_db)):
    """Add a food entry to today's log. Creates the log automatically if it doesn't exist."""
    get_user_or_404(user_id, db)
    
    # validate food item exists
    food = db.query(models.FoodItem).filter(models.FoodItem.id == entry_data.food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")

    log = get_or_create_todays_log(user_id, db)

    entry = models.FoodEntry(
        log_id=log.id,
        food_id=entry_data.food_id,
        category=entry_data.category,
        quantity=entry_data.quantity,
    )
    db.add(entry)

    # update log total calories
    log.totalNutrition += food.calories * entry_data.quantity
    log.updatedAt = datetime.utcnow()

    db.commit()
    db.refresh(entry)
    return entry

# view log
@router.get("/{user_id}", response_model=list[schemas.NutritionLogResponse])
def get_all_logs(user_id: int, db: Session = Depends(get_db)):
    """Returns all nutrition logs for a user (full history)."""
    return db.query(models.NutritionLog).filter(
        models.NutritionLog.user_id == user_id
    ).order_by(models.NutritionLog.logDate.desc()).all()
