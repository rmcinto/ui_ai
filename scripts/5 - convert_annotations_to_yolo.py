import os
import json

ANNOTATIONS_DIR = "data/processed/annotations"
FRAMES_DIR = "data/processed/frames"
YOLO_OUTPUT_DIR = "data/processed/yolo"
CLASS_MAPPING_FILE = os.path.join(YOLO_OUTPUT_DIR, "class_mapping.json")

os.makedirs(YOLO_OUTPUT_DIR, exist_ok=True)

def ensure_dir_exists(path):
    """Ensure that the directory exists."""
    if not os.path.exists(path):
        os.makedirs(path)

def get_class_mapping(annotations_dir):
    """Generate a class mapping based on 'component_type' in annotations."""
    class_mapping = {}
    class_id = 0

    for root, _, files in os.walk(annotations_dir):
        for file in files:
            if file.endswith(".json"):
                with open(os.path.join(root, file), "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for annotation in data.get("annotations", []):
                        component_type = annotation["component_type"]
                        if component_type not in class_mapping:
                            class_mapping[component_type] = class_id
                            class_id += 1

    return class_mapping

def save_class_mapping(class_mapping, file_path):
    """Save the class mapping as a JSON file."""
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(class_mapping, f, indent=4)
    print(f"Class mapping saved to {file_path}")

def convert_annotations(annotations_dir, frames_dir, yolo_output_dir, class_mapping):
    """Convert annotations to YOLO format and save label files."""
    for root, _, files in os.walk(annotations_dir):
        for file in files:
            if file.endswith(".json"):
                with open(os.path.join(root, file), "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                frame_path = os.path.join(frames_dir, data["frame"]["path"])
                frame_width, frame_height = data["frame"]["width"], data["frame"]["height"]

                label_output_dir = os.path.join(yolo_output_dir, os.path.relpath(root, annotations_dir))
                ensure_dir_exists(label_output_dir)

                yolo_label_path = os.path.join(label_output_dir, f"{data['frame']['name']}.txt")

                with open(yolo_label_path, "w") as label_file:
                    for annotation in data.get("annotations", []):
                        bbox = annotation["bounding_box"]
                        x_center = (bbox["x"] + bbox["width"] / 2) / frame_width
                        y_center = (bbox["y"] + bbox["height"] / 2) / frame_height
                        width = bbox["width"] / frame_width
                        height = bbox["height"] / frame_height
                        class_id = class_mapping[annotation["component_type"]]
                        
                        label_file.write(f"{class_id} {x_center} {y_center} {width} {height}\n")

if __name__ == "__main__":
    class_mapping = get_class_mapping(ANNOTATIONS_DIR)
    save_class_mapping(class_mapping, CLASS_MAPPING_FILE)
    convert_annotations(ANNOTATIONS_DIR, FRAMES_DIR, YOLO_OUTPUT_DIR, class_mapping)

    print("Conversion complete. YOLO labels saved in:", YOLO_OUTPUT_DIR)
