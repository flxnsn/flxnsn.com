import os, uuid, shutil
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List

from app.database import Base, engine, get_db
#from app.models import DesignProject, DesignTag, DesignImage, ITProject, ITTag, ITDesc, Photo
#from app.schemas import DesignTagSchema, DesignImageSchema, DesignProject, ITTagSchema, ITDescSchema, ITImageSchema, ITProject, Photo
#from app.seed import DESIGN_PROJECTS, IT_PROJECTS, PHOTOS
# import app.models, app.schemas, app.seed
from app import models, schemas, seed

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Portfolio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed.clear_and_seed(db)
    finally:
        db.close()


# image upload for later or never idk

@app.post("/upload-image", response_model=schemas.UploadedImage)
async def upload_image(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"}:
        raise HTTPException(status_code=400, detail="Unsupported image type")
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"url": f"/uploads/{filename}"}


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

@app.post("/design", response_model=schemas.DesignProject)
def create_design_project(payload: schemas.DesignProjectWrite, db: Session = Depends(get_db)):
    pid = payload.id or f"d{uuid.uuid4().hex[:6]}"
    proj = models.DesignProject(id=pid, title=payload.title, desc=payload.desc)
    db.add(proj)
    for i, v in enumerate(payload.tags):
        db.add(models.DesignTag(id=f"{pid}_t{i}", project_id=pid, value=v))
    for i, url in enumerate(payload.images):
        db.add(models.DesignImage(id=f"{pid}_img{i}", project_id=pid, url=url))
    db.commit(); db.refresh(proj)
    return proj

@app.put("/design/{project_id}", response_model=schemas.DesignProject)
def update_design_project(project_id: str, payload: schemas.DesignProjectWrite, db: Session = Depends(get_db)):
    proj = db.query(models.DesignProject).filter(models.DesignProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Design project not found")
    proj.title = payload.title
    proj.desc  = payload.desc
    db.query(models.DesignTag).filter_by(project_id=project_id).delete()
    db.query(models.DesignImage).filter_by(project_id=project_id).delete()
    for i, v in enumerate(payload.tags):
        db.add(models.DesignTag(id=f"{project_id}_t{i}", project_id=project_id, value=v))
    for i, url in enumerate(payload.images):
        db.add(models.DesignImage(id=f"{project_id}_img{i}", project_id=project_id, url=url))
    db.commit(); db.refresh(proj)
    return proj

@app.delete("/design/{project_id}", status_code=204)
def delete_design_project(project_id: str, db: Session = Depends(get_db)):
    proj = db.query(models.DesignProject).filter(models.DesignProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Design project not found")
    db.delete(proj); db.commit()


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

@app.post("/it", response_model=schemas.ITProject)
def create_it_project(payload: schemas.ITProjectWrite, db: Session = Depends(get_db)):
    pid = payload.id or f"i{uuid.uuid4().hex[:6]}"
    proj = models.ITProject(id=pid, title=payload.title,
                            image_src=payload.image_src, image_alt=payload.image_alt)
    db.add(proj)
    for i, v in enumerate(payload.tags):
        db.add(models.ITTag(id=f"{pid}_t{i}", project_id=pid, value=v))
    for i, text in enumerate(payload.desc):
        db.add(models.ITDesc(id=f"{pid}_d{i}", project_id=pid, position=str(i), text=text))
    db.commit(); db.refresh(proj)
    return proj

@app.put("/it/{project_id}", response_model=schemas.ITProject)
def update_it_project(project_id: str, payload: schemas.ITProjectWrite, db: Session = Depends(get_db)):
    proj = db.query(models.ITProject).filter(models.ITProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="IT project not found")
    proj.title = payload.title
    proj.image_src = payload.image_src
    proj.image_alt = payload.image_alt
    db.query(models.ITTag).filter_by(project_id=project_id).delete()
    db.query(models.ITDesc).filter_by(project_id=project_id).delete()
    for i, v in enumerate(payload.tags):
        db.add(models.ITTag(id=f"{project_id}_t{i}", project_id=project_id, value=v))
    for i, text in enumerate(payload.desc):
        db.add(models.ITDesc(id=f"{project_id}_d{i}", project_id=project_id, position=str(i), text=text))
    db.commit(); db.refresh(proj)
    return proj

@app.delete("/it/{project_id}", status_code=204)
def delete_it_project(project_id: str, db: Session = Depends(get_db)):
    proj = db.query(models.ITProject).filter(models.ITProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="IT project not found")
    db.delete(proj); db.commit()


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

@app.post("/photos", response_model=schemas.Photo)
def create_photo(payload: schemas.PhotoWrite, db: Session = Depends(get_db)):
    pid = payload.id or f"p{uuid.uuid4().hex[:6]}"
    photo = models.Photo(id=pid, src=payload.src, title=payload.title, desc=payload.desc)
    db.add(photo); db.commit(); db.refresh(photo)
    return photo

@app.put("/photos/{photo_id}", response_model=schemas.Photo)
def update_photo(photo_id: str, payload: schemas.PhotoWrite, db: Session = Depends(get_db)):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    photo.src   = payload.src
    photo.title = payload.title
    photo.desc  = payload.desc
    db.commit(); db.refresh(photo)
    return photo

@app.delete("/photos/{photo_id}", status_code=204)
def delete_photo(photo_id: str, db: Session = Depends(get_db)):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    db.delete(photo); db.commit()