from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import FRONTEND_ORIGIN
from app.core.db import Base, engine, SessionLocal
# from app.routers import
# from app.services.seed_service import
# from app.models import


app = FastAPI(title="Portfolio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(lessons.router)
app.include_router(quiz.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # seed_x(db)
        # seed_y(db)
        pass
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "Portfolio API is running."}
