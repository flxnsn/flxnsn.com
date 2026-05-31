from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_ORIGIN
from sqlalchemy.orm import Session
from typing import List

from app.database import Base, engine, get_db
#from app.models import DesignProject, DesignTag, DesignImage, ITProject, ITTag, ITDesc, Photo
#from app.schemas import DesignTagSchema, DesignImageSchema, DesignProject, ITTagSchema, ITDescSchema, ITImageSchema, ITProject, Photo
#from app.seed import DESIGN_PROJECTS, IT_PROJECTS, PHOTOS
# import app.models, app.schemas, app.seed
from app import models, schemas, seed

app = FastAPI(title="Portfolio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed.clear_and_seed(db)
    finally:
        db.close()


# design

@app.get("/design", response_model=List[schemas.DesignProject])
def list_design_projects(db: Session = Depends(get_db)):
    return db.query(models.DesignProject).all()


@app.get("/design/{project_id}", response_model=schemas.DesignProject)
def get_design_project(project_id: str, db: Session = Depends(get_db)):
    obj = db.query(models.DesignProject).filter(models.DesignProject.id == project_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Design project not found")
    return obj


# IT

@app.get("/it", response_model=List[schemas.ITProject])
def list_it_projects(db: Session = Depends(get_db)):
    return db.query(models.ITProject).all()


@app.get("/it/{project_id}", response_model=schemas.ITProject)
def get_it_project(project_id: str, db: Session = Depends(get_db)):
    obj = db.query(models.ITProject).filter(models.ITProject.id == project_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="IT project not found")
    return obj


# photography

@app.get("/photos", response_model=List[schemas.Photo])
def list_photos(db: Session = Depends(get_db)):
    return db.query(models.Photo).all()


@app.get("/photos/{photo_id}", response_model=schemas.Photo)
def get_photo(photo_id: str, db: Session = Depends(get_db)):
    obj = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Photo not found")
    return obj
