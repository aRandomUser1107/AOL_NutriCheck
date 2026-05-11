from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/articles", tags=["Articles"])

# view articles (all users)
@router.get("/", response_model=list[schemas.ArticleResponse])
def get_all_articles(db: Session = Depends(get_db)):
    return db.query(models.Article).order_by(models.Article.postDate.desc()).all()

@router.get("/{article_id}", response_model=schemas.ArticleResponse)
def get_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")
    return article

# write and post article (nutritionist)
@router.post("/", response_model=schemas.ArticleResponse, status_code=status.HTTP_201_CREATED)
def write_article(article_data: schemas.ArticleCreate, nutritionist_id: int, db: Session = Depends(get_db)):
    
    # auth not yet
    nutritionist = db.query(models.Nutritionist).filter(
        models.Nutritionist.id == nutritionist_id
    ).first()
    if not nutritionist:
        raise HTTPException(status_code=404, detail="Nutritionist not found.")

    article = models.Article(writer_id=nutritionist_id, **article_data.model_dump())
    db.add(article)
    db.commit()
    db.refresh(article)
    return article

# edit article (nutritionist)
@router.put("/{article_id}", response_model=schemas.ArticleResponse)
def edit_article(article_id: int, article_data: schemas.ArticleCreate, nutritionist_id: int, db: Session = Depends(get_db)):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")
    if article.writer_id != nutritionist_id:
        raise HTTPException(status_code=403, detail="You can only edit your own articles.")

    article.title = article_data.title
    article.content = article_data.content
    db.commit()
    db.refresh(article)
    return article

# delete article (nutritionist)
@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(article_id: int, nutritionist_id: int, db: Session = Depends(get_db)):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")
    if article.writer_id != nutritionist_id:
        raise HTTPException(status_code=403, detail="You can only delete your own articles.")

    db.delete(article)
    db.commit()