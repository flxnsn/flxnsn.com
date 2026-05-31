"""
seed.py
-------
Called on every startup: wipes all tables and reloads the original data
that was previously hard-coded in the JS frontend.
"""
from sqlalchemy.orm import Session
from app import models

# example data

DESIGN_PROJECTS = [
    {
        "id": "d0",
        "title": "Project 1",
        "tags": ["Illustrator", "InDesign", "Print"],
        "desc": "Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.",
        "images": ["https://picsum.photos/seed/d3a/1200/800"],
    },
    {
        "id": "d1",
        "title": "Another Project",
        "tags": ["Figma", "Prototyping", "iOS"],
        "desc": "Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.",
        "images": ["https://picsum.photos/seed/d3a/1200/800"],
    },
    {
        "id": "d2",
        "title": "So much Design",
        "tags": ["InDesign", "Photoshop", "Typography"],
        "desc": "Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu.",
        "images": ["https://picsum.photos/seed/d3a/1200/800"],
    },
    {
        "id": "d3",
        "title": "So much more",
        "tags": ["Cinema 4D", "Illustrator", "Packaging"],
        "desc": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.",
        "images": ["https://picsum.photos/seed/d3a/1200/800"],
    },
]

IT_PROJECTS = [
    {
        "id": "i0",
        "title": "IT Project",
        "tags": ["React", "Node.js", "WebSockets", "PostgreSQL"],
        "desc": [
            "At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
        ],
        "image": {"src": "https://picsum.photos/seed/it1/600/450", "alt": "Dashboard project"},
    },
    {
        "id": "i1",
        "title": "Some Development Stuff",
        "tags": ["Go", "Docker", "Kubernetes", "Bash"],
        "desc": [
            "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
            "At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
        ],
        "image": None,
    },
    {
        "id": "i2",
        "title": "Tricky Code and so on",
        "tags": ["Rust", "WASM", "IndexedDB", "AES-256"],
        "desc": [
            "Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.",
        ],
        "image": {"src": "https://picsum.photos/seed/it3/600/450", "alt": "Notes App"},
    },
]

PHOTOS = [
    {"id": "p0",  "src": "https://picsum.photos/seed/ph1/800/600",  "title": "Golden Hour, Iceland",       "desc": "Shot on a mirrorless during the midnight sun. Long exposure, no filters."},
    {"id": "p1",  "src": "https://picsum.photos/seed/ph2/600/900",  "title": "Portrait Study #4",           "desc": "Available light, north-facing window. Kodak Portra 400 emulation."},
    {"id": "p2",  "src": "https://picsum.photos/seed/ph3/800/500",  "title": "Hamburg Harbour, Dawn",       "desc": "Pre-dawn fog rolling off the Elbe. 5am alarm well worth it."},
    {"id": "p3",  "src": "https://picsum.photos/seed/ph4/700/700",  "title": "Geometry & Shadow",           "desc": "Brutalist stairwell, abandoned department store, natural light only."},
    {"id": "p4",  "src": "https://picsum.photos/seed/ph5/900/600",  "title": "Open Water",                  "desc": "Baltic Sea in November. 1/2000s to freeze the wave crests."},
    {"id": "p5",  "src": "https://picsum.photos/seed/ph6/600/800",  "title": "Street — Tokyo, 2023",        "desc": "Shinjuku at 2am. Ricoh GR IIIx, zone focus, single burst."},
    {"id": "p6",  "src": "https://picsum.photos/seed/ph7/800/600",  "title": "Forest Interior",             "desc": "Old-growth beech forest, October. Mist reduces contrast beautifully."},
    {"id": "p7",  "src": "https://picsum.photos/seed/ph8/1000/600", "title": "Panorama — Lofoten",          "desc": "Stitched from 7 vertical frames. 100MP equivalent output."},
    {"id": "p8",  "src": "https://picsum.photos/seed/ph9/600/900",  "title": "Still Life — Ceramics",       "desc": "Product photography for a local pottery studio."},
    {"id": "p9",  "src": "https://picsum.photos/seed/ph10/800/600", "title": "Commute",                     "desc": "U-Bahn window reflection. 1/60s, f/2, accepted the motion blur."},
    {"id": "p10", "src": "https://picsum.photos/seed/ph11/700/500", "title": "The Red Boat",                "desc": "Alster lake, midday. Colour was the whole point."},
    {"id": "p11", "src": "https://picsum.photos/seed/ph12/800/800", "title": "Square Study — Architecture", "desc": "Symmetry hunting in the HafenCity district."},
]


# seed logic

def clear_and_seed(db: Session) -> None:
    _clear(db)
    _seed_design(db)
    _seed_it(db)
    _seed_photos(db)
    db.commit()
    print("✓ Database cleared and re-seeded.")


def _clear(db: Session) -> None:
    """Delete all rows in dependency-safe order."""
    for model in (
        models.DesignTag,
        models.DesignImage,
        models.DesignProject,
        models.ITTag,
        models.ITDesc,
        models.ITProject,
        models.Photo,
    ):
        db.query(model).delete()


def _seed_design(db: Session) -> None:
    for p in DESIGN_PROJECTS:
        db.add(models.DesignProject(id=p["id"], title=p["title"], desc=p["desc"]))
        for i, tag in enumerate(p["tags"]):
            db.add(models.DesignTag(id=f"{p['id']}_t{i}", project_id=p["id"], value=tag))
        for i, url in enumerate(p["images"]):
            db.add(models.DesignImage(id=f"{p['id']}_img{i}", project_id=p["id"], url=url))


def _seed_it(db: Session) -> None:
    for p in IT_PROJECTS:
        img = p["image"] or {}
        db.add(models.ITProject(
            id=p["id"],
            title=p["title"],
            image_src=img.get("src"),
            image_alt=img.get("alt"),
        ))
        for i, tag in enumerate(p["tags"]):
            db.add(models.ITTag(id=f"{p['id']}_t{i}", project_id=p["id"], value=tag))
        for i, text in enumerate(p["desc"]):
            db.add(models.ITDesc(id=f"{p['id']}_d{i}", project_id=p["id"], position=str(i), text=text))


def _seed_photos(db: Session) -> None:
    for p in PHOTOS:
        db.add(models.Photo(id=p["id"], src=p["src"], title=p["title"], desc=p["desc"]))
