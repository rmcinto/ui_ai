# frames_service.py
# Contains the core logic for listing frames and converting them to the datasets folder.

import os
import shutil
import json
from fastapi.responses import FileResponse
import re
import cv2
from ..config import FRAMES_PATH, ANNOTATIONS_PATH

def list_frames_items(path: str):
    '''
    List only the immediate folders and files in the given path (non-recursive).
    Returns a simple list of relative paths for demonstration.
    '''
    valid_image_extensions = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff"}

    if not os.path.isdir(path):
        raise FileNotFoundError(f"Frames path '{path}' does not exist.")

    items = []
    for entry in os.listdir(path):
        entry_path = os.path.join(path, entry)
        rel_path = os.path.relpath(entry_path, start=path)
        if (os.path.isfile(entry_path)):
            _, ext = os.path.splitext(rel_path)
            if (ext.lower() in valid_image_extensions and rel_path.find("_diff") == -1):
                if not os.path.exists(entry_path.replace(FRAMES_PATH, ANNOTATIONS_PATH).replace(ext, ".json")):
                    items.append(rel_path)
        else:
            items.append(rel_path)
    return items

def get_file_contents(file_path: str) -> str:
    '''
    Reads and returns the contents of a file at the given path.
    Supports plain text files. Raises exceptions for invalid paths or unsupported file types.
    '''
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File '{file_path}' does not exist or is not a file.")
    try:
        _, ext = os.path.splitext(file_path)
        return FileResponse(
            path=file_path,
            media_type=f"image/{ext[1:]}",  
            filename=os.path.basename(file_path)        
        )
    except UnicodeDecodeError:
        raise ValueError(f"File '{file_path}' cannot be decoded as text.")
    except Exception as e:
        raise IOError(f"Error reading file '{file_path}': {str(e)}")

def convert_frame_to_dataset(relative_path: str, frames_root: str, datasets_root: str):
    '''
    Copy an image from the frames folder (plus optional JSON) to the datasets folder,
    preserving folder structure. If no annotation JSON exists, create an empty one.
    '''
    # Source image path
    src_image_path = os.path.join(frames_root, relative_path)
    if not os.path.isfile(src_image_path):
        raise FileNotFoundError(f"Source image '{src_image_path}' not found.")
    
    # Destination image path
    dest_image_path = os.path.join(datasets_root, relative_path)
    dest_dir = os.path.dirname(dest_image_path)
    os.makedirs(dest_dir, exist_ok=True)

    # Check for existing JSON annotation in frames
    base_name, ext = os.path.splitext(relative_path)
    file_name = os.path.basename(relative_path)
    name,_ = os.path.splitext(file_name)
    print(name)
    src_json_path = os.path.join(frames_root, f"{base_name}.json")
    dest_json_path = os.path.join(datasets_root, f"{base_name}.json")

    if os.path.isfile(src_json_path):
        with open(src_json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = {}
    
    keywords = os.path.dirname(relative_path).split("/")
    keywords.append(name)
    keywords = [kw for kw in keywords if not kw.isdigit()]

    metadata = {}
    metadata["frame"] = data
    metadata["frame"]["path"] = relative_path
    metadata["name"] = name 
    metadata["keywords"] = keywords
    metadata["annotations"] = []

    with open(dest_json_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # rescale_image(src_image_path, dest_image_path)

def rescale_image(src_image_path, dest_image_path, scale_factor=0.25):
    """
    Loads an image from src_image_path, rescales it by scale_factor,
    and saves the result to dest_image_path.

    - If scale_factor < 1.0, the image is shrunk (downscaled).
      'INTER_AREA' is typically recommended for shrinking.
    - If scale_factor > 1.0, the image is enlarged (upscaled).
      'INTER_CUBIC' or 'INTER_LINEAR' is typically recommended for enlarging.
    """
    # Read the source image in color
    src_image = cv2.imread(src_image_path, cv2.IMREAD_COLOR)
    if src_image is None:
        raise FileNotFoundError(f"Could not load image: {src_image_path}")

    # Determine interpolation method based on scale_factor
    if scale_factor < 1.0:
        interpolation = cv2.INTER_AREA
    else:
        interpolation = cv2.INTER_CUBIC  # or cv2.INTER_LINEAR

    # Calculate the target dimensions
    height, width = src_image.shape[:2]
    new_width = int(width * scale_factor)
    new_height = int(height * scale_factor)

    # Resize the image
    resized_image = cv2.resize(src_image, (new_width, new_height), interpolation=interpolation)

    # Write the resulting image to the destination path
    cv2.imwrite(dest_image_path, resized_image)