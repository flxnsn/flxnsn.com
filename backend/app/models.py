from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


# design

class DesignProject(Base):
    __tablename__ = "design_projects"

    id    = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    desc  = Column(Text,   nullable=False)

    tags   = relationship("DesignTag",   back_populates="project", cascade="all, delete-orphan")
    images = relationship("DesignImage", back_populates="project", cascade="all, delete-orphan")


class DesignTag(Base):
    __tablename__ = "design_tags"

    id         = Column(String, primary_key=True)   # e.g. "d0_0"
    project_id = Column(String, ForeignKey("design_projects.id"), nullable=False)
    value      = Column(String, nullable=False)

    project = relationship("DesignProject", back_populates="tags")


class DesignImage(Base):
    __tablename__ = "design_images"

    id         = Column(String, primary_key=True)   # e.g. "d0_img0"
    project_id = Column(String, ForeignKey("design_projects.id"), nullable=False)
    url        = Column(String, nullable=False)

    project = relationship("DesignProject", back_populates="images")


# IT

class ITProject(Base):
    __tablename__ = "it_projects"

    id    = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)

    # image columns (nullable — some projects have no image)
    image_src = Column(String, nullable=True)
    image_alt = Column(String, nullable=True)

    tags  = relationship("ITTag",  back_populates="project", cascade="all, delete-orphan")
    descs = relationship("ITDesc", back_populates="project", cascade="all, delete-orphan")


class ITTag(Base):
    __tablename__ = "it_tags"

    id         = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("it_projects.id"), nullable=False)
    value      = Column(String, nullable=False)

    project = relationship("ITProject", back_populates="tags")


class ITDesc(Base):
    """Each paragraph of an IT project description is its own row."""
    __tablename__ = "it_descs"

    id         = Column(String, primary_key=True)   # e.g. "i1_desc0"
    project_id = Column(String, ForeignKey("it_projects.id"), nullable=False)
    position   = Column(String, nullable=False)      # "0", "1", … for ordering
    text       = Column(Text,   nullable=False)

    project = relationship("ITProject", back_populates="descs")


# photography

class Photo(Base):
    __tablename__ = "photos"

    id    = Column(String, primary_key=True, index=True)
    src   = Column(String, nullable=False)
    title = Column(String, nullable=False)
    desc  = Column(Text,   nullable=False)
