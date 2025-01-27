# datasets_service.py
# Contains the core logic for listing dataset folders/images, and loading/saving annotations.

import os
import json
from fastapi.responses import FileResponse

def list_datasets_items(path: str):
    '''
    Recursively list the folders and images in root_path.
    Returns a list of relative paths (folders and files).
    '''

    if not os.path.isdir(path):
        raise FileNotFoundError(f"Datasets path '{path}' does not exist.")

    items = []
    for entry in os.listdir(path):
        entry_path = os.path.join(path, entry)
        rel_path = os.path.relpath(entry_path, start=path)
        if (os.path.isfile(entry_path)):
            _, ext = os.path.splitext(rel_path)
            if (ext.lower() == ".json"):
                items.append(rel_path)
        else:
            items.append(rel_path)
    return items

def get_file_contents(file_path: str) -> str:
    '''
    Reads and returns the contents of a file at the given path.
    Supports plain text files. Raises exceptions for invalid paths or unsupported file types.
    '''
    print(file_path)
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File '{file_path}' does not exist or is not a file.")
    try:
        _, ext = os.path.splitext(file_path)
        response = FileResponse(
            path=file_path,
            media_type= "application/json" if ext==".json" else f"image/{ext[1:]}",  
            filename=os.path.basename(file_path)        
        )
        if "etag" in response.headers:
            del response.headers["etag"]

        # Add no-cache headers
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

        return response
    except UnicodeDecodeError:
        raise ValueError(f"File '{file_path}' cannot be decoded as text.")
    except Exception as e:
        raise IOError(f"Error reading file '{file_path}': {str(e)}")

def load_annotation(relative_path: str, datasets_root: str):
    '''
    Load the JSON annotation file corresponding to the given relative image path.
    If the annotation file doesn't exist, raise an error, or create an empty annotation structure.
    '''
    base_name, ext = os.path.splitext(relative_path)
    annotation_rel = f"{base_name}.json"
    annotation_path = os.path.join(datasets_root, annotation_rel)

    if not os.path.isfile(annotation_path):
        # Optionally, create an empty annotation file on the fly or raise
        raise FileNotFoundError(f"No annotation JSON found at '{annotation_path}'.")

    with open(annotation_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return data

def save_annotation(relative_path: str, datasets_root: str, annotations):
    '''
    Save (overwrite) the annotation JSON for the given image path.
    '''
    base_name, ext = os.path.splitext(relative_path)
    annotation_rel = f"{base_name}.json"
    annotation_path = os.path.join(datasets_root, annotation_rel)

    # Ensure the destination directory exists
    os.makedirs(os.path.dirname(annotation_path), exist_ok=True)

    with open(annotation_path, "w", encoding="utf-8") as f:
        json.dump(annotations, f, indent=2)
