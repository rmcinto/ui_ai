# frames.py
# FastAPI router to handle listing frame folders, images, and converting them for annotation.

from fastapi import APIRouter, HTTPException, Query, Response
from typing import List, Optional, Union
import os
import shutil
import json

from ..config import FRAMES_PATH, ANNOTATIONS_PATH
from ..services.frames_service import get_file_contents, list_frames_items, convert_frame_to_dataset

router = APIRouter()

@router.get("/list", response_model=Union[List[str], str])
def list_frames(path: Optional[str] = Query(None, description="Optional subpath within the frames directory")):
    '''
    Returns the contents of a file if the path points to a file.
    Otherwise, lists the folders and images in the specified directory.
    '''
    try:
        # Construct the full path based on the query parameter
        target_path = FRAMES_PATH + '/' + path if path else FRAMES_PATH

        # Check if the path exists
        if not os.path.exists(target_path):
            raise FileNotFoundError(f"Path '{target_path}' does not exist.")

        # If the path is a file, return its contents
        if os.path.isfile(target_path):
            return ""

        # If the path is a directory, list its contents
        items = list_frames_items(target_path)
        return items

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IOError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/file", response_model=Union[List[str], str])
def list_frames(path: Optional[str] = Query(None, description="Optional subpath within the frames directory"),
    response: Response = None):
    '''
    Returns the contents of a file if the path points to a file.
    Otherwise, lists the folders and images in the specified directory.
    '''

    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    try:
        # Construct the full path based on the query parameter
        target_path = FRAMES_PATH + '/' + path if path else FRAMES_PATH

        # Check if the path exists
        if not os.path.exists(target_path):
            raise FileNotFoundError(f"Path '{target_path}' does not exist.")

        # If the path is a file, return its contents
        if os.path.isfile(target_path):
            return get_file_contents(target_path)
        return ""
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IOError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/convert")
def convert_frame(path: str):
    '''
    Given a path to an image in the frames folder, copy it (and optional JSON)
    into the datasets folder with the same folder structure.
    If the JSON doesn't exist, create an empty one.
    '''
    try:
        convert_frame_to_dataset(path, FRAMES_PATH, ANNOTATIONS_PATH)
        return {"message": f"Converted '{path}' to dataset successfully."}
    except FileNotFoundError as e:
        print(e)
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
