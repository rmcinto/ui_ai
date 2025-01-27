import os
import json
import pytesseract
import cv2
import numpy as np
from PIL import Image

# Directories
ANNOTATIONS_DIR = "data/processed/annotations"
FRAMES_DIR = "data/processed/frames"
OCR_OUTPUT_DIR = "data/processed/ocr"

os.makedirs(OCR_OUTPUT_DIR, exist_ok=True)

def ensure_dir_exists(path):
    """Ensure that the directory exists."""
    if not os.path.exists(path):
        os.makedirs(path)

def extract_dominant_color(image):
    """Extract the dominant text color from the cropped region."""
    pixels = np.float32(image.reshape(-1, 3))
    n_colors = 2
    _, labels, palette = cv2.kmeans(
        pixels, n_colors, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 0.2), 10, cv2.KMEANS_RANDOM_CENTERS
    )
    dominant_color = palette[np.argmax(np.bincount(labels.flatten()))]
    return f"#{int(dominant_color[0]):02x}{int(dominant_color[1]):02x}{int(dominant_color[2]):02x}"

def find_innermost_bounding_box(text_bbox, existing_annotations):
    """
    Identify the innermost bounding box that encloses the detected text.
    It finds the smallest enclosing component from existing annotations.
    """
    innermost = None
    for ann in existing_annotations:
        bbox = ann["bounding_box"]
        if (bbox["x"] <= text_bbox["x"] and bbox["y"] <= text_bbox["y"] and
            bbox["x"] + bbox["width"] >= text_bbox["x"] + text_bbox["width"] and
            bbox["y"] + bbox["height"] >= text_bbox["y"] + text_bbox["height"]):

            if innermost is None or (bbox["width"] * bbox["height"] < innermost["bounding_box"]["width"] * innermost["bounding_box"]["height"]):
                innermost = ann

    return innermost["id"] if innermost else None

def detect_text_and_update_annotations():
    """Detect text in frames, extract properties, and update annotation files."""
    for root, _, files in os.walk(ANNOTATIONS_DIR):
        for file in files:
            if file.endswith(".json"):
                annotation_path = os.path.join(root, file)
                with open(annotation_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                frame_path = os.path.join(FRAMES_DIR, data["frame"]["path"])
                ocr_output_path = os.path.join(OCR_OUTPUT_DIR, os.path.relpath(root, ANNOTATIONS_DIR))
                ensure_dir_exists(ocr_output_path)

                img = cv2.imread(frame_path)
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

                # Detect text regions using OpenCV and Tesseract
                d = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)

                new_annotations = []
                for i in range(len(d['text'])):
                    text = d['text'][i].strip()
                    if text:  # Ignore empty detections
                        x, y, w, h = d['left'][i], d['top'][i], d['width'][
