from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/users", tags=["Health Profile"])

# view health profile
@router.get("/{user_id}/profile", response_model=schemas.HealthProfileResponse)
def get_health_profile(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.HealthProfile).filter(
        models.HealthProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Health profile not found")
    return profile

# input/update profile info
@router.post("/{user_id}/profile", response_model=schemas.HealthProfileResponse, status_code=status.HTTP_201_CREATED)
def create_health_profile(user_id: int, profile_data: schemas.HealthProfileCreate, db: Session = Depends(get_db)):
    # Check user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Check profile doesn't already exist
    if db.query(models.HealthProfile).filter(models.HealthProfile.user_id == user_id).first():
        raise HTTPException(status_code=400, detail="Profile already exists. Use PUT to update.")

    profile = models.HealthProfile(user_id=user_id, **profile_data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.put("/{user_id}/profile", response_model=schemas.HealthProfileResponse)
def update_health_profile(user_id: int, profile_data: schemas.HealthProfileCreate, db: Session = Depends(get_db)):
    profile = db.query(models.HealthProfile).filter(
        models.HealthProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Health profile not found. Use POST to create.")

    for key, value in profile_data.model_dump().items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile

# calculate BMI
@router.get("/{user_id}/bmi")
def calculate_bmi(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.HealthProfile).filter(
        models.HealthProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Health profile not found")

    height_m = profile.height / 100  # height in cm
    bmi = round(profile.weight / (height_m ** 2), 2)

    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal weight"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"

    return {"bmi": bmi, "category": category, "weight_kg": profile.weight, "height_cm": profile.height}

# nutrition goal
@router.post("/{user_id}/goals", response_model=schemas.NutritionGoalResponse, status_code=status.HTTP_201_CREATED)
def set_goal(user_id: int, goal_data: schemas.NutritionGoalCreate, db: Session = Depends(get_db)):
    profile = db.query(models.HealthProfile).filter(
        models.HealthProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Create a health profile first")

    goal = models.NutritionGoal(health_profile_id=profile.id, **goal_data.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.get("/{user_id}/goals", response_model=list[schemas.NutritionGoalResponse])
def get_goals(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.HealthProfile).filter(
        models.HealthProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Health profile not found")
    return profile.goals

@router.put("/goals/{goal_id}", response_model=schemas.NutritionGoalResponse)
def update_goal(goal_id: int, goal_data: schemas.NutritionGoalCreate, db: Session = Depends(get_db)):
    goal = db.query(models.NutritionGoal).filter(models.NutritionGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    for key, value in goal_data.model_dump().items():
        setattr(goal, key, value)

    db.commit()
    db.refresh(goal)
    return goal

# delete goal
@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(models.NutritionGoal).filter(models.NutritionGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()