from pydantic import BaseModel
from typing import List, Optional


# design

class DesignTagSchema(BaseModel):
    id: str
    value: str
    model_config = {"from_attributes": True}

class DesignImageSchema(BaseModel):
    id: str
    url: str
    model_config = {"from_attributes": True}

class DesignProject(BaseModel):
    id: str
    title: str
    desc: str
    tags: List[DesignTagSchema]
    images: List[DesignImageSchema]
    model_config = {"from_attributes": True}

class DesignProjectWrite(BaseModel):
    id: Optional[str] = None
    title: str
    desc: str
    tags: List[str] = []
    images: List[str] = []


# IT

class ITTagSchema(BaseModel):
    id: str
    value: str
    model_config = {"from_attributes": True}

class ITDescSchema(BaseModel):
    id: str
    position: str
    text: str
    model_config = {"from_attributes": True}

class ITProject(BaseModel):
    id: str
    title: str
    image_src: Optional[str]
    image_alt: Optional[str]
    tags: List[ITTagSchema]
    descs: List[ITDescSchema]
    model_config = {"from_attributes": True}

class ITProjectWrite(BaseModel):
    id: Optional[str] = None
    title: str
    image_src: Optional[str] = None
    image_alt: Optional[str] = None
    tags: List[str] = []
    desc: List[str] = []


# photography

class Photo(BaseModel):
    id: str
    src: str
    title: str
    desc: str
    model_config = {"from_attributes": True}

class PhotoWrite(BaseModel):
    id: Optional[str] = None
    src: str
    title: str
    desc: str


# upload

class UploadedImage(BaseModel):
    url: str
