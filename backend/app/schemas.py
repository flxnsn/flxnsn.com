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


class ITImageSchema(BaseModel):
    src: str
    alt: str


class ITProject(BaseModel):
    id: str
    title: str
    image_src: Optional[str]
    image_alt: Optional[str]
    tags: List[ITTagSchema]
    descs: List[ITDescSchema]

    model_config = {"from_attributes": True}


# photography

class Photo(BaseModel):
    id: str
    src: str
    title: str
    desc: str

    model_config = {"from_attributes": True}
