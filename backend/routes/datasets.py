# datasets.py
# FastAPI router to handle listing dataset folders, images, and handling annotation updates.

from fastapi import APIRouter, HTTPException, Query, Response
from typing import Any, Dict, List, Optional, Union
import os

from ..config import ANNOTATIONS_PATH, FRAMES_PATH
from ..services.datasets_service import (
    get_file_contents,
    list_datasets_items,
    load_annotation,
    save_annotation,
)

router = APIRouter()

def set_no_cache_headers(response: Response):
    """Utility function to set no-cache headers and remove ETag."""
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    # Remove ETag if present
    if "etag" in response.headers:
        del response.headers["etag"]


@router.get("/list", response_model=List[str])
def list_datasets(
    path: Optional[str] = Query(None, description="Optional subpath within the frames directory"),
    response: Response = None
):
    """
    Returns a nested list of folders and images in the datasets folder.
    """
    # Ensure we set no-cache before returning
    set_no_cache_headers(response)

    target_path = ANNOTATIONS_PATH + '/' + path if path else ANNOTATIONS_PATH

    # Check if the path exists
    if not os.path.exists(target_path):
        raise FileNotFoundError(f"Path '{target_path}' does not exist.")

    try:
        items = list_datasets_items(target_path)
        return items
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/file", response_model=Union[List[str], str])
def list_frames(
    path: Optional[str] = Query(None, description="Optional subpath"),
    response: Response = None
):
    """
    Returns the contents of a file if the path points to a file.
    Otherwise, returns an empty string.
    """
    set_no_cache_headers(response)

    try:
        # Construct the full path, deciding between ANNOTATIONS_PATH and FRAMES_PATH
        if path:
            if path.endswith(".json"):
                target_path = os.path.join(ANNOTATIONS_PATH, path)
            else:
                target_path = os.path.join(FRAMES_PATH, path)
        else:
            # If `path` is None, default to ANNOTATIONS_PATH if it ends with .json, else FRAMES_PATH
            # but here path is None, so this logic might not be relevant unless you want a fallback
            target_path = ANNOTATIONS_PATH  # or FRAMES_PATH, depending on your design

        # Check if the path exists
        if not os.path.exists(target_path):
            raise FileNotFoundError(f"Path '{target_path}' does not exist.")

        # If it's a file, return its contents
        if os.path.isfile(target_path):
            return get_file_contents(target_path)

        # Otherwise, return an empty string
        return ""
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IOError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/annotations")
def update_annotations(
    path: str,
    annotations: Dict[str, Any],
    response: Response = None
):
    """
    Save/Update annotations for a given image in the datasets folder.
    Overwrites the existing annotation file with the new annotations.
    """
    set_no_cache_headers(response)

    try:
        save_annotation(path, ANNOTATIONS_PATH, annotations)
        return {"message": "Annotations saved successfully."}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
