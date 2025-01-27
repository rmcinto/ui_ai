import os
import json
import shutil
import cv2
import numpy as np

# Paths
ANNOTATION_ROOT_DIR = os.path.join("data" , "annotations")
IMAGE_ROOT_DIR = os.path.join("data" , "frames")
OUTPUT_DIR = os.path.join("data" , "processed")
ANNOTATION_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "annotations")
IMAGE_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "frames")

# Create output directories
os.makedirs(ANNOTATION_OUTPUT_DIR, exist_ok=True)
os.makedirs(IMAGE_OUTPUT_DIR, exist_ok=True)

# Step 1: Scan for valid annotation files
def find_json_files(root_dir):
    """Recursively find all JSON files where 'isReady' and 'isValid' are true."""
    json_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for file in filenames:
            if file.endswith(".json"):
                file_path = os.path.join(dirpath, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data.get("isReady") and data.get("isValid"):
                        json_files.append(file_path)
    return json_files

# Step 2: Extract unique attributes & max frame size
def extract_unique_attributes(json_files):
    """Find all unique attributes and determine the largest frame size."""
    unique_attributes = set()
    max_width, max_height = 0, 0

    for file_path in json_files:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        frame_width = data["frame"]["width"]
        frame_height = data["frame"]["height"]
        max_width = max(max_width, frame_width)
        max_height = max(max_height, frame_height)

        for annotation in data["annotations"]:
            for attr in annotation.get("attributes", {}):
                unique_attributes.add(attr)

    return unique_attributes, max_width, max_height

# Step 3: Normalize attributes and remove unnecessary properties
def normalize_and_save_json(json_files, unique_attributes):
    """Copies and normalizes JSON files while removing unnecessary properties."""
    for file_path in json_files:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        data.pop("isReady")
        data.pop("isValid")
        for annotation in data["annotations"]:
            # Remove unwanted properties
            for prop in ["isSelected", "hidden", "color"]:
                annotation.pop(prop, None)

            # Normalize attributes
            attr_dict = annotation.setdefault("attributes", {})
            for attr in unique_attributes:
                attr_dict.setdefault(attr, None)

        # Convert frame path to use Windows-style separators
        if "frame" in data and "path" in data["frame"]:
            data["frame"]["path"] = os.path.normpath(data["frame"]["path"])

        # Save the normalized JSON file in processed_data/annotations/
        relative_path = os.path.relpath(file_path, ANNOTATION_ROOT_DIR)
        output_path = os.path.join(ANNOTATION_OUTPUT_DIR, relative_path)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)

# Step 4: Resize images while maintaining aspect ratio
def resize_image_with_padding(image_path, output_path, max_width, max_height):
    """Resize image while maintaining aspect ratio and adding transparent padding."""
    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)

    if img is None:
        print(f"Warning: Unable to read image {image_path}")
        return

    # Convert to RGBA if not already (for transparency support)
    if img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

    h, w = img.shape[:2]
    scale = min(max_width / w, max_height / h)
    new_w, new_h = int(w * scale), int(h * scale)
    
    # Resize while maintaining aspect ratio
    resized_img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # Create transparent background
    padded_img = np.zeros((max_height, max_width, 4), dtype=np.uint8)
    
    # Center the image
    x_offset = (max_width - new_w) // 2
    y_offset = (max_height - new_h) // 2
    padded_img[y_offset:y_offset + new_h, x_offset:x_offset + new_w] = resized_img

    cv2.imwrite(output_path, padded_img)

# Step 5: Apply Image Augmentations
def augment_image(image_path, output_dir):
    """Apply various augmentations to an image."""
    img = cv2.imread(image_path)

    if img is None:
        print(f"Warning: Unable to read image {image_path}")
        return

    base_name = os.path.basename(image_path).split('.')[0]
    relative_dir = os.path.dirname(os.path.relpath(image_path, IMAGE_OUTPUT_DIR))
    aug_output_dir = os.path.join(output_dir, relative_dir)

    os.makedirs(aug_output_dir, exist_ok=True)
    
    # Augmentations
    flipped = cv2.flip(img, 1)  # Horizontal flip
    blurred = cv2.GaussianBlur(img, (5, 5), 0)  # Gaussian blur
    grayscale = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
    bright = cv2.convertScaleAbs(img, alpha=1.2, beta=30)  # Brightness increase
    
    cv2.imwrite(os.path.join(aug_output_dir, f"{base_name}_flipped.png"), flipped)
    cv2.imwrite(os.path.join(aug_output_dir, f"{base_name}_blurred.png"), blurred)
    cv2.imwrite(os.path.join(aug_output_dir, f"{base_name}_grayscale.png"), grayscale)
    cv2.imwrite(os.path.join(aug_output_dir, f"{base_name}_bright.png"), bright)

# Step 6: Process all files
def preprocess_data():
    """Main function to preprocess annotations and images."""
    json_files = find_json_files(ANNOTATION_ROOT_DIR)
    
    if not json_files:
        print("No valid annotation files found.")
        return

    unique_attributes, max_width, max_height = extract_unique_attributes(json_files)
    
    print(f"✅ Found {len(unique_attributes)} unique attributes: {unique_attributes}")
    print(f"✅ Largest frame size determined: {max_width}x{max_height}")

    # Normalize attributes and save JSON files
    normalize_and_save_json(json_files, unique_attributes)

    for file_path in json_files:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        image_path = os.path.normpath(os.path.join(IMAGE_ROOT_DIR, data["frame"]["path"]))
        relative_image_path = os.path.relpath(image_path, IMAGE_ROOT_DIR)
        output_image_path = os.path.join(IMAGE_OUTPUT_DIR, relative_image_path)

        os.makedirs(os.path.dirname(output_image_path), exist_ok=True)

        resize_image_with_padding(image_path, output_image_path, max_width, max_height)
        augment_image(output_image_path, IMAGE_OUTPUT_DIR)

    print("✅ Preprocessing complete.")

if __name__ == "__main__":
    preprocess_data()